import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { IVisitaRegistroFormData } from '../../types/visita';

interface VisitDetailFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
  errors: FieldErrors<IVisitaRegistroFormData>;
  watch: UseFormWatch<IVisitaRegistroFormData>;
}

export const VisitDetailForm: React.FC<VisitDetailFormProps> = ({
  register,
  watch,
}) => {
  const observaciones = watch('observaciones') || '';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F172A] text-white text-xs font-bold">
          3
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Información de la visita
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Objetivo de la visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Objetivo de la visita <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('objetivo_visita')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Presentación de nueva línea">
              Presentación de nueva línea
            </option>
            <option value="Cierre de cotización">Cierre de cotización</option>
            <option value="Seguimiento de entregas">
              Seguimiento de entregas
            </option>
            <option value="Cobranza y cartera">Cobranza y cartera</option>
            <option value="Prospección inicial">Prospección inicial</option>
          </select>
        </div>

        {/* Tipo de visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Tipo de visita <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('tipo_visita')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Desarrollo de cliente">Desarrollo de cliente</option>
            <option value="Mantenimiento de cuenta">
              Mantenimiento de cuenta
            </option>
            <option value="Recuperación">Recuperación</option>
            <option value="Visita técnica">Visita técnica</option>
          </select>
        </div>

        {/* Potencial del cliente */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Potencial del cliente <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('potencial_cliente')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
          </select>
        </div>

        {/* Estado de la visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Estado de la visita <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('estado_visita')}
            className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 py-2 px-3 text-xs font-bold text-emerald-800 focus:border-[#16A34A] focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
          >
            <option value="VISITADO">Visitado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="REPROGRAMADO">Reprogramado</option>
            <option value="SIN_VISITAR">Sin visitar</option>
          </select>
        </div>

        {/* Resultado de la visita */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Resultado de la visita <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('resultado_visita')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Interesado">Interesado</option>
            <option value="Pedido">Pedido</option>
            <option value="Cotización enviada">Cotización enviada</option>
            <option value="No visitado">No visitado</option>
            <option value="No interesado">No interesado</option>
          </select>
        </div>

        {/* Interés en nuestros productos */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Interés en nuestros productos{' '}
            <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('interes_productos')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
          </select>
        </div>

        {/* Módulo de interés */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Módulo de interés
          </label>
          <input
            type="text"
            {...register('modulo_interes')}
            placeholder="Calidad y precio"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Competencia mencionada */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Competencia mencionada
          </label>
          <input
            type="text"
            {...register('competencia_mencionada')}
            placeholder="Inducacor"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
      </div>

      {/* Observaciones con contador de 500 caracteres */}
      <div className="space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Observaciones de la visita <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {observaciones.length}/500
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          {...register('observaciones')}
          placeholder="Cliente interesado en la nueva línea de equipos de soldadura. Solicita cotización formal y muestras de productos."
          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] resize-none"
        />
      </div>
    </div>
  );
};
