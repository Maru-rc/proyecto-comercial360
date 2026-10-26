import { describe, it, expect, beforeEach } from 'vitest';
import { ImportClientsUseCase } from './import-clients.use-case.js';
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
  PotentialCatalogItem,
} from '../ports/catalog.repository.port.js';
import {
  GeocodeQuery,
  GeocodeResult,
  GeocodingService,
} from '../ports/geocoding.port.js';
import {
  ClientFileParser,
  ParsedClientRow,
} from '../ports/client-file-parser.port.js';
import {
  BackupFileParams,
  BackupFileResult,
  FileBackupService,
} from '../ports/file-backup.port.js';

class InMemoryClientRepository implements ClientRepository {
  public savedTransactions: SaveClientTransactionData[] = [];
  public upserted: {
    data: SaveClientTransactionData;
    outcome: 'created' | 'updated';
  }[] = [];
  public existingNits = new Set<string>();

  async findByTaxId(taxId: string): Promise<ClientSummaryRecord | null> {
    return this.existingNits.has(taxId.toLowerCase())
      ? ({} as ClientSummaryRecord)
      : null;
  }
  async findById(): Promise<ClientSummaryRecord | null> {
    return null;
  }
  async findAll(): Promise<ClientSummaryRecord[]> {
    return [];
  }
  async saveWithRelations(
    data: SaveClientTransactionData,
  ): Promise<ClientSummaryRecord> {
    this.savedTransactions.push(data);
    return {} as ClientSummaryRecord;
  }
  async upsertWithRelations(
    data: SaveClientTransactionData,
  ): Promise<'created' | 'updated'> {
    const nit = data.client.nit.value.toLowerCase();
    const outcome = this.existingNits.has(nit) ? 'updated' : 'created';
    this.existingNits.add(nit);
    this.upserted.push({ data, outcome });
    return outcome;
  }
  async findHistoryByClientId(): Promise<ClientHistoryRecord[]> {
    return [];
  }
  async recordHistoryEvent(): Promise<ClientHistoryRecord> {
    return {} as ClientHistoryRecord;
  }
}

class InMemoryCatalogRepository implements CatalogRepository {
  private zones: CatalogItem[] = [{ id: 1, nombre: 'NORTE' }];
  private types: CatalogItem[] = [{ id: 1, nombre: 'Industrial' }];
  private potentials: PotentialCatalogItem[] = [
    { id: 1, nombre: 'Alto', orden: 1 },
  ];
  private statuses: CatalogItem[] = [{ id: 1, nombre: 'Activo' }];

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
  async findPortfolios() {
    return [];
  }
}

class MockGeocodingService implements GeocodingService {
  async geocode(_query: GeocodeQuery): Promise<GeocodeResult | null> {
    return { latitude: 10.98, longitude: -74.78 };
  }
}

class MockFileParser implements ClientFileParser {
  public rowsToReturn: ParsedClientRow[] = [];
  async parse(): Promise<ParsedClientRow[]> {
    return this.rowsToReturn;
  }
}

class MockFileBackupService implements FileBackupService {
  public backups: BackupFileParams[] = [];
  async backupFile(params: BackupFileParams): Promise<BackupFileResult> {
    this.backups.push(params);
    return { attachmentId: 101, s3Key: `imports/${params.originalName}` };
  }
}

describe('ImportClientsUseCase', () => {
  let clientRepo: InMemoryClientRepository;
  let catalogRepo: InMemoryCatalogRepository;
  let geocodingService: MockGeocodingService;
  let fileParser: MockFileParser;
  let backupService: MockFileBackupService;
  let useCase: ImportClientsUseCase;

  beforeEach(() => {
    clientRepo = new InMemoryClientRepository();
    catalogRepo = new InMemoryCatalogRepository();
    geocodingService = new MockGeocodingService();
    fileParser = new MockFileParser();
    backupService = new MockFileBackupService();

    useCase = new ImportClientsUseCase(
      clientRepo,
      catalogRepo,
      geocodingService,
      fileParser,
      backupService,
    );
  });

  it('procesa filas válidas, actualiza existentes y respalda el archivo original (HU-06)', async () => {
    clientRepo.existingNits.add('900.222.333-1'); // Ya existe en la base

    fileParser.rowsToReturn = [
      {
        rowNumber: 2,
        nit: '900.111.111-1',
        razon_social: 'Cliente Nuevo S.A.',
        direccion: 'Calle 10 # 20-30',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'NORTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
        contacto_nombre: 'Andrés López',
      },
      {
        rowNumber: 3,
        nit: '900.222.333-1', // Debe actualizarse
        razon_social: 'Cliente Existente Actualizado',
        direccion: 'Cra 50 # 80-10',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'NORTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
        contacto_nombre: 'María Gómez',
      },
      {
        rowNumber: 4,
        nit: '', // Error: NIT vacío
        razon_social: 'Cliente Inválido',
        direccion: 'Calle 1',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'NORTE',
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
      },
      {
        rowNumber: 5,
        nit: '900.333.333-3',
        razon_social: 'Cliente Con Zona Errónea',
        direccion: 'Calle 2',
        departamento: 'Atlántico',
        municipio: 'Barranquilla',
        zona: 'ZONA_INEXISTENTE', // Error de catálogo
        tipo_cliente: 'Industrial',
        potencial: 'Alto',
      },
    ];

    const result = await useCase.execute(
      {
        buffer: Buffer.from('dummy-content'),
        filename: 'clientes.csv',
        mimeType: 'text/csv',
      },
      { name: 'Director Comercial', email: 'director@comercial360.com' },
    );

    expect(result.total_filas).toBe(4);
    expect(result.creados).toBe(1);
    expect(result.actualizados).toBe(1);
    expect(result.errores).toHaveLength(2);
    expect(result.errores[0].fila).toBe(4);
    expect(result.errores[0].motivo).toContain('NIT es obligatorio');
    expect(result.errores[1].fila).toBe(5);
    expect(result.errores[1].motivo).toContain('Zona');
    expect(result.adjunto_id).toBe(101);

    expect(backupService.backups).toHaveLength(1);
    expect(backupService.backups[0].originalName).toBe('clientes.csv');
  });
});
