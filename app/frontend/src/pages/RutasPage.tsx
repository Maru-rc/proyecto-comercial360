import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Plus, RotateCcw } from 'lucide-react';
import { RouteStepper } from '../components/rutas/RouteStepper';
import { GeneralInfoForm } from '../components/rutas/GeneralInfoForm';
import { SortableStopTable } from '../components/rutas/SortableStopTable';
import { CustomerPicker } from '../components/rutas/CustomerPicker';
import { RouteSummary } from '../components/rutas/RouteSummary';
import {
  OpenStreetMapViewer,
  IMapMarkerItem,
} from '../components/maps/OpenStreetMapViewer';
import { useRouteDraftStore } from '../store/useRouteDraftStore';
import { useRutas } from '../hooks/useRutas';
import { apiErrorMessage } from '../api/client';
import { notifyError, notifyFormErrors, notifySuccess } from '../lib/alerts';

export const RutasPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    setStep,
    paradas,
    formData,
    limpiarRuta,
    optimizarRuta,
    resetDraft,
  } = useRouteDraftStore();
  const { crearRuta, isCreating } = useRutas();

  // Map markers from draft paradas
  const markers: IMapMarkerItem[] = (paradas || []).map((p) => ({
    id: p.id,
    lat: p.cliente?.latitud ?? 10.9685,
    lng: p.cliente?.longitud ?? -74.7813,
    title: p.cliente?.nombre_comercial || 'Cliente',
    subtitle: `${p.hora_sugerida || ''} • ${p.cliente?.tipo_cliente_nombre || ''}`,
    orden: p.orden,
    estado: p.estado_visita || 'NO_ASIGNADO',
    direccion: p.cliente?.direccion || '',
  }));

  const handleSaveAndAssign = async () => {
    if (!formData.nombre.trim()) {
      notifyFormErrors(['Escribe el nombre de la ruta.']);
      return;
    }
    if (!formData.territorio_zona) {
      notifyFormErrors(['Selecciona la zona de la ruta.']);
      return;
    }
    // crearRuta only assigns (and generates visits) with an advisor and stops
    const seAsigna = Boolean(formData.id_asesor) && paradas.length > 0;
    try {
      await crearRuta({ formData, paradas });
      // The next route starts empty instead of reusing this one's data
      resetDraft();
      notifySuccess(
        seAsigna ? 'Ruta asignada y programada' : 'Ruta guardada como borrador',
        seAsigna ? undefined : 'Falta asesor o paradas para asignarla.',
      );
      navigate('/rutas/asignadas');
    } catch (error) {
      // Nada se guarda en local: se muestra lo que respondió el backend
      notifyError(
        'No se pudo guardar la ruta',
        apiErrorMessage(
          error,
          'No se pudo guardar la ruta. Revisa los datos e intenta de nuevo.',
        ),
      );
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Bar with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Creación de rutas
          </h1>
          <p className="text-xs text-slate-500">
            Diseña la ruta comercial ordenando las visitas para máxima
            eficiencia.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isCreating}
            onClick={handleSaveAndAssign}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isCreating ? 'Guardando...' : 'Guardar y asignar'}
          </button>
        </div>
      </div>

      {/* Stepper Header */}
      <RouteStepper currentStep={currentStep} onStepChange={setStep} />

      {/* Main 3-Column Layout from diseno_04.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Información general de la ruta (3 cols ~ 25%) */}
        <div className="lg:col-span-3">
          <GeneralInfoForm />
        </div>

        {/* Center Column: Map & Paradas Drag & Drop Table (6 cols ~ 50%) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Map Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={optimizarRuta}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Optimizar ruta
              </button>

              <span className="text-xs text-slate-500 font-semibold">
                {paradas.length} paradas en trazado
              </span>
            </div>

            <OpenStreetMapViewer
              markers={markers}
              center={[10.9685, -74.7813]}
              zoom={12}
              height="300px"
              legendTitle="Estados en la ruta"
            />

            {/* Buttons under map */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  const picker = document.getElementById(
                    'customer-picker-input',
                  );
                  picker?.focus();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EA580C] text-[#EA580C] hover:bg-orange-50/50 bg-white px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar cliente
              </button>

              <button
                type="button"
                onClick={limpiarRuta}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar ruta
              </button>
            </div>
          </div>

          {/* Sortable Paradas Table with @dnd-kit */}
          <SortableStopTable />
        </div>

        {/* Right Column: Customer Picker & Summary (3 cols ~ 25%) */}
        <div className="lg:col-span-3 space-y-4">
          <CustomerPicker />
          <RouteSummary />
        </div>
      </div>
    </div>
  );
};
