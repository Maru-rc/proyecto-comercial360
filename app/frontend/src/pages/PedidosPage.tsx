import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Truck, CheckCircle2, Package, Eye } from 'lucide-react';
import { IPedido } from '../types/visita';
import { getPedidos, crearPedidoApi } from '../api/pedidos';
import { generarNumeroDocumento } from '../api/document-number';
import { useClientes } from '../hooks/useClientes';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { notifyError, notifyFormErrors, notifySuccess } from '../lib/alerts';
import { usePageReset } from '../hooks/usePageReset';
import { toLocalIsoDate } from '../lib/fecha';

export const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [selectedPedido, setSelectedPedido] = useState<IPedido | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const { clientes } = useClientes();
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPedidos = useCallback(() => {
    getPedidos({ search, estado: estadoFilter })
      .then((data) => setPedidos(data))
      .catch(() => setPedidos([]));
  }, [search, estadoFilter]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleCreatePedido = async (e: React.FormEvent) => {
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
      const created = await crearPedidoApi({
        numero: generarNumeroDocumento('PED'),
        id_cliente: clienteId,
        valor: monto,
        fecha: toLocalIsoDate(),
        fecha_entrega: fechaEntrega || undefined,
        observaciones,
        estado: 'PENDIENTE',
      });
      setIsNewModalOpen(false);
      notifySuccess(`Pedido ${created.numero} registrado`);
      fetchPedidos();
    } catch {
      notifyError(
        'No se pudo registrar el pedido',
        'Revisa tu conexión e intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFacturado = pedidos.reduce((acc, p) => acc + (p.valor || 0), 0);
  const entregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length;

  const [currentPage, setCurrentPage] = usePageReset([
    search,
    estadoFilter,
    pageSize,
  ]);

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Gestión de Pedidos Comerciales
          </h1>
          <p className="text-xs text-slate-500">
            Seguimiento a órdenes de venta, compromisos de entrega y estado
            logístico de despacho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Facturación Total
          </p>
          <p className="text-lg font-extrabold text-slate-800 mt-1">
            $ {totalFacturado.toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Valor consolidado
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Pedidos Entregados
          </p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {entregados}
          </p>
          <span className="text-[10px] text-slate-400">Cumplimiento total</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            En Despacho / Ruta
          </p>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            {
              pedidos.filter(
                (p) =>
                  p.estado === 'DESPACHADO' || p.estado === 'EN_PREPARACION',
              ).length
            }
          </p>
          <span className="text-[10px] text-slate-400">
            En proceso logístico
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Pendientes</p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {pedidos.filter((p) => p.estado === 'PENDIENTE').length}
          </p>
          <span className="text-[10px] text-slate-400">Por alistar</span>
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
            placeholder="Buscar por número (ej. PED-568) o cliente..."
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
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="DESPACHADO">Despachado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">N° Pedido</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Fecha Pedido</th>
                <th className="py-2.5 px-3">Fecha Estimada Entrega</th>
                <th className="py-2.5 px-3">Asesor</th>
                <th className="py-2.5 px-3">Valor (COP)</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pedidos
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((ped) => (
                  <tr
                    key={ped.id_pedido || ped.numero}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                      {ped.numero}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {ped.cliente_nombre || 'Cliente'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {ped.fecha}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {ped.fecha_entrega}
                    </td>
                    <td className="py-2.5 px-3">{ped.asesor_nombre || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      $ {ped.valor.toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          ped.estado === 'ENTREGADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ped.estado === 'DESPACHADO'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : ped.estado === 'EN_PREPARACION'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {ped.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPedido(ped)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Ver seguimiento logístico"
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
          totalItems={pedidos.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Order Tracking Modal */}
      {selectedPedido && (
        <Modal
          isOpen={!!selectedPedido}
          onClose={() => setSelectedPedido(null)}
          title={`Seguimiento de Pedido: ${selectedPedido.numero}`}
          description={`Cliente: ${selectedPedido.cliente_nombre} | Valor: $ ${selectedPedido.valor.toLocaleString('es-CO')}`}
          maxWidth="md"
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPedido(null)}
            >
              Cerrar
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Tracking timeline */}
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 text-xs block">
                Etapas del Pedido
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    1. Pedido Confirmado en Sistema ({selectedPedido.fecha})
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2.5 font-semibold ${
                    selectedPedido.estado !== 'PENDIENTE'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>2. Alistamiento de Mercancía en Bodega</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 font-semibold ${
                    selectedPedido.estado === 'DESPACHADO' ||
                    selectedPedido.estado === 'ENTREGADO'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span>3. Despacho y Transporte en Ruta</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 font-semibold ${
                    selectedPedido.estado === 'ENTREGADO'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span>
                    4. Entrega Exitosa y Firma de Remisión (
                    {selectedPedido.fecha_entrega})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Asesor responsable:</span>
                <span className="font-bold text-slate-800">
                  {selectedPedido.asesor_nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Fecha prometida de entrega:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedPedido.fecha_entrega}
                </span>
              </div>
              {selectedPedido.observaciones && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">
                    Notas de despacho:
                  </span>
                  <p className="text-slate-700 font-medium">
                    {selectedPedido.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* New Order Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Registrar nuevo pedido confirmado"
          description="Añada una orden de compra generada durante la visita comercial."
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
                onClick={handleCreatePedido}
                isLoading={isSubmitting}
              >
                Crear pedido
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreatePedido} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Cliente
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
                label="Fecha estimada de entrega"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Observaciones y condiciones de despacho
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                placeholder="Instrucciones de entrega, contacto en bodega..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
