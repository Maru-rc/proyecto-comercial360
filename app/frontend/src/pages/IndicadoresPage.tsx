import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Target,
  Award,
  Users,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { getDashboardKpis, getSeguimientoVisitas } from '../api/kpis';
import { ISeguimientoFila } from '../types/kpi';

type Periodo = 'week' | 'month';

interface RankingAsesor {
  nombre: string;
  territorio: string;
  visitas: number;
  realizadas: number;
  pedidos: number;
  cotizado: number;
  efectividad: number;
}

const formatMillones = (valor: number) =>
  `$${(valor / 1_000_000).toLocaleString('es-CO', {
    maximumFractionDigits: 1,
  })}M`;

const pct = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 1000) / 10 : 0;

const buildRanking = (filas: ISeguimientoFila[]): RankingAsesor[] => {
  const porAsesor = new Map<string, RankingAsesor>();
  for (const f of filas) {
    const actual = porAsesor.get(f.asesor) ?? {
      nombre: f.asesor,
      territorio: f.territorio,
      visitas: 0,
      realizadas: 0,
      pedidos: 0,
      cotizado: 0,
      efectividad: 0,
    };
    actual.visitas += 1;
    if (f.estado_visita === 'Visitado' || f.estado_visita === 'Pedido cerrado')
      actual.realizadas += 1;
    if (f.pedido !== '—') actual.pedidos += 1;
    actual.cotizado += f.valor_cotizacion || 0;
    porAsesor.set(f.asesor, actual);
  }
  return [...porAsesor.values()]
    .map((a) => ({ ...a, efectividad: pct(a.realizadas, a.visitas) }))
    .sort((a, b) => b.cotizado - a.cotizado || b.efectividad - a.efectividad);
};

export const IndicadoresPage: React.FC = () => {
  const [periodo, setPeriodo] = useState<Periodo>('month');

  const kpisQuery = useQuery({
    queryKey: ['kpis', 'semana-actual'],
    queryFn: () => getDashboardKpis(),
  });
  const seguimientoQuery = useQuery({
    queryKey: ['seguimiento', periodo],
    queryFn: () => getSeguimientoVisitas(periodo),
  });

  const filas = useMemo(
    () => seguimientoQuery.data ?? [],
    [seguimientoQuery.data],
  );
  const ranking = useMemo(() => buildRanking(filas), [filas]);

  const total = filas.length;
  const conPedido = filas.filter((f) => f.pedido !== '—').length;
  const conCotizacion = filas.filter(
    (f) => f.cotizacion !== '—' && f.pedido === '—',
  ).length;
  const sinVisitar = filas.filter(
    (f) => f.estado_visita === 'Sin visitar',
  ).length;
  const reprogramadas = filas.filter(
    (f) => f.estado_visita === 'Reprogramado',
  ).length;
  const clientesVisitados = new Set(filas.map((f) => f.cliente)).size;
  const kpis = kpisQuery.data;

  const distribucion = [
    {
      label: 'Con pedido',
      valor: pct(conPedido, total),
      color: 'bg-emerald-500',
      text: 'text-emerald-600',
    },
    {
      label: 'Con cotización (sin pedido)',
      valor: pct(conCotizacion, total),
      color: 'bg-[#EA580C]',
      text: 'text-[#EA580C]',
    },
    {
      label: 'Reprogramadas',
      valor: pct(reprogramadas, total),
      color: 'bg-amber-500',
      text: 'text-amber-600',
    },
    {
      label: 'Sin visitar',
      valor: pct(sinVisitar, total),
      color: 'bg-rose-500',
      text: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Indicadores de Gestión Comercial
          </h1>
          <p className="text-xs text-slate-500">
            Efectividad de visitas, valor cotizado, pedidos y ranking del
            equipo.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="month">Mes en curso</option>
            <option value="week">Semana en curso</option>
          </select>
        </div>
      </div>

      {(kpisQuery.isError || seguimientoQuery.isError) && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          No se pudieron cargar todos los indicadores. Intenta de nuevo más
          tarde.
        </p>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Efectividad semanal</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {kpis ? `${kpis.efectividad}%` : '—'}
          </span>
          <p className="text-[10px] text-slate-400">
            {kpis
              ? `${kpis.realizadas} visitas realizadas de ${kpis.programadas} programadas`
              : 'Cargando...'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cumplimiento de meta</span>
            <span className="p-1.5 bg-orange-50 text-[#EA580C] rounded-lg">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {kpis ? `${kpis.porcentajeCumplimiento}%` : '—'}
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#EA580C] h-full rounded-full"
              style={{
                width: `${Math.min(kpis?.porcentajeCumplimiento ?? 0, 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {kpis
              ? `${kpis.completadasVisitas} de ${kpis.metaVisitas} visitas de la meta semanal`
              : 'Cargando...'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Clientes visitados</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {clientesVisitados}
          </span>
          <p className="text-[10px] text-slate-400">
            Clientes distintos con visita en el periodo
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Facturación semanal</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {kpis ? formatMillones(kpis.facturacion) : '—'}
          </span>
          <p className="text-[10px] text-slate-400">
            {kpis
              ? `${kpis.pedidos} pedidos · ${formatMillones(kpis.valorCotizado)} cotizado`
              : 'Cargando...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Advisor ranking */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#EA580C]" />
              <h2 className="text-sm font-bold text-slate-900">
                Ranking de Asesores Comerciales
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Ordenado por valor cotizado
            </span>
          </div>

          <div className="space-y-3">
            {seguimientoQuery.isLoading && (
              <p className="text-xs text-slate-500">Cargando ranking...</p>
            )}
            {!seguimientoQuery.isLoading && ranking.length === 0 && (
              <p className="text-xs text-slate-500">
                Sin visitas registradas en el periodo.
              </p>
            )}
            {ranking.map((a, idx) => (
              <div
                key={a.nombre}
                className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-900 shadow-xs'
                        : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-orange-100 text-[#EA580C]'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      {a.nombre}
                    </p>
                    <p className="text-[11px] text-slate-400">{a.territorio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Cotizado
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatMillones(a.cotizado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Pedidos
                    </span>
                    <span className="font-bold text-slate-800">
                      {a.pedidos}
                    </span>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
                      <span>Efectividad</span>
                      <span className="text-[#EA580C]">{a.efectividad}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#EA580C] h-full rounded-full"
                        style={{ width: `${a.efectividad}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results distribution */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Distribución de Resultados en Campo
          </h3>
          <p className="text-[11px] text-slate-400">
            {total} visitas en el periodo
          </p>
          <div className="space-y-2 text-xs">
            {distribucion.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>{d.label}</span>
                  <span className={`font-bold ${d.text}`}>{d.valor}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${d.color} h-full rounded-full`}
                    style={{ width: `${d.valor}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
