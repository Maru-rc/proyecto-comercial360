import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { IVisitaRegistroFormData } from '../../types/visita';
import { Search } from 'lucide-react';

interface VisitCustomerFormProps {
  register: UseFormRegister<IVisitaRegistroFormData>;
  errors: FieldErrors<IVisitaRegistroFormData>;
  setValue?: UseFormSetValue<IVisitaRegistroFormData>;
}

export const VisitCustomerForm: React.FC<VisitCustomerFormProps> = ({
  register,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F172A] text-white text-xs font-bold">
          2
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Información del cliente
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cliente */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Cliente <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('cliente_nombre')}
              placeholder="Buscar cliente..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-xs font-bold text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
            <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Código cliente */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Código cliente
          </label>
          <input
            type="text"
            {...register('codigo_cliente')}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none"
          />
        </div>

        {/* Tipo cliente */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Tipo cliente
          </label>
          <select
            {...register('tipo_cliente')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Industrial">Industrial</option>
            <option value="Distribuidor">Distribuidor</option>
            <option value="Retail">Retail</option>
            <option value="Constructor">Constructor</option>
          </select>
        </div>

        {/* Municipio */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Municipio <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('municipio')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Barranquilla">Barranquilla</option>
            <option value="Soledad">Soledad</option>
            <option value="Malambo">Malambo</option>
            <option value="Galapa">Galapa</option>
            <option value="Puerto Colombia">Puerto Colombia</option>
          </select>
        </div>

        {/* Contacto */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Contacto
          </label>
          <input
            type="text"
            {...register('contacto')}
            placeholder="Nombre de contacto"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Teléfono
          </label>
          <input
            type="text"
            {...register('telefono')}
            placeholder="300 123 4567"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Cargo */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Cargo
          </label>
          <input
            type="text"
            {...register('cargo')}
            placeholder="Jefe de Compras"
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        {/* Canal de contacto */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Canal de contacto
          </label>
          <select
            {...register('canal_contacto')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Presencial">Presencial</option>
            <option value="Telefónico">Telefónico</option>
            <option value="Videollamada">Videollamada</option>
            <option value="Correo electrónico">Correo electrónico</option>
          </select>
        </div>
      </div>
    </div>
  );
};
