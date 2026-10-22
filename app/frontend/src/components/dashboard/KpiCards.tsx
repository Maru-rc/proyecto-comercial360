import React from 'react';
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import { IKpisDashboard } from '../../types/kpi';

interface KpiCardsProps {
  data: IKpisDashboard;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  const formatCurrency = (val: number) => {
    return '$ ' + val.toLocaleString('es-CO');
  };

  const cards = [
    {
      title: 'Visitas programadas',
      value: (data?.programadas ?? 24).toString(),
      subtext: 'Esta semana',
      icon: Calendar,
      bgColor: 'bg-[#0F172A]',
      textColor: 'text-white',
    },
    {
      title: 'Visitas realizadas',
      value: (data?.realizadas ?? 19).toString(),
      subtext: 'Esta semana',
      icon: CheckCircle2,
      bgColor: 'bg-[#16A34A]',
      textColor: 'text-white',
    },
    {
      title: 'Efectividad',
      value: `${data?.efectividad ?? 79}%`,
      subtext: 'vs. programación',
      icon: TrendingUp,
      bgColor: 'bg-[#EA580C]',
      textColor: 'text-white',
    },
    {
      title: 'Valor cotizado',
      value: formatCurrency(data?.valorCotizado ?? 215450000),
      subtext: 'Esta semana',
      icon: DollarSign,
      bgColor: 'bg-[#2563EB]',
      textColor: 'text-white',
    },
    {
      title: 'Pedidos cerrados',
      value: (data?.pedidos ?? 8).toString(),
      subtext: 'Esta semana',
      icon: ShoppingCart,
      bgColor: 'bg-[#9333EA]',
      textColor: 'text-white',
    },
    {
      title: 'Facturación ruta',
      value: formatCurrency(data?.facturacion ?? 128760000),
      subtext: 'Esta semana',
      icon: Wallet,
      bgColor: 'bg-[#16A34A]',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bgColor} ${card.textColor} shadow-xs`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {card.title}
              </p>
              <p className="text-base font-extrabold text-[#0F172A] truncate tracking-tight">
                {card.value}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
