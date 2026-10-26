import type {
  CatalogItem,
  CatalogRepository,
  PotentialCatalogItem,
} from '../ports/catalog.repository.port.js';
import { CatalogoInvalidoError } from '../../domain/client.errors.js';

export interface ResolvedClientCatalogs {
  zone: CatalogItem;
  customerType: CatalogItem;
  potential: PotentialCatalogItem;
  status: CatalogItem;
}

export interface ClientCatalogLookup {
  findZone: (val: string | number) => CatalogItem | undefined;
  findCustomerType: (val: string | number) => CatalogItem | undefined;
  findPotential: (val: string | number) => PotentialCatalogItem | undefined;
  findCustomerStatus: (val: string | number) => CatalogItem | undefined;
}

export class ClientCatalogResolver {
  static async resolveStrict(
    catalogRepo: CatalogRepository,
    inputs: {
      zona: string | number;
      tipo_cliente: string | number;
      potencial: string | number;
      estado_cliente?: string | number | null;
    },
  ): Promise<ResolvedClientCatalogs> {
    const statusValue = inputs.estado_cliente ?? 'Activo';

    const [zone, customerType, potential, status] = await Promise.all([
      catalogRepo.findZone(inputs.zona),
      catalogRepo.findCustomerType(inputs.tipo_cliente),
      catalogRepo.findPotential(inputs.potencial),
      catalogRepo.findCustomerStatus(statusValue),
    ]);

    if (!zone) throw new CatalogoInvalidoError('zona', inputs.zona);
    if (!customerType)
      throw new CatalogoInvalidoError('tipo_cliente', inputs.tipo_cliente);
    if (!potential)
      throw new CatalogoInvalidoError('potencial', inputs.potencial);
    if (!status) throw new CatalogoInvalidoError('estado_cliente', statusValue);

    return { zone, customerType, potential, status };
  }

  static async createLookupCache(
    catalogRepo: CatalogRepository,
  ): Promise<ClientCatalogLookup> {
    const all = await catalogRepo.getAll();

    const normalize = (val: string | number) =>
      String(val).trim().toLowerCase();

    const matchItem = <T extends CatalogItem>(
      items: T[] | undefined,
      val: string | number,
    ): T | undefined => {
      if (!items || !Array.isArray(items)) return undefined;
      const norm = normalize(val);
      const asNum = Number(val);
      return items.find(
        (item) =>
          (!isNaN(asNum) && item.id === asNum) ||
          normalize(item.nombre) === norm,
      );
    };

    return {
      findZone: (val: string | number) => matchItem(all.zonas, val),
      findCustomerType: (val: string | number) => matchItem(all.tipos, val),
      findPotential: (val: string | number) => matchItem(all.potenciales, val),
      findCustomerStatus: (val: string | number) => matchItem(all.estados, val),
    };
  }

  static resolveIdsFromLookup(
    lookup: ClientCatalogLookup,
    row: {
      zona?: string | number;
      tipo_cliente?: string | number;
      potencial?: string | number;
      estado_cliente?: string | number | null;
    },
  ) {
    const statusName =
      row.estado_cliente && String(row.estado_cliente).trim().length > 0
        ? row.estado_cliente
        : 'Activo';

    const zone = lookup.findZone(row.zona!);
    const customerType = lookup.findCustomerType(row.tipo_cliente!);
    const potential = lookup.findPotential(row.potencial!);
    const status = lookup.findCustomerStatus(statusName);

    if (!zone) {
      throw new Error(`Zona '${row.zona}' no encontrada en el catálogo`);
    }
    if (!customerType) {
      throw new Error(
        `Tipo de cliente '${row.tipo_cliente}' no encontrado en el catálogo`,
      );
    }
    if (!potential) {
      throw new Error(
        `Potencial '${row.potencial}' no encontrado en el catálogo`,
      );
    }
    if (!status) {
      throw new Error(`Estado '${statusName}' no encontrado en el catálogo`);
    }

    return {
      zoneId: zone.id,
      customerTypeId: customerType.id,
      potentialId: potential.id,
      customerStatusId: status.id,
    };
  }
}
