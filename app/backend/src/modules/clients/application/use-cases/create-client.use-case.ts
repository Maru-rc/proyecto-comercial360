import { Inject, Injectable } from '@nestjs/common';
import { Nit } from '../../domain/value-objects/nit.vo.js';
import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import { ClienteYaExisteError } from '../../domain/client.errors.js';
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
import { ClientCatalogResolver } from '../services/client-catalog-resolver.js';
import { resolveCoordinates } from '../services/resolve-coordinates.helper.js';

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
    // 1. Validar unicidad del NIT
    const nitVO = new Nit(command.nit);
    const existing = await this.clientRepo.findByTaxId(nitVO.value);
    if (existing) {
      throw new ClienteYaExisteError(nitVO.value);
    }

    // 2. Resolver catálogos concurrentemente
    const { zone, customerType, potential, status } =
      await ClientCatalogResolver.resolveStrict(this.catalogRepo, {
        zona: command.zona,
        tipo_cliente: command.tipo_cliente,
        potencial: command.potencial,
        estado_cliente: command.estado_cliente,
      });

    let portfolioIds: number[] = [];
    if (command.portafolios && command.portafolios.length > 0) {
      const foundPortfolios = await this.catalogRepo.findPortfolios(
        command.portafolios,
      );
      portfolioIds = foundPortfolios.map((p) => p.id);
    }

    // 3. Geocodificación resiliente con Nominatim (N-2)
    const coordinates = await resolveCoordinates(
      this.geocodingService,
      command.latitud,
      command.longitud,
      {
        address: command.direccion,
        municipality: command.municipio,
        department: command.departamento,
      },
    );

    // 4. Instanciar Entidades de Dominio
    const client = Client.create({
      nit: nitVO,
      legalName: command.razon_social,
      commercialName: command.nombre_comercial,
      address: command.direccion,
      department: command.departamento,
      municipality: command.municipio,
      neighborhood: command.barrio,
      phone: command.telefono,
      email: command.email,
      coordinates,
      visitFrequencyDays: command.frecuencia_visita_dias,
      isActive: true,
      zoneId: zone.id,
      customerTypeId: customerType.id,
      potentialId: potential.id,
      customerStatusId: status.id,
    });

    const primaryContact = ClientContact.create({
      name: command.contacto_nombre,
      position: command.contacto_cargo,
      phone: command.contacto_telefono,
      mobilePhone: command.contacto_celular,
      email: command.contacto_email,
      isPrimary: true,
    });

    const history = ClientHistory.create({
      action: 'Cliente creado',
      user: currentUser?.name || currentUser?.email || 'Sistema',
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
