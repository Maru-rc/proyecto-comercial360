export interface CatalogItem {
  id: number;
  nombre: string;
}

export interface PotentialCatalogItem extends CatalogItem {
  orden: number;
}

export interface PortfolioCatalogItem extends CatalogItem {
  descripcion: string | null;
}

export interface CatalogsGroup {
  zonas: CatalogItem[];
  tipos: CatalogItem[];
  potenciales: PotentialCatalogItem[];
  estados: CatalogItem[];
  portafolios: PortfolioCatalogItem[];
}

export interface CatalogRepository {
  getAll(): Promise<CatalogsGroup>;
  findZone(idOrName: string | number): Promise<CatalogItem | null>;
  findCustomerType(idOrName: string | number): Promise<CatalogItem | null>;
  findPotential(
    idOrName: string | number,
  ): Promise<PotentialCatalogItem | null>;
  findCustomerStatus(idOrName: string | number): Promise<CatalogItem | null>;
  findPortfolios(
    idsOrNames: (string | number)[],
  ): Promise<PortfolioCatalogItem[]>;
}

export const CATALOG_REPOSITORY = Symbol('CATALOG_REPOSITORY');
