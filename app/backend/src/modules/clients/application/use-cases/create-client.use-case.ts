import { Inject, Injectable } from '@nestjs/common';
import { Nit } from '../../domain/value-objects/nit.vo.js';
import { Coordinates } from '../../domain/value-objects/coordinates.vo.js';
import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import {
  ClienteYaExisteError,
  CatalogoInvalidoError,
} from '../../domain/client.errors.js';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientSummaryRecord,
} from '../ports/client.repository.port.js';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../ports/catalog.repository.port.js';
import {
  GEOCODING_SERVICE,
  type GeocodingService,
} from '../ports/geocoding.port.js';

export interface CreateClientCommand {
  nit: string;
  razon_social: string;
  nombre_comercial?: string | null;
  direccion: string;
  departamento: string;
  municipio: string;
  barrio?: string | null;
  telefono?: string | null;
  email?: string | null;
  zona: string | number;
  tipo_cliente: string | number;
  potencial: string | number;
  estado_cliente?: string | number | null;
  frecuencia_visita_dias?: number | null;
  portafolios?: (string | number)[];
  latitud?: number | null;
  longitud?: number | null;
  contacto_nombre: string;
  contacto_cargo?: string | null;
  contacto_telefono?: string | null;
  contacto_celular?: string | null;
  contacto_email?: string | null;
}

export interface UserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepo: CatalogRepository,
    @Inject(GEOCODING_SERVICE)
    private readonly geocodingService: GeocodingService,
  ) {}

  async execute(
    command: CreateClientCommand,
    currentUser?: UserContext,
  ): Promise<ClientSummaryRecord> {
    // 1. Validar NIT inmutable y unicidad
    const nitVO = new Nit(command.nit);
    const existing = await this.clientRepo.findByTaxId(nitVO.value);
    if (existing) {
      throw new ClienteYaExisteError(nitVO.value);
    }

    // 2. Resolver catálogos por ID o Nombre
    const zone = await this.catalogRepo.findZone(command.zona);
    if (!zone) {
      throw new CatalogoInvalidoError('zona', command.zona);
    }

    const customerType = await this.catalogRepo.findCustomerType(
      command.tipo_cliente,
    );
    if (!customerType) {
      throw new CatalogoInvalidoError('tipo_cliente', command.tipo_cliente);
    }

    const potential = await this.catalogRepo.findPotential(command.potencial);
    if (!potential) {
      throw new CatalogoInvalidoError('potencial', command.potencial);
    }

    const statusValue = command.estado_cliente ?? 'Activo';
    const status = await this.catalogRepo.findCustomerStatus(statusValue);
    if (!status) {
      throw new CatalogoInvalidoError('estado_cliente', statusValue);
    }

    let portfolioIds: number[] = [];
    if (command.portafolios && command.portafolios.length > 0) {
      const foundPortfolios = await this.catalogRepo.findPortfolios(
        command.portafolios,
      );
      portfolioIds = foundPortfolios.map((p) => p.id);
    }

    // 3. Geocodificación resiliente con Nominatim (N-2)
    let coordinates = new Coordinates(
      command.latitud ?? null,
      command.longitud ?? null,
    );

    if (!coordinates.hasValidCoordinates()) {
      try {
        const geoResult = await this.geocodingService.geocode({
          address: command.direccion,
          municipality: command.municipio,
          department: command.departamento,
        });
        if (geoResult) {
          coordinates = new Coordinates(
            geoResult.latitude,
            geoResult.longitude,
          );
        }
      } catch {
        // Fallback: si falla el proveedor de mapas, se guarda con coordenadas null
        coordinates = new Coordinates(null, null);
      }
    }

    // 4. Instanciar Entidad de Dominio
    const client = new Client({
      nit: nitVO,
      legalName: command.razon_social.trim(),
      commercialName:
        command.nombre_comercial?.trim() || command.razon_social.trim(),
      address: command.direccion.trim(),
      department: command.departamento.trim(),
      municipality: command.municipio.trim(),
      neighborhood: command.barrio?.trim() ?? null,
      phone: command.telefono?.trim() ?? null,
      email: command.email?.trim() ?? null,
      coordinates,
      visitFrequencyDays: command.frecuencia_visita_dias ?? null,
      isActive: true,
      zoneId: zone.id,
      customerTypeId: customerType.id,
      potentialId: potential.id,
      customerStatusId: status.id,
    });

    const primaryContact = new ClientContact({
      name: command.contacto_nombre.trim(),
      position: command.contacto_cargo?.trim() ?? null,
      phone: command.contacto_telefono?.trim() ?? null,
      mobilePhone: command.contacto_celular?.trim() ?? null,
      email: command.contacto_email?.trim() ?? null,
      isPrimary: true,
    });

    const userName = currentUser?.name || currentUser?.email || 'Sistema';
    const history = new ClientHistory({
      customerId: 0,
      action: 'Cliente creado',
      user: userName,
      description: 'Cliente registrado mediante formulario',
    });

    // 5. Persistir atómicamente en una sola transacción
    return this.clientRepo.saveWithRelations({
      client,
      primaryContact,
      portfolioIds,
      history,
    });
  }
}
