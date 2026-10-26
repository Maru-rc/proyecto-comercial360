import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { KpiCards } from '../components/dashboard/KpiCards';
import {
  OpenStreetMapViewer,
  IMapMarkerItem,
} from '../components/maps/OpenStreetMapViewer';
import { DailyAgenda } from '../components/dashboard/DailyAgenda';
import { VisitsTable } from '../components/dashboard/VisitsTable';
import { useDashboardKpis } from '../hooks/useDashboardKpis';
import { useRouteDraftStore } from '../store/useRouteDraftStore';

const HOY_TEXTO = new Date().toLocaleDateString('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { kpis, filasSeguimiento, agendaItems, isLoadingKpis } =
    useDashboardKpis();
  const { paradas } = useRouteDraftStore();

  // Convert paradas to map markers
  const markers: IMapMarkerItem[] = (paradas || []).map((p) => ({
    id: p.id,
    lat: p.cliente?.latitud ?? 10.9685,
    lng: p.cliente?.longitud ?? -74.7813,
    title: p.cliente?.nombre_comercial || 'Cliente',
    subtitle: `${p.cliente?.tipo_cliente_nombre || ''} • ${p.hora_sugerida || ''}`,
    orden: p.orden,
    estado: p.estado_visita || 'PENDIENTE',
    direccion: p.cliente?.direccion || '',
  }));

  if (isLoadingKpis || !kpis) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA580C] mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">
            Cargando métricas y agenda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 relative">
      {/* 6 KPI Cards Row */}
      <KpiCards data={kpis} />

      {/* Main Grid: Left (Map + Table) & Right (Daily Agenda) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols in 12-grid ~ 67%) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Map Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Mapa de ruta - Martes 21 de mayo
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {paradas.length} paradas programadas
              </span>
            </div>

            <OpenStreetMapViewer
              markers={markers}
              center={[10.9685, -74.7813]}
              zoom={12}
              height="340px"
              legendTitle="Estado de visita"
              onMarkerClick={(item) => {
                navigate(
                  `/visitas/registrar?cliente=${encodeURIComponent(item.title)}`,
                );
              }}
            />
          </div>

          {/* Visits Tracking Table */}
          <VisitsTable filas={filasSeguimiento} />
        </div>

        {/* Right Column (4 cols in 12-grid ~ 33%) */}
        <div className="lg:col-span-4">
          <DailyAgenda items={agendaItems} fechaTexto={HOY_TEXTO} />
        </div>
      </div>

      {/* Floating Action Button (FAB) "+ Registrar visita" from diseno_02.png */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => navigate('/visitas/registrar')}
          className="flex flex-col items-center justify-center w-18 h-18 rounded-full bg-[#EA580C] hover:bg-[#D9480F] text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer ring-4 ring-white"
          title="Registrar nueva visita"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
          <span className="text-[10px] font-extrabold leading-tight text-center px-1">
            Registrar
            <br />
            visita
          </span>
        </button>
      </div>

      {/* Dashboard Footer */}
      <footer className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 border-t border-slate-200">
        <p>© 2024 Comercial 360. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <a href="#ayuda" className="hover:underline">
            Ayuda
          </a>
          <a href="#terminos" className="hover:underline">
            Términos y condiciones
          </a>
          <a href="#privacidad" className="hover:underline">
            Política de privacidad
          </a>
          <span className="text-slate-400 font-mono">Versión 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};
