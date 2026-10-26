export interface ParsedClientRow {
  rowNumber: number;
  nit?: string;
  razon_social?: string;
  nombre_comercial?: string;
  direccion?: string;
  departamento?: string;
  municipio?: string;
  barrio?: string;
  telefono?: string;
  email?: string;
  zona?: string;
  tipo_cliente?: string;
  potencial?: string;
  estado_cliente?: string;
  frecuencia_visita_dias?: number;
  latitud?: number;
  longitud?: number;
  contacto_nombre?: string;
  contacto_cargo?: string;
  contacto_telefono?: string;
  contacto_celular?: string;
  contacto_email?: string;
}

export interface ClientFileParser {
  parse(
    buffer: Buffer,
    mimeType: string,
    filename: string,
  ): Promise<ParsedClientRow[]>;
}

export const CLIENT_FILE_PARSER = Symbol('CLIENT_FILE_PARSER');
