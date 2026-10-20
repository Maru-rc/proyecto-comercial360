import { apiClient } from './client';
import { ICotizacion } from '../types/visita';

export const MOCK_COTIZACIONES: ICotizacion[] = [
  {
    id_cotizacion: 'cot-1',
    numero: 'COT-1245',
    id_cliente: 'cli-005',
    cliente_nombre: 'ConstruInnova S.A.S',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-21',
    validez: '2024-06-05',
    valor: 18500000,
    moneda: 'COP',
    estado: 'ENVIADA',
    descripcion: 'Equipos de corte por plasma y consumibles de alta resistencia',
  },
  {
    id_cotizacion: 'cot-2',
    numero: 'COT-1242',
    id_cliente: 'cli-001',
    cliente_nombre: 'Metalúrgicas S.A.S',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-21',
    validez: '2024-06-04',
    valor: 24800000,
    moneda: 'COP',
    estado: 'APROBADA',
    descripcion: 'Equipos de soldadura industrial multiproceso y kit de protección',
  },
  {
    id_cotizacion: 'cot-3',
    numero: 'COT-1241',
    id_cliente: 'cli-002',
    cliente_nombre: 'Ferretería del Norte S.A.',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-20',
    validez: '2024-06-03',
    valor: 12600000,
    moneda: 'COP',
    estado: 'APROBADA',
    descripcion: 'Lote de discos abrasivos, electrodos y herramientas eléctricas',
  },
  {
    id_cotizacion: 'cot-4',
    numero: 'COT-1240',
    id_cliente: 'cli-003',
    cliente_nombre: 'Aceros del Caribe Ltda.',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-18',
    validez: '2024-06-01',
    valor: 45200000,
    moneda: 'COP',
    estado: 'EN_NEGOCIACION',
    descripcion: 'Línea de maquinaria pesada y dobladoras industriales',
  },
  {
    id_cotizacion: 'cot-5',
    numero: 'COT-1238',
    id_cliente: 'cli-004',
    cliente_nombre: 'Soluciones Industriales de la Costa',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-15',
    validez: '2024-05-20',
    valor: 8900000,
    moneda: 'COP',
    estado: 'VENCIDA',
    descripcion: 'Kit de mantenimiento y repuestos hidráulicos',
  },
  {
    id_cotizacion: 'cot-6',
    numero: 'COT-1235',
    id_cliente: 'cli-006',
    cliente_nombre: 'Distribuciones JM del Atlántico',
    id_asesor: 'ase-002',
    asesor_nombre: 'Carlos Gómez',
    fecha: '2024-05-12',
    validez: '2024-05-27',
    valor: 14200000,
    moneda: 'COP',
    estado: 'APROBADA',
    descripcion: 'Suministros ferreteros y remaches industriales',
  },
  {
    id_cotizacion: 'cot-7',
    numero: 'COT-1234',
    id_cliente: 'cli-008',
    cliente_nombre: 'Induacero S.A.S',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    fecha: '2024-05-10',
    validez: '2024-05-25',
    valor: 32100000,
    moneda: 'COP',
    estado: 'APROBADA',
    descripcion: 'Estructuras de perfilería pesada y pernos de anclaje',
  },
];

export const getCotizaciones = async (params?: {
  search?: string;
  estado?: string;
}): Promise<ICotizacion[]> => {
  try {
    const res = await apiClient.get<ICotizacion[]>('/cotizaciones', { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    throw new Error('Fallback to mock');
  } catch {
    let result = [...MOCK_COTIZACIONES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.numero.toLowerCase().includes(q) ||
          (c.cliente_nombre && c.cliente_nombre.toLowerCase().includes(q)) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(q))
      );
    }
    if (params?.estado && params.estado !== 'Todos') {
      result = result.filter((c) => c.estado === params.estado);
    }
    return result;
  }
};

export const crearCotizacionApi = async (data: Partial<ICotizacion>): Promise<ICotizacion> => {
  const newCot: ICotizacion = {
    id_cotizacion: `cot-${Date.now()}`,
    numero: data.numero || `COT-${Math.floor(1000 + Math.random() * 9000)}`,
    id_cliente: data.id_cliente || 'cli-001',
    cliente_nombre: data.cliente_nombre || 'Cliente Comercial',
    id_asesor: data.id_asesor || 'ase-001',
    asesor_nombre: data.asesor_nombre || 'Juan Pérez',
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    validez: data.validez || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    valor: Number(data.valor || 15000000),
    moneda: data.moneda || 'COP',
    estado: (data.estado as any) || 'ENVIADA',
    descripcion: data.descripcion || 'Productos y servicios comerciales',
  };

  try {
    const res = await apiClient.post<ICotizacion>('/cotizaciones', newCot);
    MOCK_COTIZACIONES.unshift(res.data);
    return res.data;
  } catch {
    MOCK_COTIZACIONES.unshift(newCot);
    return newCot;
  }
};
