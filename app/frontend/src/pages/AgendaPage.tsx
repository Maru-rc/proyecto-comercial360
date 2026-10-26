import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  Play,
  Plus,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { agendarVisita } from '../api/visitas';
import { useVisitasAgenda } from '../hooks/useVisitasAgenda';
import { useClientes } from '../hooks/useClientes';
import { useAuthStore } from '../store/useAuthStore';

const toIsoDate = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const toEstado = (status?: string) =>
  status === 'COMPLETED'
    ? 'Visitado'
    : status === 'RESCHEDULED'
      ? 'Reprogramado'
      : status === 'CANCELLED'
        ? 'Sin visitar'
        : 'Pendiente';

export const AgendaPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fecha, setFecha] = useState(() => new Date());
  const fechaIso = toIsoDate(fecha);
  const [hoyIso] = useState(() => toIsoDate(new Date()));
  const esHoy = fechaIso === hoyIso;
  const user = useAuthStore((state) => state.user);
  const { clientes } = useClientes();

  const { agenda, isLoading, isError, refetch } = useVisitasAgenda(fechaIso);

  const items = useMemo(
    () =>
      agenda.map((a, idx) => ({
        id: String(a.id ?? idx + 1),
        clienteId: String(a.clientId),
        // The backend always sends order 1; visits come sorted by time
        orden: idx + 1,
        hora: a.suggestedTime || a.time || '—',
        cliente: a.clientName || `Cliente #${a.clientId}`,
        estado: toEstado(a.visitStatus || a.status),
        contacto: a.primaryContact?.name || a.contactName || undefined,
        objetivo: a.objective || undefined,
        potencial: a.potential || undefined,
        direccion: a.address || a.clientAddress || undefined,
        isCurrent: a.isCurrent ?? a.active,
      })),
    [agenda],
  );

  const moverDia = (dias: number) =>
    setFecha((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + dias);
      return next;
    });

  // New agenda item form
  const [newClienteId, setNewClienteId] = useState('');
  const [newHora, setNewHora] = useState('');
  const [newObjetivo, setNewObjetivo] = useState('');
  const [newDireccion, setNewDireccion] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const handleCreateAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteId) {
      setScheduleError('Selecciona un cliente.');
      return;
    }
    setScheduleError('');
    setIsScheduling(true);
    try {
      await agendarVisita({
        clientId: Number(newClienteId),
        scheduledDate: fechaIso,
        startTime: newHora || undefined,
        objective: newObjetivo || undefined,
        visitOrder: items.length + 1,
      });
      setIsModalOpen(false);
      setNewClienteId('');
      setNewHora('');
      setNewObjetivo('');
      setNewDireccion('');
      await refetch();
    } catch {
      setScheduleError(
        'No se pudo agendar la visita. Si eres director, agenda desde la asignación de rutas.',
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const visitadosCount = items.filter(
    (i) => i.estado.toLowerCase() === 'visitado',
  ).length;
  const pendientesCount = items.filter(
    (i) => i.estado.toLowerCase() === 'pendiente',
  ).length;
  const reprogramadasCount = items.filter(
    (i) => i.estado.toLowerCase() === 'reprogramado',
  ).length;
  const proximas = items
    .filter((i) => i.estado.toLowerCase() === 'pendiente')
    .slice(0, 3);

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Agenda Comercial de Visitas
          </h1>
          <p className="text-xs text-slate-500">
            Control de citas, horarios de atención y compromisos de seguimiento
            con clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agendar nueva visita
          </button>
        </div>
      </div>

      {/* Date Navigation Bar & KPI counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moverDia(-1)}
            aria-label="Día anterior"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <CalendarIcon className="h-4 w-4 text-[#EA580C]" />
            <span className="text-xs font-extrabold text-slate-800">
              {fecha.toLocaleDateString('es-CO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {esHoy && (
              <span className="text-[10px] bg-orange-100 text-[#EA580C] font-bold px-2 py-0.5 rounded-full">
                Hoy
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => moverDia(1)}
            aria-label="Día siguiente"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
            <span className="text-slate-600 font-semibold">
              {visitadosCount} visitadas
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
            <span className="text-slate-600 font-semibold">
              {pendientesCount} pendientes
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
            <span className="text-slate-600 font-semibold">
              {reprogramadasCount} reprogramadas
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Timeline Column */}
        <div className="lg:col-span-8 space-y-3">
          {isLoading && (
            <p className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
              Cargando agenda...
            </p>
          )}
          {isError && (
            <p className="bg-red-50 rounded-xl border border-red-200 p-4 text-xs text-red-700">
              No se pudo cargar la agenda. Intenta de nuevo más tarde.
            </p>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <p className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
              No hay visitas programadas para este día.
            </p>
          )}
          {items.map((item, idx) => {
            const isVisitado = item.estado.toLowerCase() === 'visitado';
            const isReprogramado = item.estado.toLowerCase() === 'reprogramado';

            return (
              <div
                key={item.id || idx}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isVisitado
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isReprogramado
                      ? 'border-rose-200 bg-rose-50/10'
                      : 'border-slate-200 hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-xs font-black shadow-xs ${
                        isVisitado
                          ? 'bg-[#16A34A] text-white'
                          : isReprogramado
                            ? 'bg-[#DC2626] text-white'
                            : 'bg-[#0F172A] text-white'
                      }`}
                    >
                      {item.orden || idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 mt-1">
                      {item.hora}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {item.cliente}
                      </h3>
                      <Badge variant={item.estado.toLowerCase()}>
                        {item.estado}
                      </Badge>
                      {item.isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Visita actual
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {item.direccion && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {item.direccion}
                        </span>
                      )}
                      {item.contacto && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {item.contacto}
                        </span>
                      )}
                    </div>

                    {item.objetivo && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium">
                        Objetivo: {item.objetivo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isVisitado ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Visita cerrada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/visitas/registrar?cliente=${encodeURIComponent(
                            item.cliente,
                          )}&clienteId=${item.clienteId}&visita=${item.id}${item.hora !== '—' ? `&hora=${encodeURIComponent(item.hora)}` : ''}`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-3.5 py-1.5 text-xs font-bold cursor-pointer shadow-xs transition-colors"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Iniciar visita
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/visitas/registrar?cliente=${encodeURIComponent(item.cliente)}&clienteId=${item.clienteId}&visita=${item.id}`,
                      )
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Info Widget Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Daily Route info */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CalendarCheck className="h-4 w-4 text-[#EA580C]" />
              <span>Ruta asignada de hoy</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Asesor:</span>
                <span className="font-bold text-slate-800">
                  {user?.nombre ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Visitas del día:</span>
                <span className="font-bold text-slate-800">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primera visita:</span>
                <span className="font-bold text-slate-800">
                  {items[0]?.hora ?? '—'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/mapa')}
              className="w-full text-center py-2 text-xs font-bold text-[#EA580C] bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors"
            >
              Ver mapa completo de hoy
            </button>
          </div>

          {/* Upcoming Followups */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Próximas visitas pendientes
            </h3>
            <div className="space-y-2.5 text-xs">
              {proximas.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  Sin visitas pendientes en esta fecha.
                </p>
              )}
              {proximas.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-800">
                      {item.cliente}
                    </span>
                    <span className="text-[10px] text-[#EA580C] font-bold">
                      {item.hora}
                    </span>
                  </div>
                  {item.objetivo && (
                    <p className="text-[11px] text-slate-500">
                      {item.objetivo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agendar Visita */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Agendar nueva visita comercial"
          description="Añada una cita a su cronograma de trabajo para hoy o días posteriores."
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateAgendaItem}
                isLoading={isScheduling}
              >
                Agendar visita
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateAgendaItem} className="space-y-3 text-xs">
            {scheduleError && (
              <p className="rounded-lg bg-red-50 p-2 text-red-700">
                {scheduleError}
              </p>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Cliente
              </label>
              <select
                value={newClienteId}
                onChange={(e) => {
                  setNewClienteId(e.target.value);
                  const found = clientes.find(
                    (c) => String(c.id_cliente) === e.target.value,
                  );
                  setNewDireccion(found?.direccion ?? '');
                }}
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
                label="Hora sugerida"
                type="time"
                value={newHora}
                onChange={(e) => setNewHora(e.target.value)}
              />
              <Input label="Dirección" value={newDireccion} readOnly />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Objetivo comercial de la visita
              </label>
              <textarea
                rows={2}
                value={newObjetivo}
                onChange={(e) => setNewObjetivo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                placeholder="Ej. Presentación de catálogo de soldadura y toma de pedido"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
