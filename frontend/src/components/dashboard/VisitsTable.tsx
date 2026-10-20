import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Filter,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ISeguimientoFila } from '../../types/kpi';
import { Badge } from '../common/Badge';
import { downloadCsvReport } from '../../api/kpis';
import { useFilterStore } from '../../store/useFilterStore';

interface VisitsTableProps {
  filas: ISeguimientoFila[];
}

export const VisitsTable: React.FC<VisitsTableProps> = ({ filas }) => {
  const navigate = useNavigate();
  const { territorio, semanaNumero } = useFilterStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState('Esta semana');

  const formatCurrency = (val: number) => {
    if (!val) return '$ 0';
    return '$ ' + val.toLocaleString('es-CO');
  };

  const handleExport = () => {
    downloadCsvReport(territorio, semanaNumero);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Seguimiento de rutas y visitas
        </h3>

        <div className="flex items-center gap-2.5">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="Esta semana">Esta semana</option>
            <option value="Semana anterior">Semana anterior</option>
            <option value="Mes actual">Mes actual</option>
          </select>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            Filtros
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white px-3 py-1.5 text-xs font-bold cursor-pointer shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Asesor</th>
              <th className="py-2.5 px-3">Territorio</th>
              <th className="py-2.5 px-3">Semana</th>
              <th className="py-2.5 px-3">Día</th>
              <th className="py-2.5 px-3">Ruta</th>
              <th className="py-2.5 px-3">Cliente</th>
              <th className="py-2.5 px-3">Municipio</th>
              <th className="py-2.5 px-3">Tipo cliente</th>
              <th className="py-2.5 px-3">Potencial</th>
              <th className="py-2.5 px-3">Estado visita</th>
              <th className="py-2.5 px-3">Resultado</th>
              <th className="py-2.5 px-3">Cotización</th>
              <th className="py-2.5 px-3 text-right">Valor cotización</th>
              <th className="py-2.5 px-3">Pedido</th>
              <th className="py-2.5 px-3">Próximo seguimiento</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filas.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 whitespace-nowrap">{row.fecha}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                  {row.asesor}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.territorio}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.semana}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.dia}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                  {row.ruta}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900">
                  {row.cliente}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.municipio}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.tipo_cliente}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Badge variant={row.potencial}>{row.potencial}</Badge>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Badge variant={row.estado_visita}>{row.estado_visita}</Badge>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.resultado}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                  {row.cotizacion}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium text-slate-900">
                  {formatCurrency(row.valor_cotizacion)}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                  {row.pedido}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {row.proximo_seguimiento}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      title="Ver detalles"
                      onClick={() =>
                        navigate(
                          `/visitas/registrar?cliente=${encodeURIComponent(
                            row.cliente
                          )}`
                        )
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Editar o registrar visita"
                      onClick={() =>
                        navigate(
                          `/visitas/registrar?cliente=${encodeURIComponent(
                            row.cliente
                          )}`
                        )
                      }
                      className="p-1 text-slate-400 hover:text-[#EA580C] hover:bg-orange-50 rounded-md cursor-pointer transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
        <div>Mostrando 1 a 5 de 24 filas</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 cursor-pointer"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-xs cursor-pointer ${
              currentPage === 1
                ? 'bg-[#EA580C] text-white'
                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-xs cursor-pointer ${
              currentPage === 2
                ? 'bg-[#EA580C] text-white'
                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-xs cursor-pointer ${
              currentPage === 3
                ? 'bg-[#EA580C] text-white'
                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button
            onClick={() => setCurrentPage(5)}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-xs cursor-pointer ${
              currentPage === 5
                ? 'bg-[#EA580C] text-white'
                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            5
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
            className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 cursor-pointer"
            disabled={currentPage === 5}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
