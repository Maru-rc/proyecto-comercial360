import { Nit } from '../../domain/value-objects/nit.vo.js';
import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import type { CatalogRepository } from '../ports/catalog.repository.port.js';
import type { GeocodingService } from '../ports/geocoding.port.js';
import { ClientCatalogResolver } from './client-catalog-resolver.js';
import { resolveCoordinates } from './resolve-coordinates.helper.js';

/** Form fields shared by client creation (HU-05) and edition (HU-23). */
export interface ClientFormCommand {
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

export interface ClientAggregate {
  client: Client;
  primaryContact: ClientContact;
  portfolioIds: number[];
}

/**
 * Resolves catalogs, portfolios and coordinates and builds the domain
 * entities. Throws CatalogoInvalidoError for unknown catalog values.
 */
export async function buildClientAggregate(
  command: ClientFormCommand,
  catalogRepo: CatalogRepository,
  geocodingService: GeocodingService,
): Promise<ClientAggregate> {
  const { zone, customerType, potential, status } =
    await ClientCatalogResolver.resolveStrict(catalogRepo, {
      zona: command.zona,
      tipo_cliente: command.tipo_cliente,
      potencial: command.potencial,
      estado_cliente: command.estado_cliente,
    });

  let portfolioIds: number[] = [];
  if (command.portafolios && command.portafolios.length > 0) {
    const foundPortfolios = await catalogRepo.findPortfolios(
      command.portafolios,
    );
    portfolioIds = foundPortfolios.map((p) => p.id);
  }

  // Geocodificación resiliente con Nominatim (N-2)
  const coordinates = await resolveCoordinates(
    geocodingService,
    command.latitud,
    command.longitud,
    {
      address: command.direccion,
      municipality: command.municipio,
      department: command.departamento,
    },
  );

  const client = Client.create({
    nit: new Nit(command.nit),
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

  return { client, primaryContact, portfolioIds };
}
