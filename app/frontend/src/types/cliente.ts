export interface IContactoCliente {
  id_contacto: string;
  nombre: string;
  cargo: string;
  telefono: string;
  celular?: string;
  email: string;
  principal: boolean;
}

export interface IPortafolio {
  id_portafolio: string;
  nombre: string;
  descripcion?: string;
}

export interface ICliente {
  id_cliente: string;
  nit: string;
  razon_social: string;
  nombre_comercial: string;
  codigo: string;
  direccion: string;
  departamento: string;
  municipio: string;
  barrio?: string;
  telefono: string;
  email: string;
  id_zona?: string;
  zona_nombre?: string;
  id_tipo_cliente?: string;
  tipo_cliente_nombre: 'Industrial' | 'Distribuidor' | 'Retail' | 'Constructor' | string;
  id_potencial?: string;
  potencial_nombre: 'Alto' | 'Medio' | 'Bajo';
  id_estado_cliente?: string;
  estado_cliente_nombre: 'Activo' | 'Inactivo' | 'Prospecto';
  frecuencia_visita_dias?: number;
  latitud: number;
  longitud: number;
  contactos?: IContactoCliente[];
  portafolios?: IPortafolio[];
  activo: boolean;
}

export interface IHistorialCliente {
  id_historial: string;
  id_cliente: string;
  fecha: string;
  accion: string;
  usuario: string;
  descripcion: string;
}
