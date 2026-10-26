import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Printer, Eye } from 'lucide-react';
import { ICotizacion } from '../types/visita';
import { getCotizaciones, crearCotizacionApi } from '../api/cotizaciones';
import { generarNumeroDocumento } from '../api/document-number';
import { useClientes } from '../hooks/useClientes';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { notifyError, notifyFormErrors, notifySuccess } from '../lib/alerts';

export const CotizacionesPage: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<ICotizacion[]>([]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [selectedCot, setSelectedCot] = useState<ICotizacion | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const { clientes } = useClientes();
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [validez, setValidez] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCotizaciones = useCallback(() => {
    getCotizaciones({ search, estado: estadoFilter })
      .then((data) => setCotizaciones(data))
      .catch(() => setCotizaciones([]));
  }, [search, estadoFilter]);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  const handleCreateCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(valor);
    if (!clienteId || !(monto > 0)) {
      notifyFormErrors([
        'Selecciona un cliente',
        'Ingresa un valor mayor a cero',
      ]);
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await crearCotizacionApi({
        numero: generarNumeroDocumento('COT'),
        id_cliente: clienteId,
        valor: monto,
        fecha: new Date().toISOString().slice(0, 10),
        descripcion,
        validez,
        estado: 'ENVIADA',
      });
      setIsNewModalOpen(false);
      notifySuccess(`Cotización ${created.numero} generada`);
      fetchCotizaciones();
    } catch {
      notifyError(
        'No se pudo emitir la cotización',
        'Revisa tu conexión e intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValor = cotizaciones.reduce((acc, c) => acc + (c.valor || 0), 0);
  const aprobadas = cotizaciones.filter((c) => c.estado === 'APROBADA').length;

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Gestión de Cotizaciones
          </h1>
          <p className="text-xs text-slate-500">
            Registro, control de validez y seguimiento de ofertas económicas
            enviadas a clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva cotización
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Total Cotizado
          </p>
          <p className="text-lg font-extrabold text-slate-800 mt-1">
            $ {totalValor.toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-slate-400">COP acumulado</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Cotizaciones Aprobadas
          </p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {aprobadas}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Listas para pedido
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            En Negociación / Enviadas
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {
              cotizaciones.filter(
                (c) => c.estado === 'ENVIADA' || c.estado === 'EN_NEGOCIACION',
              ).length
            }
          </p>
          <span className="text-[10px] text-slate-400">En seguimiento</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Tasa de Aprobación
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {cotizaciones.length > 0
              ? Math.round((aprobadas / cotizaciones.length) * 100)
              : 0}
            %
          </p>
          <span className="text-[10px] text-slate-400">
            Efectividad de cierre
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número (ej. COT-1242), cliente o descripción..."
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
            <option value="APROBADA">Aprobada</option>
            <option value="ENVIADA">Enviada</option>
            <option value="EN_NEGOCIACION">En negociación</option>
            <option value="VENCIDA">Vencida</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">N° Cotización</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Fecha Emisión</th>
                <th className="py-2.5 px-3">Válida Hasta</th>
                <th className="py-2.5 px-3">Asesor</th>
                <th className="py-2.5 px-3">Valor (COP)</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cotizaciones
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((cot) => (
                  <tr
                    key={cot.id_cotizacion || cot.numero}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#EA580C]">
                      {cot.numero}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {cot.cliente_nombre || 'Cliente'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {cot.fecha}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {cot.validez || '15 días'}
                    </td>
                    <td className="py-2.5 px-3">{cot.asesor_nombre || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      $ {cot.valor.toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          cot.estado === 'APROBADA'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : cot.estado === 'ENVIADA'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : cot.estado === 'EN_NEGOCIACION'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {cot.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedCot(cot)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Ver y descargar cotización"
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
          totalItems={cotizaciones.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Quote Preview / Detail Modal */}
      {selectedCot && (
        <Modal
          isOpen={!!selectedCot}
          onClose={() => setSelectedCot(null)}
          title={`Cotización ${selectedCot.numero}`}
          description={`Cliente: ${selectedCot.cliente_nombre} | Emisión: ${selectedCot.fecha}`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCot(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Imprimir / PDF
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs bg-white p-4 rounded-xl border border-slate-100">
            {/* Header document */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-base font-extrabold text-[#0F172A]">
                  COMERCIAL <span className="text-[#EA580C]">360</span> S.A.S.
                </span>
                <p className="text-[11px] text-slate-500">NIT: 900.876.543-2</p>
                <p className="text-[11px] text-slate-500">
                  Cra 53 # 106-280, Barranquilla
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-extrabold text-[#EA580C]">
                  {selectedCot.numero}
                </span>
                <p className="text-[11px] text-slate-500">
                  Fecha: {selectedCot.fecha}
                </p>
                <p className="text-[11px] text-slate-500">
                  Válida hasta: {selectedCot.validez}
                </p>
              </div>
            </div>

            {/* Client info */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <span className="font-bold text-slate-800 text-xs">
                Datos del Cliente:
              </span>
              <p className="font-semibold text-slate-900">
                {selectedCot.cliente_nombre}
              </p>
              <p className="text-[11px] text-slate-500">
                Asesor Comercial: {selectedCot.asesor_nombre}
              </p>
            </div>

            {/* Item description */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Descripción de ítems / servicio</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-800">
                      {selectedCot.descripcion ||
                        'Lote de productos industriales con garantía'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                      ${' '}
                      {Math.round(selectedCot.valor / 1.19).toLocaleString(
                        'es-CO',
                      )}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2 text-slate-500">IVA (19%)</td>
                    <td className="p-2 text-right font-mono text-slate-600">
                      ${' '}
                      {Math.round(
                        selectedCot.valor - selectedCot.valor / 1.19,
                      ).toLocaleString('es-CO')}
                    </td>
                  </tr>
                  <tr className="bg-orange-50/40 font-bold text-sm">
                    <td className="p-2.5 text-[#0F172A]">
                      TOTAL ESTIMADO (COP)
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#EA580C]">
                      $ {selectedCot.valor.toLocaleString('es-CO')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Precios sujetos a inventario disponible. Tiempo de entrega
              promedio de 5 a 8 días hábiles.
            </p>
          </div>
        </Modal>
      )}

      {/* New Quote Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Emitir nueva cotización comercial"
          description="Genere una cotización formal vinculada a la cuenta de cliente."
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCotizacion}
                isLoading={isSubmitting}
              >
                Emitir cotización
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateCotizacion} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Cliente Destinatario
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre_comercial} ({c.municipio})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor total (COP)"
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
              <Input
                label="Vigencia hasta"
                type="date"
                value={validez}
                onChange={(e) => setValidez(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Descripción de productos / propuesta
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                placeholder="Detalle de productos ofertados, marcas, plazos..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
