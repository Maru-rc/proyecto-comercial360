import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as xlsx from 'xlsx';
import { Readable } from 'node:stream';
import {
  ClientFileParser,
  ParsedClientRow,
} from '../../application/ports/client-file-parser.port.js';

@Injectable()
export class StreamClientFileParserAdapter implements ClientFileParser {
  async parse(
    buffer: Buffer,
    mimeType: string,
    filename: string,
  ): Promise<ParsedClientRow[]> {
    const isCsv =
      filename.toLowerCase().endsWith('.csv') ||
      mimeType.includes('csv') ||
      mimeType.includes('text/plain');

    if (isCsv) {
      return this.parseCsv(buffer);
    } else {
      return this.parseExcel(buffer);
    }
  }

  private async parseCsv(buffer: Buffer): Promise<ParsedClientRow[]> {
    return new Promise((resolve, reject) => {
      const records: ParsedClientRow[] = [];
      let rowNumber = 1; // Header is row 1, data starts row 2

      const stream = Readable.from(buffer);
      const parser = parse({
        columns: (header: string[]) => header.map((h) => this.normalizeKey(h)),
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });

      parser.on('readable', () => {
        let record: Record<string, string>;
        while ((record = parser.read()) !== null) {
          rowNumber++;
          records.push(this.mapRecordToRow(record, rowNumber));
        }
      });

      parser.on('error', (err) => reject(err));
      parser.on('end', () => resolve(records));

      stream.pipe(parser);
    });
  }

  private parseExcel(buffer: Buffer): ParsedClientRow[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });

    return rawData.map((raw, index) => {
      const normalizedRecord: Record<string, string> = {};
      for (const [key, value] of Object.entries(raw)) {
        const stringValue =
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
            ? String(value).trim()
            : '';
        normalizedRecord[this.normalizeKey(key)] = stringValue;
      }
      return this.mapRecordToRow(normalizedRecord, index + 2); // 1-indexed, row 1 is header
    });
  }

  private normalizeKey(key: string): string {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private mapRecordToRow(
    record: Record<string, string>,
    rowNumber: number,
  ): ParsedClientRow {
    const getVal = (...keys: string[]): string | undefined => {
      for (const k of keys) {
        if (record[k] !== undefined && record[k] !== '') {
          return record[k].trim();
        }
      }
      return undefined;
    };

    const latStr = getVal('latitud', 'latitude', 'lat');
    const lonStr = getVal('longitud', 'longitude', 'lon', 'lng');
    const freqStr = getVal(
      'frecuencia_visita_dias',
      'frecuencia_dias',
      'frecuencia',
    );

    return {
      rowNumber,
      nit: getVal('nit', 'identificacion', 'numero_identificacion'),
      razon_social: getVal('razon_social', 'nombre_empresa', 'empresa'),
      nombre_comercial: getVal('nombre_comercial', 'nombre_fantasia'),
      direccion: getVal('direccion', 'direccion_comercial'),
      departamento: getVal('departamento'),
      municipio: getVal('municipio', 'ciudad'),
      barrio: getVal('barrio'),
      telefono: getVal('telefono', 'telefono_fijo', 'tel'),
      email: getVal('email', 'correo', 'correo_electronico'),
      zona: getVal('zona', 'territorio'),
      tipo_cliente: getVal('tipo_cliente', 'tipo'),
      potencial: getVal('potencial', 'clasificacion'),
      estado_cliente: getVal('estado_cliente', 'estado'),
      frecuencia_visita_dias: freqStr
        ? parseInt(freqStr, 10) || undefined
        : undefined,
      latitud: latStr ? parseFloat(latStr) || undefined : undefined,
      longitud: lonStr ? parseFloat(lonStr) || undefined : undefined,
      contacto_nombre: getVal('contacto_nombre', 'nombre_contacto', 'contacto'),
      contacto_cargo: getVal('contacto_cargo', 'cargo_contacto', 'cargo'),
      contacto_telefono: getVal('contacto_telefono', 'telefono_contacto'),
      contacto_celular: getVal(
        'contacto_celular',
        'celular_contacto',
        'celular',
      ),
      contacto_email: getVal(
        'contacto_email',
        'email_contacto',
        'correo_contacto',
      ),
    };
  }
}
