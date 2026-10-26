import { ICliente } from './cliente';

export type EstadoRuta = 'BORRADOR' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA';

export interface IParadaRuta {
  id: string; // for dnd-kit sortable
  id_cliente: string;
  cliente: ICliente;
  orden: number;
  hora_sugerida: string;
  estado_visita?:
    | 'VISITADO'
    | 'PENDIENTE'
    | 'REPROGRAMADO'
    | 'SIN_VISITAR'
    | 'NO_ASIGNADO'
    | 'PEDIDO_CERRADO';
}

export interface IRuta {
  id_ruta: string;
  codigo: string;
  nombre: string;
  territorio_zona: string;
  dia_ejecucion: string;
  frecuencia: 'Diaria' | 'Semanal' | 'Quincenal' | 'Mensual';
  hora_inicio_sugerida: string;
  hora_fin_sugerida: string;
  descripcion: string;
  id_asesor?: string;
  asesor_nombre?: string;
  estado: EstadoRuta;
  paradas: IParadaRuta[];
  distancia_km_aprox: number;
  tiempo_estimado_min: number;
  fecha_creacion?: string;
}

export interface IRutaFormData {
  nombre: string;
  territorio_zona: string;
  dia_ejecucion: string;
  frecuencia: string;
  hora_inicio: string;
  hora_fin: string;
  descripcion: string;
  id_asesor?: string;
}
