import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import { ISeguimientoFila } from '../types/kpi';
import {
  getSeguimientoVisitas,
  resumirSeguimiento,
  SIN_DOCUMENTO,
} from '../api/kpis';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';

export const VisitasListPage: React.FC = () => {
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState<ISeguimientoFila[]>([]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [selectedVisita, setSelectedVisita] = useState<ISeguimientoFila | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    getSeguimientoVisitas().then((data) => setVisitas(data));
  }, []);

  const filteredVisitas = visitas.filter((v) => {
    const matchesSearch =
      v.cliente.toLowerCase().includes(search.toLowerCase()) ||
      v.asesor.toLowerCase().includes(search.toLowerCase()) ||
      v.municipio.toLowerCase().includes(search.toLowerCase()) ||
      v.ruta.toLowerCase().includes(search.toLowerCase());

    const matchesEstado =
      estadoFilter === 'Todos' ||
      v.estado_visita.toLowerCase() === estadoFilter.toLowerCase();

    return matchesSearch && matchesEstado;
  });

  const resumen = resumirSeguimiento(visitas);

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Registro y Bitácora de Visitas
          </h1>
          <p className="text-xs text-slate-500">
            Control integral de visitas comerciales realizadas, estados de
            negociación y resultados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/visitas/registrar')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Registrar nueva visita
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Visitas Registradas
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {resumen.visitas}
          </p>
          <span className="text-[10px] text-slate-400">Esta semana</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Pedidos Cerrados
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {resumen.pedidos}
          </p>
          <span className="text-[10px] text-slate-400">
            De los clientes visitados
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Cotizaciones Emitidas
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {resumen.cotizaciones}
          </p>
          <span className="text-[10px] text-slate-400">
            $ {resumen.valorCotizado.toLocaleString('es-CO')} cotizados
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Efectividad
          </p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {resumen.efectividad}%
          </p>
          <span className="text-[10px] text-slate-400">
            {resumen.visitadas} de {resumen.visitas} visitas realizadas
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, asesor comercial, ruta o municipio..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Visitado">Visitado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Reprogramado">Reprogramado</option>
            <option value="Sin visitar">Sin visitar</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Municipio</th>
                <th className="py-2.5 px-3">Ruta</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Resultado</th>
                <th className="py-2.5 px-3">Cotización</th>
                <th className="py-2.5 px-3">Pedido</th>
                <th className="py-2.5 px-3">Próximo Seg.</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisitas
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold">
                      {v.fecha}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {v.cliente}
                    </td>
                    <td className="py-2.5 px-3">{v.municipio}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-600">
                      {v.ruta}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={v.estado_visita}>{v.estado_visita}</Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {v.resultado}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs">
                      {v.cotizacion !== SIN_DOCUMENTO ? (
                        <span className="text-[#EA580C] font-bold">
                          {v.cotizacion}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs">
                      {v.pedido !== SIN_DOCUMENTO ? (
                        <span className="text-blue-600 font-bold">
                          {v.pedido}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {v.proximo_seguimiento}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedVisita(v)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Ver detalle de la visita"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredVisitas.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Visita Detail Modal */}
      {selectedVisita && (
        <Modal
          isOpen={!!selectedVisita}
          onClose={() => setSelectedVisita(null)}
          title={`Detalle de visita: ${selectedVisita.cliente}`}
          description={`Fecha: ${selectedVisita.fecha} | Asesor: ${selectedVisita.asesor} | Ruta: ${selectedVisita.ruta}`}
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVisita(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Se abre la visita existente (no una nueva); si ya se
                  // registró, en modo lectura para no duplicar su resultado
                  const { id, estado_visita } = selectedVisita;
                  const modo = estado_visita === 'Visitado' ? '&modo=ver' : '';
                  setSelectedVisita(null);
                  navigate(`/visitas/registrar?visita=${id}${modo}`);
                }}
              >
                Abrir formulario completo
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Estado
                </span>
                <Badge variant={selectedVisita.estado_visita}>
                  {selectedVisita.estado_visita}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Resultado
                </span>
                <span className="font-bold text-slate-800">
                  {selectedVisita.resultado}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Municipio
                </span>
                <span className="font-bold text-slate-800">
                  {selectedVisita.municipio}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Tipo Cliente
                </span>
                <span className="font-bold text-slate-800">
                  {selectedVisita.tipo_cliente}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h4 className="font-bold text-slate-800">
                Compromisos comerciales asociados
              </h4>
              <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50/50 border border-orange-100">
                <span className="text-slate-600">Cotización emitida:</span>
                <span className="font-mono font-bold text-[#EA580C]">
                  {selectedVisita.cotizacion} (
                  {selectedVisita.valor_cotizacion > 0
                    ? `$ ${selectedVisita.valor_cotizacion.toLocaleString('es-CO')}`
                    : 'N/A'}
                  )
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="text-slate-600">Pedido confirmado:</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedVisita.pedido}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">
                Próximo seguimiento programado:
              </span>
              <span>{selectedVisita.proximo_seguimiento}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
