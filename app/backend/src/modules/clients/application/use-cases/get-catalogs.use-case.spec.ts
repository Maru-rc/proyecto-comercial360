import { describe, it, expect } from 'vitest';
import { GetCatalogsUseCase } from './get-catalogs.use-case.js';
import {
  CatalogRepository,
  CatalogsGroup,
} from '../ports/catalog.repository.port.js';

class DummyCatalogRepository implements CatalogRepository {
  async getAll(): Promise<CatalogsGroup> {
    return {
      zonas: [{ id: 1, nombre: 'NORTE' }],
      tipos: [{ id: 1, nombre: 'Industrial' }],
      potenciales: [{ id: 1, nombre: 'Alto', orden: 1 }],
      estados: [{ id: 1, nombre: 'Activo' }],
      portafolios: [{ id: 1, nombre: 'Línea A', descripcion: null }],
    };
  }
  async findZone() {
    return null;
  }
  async findCustomerType() {
    return null;
  }
  async findPotential() {
    return null;
  }
  async findCustomerStatus() {
    return null;
  }
  async findPortfolios() {
    return [];
  }
}

describe('GetCatalogsUseCase', () => {
  it('retorna los grupos de catálogos esperados', async () => {
    const useCase = new GetCatalogsUseCase(new DummyCatalogRepository());
    const result = await useCase.execute();

    expect(result.zonas).toHaveLength(1);
    expect(result.tipos).toHaveLength(1);
    expect(result.potenciales).toHaveLength(1);
    expect(result.estados).toHaveLength(1);
    expect(result.portafolios).toHaveLength(1);
  });
});
