import React from 'react';
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { IVisitaRegistroFormData } from '../../types/visita';

interface VisitCommercialFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
  watch: UseFormWatch<IVisitaRegistroFormData>;
  setValue: UseFormSetValue<IVisitaRegistroFormData>;
}

export const VisitCommercialForm: React.FC<VisitCommercialFormProps> = ({
  register,
  watch,
  setValue,
}) => {
  const generoCotizacion = watch('genero_cotizacion');
  const generoPedido = watch('genero_pedido');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F172A] text-white text-xs font-bold">
          4
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">Gestión comercial</h3>
      </div>

      {/* Row 1: Cotización */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Toggle ¿Se generó cotización? */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              ¿Se generó cotización? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setValue('genero_cotizacion', true)}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  generoCotizacion
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setValue('genero_cotizacion', false)}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  !generoCotizacion
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {generoCotizacion && (
            <>
              {/* Número de cotización */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Número de cotización
                </label>
                <input
                  type="text"
                  {...register('numero_cotizacion')}
                  placeholder="COT-1242"
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-bold font-mono text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Valor cotización */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Valor cotización
                </label>
                <input
                  type="number"
                  {...register('valor_cotizacion', { valueAsNumber: true })}
                  placeholder="24800000"
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-bold text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Moneda */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Moneda
                </label>
                <select
                  {...register('moneda')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
                >
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Pedido */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Toggle ¿Se generó pedido? */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              ¿Se generó pedido? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setValue('genero_pedido', true)}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  generoPedido
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setValue('genero_pedido', false)}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  !generoPedido
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {generoPedido && (
            <>
              {/* Número de pedido */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Número de pedido
                </label>
                <input
                  type="text"
                  {...register('numero_pedido')}
                  placeholder="PED-568"
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-bold font-mono text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Valor pedido */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Valor pedido
                </label>
                <input
                  type="number"
                  {...register('valor_pedido', { valueAsNumber: true })}
                  placeholder="18500000"
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-bold text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Fecha estimada entrega */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Fecha estimada entrega
                </label>
                <input
                  type="date"
                  {...register('fecha_estimada_entrega')}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
