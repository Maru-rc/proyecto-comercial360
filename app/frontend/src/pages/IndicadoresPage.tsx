import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Users,
  Calendar,
  Filter,
  DollarSign,
} from 'lucide-react';

export const IndicadoresPage: React.FC = () => {
  const [periodo, setPeriodo] = useState('Mayo 2024 (Mes en curso)');
  const [territorio, setTerritorio] = useState('Todos los territorios');

  const rankingAsesores = [
    {
      nombre: 'María Rodríguez',
      territorio: 'Atlántico Centro',
      visitas: 22,
      pedidos: 9,
      ventas: 48000000,
      cumplimiento: 91,
      badge: '1er Lugar',
    },
    {
      nombre: 'Carlos Gómez',
      territorio: 'Atlántico Sur',
      visitas: 26,
      pedidos: 7,
      ventas: 38200000,
      cumplimiento: 85,
      badge: '2do Lugar',
    },
    {
      nombre: 'Juan Pérez',
      territorio: 'Atlántico Norte & Este',
      visitas: 24,
      pedidos: 8,
      ventas: 42500000,
      cumplimiento: 78,
      badge: '3er Lugar',
    },
    {
      nombre: 'Roberto Silva',
      territorio: 'Atlántico Norte',
      visitas: 20,
      pedidos: 5,
      ventas: 29400000,
      cumplimiento: 72,
      badge: '4to Lugar',
    },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">Tablero de Indicadores y Analítica</h1>
          <p className="text-xs text-slate-500">
            Inteligencia comercial, conversión de visitas, cumplimiento de ventas y ranking del equipo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Mayo 2024 (Mes en curso)">Mayo 2024 (Mes en curso)</option>
              <option value="Abril 2024">Abril 2024</option>
              <option value="Q1 2024">Primer Trimestre 2024</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={territorio}
              onChange={(e) => setTerritorio(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos los territorios">Todos los territorios</option>
              <option value="Atlántico Norte">Atlántico Norte</option>
              <option value="Atlántico Sur">Atlántico Sur</option>
              <option value="Atlántico Centro">Atlántico Centro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Efectividad de Visitas</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">79.2%</span>
            <span className="text-xs text-emerald-600 font-bold">+4.2%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[79%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">19 visitas efectivas de 24 programadas</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cumplimiento Presupuesto</span>
            <span className="p-1.5 bg-orange-50 text-[#EA580C] rounded-lg">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">85.8%</span>
            <span className="text-xs text-[#EA580C] font-bold">$128.7M</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#EA580C] h-full rounded-full w-[86%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">Meta comercial mensual: $150.0M COP</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cobertura de Cartera</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">89.1%</span>
            <span className="text-xs text-blue-600 font-bold">107 Clientes</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[89%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">Clientes activos con visita este mes</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ticket Promedio por Pedido</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">$16.1M</span>
            <span className="text-xs text-emerald-600 font-bold">+12%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full w-[75%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">Promedio COP por orden de venta</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Advisor Performance Ranking (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#EA580C]" />
              <h2 className="text-sm font-bold text-slate-900">
                Ranking de Asesores Comerciales
              </h2>
            </div>
            <span className="text-xs text-slate-400">Desempeño mensual</span>
          </div>

          <div className="space-y-3">
            {rankingAsesores.map((a, idx) => (
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
                    <p className="font-bold text-slate-900 text-xs">{a.nombre}</p>
                    <p className="text-[11px] text-slate-400">{a.territorio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Ventas</span>
                    <span className="font-mono font-bold text-slate-800">
                      $ {(a.ventas / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Pedidos</span>
                    <span className="font-bold text-slate-800">{a.pedidos}</span>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
                      <span>Meta</span>
                      <span className="text-[#EA580C]">{a.cumplimiento}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#EA580C] h-full rounded-full"
                        style={{ width: `${a.cumplimiento}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Distribution of Visit Results & Territory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Results distribution */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Distribución de Resultados en Campo
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Pedido Cerrado Directo</span>
                  <span className="font-bold text-emerald-600">35%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[35%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Interesado / Cotización Enviada</span>
                  <span className="font-bold text-[#EA580C]">44%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#EA580C] h-full rounded-full w-[44%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Reprogramada por Cliente</span>
                  <span className="font-bold text-amber-600">12%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full w-[12%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Sin Interés / Cerrado</span>
                  <span className="font-bold text-slate-500">9%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full w-[9%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Competencia detectada */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Competencia Detectada en Campo
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#EA580C] font-bold border border-orange-200">
                Inducacor (42%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                Sidenor (28%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                Diaco (18%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                Otros (12%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
