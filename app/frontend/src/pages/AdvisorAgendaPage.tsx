import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ArrowRight, Filter, User } from 'lucide-react';
import {
  buildAsesoresSchedule,
  getAsesores,
  IAsesorSchedule,
} from '../api/rutas';
import { useRutas } from '../hooks/useRutas';

const DIAS: Array<{ key: keyof IAsesorSchedule['cronograma']; label: string }> =
  [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
  ];

// getDay(): 0 = domingo … 6 = sábado
const HOY_KEY = DIAS[new Date().getDay() - 1]?.key;

export const AdvisorAgendaPage: React.FC = () => {
  const navigate = useNavigate();
  const [territorioFiltro, setTerritorioFiltro] = useState('Todos');

  const asesoresQuery = useQuery({
    queryKey: ['asesores'],
    queryFn: getAsesores,
  });
  const { rutas, isLoading: rutasLoading } = useRutas();

  const asesores = useMemo(
    () => buildAsesoresSchedule(asesoresQuery.data ?? [], rutas),
    [asesoresQuery.data, rutas],
  );

  const territorios = useMemo(
    () => [...new Set(rutas.map((r) => r.territorio_zona))].sort(),
    [rutas],
  );

  const filteredAsesores = asesores.filter((a) => {
    if (territorioFiltro === 'Todos') return true;
    return a.territorio.toLowerCase().includes(territorioFiltro.toLowerCase());
  });

  const rutasAsignadas = rutas.filter((r) => r.id_asesor).length;
  const asesoresConRuta = asesores.filter((a) => a.rutasAsignadas > 0).length;
  const isLoading = asesoresQuery.isLoading || rutasLoading;

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Planeación de rutas</span>
            <span>&gt;</span>
            <span className="font-bold text-slate-800">Agenda de asesores</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Cronograma Semanal del Equipo Comercial
          </h1>
          <p className="text-xs text-slate-500">
            Distribución diaria de las rutas asignadas a cada asesor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/rutas')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Asignar nueva ruta
          </button>
        </div>
      </div>

      {/* Team KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Asesores Activos
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {asesores.length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Asesores con Ruta
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {asesoresConRuta}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Rutas Asignadas
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {rutasAsignadas}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Rutas sin Asignar
          </p>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            {rutas.length - rutasAsignadas}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={territorioFiltro}
            onChange={(e) => setTerritorioFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los territorios</option>
            {territorios.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advisors Weekly Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0B1527] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 min-w-[200px]">Asesor Comercial</th>
                {DIAS.map((dia) => (
                  <th key={dia.key} className="py-3 px-3 min-w-[130px]">
                    {dia.label}
                    {dia.key === HOY_KEY ? ' (Hoy)' : ''}
                  </th>
                ))}
                <th className="py-3 px-4 min-w-[150px]">Carga semanal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-slate-500">
                    Cargando cronograma...
                  </td>
                </tr>
              )}
              {asesoresQuery.isError && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-red-700">
                    No se pudo cargar el equipo comercial.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !asesoresQuery.isError &&
                filteredAsesores.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-slate-500">
                      No hay asesores para este filtro.
                    </td>
                  </tr>
                )}
              {filteredAsesores.map((asesor) => (
                <tr
                  key={asesor.id_asesor}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-100">
                        <User className="h-4 w-4 text-slate-500" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {asesor.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#EA580C]" />
                          {asesor.territorio}
                        </p>
                      </div>
                    </div>
                  </td>

                  {DIAS.map((dia) => {
                    const ruta = asesor.cronograma[dia.key];
                    const esHoy = dia.key === HOY_KEY;
                    return (
                      <td key={dia.key} className="py-3 px-3">
                        <div
                          className={`rounded-lg p-2 border text-[11px] ${
                            esHoy
                              ? 'bg-orange-50/60 border-orange-200'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <span
                            className={`block ${
                              ruta
                                ? esHoy
                                  ? 'font-bold text-[#EA580C]'
                                  : 'font-semibold text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {ruta || 'Sin ruta'}
                          </span>
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">
                        {asesor.rutasAsignadas} rutas · {asesor.paradasSemana}{' '}
                        paradas
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/mapa')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer pt-0.5"
                      >
                        Ver ruta en mapa
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
