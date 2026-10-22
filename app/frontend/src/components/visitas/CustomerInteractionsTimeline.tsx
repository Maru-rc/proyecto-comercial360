import React from 'react';
import { CheckCircle2, FileText, Clock, ChevronRight } from 'lucide-react';

export const CustomerInteractionsTimeline: React.FC = () => {
  const interactions = [
    {
      fecha: '14/05/2024',
      titulo: 'Visita realizada',
      detalle: 'Resultado: Interesado',
      icon: CheckCircle2,
      color: 'text-[#16A34A] bg-emerald-50 border-emerald-200',
    },
    {
      fecha: '07/05/2024',
      titulo: 'Cotización enviada',
      detalle: 'COT-1241 | $ 12,600,000',
      icon: FileText,
      color: 'text-[#2563EB] bg-blue-50 border-blue-200',
    },
    {
      fecha: '30/04/2024',
      titulo: 'Seguimiento telefónico',
      detalle: 'Pendiente de respuesta',
      icon: Clock,
      color: 'text-[#EA580C] bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-slate-100 pb-2">
        Últimas interacciones
      </h4>

      <div className="relative pl-6 space-y-4 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
        {interactions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="relative">
              <span
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-2xs ${item.color}`}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">{item.fecha}</span>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {item.titulo}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {item.detalle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#EA580C] cursor-pointer transition-colors"
        >
          Ver historial completo <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
