import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Clock,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import {
  getClienteHistorial,
  type ClienteHistorialItem,
} from '../../api/clientes';

interface CustomerInteractionsTimelineProps {
  clienteId?: string | number;
}

const resolveInteractionStyle = (
  accion: string,
): { icon: LucideIcon; color: string } => {
  const lower = accion.toLowerCase();
  if (lower.includes('cotizaci')) {
    return {
      icon: FileText,
      color: 'text-[#2563EB] bg-blue-50 border-blue-200',
    };
  }
  if (lower.includes('pedido')) {
    return {
      icon: ShoppingCart,
      color: 'text-[#7C3AED] bg-purple-50 border-purple-200',
    };
  }
  if (lower.includes('seguimiento') || lower.includes('reprogram')) {
    return {
      icon: Clock,
      color: 'text-[#EA580C] bg-orange-50 border-orange-200',
    };
  }
  if (lower.includes('cliente')) {
    return {
      icon: UserPlus,
      color: 'text-slate-700 bg-slate-100 border-slate-300',
    };
  }
  return {
    icon: CheckCircle2,
    color: 'text-[#16A34A] bg-emerald-50 border-emerald-200',
  };
};

const formatHistoryDate = (raw: string): string => {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const CustomerInteractionsTimeline: React.FC<
  CustomerInteractionsTimelineProps
> = ({ clienteId }) => {
  const [history, setHistory] = useState<ClienteHistorialItem[]>([]);

  useEffect(() => {
    getClienteHistorial(clienteId, 3).then(setHistory);
  }, [clienteId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-slate-100 pb-2">
        Últimas interacciones
      </h4>

      <div className="relative pl-6 space-y-4 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
        {history.map((item, idx) => {
          const { icon: Icon, color } = resolveInteractionStyle(item.accion);
          return (
            <div key={item.id_historial ?? idx} className="relative">
              <span
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-2xs ${color}`}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formatHistoryDate(item.fecha)}
                </span>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {item.accion}
                </p>
                {item.descripcion && (
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {item.descripcion}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
