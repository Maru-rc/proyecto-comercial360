import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, Eye, Edit2 } from 'lucide-react';
import { ISeguimientoFila } from '../../types/kpi';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { downloadCsvReport } from '../../api/kpis';
import { useFilterStore } from '../../store/useFilterStore';
import { usePageReset } from '../../hooks/usePageReset';

interface VisitsTableProps {
  filas: ISeguimientoFila[];
}

export const VisitsTable: React.FC<VisitsTableProps> = ({ filas }) => {
  const navigate = useNavigate();
  const { territorio, semanaNumero } = useFilterStore();
  const [pageSize, setPageSize] = useState(5);
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = usePageReset([
    filterEstado,
    pageSize,
    semanaNumero,
    territorio,
  ]);

  const filteredFilas = filas.filter((r) => {
    if (filterEstado === 'Todos') return true;
    return r.estado_visita.toLowerCase() === filterEstado.toLowerCase();
  });

  const paginatedFilas = filteredFilas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const formatCurrency = (val: number) => {
    if (!val) return '$ 0';
    return '$ ' + val.toLocaleString('es-CO');
  };

  const handleExport = () => {
    void downloadCsvReport(territorio, `Semana${semanaNumero}`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Seguimiento de rutas y visitas
        </h3>

        <div className="flex items-center gap-2.5">
          {/* The week comes from the selector in the header */}
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
            Semana {semanaNumero}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              Filtro: {filterEstado}
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-30 text-xs">
                {[
                  'Todos',
                  'Visitado',
                  'Pendiente',
                  'Reprogramado',
                  'Sin visitar',
                ].map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => {
                      setFilterEstado(est);
                      setCurrentPage(1);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg cursor-pointer ${
                      filterEstado === est
                        ? 'bg-orange-50 text-[#EA580C] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            {paginatedFilas.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-2.5 px-3 whitespace-nowrap">{row.fecha}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                  {row.asesor}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {row.territorio}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.semana}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{row.dia}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                  {row.ruta}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900">
                  {row.cliente}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {row.municipio}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {row.tipo_cliente}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Badge variant={row.potencial}>{row.potencial}</Badge>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Badge variant={row.estado_visita}>{row.estado_visita}</Badge>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {row.resultado}
                </td>
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
                            row.cliente,
                          )}&visita=${row.id}&modo=ver`,
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
                            row.cliente,
                          )}&visita=${row.id}`,
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
      <Pagination
        currentPage={currentPage}
        totalItems={filteredFilas.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
