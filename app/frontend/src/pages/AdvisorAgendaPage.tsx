import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { MOCK_ASESORES_SCHEDULE, IAsesorSchedule } from '../api/rutas';

export const AdvisorAgendaPage: React.FC = () => {
  const navigate = useNavigate();
  const [asesores] = useState<IAsesorSchedule[]>(MOCK_ASESORES_SCHEDULE);
  const [territorioFiltro, setTerritorioFiltro] = useState('Todos');
  const [semana, setSemana] = useState('Semana 21 (20 - 26 Mayo 2024)');

  const filteredAsesores = asesores.filter((a) => {
    if (territorioFiltro === 'Todos') return true;
    return a.territorio.toLowerCase().includes(territorioFiltro.toLowerCase());
  });

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
            Distribución diaria de rutas asignadas, cobertura de clientes y
            cumplimiento por asesor.
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
          <span className="text-[10px] text-emerald-600 font-semibold">
            100% operativos
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Visitas Semanales Meta
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">92</p>
          <span className="text-[10px] text-slate-400">Meta regional</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Completadas a la Fecha
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">75</p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            81.5% de cumplimiento
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            En Ruta Actualmente
          </p>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            2 asesores
          </p>
          <span className="text-[10px] text-slate-400">Monitoreo en vivo</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={semana}
            onChange={(e) => setSemana(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Semana 21 (20 - 26 Mayo 2024)">
              Semana 21 (20 - 26 Mayo 2024)
            </option>
            <option value="Semana 22 (27 Mayo - 02 Junio 2024)">
              Semana 22 (27 Mayo - 02 Junio 2024)
            </option>
            <option value="Semana 20 (13 - 19 Mayo 2024)">
              Semana 20 (13 - 19 Mayo 2024)
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={territorioFiltro}
            onChange={(e) => setTerritorioFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los territorios</option>
            <option value="Norte">Atlántico Norte</option>
            <option value="Sur">Atlántico Sur</option>
            <option value="Centro">Atlántico Centro</option>
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
                <th className="py-3 px-3 min-w-[130px]">Lunes</th>
                <th className="py-3 px-3 min-w-[130px]">Martes (Hoy)</th>
                <th className="py-3 px-3 min-w-[130px]">Miércoles</th>
                <th className="py-3 px-3 min-w-[130px]">Jueves</th>
                <th className="py-3 px-3 min-w-[130px]">Viernes</th>
                <th className="py-3 px-4 min-w-[150px]">Meta & Progreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAsesores.map((asesor) => (
                <tr
                  key={asesor.id_asesor}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Asesor info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={asesor.avatarUrl}
                        alt={asesor.nombre}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {asesor.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#EA580C]" />
                          {asesor.territorio}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            asesor.estadoActual === 'En ruta'
                              ? 'bg-blue-100 text-blue-700'
                              : asesor.estadoActual === 'En oficina'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {asesor.estadoActual}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Lunes */}
                  <td className="py-3 px-3">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px]">
                      <span className="font-semibold text-slate-700 block">
                        {asesor.cronograma.lunes}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                        <CheckCircle className="h-3 w-3" /> Completado
                      </span>
                    </div>
                  </td>

                  {/* Martes */}
                  <td className="py-3 px-3">
                    <div className="rounded-lg bg-orange-50/60 p-2 border border-orange-200 text-[11px]">
                      <span className="font-bold text-[#EA580C] block">
                        {asesor.cronograma.martes}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5 mt-1">
                        <Clock className="h-3 w-3" /> En ejecución
                      </span>
                    </div>
                  </td>

                  {/* Miércoles */}
                  <td className="py-3 px-3">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px]">
                      <span className="font-semibold text-slate-700 block">
                        {asesor.cronograma.miercoles}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Programado
                      </span>
                    </div>
                  </td>

                  {/* Jueves */}
                  <td className="py-3 px-3">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px]">
                      <span className="font-semibold text-slate-700 block">
                        {asesor.cronograma.jueves}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Programado
                      </span>
                    </div>
                  </td>

                  {/* Viernes */}
                  <td className="py-3 px-3">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 text-[11px]">
                      <span className="font-semibold text-slate-700 block">
                        {asesor.cronograma.viernes}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Programado
                      </span>
                    </div>
                  </td>

                  {/* Progreso semanal */}
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {asesor.visitasCompletadas} /{' '}
                          {asesor.visitasAsignadas}
                        </span>
                        <span className="font-extrabold text-[#EA580C]">
                          {asesor.cumplimientoSemanal}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#EA580C] h-full rounded-full transition-all"
                          style={{ width: `${asesor.cumplimientoSemanal}%` }}
                        />
                      </div>
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
