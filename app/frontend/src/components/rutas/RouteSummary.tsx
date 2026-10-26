import React from 'react';
import { Info, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouteDraftStore } from '../../store/useRouteDraftStore';
import { getAsesores } from '../../api/rutas';

export const RouteSummary: React.FC = () => {
  const {
    paradas,
    distanciaTotalKm,
    tiempoTotalMin,
    formData,
    updateFormData,
  } = useRouteDraftStore();
  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores'],
    queryFn: getAsesores,
  });

  const hours = Math.floor(tiempoTotalMin / 60);
  const minutes = tiempoTotalMin % 60;
  const timeFormatted = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  return (
    <div className="space-y-4">
      {/* Asignar ruta a asesor */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          Asignar ruta a asesor
        </h4>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Asesor comercial <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={formData.id_asesor || ''}
              onChange={(e) => updateFormData({ id_asesor: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
            >
              <option value="">Sin asignar</option>
              {asesores.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de la ruta */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          Resumen de la ruta
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-100">
          <div>
            <p className="text-xl font-extrabold text-[#0F172A]">
              {paradas.length}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Paradas</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-[#0F172A]">
              {distanciaTotalKm.toLocaleString('es-CO')} km
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Distancia aprox.
            </p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-[#0F172A]">
              {timeFormatted}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Tiempo estimado
            </p>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="flex items-start gap-2.5 rounded-lg bg-blue-50/80 p-3 text-blue-900 border border-blue-100">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-blue-800">
            La ruta será asignada al asesor seleccionado para el día y
            frecuencia configurados.
          </p>
        </div>
      </div>
    </div>
  );
};
