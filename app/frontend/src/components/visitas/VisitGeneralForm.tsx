import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { IVisitaRegistroFormData } from '../../types/visita';

interface VisitGeneralFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
  errors: FieldErrors<IVisitaRegistroFormData>;
}

export const VisitGeneralForm: React.FC<VisitGeneralFormProps> = ({
  register,
}) => {
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
              type="text"
              {...register('hora_inicio')}
              placeholder="10:15 AM"
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
              type="text"
              {...register('hora_fin')}
              placeholder="11:30 AM"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
        </div>

        {/* Ruta */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Ruta <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('id_ruta')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="RUT-002">RUT-002 (Atlántico)</option>
            <option value="RUT-ATL-001">RUT-ATL-001</option>
            <option value="RUT-003">RUT-003</option>
          </select>
        </div>

        {/* Territorio */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Territorio <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('territorio')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="NORTE">NORTE</option>
            <option value="SUR">SUR</option>
            <option value="CENTRO">CENTRO</option>
            <option value="ORIENTE">ORIENTE</option>
          </select>
        </div>

        {/* Semana */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Semana <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('semana', { valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value={21}>21 (20 - 26 May 2024)</option>
            <option value={22}>22 (27 May - 02 Jun 2024)</option>
            <option value={20}>20 (13 - 19 May 2024)</option>
          </select>
        </div>

        {/* Día */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Día <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('dia')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Martes">Martes</option>
            <option value="Lunes">Lunes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
          </select>
        </div>

        {/* Asesor */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Asesor <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('asesor_nombre')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Juan Pérez">Juan Pérez</option>
            <option value="Carlos Gómez">Carlos Gómez</option>
            <option value="Laura Restrepo">Laura Restrepo</option>
          </select>
        </div>
      </div>
    </div>
  );
};
