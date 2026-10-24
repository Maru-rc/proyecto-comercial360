import { describe, it, expect, beforeEach } from 'vitest';
import { CreateClientUseCase } from './create-client.use-case.js';
import {
  ClientHistoryRecord,
  ClientRepository,
  ClientSummaryRecord,
  SaveClientTransactionData,
} from '../ports/client.repository.port.js';
import {
  CatalogItem,
  CatalogRepository,
  CatalogsGroup,
  PortfolioCatalogItem,
  PotentialCatalogItem,
} from '../ports/catalog.repository.port.js';
import {
  GeocodeQuery,
  GeocodeResult,
  GeocodingService,
} from '../ports/geocoding.port.js';
import { Client } from '../../domain/entities/client.entity.js';
import {
  CatalogoInvalidoError,
  ClienteYaExisteError,
} from '../../domain/client.errors.js';

class InMemoryClientRepository implements ClientRepository {
  public savedTransactions: SaveClientTransactionData[] = [];
  public clients: ClientSummaryRecord[] = [];

  async findByTaxId(taxId: string): Promise<ClientSummaryRecord | null> {
    const found = this.clients.find(
      (c) => c.nit.toLowerCase() === taxId.toLowerCase(),
    );
    return found ?? null;
  }

  async findById(id: number): Promise<ClientSummaryRecord | null> {
    return this.clients.find((c) => c.id_cliente === id) ?? null;
  }

  async findHistoryByClientId(): Promise<ClientHistoryRecord[]> {
    return [];
  }

  async findAll(): Promise<ClientSummaryRecord[]> {
    return this.clients;
  }

  async saveWithRelations(
    data: SaveClientTransactionData,
  ): Promise<ClientSummaryRecord> {
    this.savedTransactions.push(data);
    const newId = this.clients.length + 1;
    const record: ClientSummaryRecord = {
      id_cliente: newId,
      nit: data.client.nit.value,
      razon_social: data.client.legalName,
      nombre_comercial: data.client.commercialName,
      codigo: `CLI-${String(newId).padStart(6, '0')}`,
      direccion: data.client.address,
      departamento: data.client.department,
      municipio: data.client.municipality,
      barrio: data.client.neighborhood,
      telefono: data.client.phone,
      email: data.client.email,
      latitud: data.client.coordinates.latitude,
      longitud: data.client.coordinates.longitude,
      frecuencia_visita_dias: data.client.visitFrequencyDays,
      activo: data.client.isActive,
      zona_id: data.client.zoneId,
      zona_nombre: 'NORTE',
      tipo_cliente_id: data.client.customerTypeId,
      tipo_cliente_nombre: 'Industrial',
      potencial_id: data.client.potentialId,
      potencial_nombre: 'Alto',
      estado_cliente_id: data.client.customerStatusId,
      estado_cliente_nombre: 'Activo',
      contactos: [
        {
          id: 1,
          nombre: data.primaryContact.name,
          cargo: data.primaryContact.position,
          telefono: data.primaryContact.phone,
          celular: data.primaryContact.mobilePhone,
          email: data.primaryContact.email,
          principal: data.primaryContact.isPrimary,
        },
      ],
      portafolios: data.portfolioIds.map((id) => ({
        id,
        nombre: `Portafolio ${id}`,
      })),
    };
    this.clients.push(record);
    return record;
  }

  async upsertWithRelations(
    data: SaveClientTransactionData,
  ): Promise<'created' | 'updated'> {
    await this.saveWithRelations(data);
    return 'created';
  }
}

class InMemoryCatalogRepository implements CatalogRepository {
  private zones: CatalogItem[] = [{ id: 1, nombre: 'NORTE' }];
  private types: CatalogItem[] = [{ id: 1, nombre: 'Industrial' }];
  private potentials: PotentialCatalogItem[] = [
    { id: 1, nombre: 'Alto', orden: 1 },
  ];
  private statuses: CatalogItem[] = [{ id: 1, nombre: 'Activo' }];
  private portfolios: PortfolioCatalogItem[] = [
    { id: 1, nombre: 'Maquinaria', descripcion: 'Equipos' },
  ];

  async getAll(): Promise<CatalogsGroup> {
    return {
      zonas: this.zones,
      tipos: this.types,
      potenciales: this.potentials,
      estados: this.statuses,
      portafolios: this.portfolios,
    };
  }

  async findZone(idOrName: string | number): Promise<CatalogItem | null> {
    return (
      this.zones.find(
        (z) =>
          z.id === Number(idOrName) ||
          z.nombre.toLowerCase() === String(idOrName).toLowerCase(),
      ) ?? null
    );
  }

  async findCustomerType(
    idOrName: string | number,
  ): Promise<CatalogItem | null> {
    return (
      this.types.find(
        (t) =>
          t.id === Number(idOrName) ||
          t.nombre.toLowerCase() === String(idOrName).toLowerCase(),
      ) ?? null
    );
  }

  async findPotential(
    idOrName: string | number,
  ): Promise<PotentialCatalogItem | null> {
    return (
      this.potentials.find(
        (p) =>
          p.id === Number(idOrName) ||
          p.nombre.toLowerCase() === String(idOrName).toLowerCase(),
      ) ?? null
    );
  }

  async findCustomerStatus(
    idOrName: string | number,
  ): Promise<CatalogItem | null> {
    return (
      this.statuses.find(
        (s) =>
          s.id === Number(idOrName) ||
          s.nombre.toLowerCase() === String(idOrName).toLowerCase(),
      ) ?? null
    );
  }

  async findPortfolios(
    idsOrNames: (string | number)[],
  ): Promise<PortfolioCatalogItem[]> {
    return this.portfolios.filter(
      (p) =>
        idsOrNames.includes(p.id) ||
        idsOrNames
          .map(String)
          .map((s) => s.toLowerCase())
          .includes(p.nombre.toLowerCase()),
    );
  }
}

class InMemoryGeocodingService implements GeocodingService {
  public mockCoords: GeocodeResult | null = {
    latitude: 10.9878,
    longitude: -74.7889,
  };
  public shouldFail = false;

  async geocode(_query: GeocodeQuery): Promise<GeocodeResult | null> {
    if (this.shouldFail) throw new Error('Network timeout');
    return this.mockCoords;
  }
}

describe('CreateClientUseCase', () => {
  let clientRepo: InMemoryClientRepository;
  let catalogRepo: InMemoryCatalogRepository;
  let geocodingService: InMemoryGeocodingService;
  let useCase: CreateClientUseCase;

  beforeEach(() => {
    clientRepo = new InMemoryClientRepository();
    catalogRepo = new InMemoryCatalogRepository();
    geocodingService = new InMemoryGeocodingService();
    useCase = new CreateClientUseCase(
      clientRepo,
      catalogRepo,
      geocodingService,
    );
  });

  it('crea exitosamente un cliente con su contacto principal, portafolio y bitácora', async () => {
    const result = await useCase.execute(
      {
        nit: '900.123.456-1',
        razon_social: 'Metalúrgicas S.A.S',
        nombre_comercial: 'Metalúrgicas',
        direccion: 'Cra 38 # 74-120',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'NORTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
        estado_cliente: 'Activo',
        portafolios: [1],
        contacto_nombre: 'Carlos Mendoza',
        contacto_cargo: 'Jefe de Compras',
        contacto_email: 'cmendoza@metalurgicas.com',
      },
      { name: 'Director Comercial', email: 'director@comercial360.com' },
    );

    expect(result).toBeDefined();
    expect(result.nit).toBe('900.123.456-1');
    expect(result.latitud).toBe(10.9878);
    expect(result.longitud).toBe(-74.7889);
    expect(clientRepo.savedTransactions).toHaveLength(1);

    const transaction = clientRepo.savedTransactions[0];
    expect(transaction.primaryContact.name).toBe('Carlos Mendoza');
    expect(transaction.primaryContact.isPrimary).toBe(true);
    expect(transaction.history.action).toBe('Cliente creado');
    expect(transaction.history.user).toBe('Director Comercial');
  });

  it('lanza ClienteYaExisteError si el NIT ya existe', async () => {
    clientRepo.clients.push({
      id_cliente: 99,
      nit: '900.123.456-1',
      razon_social: 'Empresa Existente',
      nombre_comercial: null,
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
    });

    await expect(
      useCase.execute({
        nit: '900.123.456-1',
        razon_social: 'Otra Empresa',
        direccion: 'Calle 100',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'NORTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
        contacto_nombre: 'Contacto',
      }),
    ).rejects.toThrow(ClienteYaExisteError);
  });

  it('hace fallback a null en coordenadas si Nominatim falla sin romper la creación', async () => {
    geocodingService.shouldFail = true;

    const result = await useCase.execute({
      nit: '900.999.888-2',
      razon_social: 'Empresa Sin Coordenadas',
      direccion: 'Vereda Lejana Km 5',
      departamento: 'Magdalena',
      municipio: 'Ciénaga',
      zona: 'NORTE',
      tipo_cliente: 'Industrial',
      potencial: 'Alto',
      contacto_nombre: 'Pedro',
    });

    expect(result.latitud).toBeNull();
    expect(result.longitud).toBeNull();
    expect(clientRepo.savedTransactions).toHaveLength(1);
  });

  it('lanza CatalogoInvalidoError si la zona no existe', async () => {
    await expect(
      useCase.execute({
        nit: '900.111.222-3',
        razon_social: 'Empresa Test',
        direccion: 'Calle 1',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'ZONA_INEXISTENTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
        contacto_nombre: 'Pedro',
      }),
    ).rejects.toThrow(CatalogoInvalidoError);
  });
});
