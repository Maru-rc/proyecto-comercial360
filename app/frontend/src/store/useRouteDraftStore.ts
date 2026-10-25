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
  nombre: '',
  territorio_zona: '',
  dia_ejecucion: 'Lunes',
  frecuencia: 'Semanal',
  hora_inicio: '',
  hora_fin: '',
  descripcion: '',
  id_asesor: '',
};

const INITIAL_STOPS: IParadaRuta[] = [];

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
    const sorted = [...paradas].sort(
      (a, b) => b.cliente.latitud - a.cliente.latitud,
    );
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
