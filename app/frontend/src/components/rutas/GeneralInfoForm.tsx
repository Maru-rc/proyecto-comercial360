import React from 'react';
import { useRouteDraftStore } from '../../store/useRouteDraftStore';

export const GeneralInfoForm: React.FC = () => {
  const { formData, updateFormData } = useRouteDraftStore();

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 200) {
      updateFormData({ descripcion: e.target.value });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-2">
        Información general de la ruta
      </h3>

      {/* Nombre de la ruta */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Nombre de la ruta <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => updateFormData({ nombre: e.target.value })}
          placeholder="Ej. RUT-ATL-001"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
        />
      </div>

      {/* Territorio / Zona */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Territorio / Zona <span className="text-rose-500">*</span>
        </label>
        <select
          value={formData.territorio_zona}
          onChange={(e) => updateFormData({ territorio_zona: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
        >
          <option value="Atlántico Este">Atlántico Este</option>
          <option value="Atlántico Norte">Atlántico Norte</option>
          <option value="Atlántico Sur">Atlántico Sur</option>
          <option value="Barranquilla Centro">Barranquilla Centro</option>
        </select>
      </div>

      {/* Día de ejecución */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Día de ejecución <span className="text-rose-500">*</span>
        </label>
        <select
          value={formData.dia_ejecucion}
          onChange={(e) => updateFormData({ dia_ejecucion: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
        >
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
        </select>
      </div>

      {/* Frecuencia */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Frecuencia <span className="text-rose-500">*</span>
        </label>
        <select
          value={formData.frecuencia}
          onChange={(e) => updateFormData({ frecuencia: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
        >
          <option value="Diaria">Diaria</option>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
        </select>
      </div>

      {/* Horas sugeridas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Inicio sugerido <span className="text-rose-500">*</span>
          </label>
          <input
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => updateFormData({ hora_inicio: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Fin sugerido <span className="text-rose-500">*</span>
          </label>
          <input
            type="time"
            value={formData.hora_fin}
            onChange={(e) => updateFormData({ hora_fin: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
      </div>

      {/* Descripción with counter */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-slate-700">
            Descripción
          </label>
          <span className="text-[10px] text-slate-400">
            {formData.descripcion.length}/200
          </span>
        </div>
        <textarea
          rows={3}
          value={formData.descripcion}
          onChange={handleDescChange}
          placeholder="Describe el objetivo y alcance de esta ruta..."
          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] resize-none"
        />
      </div>
    </div>
  );
};
