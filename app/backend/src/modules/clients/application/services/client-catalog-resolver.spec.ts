import { describe, it, expect } from 'vitest';
import { ClientCatalogResolver } from './client-catalog-resolver.js';
import type {
  CatalogItem,
  CatalogRepository,
  CatalogsGroup,
  PortfolioCatalogItem,
  PotentialCatalogItem,
} from '../ports/catalog.repository.port.js';
import { CatalogoInvalidoError } from '../../domain/client.errors.js';

class MockCatalogRepo implements CatalogRepository {
  public zones: CatalogItem[] = [
    { id: 1, nombre: 'NORTE' },
    { id: 2, nombre: 'SUR' },
  ];
  public types: CatalogItem[] = [
    { id: 1, nombre: 'Industrial' },
    { id: 2, nombre: 'Comercial' },
  ];
  public potentials: PotentialCatalogItem[] = [
    { id: 1, nombre: 'Alto', orden: 1 },
    { id: 2, nombre: 'Medio', orden: 2 },
  ];
  public statuses: CatalogItem[] = [
    { id: 1, nombre: 'Activo' },
    { id: 2, nombre: 'Inactivo' },
  ];

  async getAll(): Promise<CatalogsGroup> {
    return {
      zonas: this.zones,
      tipos: this.types,
      potenciales: this.potentials,
      estados: this.statuses,
      portafolios: [],
    };
  }

  async findZone(v: string | number) {
    return (
      this.zones.find(
        (z) =>
          z.id === Number(v) ||
          z.nombre.toLowerCase() === String(v).toLowerCase(),
      ) ?? null
    );
  }
  async findCustomerType(v: string | number) {
    return (
      this.types.find(
        (t) =>
          t.id === Number(v) ||
          t.nombre.toLowerCase() === String(v).toLowerCase(),
      ) ?? null
    );
  }
  async findPotential(v: string | number) {
    return (
      this.potentials.find(
        (p) =>
          p.id === Number(v) ||
          p.nombre.toLowerCase() === String(v).toLowerCase(),
      ) ?? null
    );
  }
  async findCustomerStatus(v: string | number) {
    return (
      this.statuses.find(
        (s) =>
          s.id === Number(v) ||
          s.nombre.toLowerCase() === String(v).toLowerCase(),
      ) ?? null
    );
  }
  async findPortfolios(): Promise<PortfolioCatalogItem[]> {
    return [];
  }
}

describe('ClientCatalogResolver', () => {
  it('resuelve catálogos estrictamente concurrentes y lanza error si falta alguno', async () => {
    const repo = new MockCatalogRepo();

    const resolved = await ClientCatalogResolver.resolveStrict(repo, {
      zona: 'NORTE',
      tipo_cliente: 'Industrial',
      potencial: 'Alto',
      estado_cliente: 'Activo',
    });

    expect(resolved.zone.id).toBe(1);
    expect(resolved.customerType.id).toBe(1);
    expect(resolved.potential.id).toBe(1);
    expect(resolved.status.id).toBe(1);

    await expect(
      ClientCatalogResolver.resolveStrict(repo, {
        zona: 'INEXISTENTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
      }),
    ).rejects.toThrow(CatalogoInvalidoError);
  });

  it('crea caché en memoria para lookup O(1) en importaciones', async () => {
    const repo = new MockCatalogRepo();
    const cache = await ClientCatalogResolver.createLookupCache(repo);

    expect(cache.findZone('SUR')?.id).toBe(2);
    expect(cache.findZone(1)?.nombre).toBe('NORTE');
    expect(cache.findCustomerType('Comercial')?.id).toBe(2);
    expect(cache.findPotential('Medio')?.orden).toBe(2);
    expect(cache.findCustomerStatus('Inactivo')?.id).toBe(2);
    expect(cache.findZone('NO_EXISTE')).toBeUndefined();
  });
});
