import { ICliente } from "./cliente";

export type EstadoVisita =
  | "VISITADO"
  | "PENDIENTE"
  | "SIN_VISITAR"
  | "PEDIDO_CERRADO"
  | "REPROGRAMADO"
  | "PROGRAMADA";

export type MapPinStatus =
  "VISITED" | "PENDING" | "NOT_VISITED" | "ORDER_CLOSED" | "RESCHEDULED";

export interface IVisitAgendaItemContract {
  id: number;
  clientId: number;
  clientName: string;
  clientAddress?: string | null;
  address?: string | null;
  visitOrder?: number;
  order?: number;
  suggestedTime?: string | null;
  time?: string;
  visitStatus?: string;
  status?: string;
  potential?: string;
  objective?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  primaryContact?: {
    name: string;
    phone: string;
  } | null;
  isCurrent?: boolean;
  active?: boolean;
}

export interface IVisitMapStopContract {
  id: number;
  clientId: number;
  clientName: string;
  address?: string | null;
  order?: number;
  latitude: number | null;
  longitude: number | null;
  pinStatus: MapPinStatus;
  color?: string;
  colorHex?: string;
}

export type ResultadoVisita =
  | "Interesado"
  | "Pedido"
  | "Programada"
  | "No visitado"
  | "Cotización enviada"
  | "No interesado";

export interface ISeguimiento {
  id_seguimiento?: string;
  id_visita?: string;
  fecha_proxima: string;
  hora_proxima?: string;
  actividad: string;
  observacion?: string;
  responsable?: string;
  completado?: boolean;
}

export interface ICotizacion {
  id_cotizacion?: string;
  numero: string;
  id_cliente: string;
  cliente_nombre?: string;
  id_asesor?: string;
  asesor_nombre?: string;
  fecha: string;
  validez?: string;
  valor: number;
  moneda?: string;
  estado?:
    | "BORRADOR"
    | "ENVIADA"
    | "APROBADA"
    | "EN_NEGOCIACION"
    | "RECHAZADA"
    | "VENCIDA"
    | string;
  descripcion?: string;
  s3_document_key?: string;
}

export interface IPedido {
  id_pedido?: string;
  numero: string;
  id_cliente: string;
  cliente_nombre?: string;
  id_cotizacion?: string;
  fecha: string;
  valor: number;
  fecha_entrega?: string;
  estado?:
    | "PENDIENTE"
    | "EN_PREPARACION"
    | "DESPACHADO"
    | "ENTREGADO"
    | "CANCELADO"
    | string;
  asesor_nombre?: string;
  items_count?: number;
  observaciones?: string;
}

export interface IVisita {
  id_visita: string;
  id_cliente: string;
  cliente?: ICliente;
  id_asesor: string;
  asesor_nombre: string;
  id_ruta?: string;
  ruta_codigo?: string;
  territorio: string;
  semana: number;
  dia: string;
  fecha_programada: string;
  hora_inicio?: string;
  hora_fin?: string;
  fecha_real?: string;
  estado_visita: EstadoVisita;
  resultado?: ResultadoVisita;
  objetivo_visita?: string;
  tipo_visita?: string;
  interes_productos?: "Alto" | "Medio" | "Bajo";
  modulo_interes?: string;
  competencia_mencionada?: string;
  observaciones?: string;
  cotizacion?: ICotizacion;
  pedido?: IPedido;
  seguimiento?: ISeguimiento;
  fotos_s3_keys?: string[];
  documentos_s3_keys?: string[];
}

export interface IVisitaRegistroFormData {
  // Bloque 1: General
  fecha_visita: string;
  hora_inicio: string;
  hora_fin: string;
  id_ruta: string;
  territorio: string;
  semana: number;
  dia: string;
  asesor_nombre: string;

  // Bloque 2: Cliente
  id_cliente: string;
  cliente_nombre: string;
  codigo_cliente: string;
  tipo_cliente: string;
  municipio: string;
  contacto: string;
  telefono: string;
  cargo: string;
  canal_contacto: string;

  // Bloque 3: Visita
  objetivo_visita: string;
  tipo_visita: string;
  potencial_cliente: string;
  estado_visita: EstadoVisita;
  resultado_visita: ResultadoVisita;
  interes_productos: string;
  modulo_interes: string;
  competencia_mencionada: string;
  observaciones: string;

  // Bloque 4: Gestión comercial
  genero_cotizacion: boolean;
  numero_cotizacion?: string;
  valor_cotizacion?: number;
  moneda?: string;
  genero_pedido: boolean;
  numero_pedido?: string;
  valor_pedido?: number;
  fecha_estimada_entrega?: string;

  // Bloque 5: Próximo seguimiento
  fecha_proxima_visita: string;
  hora_proxima_visita?: string;
  objetivo_proximo_seguimiento?: string;
  responsable_seguimiento?: string;
}
