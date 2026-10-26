import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Play, ChevronRight, Clock } from 'lucide-react';
import { IAgendaItem } from '../../types/kpi';

interface DailyAgendaProps {
  items: IAgendaItem[];
  fechaTexto?: string;
}

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  items,
  fechaTexto = '',
}) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || '');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/90 shadow-xs p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A]">Agenda del día</h2>
          <p className="text-xs font-semibold text-[#EA580C]">{fechaTexto}</p>
        </div>
        <Clock className="h-4 w-4 text-slate-400" />
      </div>

      {/* List */}
      <div className="flex-1 space-y-2.5 py-3 overflow-y-auto">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const isVisitado = item.estado === 'Visitado';
          const isPendiente = item.estado === 'Pendiente';
          const isReprogramado = item.estado === 'Reprogramado';

          let badgeColor = 'bg-slate-100 text-slate-600';
          let numberBg = 'bg-slate-500 text-white';

          if (isVisitado) {
            badgeColor = 'text-[#16A34A]';
            numberBg = 'bg-[#16A34A] text-white';
          } else if (isPendiente) {
            badgeColor = 'text-[#EA580C]';
            numberBg = 'bg-[#EA580C] text-white';
          } else if (isReprogramado) {
            badgeColor = 'text-[#DC2626]';
            numberBg = 'bg-[#DC2626] text-white';
          }

          return (
            <div
              key={item.id}
              onClick={() => setSelectedId(isSelected ? '' : item.id)}
              className={`rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#EA580C] bg-orange-50/20 shadow-xs'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              {/* Summary line */}
              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${numberBg}`}
                  >
                    {item.orden}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {item.hora}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {item.cliente}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${badgeColor}`}>
                    {item.estado}
                  </span>
                  {isVisitado && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  )}
                </div>
              </div>

              {/* Expanded details (shown if selected) */}
              {isSelected && (
                <div className="px-3 pb-3 pt-1 border-t border-orange-100/60 mt-1 space-y-2">
                  <div className="space-y-1 text-xs">
                    {item.contacto && (
                      <div className="flex items-baseline gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Contacto:
                        </span>
                        <span>{item.contacto}</span>
                      </div>
                    )}
                    {item.objetivo && (
                      <div className="flex items-baseline gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Objetivo:
                        </span>
                        <span>{item.objetivo}</span>
                      </div>
                    )}
                    {item.potencial && (
                      <div className="flex items-baseline gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Potencial:
                        </span>
                        <span className="text-[#EA580C] font-bold">
                          {item.potencial}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Iniciar Visita button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/visitas/registrar?cliente=${encodeURIComponent(
                          item.cliente,
                        )}&visita=${item.id}${item.hora !== '—' ? `&hora=${encodeURIComponent(item.hora)}` : ''}`,
                      );
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white py-2 px-4 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Iniciar visita
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => navigate('/agenda')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#EA580C] cursor-pointer transition-colors"
        >
          Ver agenda completa <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
