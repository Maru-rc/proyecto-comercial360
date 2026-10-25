import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { IVisitaRegistroFormData } from '../../types/visita';

interface VisitFollowupFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
}

export const VisitFollowupForm: React.FC<VisitFollowupFormProps> = ({
  register,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F172A] text-white text-xs font-bold">
          5
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Próximo seguimiento
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha próxima visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Fecha próxima visita <span className="text-rose-500">*</span>
          </label>
          <input
            id="fecha_proxima_visita"
            type="date"
            {...register('fecha_proxima_visita')}
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Hora próxima visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Hora próxima visita
          </label>
          <input
            type="text"
            {...register('hora_proxima_visita')}
            placeholder="09:00 AM"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Objetivo próximo seguimiento */}
        <div className="space-y-1 lg:col-span-1">
          <label className="block text-xs font-semibold text-slate-700">
            Objetivo próximo seguimiento
          </label>
          <input
            type="text"
            {...register('objetivo_proximo_seguimiento')}
            placeholder="Presentar propuesta técnica y cierre comercial"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Responsable */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Responsable
          </label>
          <input
            type="text"
            {...register('responsable_seguimiento')}
            placeholder="Juan Pérez"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
      </div>
    </div>
  );
};
