import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';

export interface SaveClientTransactionData {
  client: Client;
  primaryContact: ClientContact;
  portfolioIds: number[];
  history: ClientHistory;
}

export interface ClientContactRecord {
  id: number;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  principal: boolean;
}

export interface ClientSummaryRecord {
  id_cliente: number;
  nit: string;
  razon_social: string;
  nombre_comercial: string | null;
  codigo?: string;
  direccion: string | null;
  departamento: string | null;
  municipio: string | null;
  barrio: string | null;
  telefono: string | null;
  email: string | null;
  latitud: number | null;
  longitud: number | null;
  frecuencia_visita_dias: number | null;
  activo: boolean;
  zona_id: number | null;
  zona_nombre: string | null;
  tipo_cliente_id: number | null;
  tipo_cliente_nombre: string | null;
  potencial_id: number | null;
  potencial_nombre: string | null;
  estado_cliente_id: number | null;
  estado_cliente_nombre: string | null;
  contactos?: ClientContactRecord[];
  portafolios?: { id: number; nombre: string }[];
}

export interface ClientHistoryRecord {
  id_historial: number;
  id_cliente: number;
  fecha: Date;
  accion: string;
  usuario: string | null;
  descripcion: string | null;
}

export interface ClientListFilter {
  search?: string;
  tipo?: string;
  zona?: string;
  municipio?: string;
  potencial?: string;
}

export interface ClientRepository {
  findByTaxId(taxId: string): Promise<ClientSummaryRecord | null>;
  findById(id: number): Promise<ClientSummaryRecord | null>;
  findHistoryByClientId(
    clientId: number,
    limit?: number,
  ): Promise<ClientHistoryRecord[]>;
  findAll(filter?: ClientListFilter): Promise<ClientSummaryRecord[]>;
  saveWithRelations(
    data: SaveClientTransactionData,
  ): Promise<ClientSummaryRecord>;
  upsertWithRelations(
    data: SaveClientTransactionData,
  ): Promise<'created' | 'updated'>;
  /** Replaces the client's data, primary contact and portfolios atomically. */
  updateWithRelations(
    id: number,
    data: SaveClientTransactionData,
  ): Promise<ClientSummaryRecord>;
}

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');
