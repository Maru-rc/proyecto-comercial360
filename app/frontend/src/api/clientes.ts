import { apiClient } from './client';
import { ICliente } from '../types/cliente';

export const getClientes = async (params?: {
  zona?: string;
  tipo?: string;
  potencial?: string;
  search?: string;
  municipio?: string;
}): Promise<ICliente[]> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, value]) => value !== undefined && value !== '' && value !== 'Todos',
    ),
  );
  const res = await apiClient.get<ICliente[]>('/clientes', {
    params: cleanParams,
  });
  return res.data;
};

export const getClienteById = async (id: string): Promise<ICliente> => {
  const res = await apiClient.get<ICliente>(`/clientes/${id}`);
  return res.data;
};

export const crearCliente = async (
  nuevo: Partial<ICliente>,
): Promise<ICliente> => {
  const primaryContact = nuevo.contactos?.[0];
  const payload = {
    nit: nuevo.nit,
    razon_social: nuevo.razon_social,
    nombre_comercial: nuevo.nombre_comercial || nuevo.razon_social,
    direccion: nuevo.direccion,
    departamento: nuevo.departamento,
    municipio: nuevo.municipio,
    telefono: nuevo.telefono,
    email: nuevo.email,
    zona: nuevo.zona_nombre,
    tipo_cliente: nuevo.tipo_cliente_nombre,
    potencial: nuevo.potencial_nombre,
    estado_cliente: nuevo.estado_cliente_nombre || 'Activo',
    latitud: nuevo.latitud,
    longitud: nuevo.longitud,
    contacto_nombre: primaryContact?.nombre,
    contacto_cargo: primaryContact?.cargo,
    contacto_telefono: primaryContact?.telefono,
    contacto_email: primaryContact?.email,
  };
  const res = await apiClient.post<ICliente>('/clientes', payload);
  return res.data;
};

export interface ImportSummary {
  total_filas: number;
  creados: number;
  actualizados: number;
  errores: { fila: number; motivo: string }[];
  adjunto_id?: number | null;
}

export const importarClientes = async (file: File): Promise<ImportSummary> => {
  const formData = new FormData();
  formData.append('archivo', file);
  const res = await apiClient.post<ImportSummary>(
    '/clientes/importar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data;
};

export const descargarPlantilla = async (): Promise<Blob> => {
  const res = await apiClient.get('/clientes/plantilla', {
    responseType: 'blob',
  });
  return res.data;
};

export interface ClienteHistorialItem {
  id_historial: number;
  id_cliente: number | string;
  fecha: string;
  accion: string;
  usuario: string;
  descripcion: string | null;
}

export const getClienteHistorial = async (
  clienteId?: string | number,
  limit = 3,
): Promise<ClienteHistorialItem[]> => {
  const numericId = Number(String(clienteId ?? '').replace(/\D/g, ''));
  if (!numericId) return [];
  const res = await apiClient.get<ClienteHistorialItem[]>(
    `/clientes/${numericId}/historial`,
    { params: { limit } },
  );
  return res.data;
};
