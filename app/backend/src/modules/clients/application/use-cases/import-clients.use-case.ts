import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from '../ports/client.repository.port.js';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
} from '../ports/catalog.repository.port.js';
import {
  GEOCODING_SERVICE,
  type GeocodingService,
} from '../ports/geocoding.port.js';
import {
  CLIENT_FILE_PARSER,
  type ClientFileParser,
  type ParsedClientRow,
} from '../ports/client-file-parser.port.js';
import {
  FILE_BACKUP_SERVICE,
  type FileBackupService,
} from '../ports/file-backup.port.js';
import {
  ClientCatalogResolver,
  type ClientCatalogLookup,
} from '../services/client-catalog-resolver.js';
import { resolveCoordinates } from '../services/resolve-coordinates.helper.js';
import type { UserContext } from './create-client.use-case.js';

export interface ImportClientsCommand {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface ImportErrorDetail {
  fila: number;
  motivo: string;
}

export interface ImportClientsSummary {
  total_filas: number;
  creados: number;
  actualizados: number;
  errores: ImportErrorDetail[];
  adjunto_id?: number | null;
}

const REQUIRED_FIELDS: { field: keyof ParsedClientRow; message: string }[] = [
  { field: 'nit', message: 'El NIT es obligatorio' },
  { field: 'razon_social', message: 'La razón social es obligatoria' },
  { field: 'direccion', message: 'La dirección es obligatoria' },
  { field: 'departamento', message: 'El departamento es obligatorio' },
  { field: 'municipio', message: 'El municipio es obligatorio' },
  { field: 'zona', message: 'La zona es obligatoria' },
  { field: 'tipo_cliente', message: 'El tipo de cliente es obligatorio' },
  { field: 'potencial', message: 'El potencial es obligatorio' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ImportClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepo: CatalogRepository,
    @Inject(GEOCODING_SERVICE)
    private readonly geocodingService: GeocodingService,
    @Inject(CLIENT_FILE_PARSER)
    private readonly fileParser: ClientFileParser,
    @Inject(FILE_BACKUP_SERVICE)
    private readonly fileBackupService: FileBackupService,
  ) {}

  async execute(
    command: ImportClientsCommand,
    currentUser?: UserContext,
  ): Promise<ImportClientsSummary> {
    const userName =
      currentUser?.name || currentUser?.email || 'Director Comercial';

    // Respaldo del archivo en S3 / ADJUNTO (N-1)
    const backup = await this.fileBackupService.backupFile({
      buffer: command.buffer,
      originalName: command.filename,
      mimeType: command.mimeType,
      user: userName,
      category: 'IMPORTACION_CLIENTES',
    });

    const rows = await this.fileParser.parse(
      command.buffer,
      command.mimeType,
      command.filename,
    );

    // Los catálogos se cargan una sola vez: las filas se resuelven en memoria
    const catalogs = await ClientCatalogResolver.createLookupCache(
      this.catalogRepo,
    );

    const summary: ImportClientsSummary = {
      total_filas: rows.length,
      creados: 0,
      actualizados: 0,
      errores: [],
      adjunto_id: backup.attachmentId ?? null,
    };

    // Cada fila se guarda en su propia transacción: un error no frena al resto
    for (const row of rows) {
      try {
        const outcome = await this.importRow(row, catalogs, {
          filename: command.filename,
          userName,
        });
        if (outcome === 'created') summary.creados++;
        else summary.actualizados++;
      } catch (error) {
        summary.errores.push({
          fila: row.rowNumber,
          motivo:
            (error as Error).message || 'Error desconocido al procesar la fila',
        });
      }
    }

    return summary;
  }

  private async importRow(
    row: ParsedClientRow,
    catalogs: ClientCatalogLookup,
    source: { filename: string; userName: string },
  ): Promise<'created' | 'updated'> {
    this.assertValidRow(row);

    const coordinates = await resolveCoordinates(
      this.geocodingService,
      row.latitud,
      row.longitud,
      {
        address: row.direccion,
        municipality: row.municipio,
        department: row.departamento,
      },
    );

    const client = Client.create({
      nit: row.nit!,
      legalName: row.razon_social!,
      commercialName: row.nombre_comercial,
      address: row.direccion,
      department: row.departamento,
      municipality: row.municipio,
      neighborhood: row.barrio,
      phone: row.telefono,
      email: row.email,
      coordinates,
      visitFrequencyDays: row.frecuencia_visita_dias,
      isActive: true,
      ...ClientCatalogResolver.resolveIdsFromLookup(catalogs, row),
    });

    return this.clientRepo.upsertWithRelations({
      client,
      primaryContact: ClientContact.create({
        name: row.contacto_nombre,
        position: row.contacto_cargo,
        phone: row.contacto_telefono,
        mobilePhone: row.contacto_celular,
        email: row.contacto_email,
      }),
      portfolioIds: [],
      history: ClientHistory.create({
        action: 'Cliente importado',
        user: source.userName,
        description: `Importación masiva desde archivo ${source.filename} (fila ${row.rowNumber})`,
      }),
    });
  }

  private assertValidRow(row: ParsedClientRow): void {
    const missing = REQUIRED_FIELDS.find(
      ({ field }) => String(row[field] ?? '').trim().length === 0,
    );
    if (missing) throw new Error(missing.message);

    if (row.email && !EMAIL_PATTERN.test(row.email.trim())) {
      throw new Error('El correo electrónico no es válido');
    }
  }
}
