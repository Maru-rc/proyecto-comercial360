import { describe, it, expect } from 'vitest';
import { ListClientsUseCase } from './list-clients.use-case.js';
import {
  ClientRepository,
  ClientSummaryRecord,
} from '../ports/client.repository.port.js';

class MockClientRepository implements Partial<ClientRepository> {
  constructor(private readonly records: ClientSummaryRecord[]) {}

  async findAll(filter?: {
    search?: string;
    tipo?: string;
    zona?: string;
  }): Promise<ClientSummaryRecord[]> {
    return this.records.filter((r) => {
      if (filter?.search && !r.razon_social.includes(filter.search))
        return false;
      return true;
    });
  }
}

describe('ListClientsUseCase', () => {
  it('retorna la lista de clientes aplicando filtros', async () => {
    const clients: ClientSummaryRecord[] = [
      {
        id_cliente: 1,
        nit: '9001',
        razon_social: 'Acero SAS',
        nombre_comercial: 'Acero',
        direccion: null,
        departamento: null,
        municipio: null,
        barrio: null,
        telefono: null,
        email: null,
        latitud: null,
        longitud: null,
        frecuencia_visita_dias: null,
        activo: true,
        zona_id: 1,
        zona_nombre: 'NORTE',
        tipo_cliente_id: 1,
        tipo_cliente_nombre: 'Industrial',
        potencial_id: 1,
        potencial_nombre: 'Alto',
        estado_cliente_id: 1,
        estado_cliente_nombre: 'Activo',
      },
    ];

    const useCase = new ListClientsUseCase(
      new MockClientRepository(clients) as ClientRepository,
    );
    const result = await useCase.execute({ search: 'Acero' });

    expect(result).toHaveLength(1);
    expect(result[0].razon_social).toBe('Acero SAS');
  });
});
