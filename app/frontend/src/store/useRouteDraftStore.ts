import { create } from 'zustand';
import { IParadaRuta, IRutaFormData } from '../types/ruta';
import { ICliente } from '../types/cliente';

interface RouteDraftState {
  currentStep: number;
  formData: IRutaFormData;
  paradas: IParadaRuta[];
  distanciaTotalKm: number;
  tiempoTotalMin: number;
  
  setStep: (step: number) => void;
  updateFormData: (data: Partial<IRutaFormData>) => void;
  agregarCliente: (cliente: ICliente) => void;
  eliminarParada: (id: string) => void;
  reordenarParadas: (newParadas: IParadaRuta[]) => void;
  limpiarRuta: () => void;
  optimizarRuta: () => void;
  resetDraft: () => void;
}

const INITIAL_FORM: IRutaFormData = {
  nombre: 'RUT-ATL-001',
  territorio_zona: 'Atlántico Este',
  dia_ejecucion: 'Martes',
  frecuencia: 'Semanal',
  hora_inicio: '08:00 AM',
  hora_fin: '05:00 PM',
  descripcion: 'Ruta para atención de clientes industriales en el Atlántico Este.',
  id_asesor: 'ase-001',
};

// Initial stops matching mockup diseno_04.png
const INITIAL_STOPS: IParadaRuta[] = [
  {
    id: 'stop-1',
    id_cliente: 'cli-001',
    cliente: {
      id_cliente: 'cli-001',
      nit: '900.123.456-1',
      razon_social: 'Metalúrgicas S.A.S',
      nombre_comercial: 'Metalúrgicas S.A.S',
      codigo: 'CJI-001245',
      direccion: 'Cra 38 # 74-120',
      departamento: 'Atlántico',
      municipio: 'Barranquilla',
      telefono: '300 123 4567',
      email: 'compras@metalurgicas.com',
      tipo_cliente_nombre: 'Industrial',
      potencial_nombre: 'Alto',
      estado_cliente_nombre: 'Activo',
      latitud: 10.9878,
      longitud: -74.7889,
      activo: true,
    },
    orden: 1,
    hora_sugerida: '08:30 AM',
    estado_visita: 'VISITADO',
  },
  {
    id: 'stop-2',
    id_cliente: 'cli-002',
    cliente: {
      id_cliente: 'cli-002',
      nit: '900.234.567-2',
      razon_social: 'Ferretería del Norte S.A.',
      nombre_comercial: 'Ferretería del Norte',
      codigo: 'CJI-001246',
      direccion: 'Calle 84 # 42-15',
      departamento: 'Atlántico',
      municipio: 'Barranquilla',
      telefono: '310 987 6543',
      email: 'gerencia@ferrenorte.com',
      tipo_cliente_nombre: 'Distribuidor',
      potencial_nombre: 'Medio',
      estado_cliente_nombre: 'Activo',
      latitud: 11.0045,
      longitud: -74.8192,
      activo: true,
    },
    orden: 2,
    hora_sugerida: '10:00 AM',
    estado_visita: 'PENDIENTE',
  },
  {
    id: 'stop-3',
    id_cliente: 'cli-003',
    cliente: {
      id_cliente: 'cli-003',
      nit: '900.345.678-3',
      razon_social: 'Aceros del Caribe Ltda.',
      nombre_comercial: 'Aceros del Caribe',
      codigo: 'CJI-001247',
      direccion: 'Vía 40 # 65-200',
      departamento: 'Atlántico',
      municipio: 'Barranquilla',
      telefono: '315 456 7890',
      email: 'ventas@acerosdelcaribe.com',
      tipo_cliente_nombre: 'Industrial',
      potencial_nombre: 'Alto',
      estado_cliente_nombre: 'Activo',
      latitud: 10.9754,
      longitud: -74.7721,
      activo: true,
    },
    orden: 3,
    hora_sugerida: '11:30 AM',
    estado_visita: 'PENDIENTE',
  },
  {
    id: 'stop-4',
    id_cliente: 'cli-004',
    cliente: {
      id_cliente: 'cli-004',
      nit: '900.456.789-4',
      razon_social: 'Soluciones Industriales de la Costa',
      nombre_comercial: 'Soluciones Industriales',
      codigo: 'CJI-001248',
      direccion: 'Cra 21 # 30-45',
      departamento: 'Atlántico',
      municipio: 'Soledad',
      telefono: '320 123 9988',
      email: 'suministros@soluciones.com',
      tipo_cliente_nombre: 'Industrial',
      potencial_nombre: 'Medio',
      estado_cliente_nombre: 'Activo',
      latitud: 10.9182,
      longitud: -74.7645,
      activo: true,
    },
    orden: 4,
    hora_sugerida: '01:30 PM',
    estado_visita: 'VISITADO',
  },
  {
    id: 'stop-5',
    id_cliente: 'cli-005',
    cliente: {
      id_cliente: 'cli-005',
      nit: '900.567.890-5',
      razon_social: 'ConstruInnova S.A.S',
      nombre_comercial: 'ConstruInnova',
      codigo: 'CJI-001249',
      direccion: 'Calle 30 # 12-50',
      departamento: 'Atlántico',
      municipio: 'Soledad',
      telefono: '301 777 8899',
      email: 'contacto@construinnova.com',
      tipo_cliente_nombre: 'Industrial',
      potencial_nombre: 'Alto',
      estado_cliente_nombre: 'Activo',
      latitud: 10.9234,
      longitud: -74.7556,
      activo: true,
    },
    orden: 5,
    hora_sugerida: '03:00 PM',
    estado_visita: 'PENDIENTE',
  },
  {
    id: 'stop-6',
    id_cliente: 'cli-006',
    cliente: {
      id_cliente: 'cli-006',
      nit: '900.678.901-6',
      razon_social: 'Distribuciones JM del Atlántico',
      nombre_comercial: 'Distribuciones JM',
      codigo: 'CJI-001250',
      direccion: 'Cra 5 # 18-60',
      departamento: 'Atlántico',
      municipio: 'Malambo',
      telefono: '318 444 3322',
      email: 'pedidos@distribucionesjm.com',
      tipo_cliente_nombre: 'Distribuidor',
      potencial_nombre: 'Medio',
      estado_cliente_nombre: 'Activo',
      latitud: 10.8621,
      longitud: -74.7733,
      activo: true,
    },
    orden: 6,
    hora_sugerida: '04:00 PM',
    estado_visita: 'REPROGRAMADO',
  },
  {
    id: 'stop-7',
    id_cliente: 'cli-007',
    cliente: {
      id_cliente: 'cli-007',
      nit: '900.789.012-7',
      razon_social: 'Ferretería La 14 Comercial',
      nombre_comercial: 'Ferretería La 14',
      codigo: 'CJI-001251',
      direccion: 'Calle 16 # 9-30',
      departamento: 'Atlántico',
      municipio: 'Malambo',
      telefono: '317 222 1100',
      email: 'ventas@ferreteriala14.com',
      tipo_cliente_nombre: 'Retail',
      potencial_nombre: 'Bajo',
      estado_cliente_nombre: 'Activo',
      latitud: 10.8589,
      longitud: -74.7801,
      activo: true,
    },
    orden: 7,
    hora_sugerida: '04:45 PM',
    estado_visita: 'SIN_VISITAR',
  },
];

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  currentStep: 2, // Default to Step 2 to show the main design interface as in diseno_04.png
  formData: INITIAL_FORM,
  paradas: INITIAL_STOPS,
  distanciaTotalKm: 68.5,
  tiempoTotalMin: 495, // 8h 15m

  setStep: (step) => set({ currentStep: step }),

  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  agregarCliente: (cliente) => {
    const { paradas } = get();
    // Check if already in route
    if (paradas.some((p) => p.id_cliente === cliente.id_cliente)) {
      return;
    }
    const nextOrden = paradas.length + 1;
    const newStop: IParadaRuta = {
      id: `stop-${Date.now()}`,
      id_cliente: cliente.id_cliente,
      cliente,
      orden: nextOrden,
      hora_sugerida: `0${Math.min(8 + nextOrden, 17)}:00 ${nextOrden > 4 ? 'PM' : 'AM'}`,
      estado_visita: 'NO_ASIGNADO',
    };
    const updated = [...paradas, newStop];
    set({
      paradas: updated,
      distanciaTotalKm: Number((updated.length * 9.8).toFixed(1)),
      tiempoTotalMin: updated.length * 70,
    });
  },

  eliminarParada: (id) => {
    const { paradas } = get();
    const filtered = paradas.filter((p) => p.id !== id);
    // Recalculate order numbers
    const updated = filtered.map((p, index) => ({
      ...p,
      orden: index + 1,
    }));
    set({
      paradas: updated,
      distanciaTotalKm: Number((updated.length * 9.8).toFixed(1)),
      tiempoTotalMin: updated.length * 70,
    });
  },

  reordenarParadas: (newParadas) => {
    const updated = newParadas.map((p, index) => ({
      ...p,
      orden: index + 1,
    }));
    set({ paradas: updated });
  },

  limpiarRuta: () => {
    set({
      paradas: [],
      distanciaTotalKm: 0,
      tiempoTotalMin: 0,
    });
  },

  optimizarRuta: () => {
    const { paradas } = get();
    if (paradas.length <= 1) return;
    // Sort geographically by latitude descending for demo optimization
    const sorted = [...paradas].sort((a, b) => b.cliente.latitud - a.cliente.latitud);
    const updated = sorted.map((p, index) => ({
      ...p,
      orden: index + 1,
    }));
    set({
      paradas: updated,
      distanciaTotalKm: Math.max(15, Number((updated.length * 8.2).toFixed(1))),
      tiempoTotalMin: Math.max(60, updated.length * 60),
    });
  },

  resetDraft: () => {
    set({
      currentStep: 1,
      formData: INITIAL_FORM,
      paradas: INITIAL_STOPS,
      distanciaTotalKm: 68.5,
      tiempoTotalMin: 495,
    });
  },
}));
