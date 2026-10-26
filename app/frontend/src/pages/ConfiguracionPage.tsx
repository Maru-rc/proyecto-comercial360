import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Database, Check, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRouteDraftStore } from '../store/useRouteDraftStore';
import { apiClient } from '../api/client';

interface HealthResponse {
  status: string;
  uptimeSeconds: number;
  services: { database: { status: string; responseTimeMs?: number } };
}

const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
};

const ROL_TEXTO: Record<string, string> = {
  DIRECTOR_REGIONAL: 'Director Regional',
  ASESOR: 'Asesor Comercial',
  ADMIN: 'Administrador',
};

const iniciales = (nombre?: string) =>
  (nombre || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');

const Dato: React.FC<{ etiqueta: string; valor?: string }> = ({
  etiqueta,
  valor,
}) => (
  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
    <span className="text-[10px] text-slate-400 block font-semibold">
      {etiqueta}
    </span>
    <span className="text-xs font-bold text-slate-800">{valor || '—'}</span>
  </div>
);

export const ConfiguracionPage: React.FC = () => {
  const { user } = useAuthStore();
  const { limpiarRuta } = useRouteDraftStore();
  const [activeTab, setActiveTab] = useState<'perfil' | 'sistema'>('perfil');
  const [toastMessage, setToastMessage] = useState('');

  // Real status of the API and the database (GET /api/health)
  const health = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    enabled: activeTab === 'sistema',
    staleTime: 1000 * 30,
  });
  const baseDatosArriba = health.data?.services.database.status === 'up';

  const tabClass = (tab: 'perfil' | 'sistema') =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
      activeTab === tab
        ? 'bg-[#0F172A] text-white'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    }`;

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <h1 className="text-lg font-extrabold text-[#0F172A]">
          Configuración de Comercial 360
        </h1>
        <p className="text-xs text-slate-500">
          Consulta los datos de tu cuenta y el estado de los servicios.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={tabClass('perfil')}
        >
          <User className="h-4 w-4" />
          Mi Perfil y Rol
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sistema')}
          className={tabClass('sistema')}
        >
          <Database className="h-4 w-4" />
          Sistema
        </button>
      </div>

      {/* Tab 1: Perfil (solo lectura: no hay endpoint para editar el perfil) */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-xl font-extrabold text-[#EA580C] ring-4 ring-orange-50">
              {iniciales(user?.nombre)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {user?.nombre}
              </h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                {ROL_TEXTO[user?.rol ?? ''] ?? user?.rol}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Dato etiqueta="Nombre completo" valor={user?.nombre} />
            <Dato etiqueta="Correo corporativo" valor={user?.email} />
            <Dato
              etiqueta="Rol"
              valor={ROL_TEXTO[user?.rol ?? ''] ?? user?.rol}
            />
            <Dato etiqueta="Teléfono" valor={user?.telefono} />
          </div>
          <p className="text-[11px] text-slate-400">
            Para cambiar estos datos, contacta al administrador.
          </p>
        </div>
      )}

      {/* Tab 2: Sistema */}
      {activeTab === 'sistema' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Estado de servicios
            </h2>
            <p className="text-xs text-slate-500">
              Consultado en este momento al backend (/api/health).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">
                API
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {import.meta.env.VITE_API_URL || '/api'}
              </span>
              <span
                className={`text-[10px] block mt-1 font-semibold ${
                  health.isError ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {health.isLoading
                  ? 'Consultando...'
                  : health.isError
                    ? 'Sin respuesta'
                    : 'En línea'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Base de datos
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                PostgreSQL
              </span>
              <span
                className={`text-[10px] block mt-1 font-semibold ${
                  baseDatosArriba ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {health.isLoading
                  ? 'Consultando...'
                  : baseDatosArriba
                    ? `Conectada (${health.data?.services.database.responseTimeMs ?? 0} ms)`
                    : 'Sin conexión'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Mapas y archivos
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                OpenStreetMap · Amazon S3
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                Archivos con URLs firmadas
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                Restablecer borrador de rutas
              </span>
              <span className="text-[11px] text-slate-500">
                Limpia las paradas temporales cargadas en el planificador de
                rutas.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                limpiarRuta();
                setToastMessage('Borrador de rutas limpiado correctamente.');
                setTimeout(() => setToastMessage(''), 3000);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar borrador
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Check className="h-5 w-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
