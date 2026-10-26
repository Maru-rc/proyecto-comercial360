import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { IVisitaRegistroFormData } from '../../types/visita';
import { useRutas } from '../../hooks/useRutas';
import { getCatalogosClientes } from '../../api/clientes';

interface VisitGeneralFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
  errors: FieldErrors<IVisitaRegistroFormData>;
}

export const VisitGeneralForm: React.FC<VisitGeneralFormProps> = ({
  register,
}) => {
  const { rutas } = useRutas();
  const { data: catalogos } = useQuery({
    queryKey: ['clientes', 'catalogos'],
    queryFn: getCatalogosClientes,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F172A] text-white text-xs font-bold">
          1
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Información general de la visita
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha de visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Fecha de visita <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              {...register('fecha_visita')}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
        </div>

        {/* Hora inicio */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Hora inicio <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="time"
              {...register('hora_inicio')}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
        </div>

        {/* Hora fin */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Hora fin <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="time"
              {...register('hora_fin')}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
        </div>

        {/* Ruta */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Ruta
          </label>
          <select
            {...register('id_ruta')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="">Sin ruta (visita no planeada)</option>
            {rutas.map((ruta) => (
              <option key={ruta.id_ruta} value={ruta.id_ruta}>
                {ruta.codigo} · {ruta.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Territorio */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Territorio
          </label>
          <select
            {...register('territorio')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="">Sin territorio</option>
            {catalogos?.zonas.map((zona) => (
              <option key={zona.id} value={zona.nombre}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Semana */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Semana <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            readOnly
            {...register('semana', { valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Día */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Día <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            readOnly
            {...register('dia')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Asesor */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Asesor <span className="text-rose-500">*</span>
          </label>
          {/* The advisor always comes from the session (HU-10) */}
          <input
            {...register('asesor_nombre')}
            readOnly
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
