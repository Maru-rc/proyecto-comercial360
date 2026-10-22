export interface IKpisDashboard {
  programadas: number;
  realizadas: number;
  efectividad: number;
  valorCotizado: number;
  pedidos: number;
  facturacion: number;
  metaVisitas: number;
  completadasVisitas: number;
  porcentajeCumplimiento: number;
}

export interface ISeguimientoFila {
  id: string;
  fecha: string;
  asesor: string;
  territorio: string;
  semana: number;
  dia: string;
  ruta: string;
  cliente: string;
  municipio: string;
  tipo_cliente: string;
  potencial: 'Alto' | 'Medio' | 'Bajo';
  estado_visita: 'Pendiente' | 'Visitado' | 'Reprogramado' | 'Sin visitar' | 'Pedido cerrado';
  resultado: string;
  cotizacion: string;
  valor_cotizacion: number;
  pedido: string;
  proximo_seguimiento: string;
}

export interface IAgendaItem {
  id: string;
  orden: number;
  hora: string;
  cliente: string;
  estado: 'Visitado' | 'Pendiente' | 'Reprogramado' | 'Sin visitar';
  contacto?: string;
  objetivo?: string;
  potencial?: string;
  latitud: number;
  longitud: number;
  direccion?: string;
}
