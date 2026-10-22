import { apiClient } from './client';
import { IKpisDashboard, ISeguimientoFila, IAgendaItem } from '../types/kpi';

export const MOCK_KPIS: IKpisDashboard = {
  programadas: 24,
  realizadas: 19,
  efectividad: 79,
  valorCotizado: 215450000,
  pedidos: 8,
  facturacion: 128760000,
  metaVisitas: 24,
  completadasVisitas: 19,
  porcentajeCumplimiento: 78,
};

export const MOCK_SEGUIMIENTO_VISITAS: ISeguimientoFila[] = [
  {
    id: 'seg-1',
    fecha: '21/05/2024',
    asesor: 'Juan Pérez',
    territorio: 'NORTE',
    semana: 21,
    dia: 'Martes',
    ruta: 'RUT-002',
    cliente: 'ConstruInnova',
    municipio: 'Barranquilla',
    tipo_cliente: 'Industrial',
    potencial: 'Alto',
    estado_visita: 'Pendiente',
    resultado: 'Programada',
    cotizacion: 'COT-1245',
    valor_cotizacion: 18500000,
    pedido: '-',
    proximo_seguimiento: '23/05/2024',
  },
  {
    id: 'seg-2',
    fecha: '21/05/2024',
    asesor: 'Juan Pérez',
    territorio: 'NORTE',
    semana: 21,
    dia: 'Martes',
    ruta: 'RUT-002',
    cliente: 'Metalúrgicas S.A.S',
    municipio: 'Barranquilla',
    tipo_cliente: 'Industrial',
    potencial: 'Alto',
    estado_visita: 'Visitado',
    resultado: 'Interesado',
    cotizacion: 'COT-1242',
    valor_cotizacion: 24800000,
    pedido: 'PED-568',
    proximo_seguimiento: '28/05/2024',
  },
  {
    id: 'seg-3',
    fecha: '21/05/2024',
    asesor: 'Juan Pérez',
    territorio: 'NORTE',
    semana: 21,
    dia: 'Martes',
    ruta: 'RUT-002',
    cliente: 'Ferretería del Norte',
    municipio: 'Soledad',
    tipo_cliente: 'Distribuidor',
    potencial: 'Medio',
    estado_visita: 'Visitado',
    resultado: 'Pedido',
    cotizacion: 'COT-1241',
    valor_cotizacion: 12600000,
    pedido: 'PED-567',
    proximo_seguimiento: '-',
  },
  {
    id: 'seg-4',
    fecha: '21/05/2024',
    asesor: 'Juan Pérez',
    territorio: 'NORTE',
    semana: 21,
    dia: 'Martes',
    ruta: 'RUT-002',
    cliente: 'Distribuciones JM',
    municipio: 'Malambo',
    tipo_cliente: 'Distribuidor',
    potencial: 'Medio',
    estado_visita: 'Reprogramado',
    resultado: 'No visitado',
    cotizacion: '-',
    valor_cotizacion: 0,
    pedido: '-',
    proximo_seguimiento: '22/05/2024',
  },
  {
    id: 'seg-5',
    fecha: '21/05/2024',
    asesor: 'Juan Pérez',
    territorio: 'NORTE',
    semana: 21,
    dia: 'Martes',
    ruta: 'RUT-002',
    cliente: 'Ferretería La 14',
    municipio: 'Soledad',
    tipo_cliente: 'Retail',
    potencial: 'Bajo',
    estado_visita: 'Sin visitar',
    resultado: '-',
    cotizacion: '-',
    valor_cotizacion: 0,
    pedido: '-',
    proximo_seguimiento: '-',
  },
];

export const MOCK_AGENDA_ITEMS: IAgendaItem[] = [
  {
    id: 'ag-1',
    orden: 1,
    hora: '08:30',
    cliente: 'Ferretería del Norte',
    estado: 'Visitado',
    latitud: 11.0045,
    longitud: -74.8192,
    direccion: 'Calle 84 # 42-15',
  },
  {
    id: 'ag-2',
    orden: 2,
    hora: '10:15',
    cliente: 'Metalúrgicas S.A.S',
    estado: 'Visitado',
    latitud: 10.9878,
    longitud: -74.7889,
    direccion: 'Cra 38 # 74-120',
  },
  {
    id: 'ag-3',
    orden: 3,
    hora: '11:45',
    cliente: 'ConstruInnova',
    estado: 'Pendiente',
    contacto: 'Carlos Julio Mendoza',
    objetivo: 'Presentación de nueva línea',
    potencial: 'Alto',
    latitud: 10.9234,
    longitud: -74.7556,
    direccion: 'Calle 30 # 12-50',
  },
  {
    id: 'ag-4',
    orden: 4,
    hora: '14:00',
    cliente: 'Soluciones Industriales',
    estado: 'Pendiente',
    latitud: 10.9182,
    longitud: -74.7645,
    direccion: 'Cra 21 # 30-45',
  },
  {
    id: 'ag-5',
    orden: 5,
    hora: '15:30',
    cliente: 'ACEROS DEL CARIBE',
    estado: 'Pendiente',
    latitud: 10.9754,
    longitud: -74.7721,
    direccion: 'Vía 40 # 65-200',
  },
  {
    id: 'ag-6',
    orden: 6,
    hora: '16:30',
    cliente: 'Distribuciones JM',
    estado: 'Reprogramado',
    latitud: 10.8621,
    longitud: -74.7733,
    direccion: 'Cra 5 # 18-60',
  },
];

export const getDashboardKpis = async (
  _territorio?: string,
  _semana?: string | number
): Promise<IKpisDashboard> => {
  try {
    const res = await apiClient.get<IKpisDashboard>('/reportes/dashboard', {
      params: { territorio: _territorio, semana: _semana },
    });
    if (res.data && typeof res.data === 'object' && typeof res.data.programadas === 'number') {
      return res.data;
    }
    return MOCK_KPIS;
  } catch {
    return MOCK_KPIS;
  }
};

export const getSeguimientoVisitas = async (): Promise<ISeguimientoFila[]> => {
  try {
    const res = await apiClient.get<ISeguimientoFila[]>('/visitas/seguimiento');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_SEGUIMIENTO_VISITAS;
  } catch {
    return MOCK_SEGUIMIENTO_VISITAS;
  }
};

export const getAgendaDelDia = async (_fecha?: string): Promise<IAgendaItem[]> => {
  try {
    const res = await apiClient.get<IAgendaItem[]>('/visitas/agenda');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_AGENDA_ITEMS;
  } catch {
    return MOCK_AGENDA_ITEMS;
  }
};

export const downloadCsvReport = (territorio: string, semana: string | number) => {
  const headers = [
    'Fecha',
    'Asesor',
    'Territorio',
    'Semana',
    'Día',
    'Ruta',
    'Cliente',
    'Municipio',
    'Tipo Cliente',
    'Potencial',
    'Estado Visita',
    'Resultado',
    'Cotización',
    'Valor Cotización',
    'Pedido',
    'Próximo Seguimiento',
  ];

  const rows = MOCK_SEGUIMIENTO_VISITAS.map((f) => [
    f.fecha,
    f.asesor,
    f.territorio,
    f.semana,
    f.dia,
    f.ruta,
    f.cliente,
    f.municipio,
    f.tipo_cliente,
    f.potencial,
    f.estado_visita,
    f.resultado,
    f.cotizacion,
    f.valor_cotizacion,
    f.pedido,
    f.proximo_seguimiento,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join(
      '\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Reporte_Comercial360_${territorio}_Semana${semana}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
