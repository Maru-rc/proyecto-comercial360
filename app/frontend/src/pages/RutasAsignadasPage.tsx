import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Eye,
  Navigation,
} from 'lucide-react';
import { IRuta } from '../types/ruta';
import { getRutas } from '../api/rutas';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { useRouteDraftStore } from '../store/useRouteDraftStore';

export const RutasAsignadasPage: React.FC = () => {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState<IRuta[]>([]);
  const [search, setSearch] = useState('');
  const [diaFiltro, setDiaFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [selectedRuta, setSelectedRuta] = useState<IRuta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const { paradas: draftParadas } = useRouteDraftStore();

  useEffect(() => {
    getRutas().then((data) => setRutas(data));
  }, []);

  const filteredRutas = rutas.filter((r) => {
    const matchesSearch =
      r.codigo.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.asesor_nombre &&
        r.asesor_nombre.toLowerCase().includes(search.toLowerCase())) ||
      r.territorio_zona.toLowerCase().includes(search.toLowerCase());

    const matchesDia = diaFiltro === 'Todos' || r.dia_ejecucion === diaFiltro;
    const matchesEstado = estadoFiltro === 'Todos' || r.estado === estadoFiltro;

    return matchesSearch && matchesDia && matchesEstado;
  });

  const getStopsForRuta = (ruta: IRuta) => {
    if (ruta.paradas && ruta.paradas.length > 0) return ruta.paradas;
    if (draftParadas && draftParadas.length > 0) return draftParadas;
    return [];
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Planeación de rutas</span>
            <span>&gt;</span>
            <span className="font-bold text-slate-800">Rutas asignadas</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Rutas Comerciales Asignadas
          </h1>
          <p className="text-xs text-slate-500">
            Supervisa la programación, paradas asignadas y estados de ejecución
            de las rutas por asesor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/rutas')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva ruta en mapa
        </button>
      </div>

      {/* Summary KPI Mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Total Rutas
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {rutas.length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            100% activas
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            En Ejecución Hoy
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {rutas.filter((r) => r.estado === 'EN_CURSO').length || 1}
          </p>
          <span className="text-[10px] text-slate-400">Martes (Hoy)</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Paradas Totales
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">28</p>
          <span className="text-[10px] text-slate-400">
            Clientes programados
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Distancia Estimada
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">271.9 km</p>
          <span className="text-[10px] text-slate-400">
            Territorio Atlántico
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
            placeholder="Buscar por código, nombre de ruta, asesor o territorio..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={diaFiltro}
            onChange={(e) => setDiaFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los días</option>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
          </select>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="ASIGNADA">Asignada</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>
      </div>

      {/* Routes Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRutas
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((ruta) => {
            const stops = getStopsForRuta(ruta);
            return (
              <div
                key={ruta.id_ruta}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-[#EA580C]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-black text-[#EA580C] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                      {ruta.codigo}
                    </span>
                    <Badge
                      variant={
                        ruta.estado === 'EN_CURSO'
                          ? 'pendiente'
                          : ruta.estado === 'COMPLETADA'
                            ? 'visitado'
                            : 'activo'
                      }
                    >
                      {ruta.estado === 'EN_CURSO'
                        ? 'En Curso'
                        : ruta.estado === 'COMPLETADA'
                          ? 'Completada'
                          : 'Asignada'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">
                    {ruta.nombre}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {ruta.descripcion}
                  </p>

                  <div className="my-3 space-y-1.5 border-t border-b border-slate-100 py-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {ruta.asesor_nombre || 'Juan Pérez'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ruta.territorio_zona}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {ruta.dia_ejecucion} ({ruta.frecuencia})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {ruta.hora_inicio_sugerida} - {ruta.hora_fin_sugerida}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg text-slate-700 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Paradas
                      </span>
                      <span className="font-bold">
                        {stops.length || 6} clientes
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Distancia
                      </span>
                      <span className="font-bold">
                        {ruta.distancia_km_aprox} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Tiempo est.
                      </span>
                      <span className="font-bold">
                        {Math.floor(ruta.tiempo_estimado_min / 60)}h{' '}
                        {ruta.tiempo_estimado_min % 60}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedRuta(ruta)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver paradas
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/rutas')}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-orange-50 hover:bg-[#EA580C] text-[#EA580C] hover:text-white px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                    title="Abrir en creador de rutas"
                  >
                    Editar
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredRutas.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[3, 6, 9, 15]}
        className="rounded-xl border border-slate-200/90 shadow-xs"
      />

      {/* Paradas Detail Modal */}
      {selectedRuta && (
        <Modal
          isOpen={!!selectedRuta}
          onClose={() => setSelectedRuta(null)}
          title={`Secuencia de paradas: ${selectedRuta.nombre}`}
          description={`Código: ${selectedRuta.codigo} | Asesor: ${selectedRuta.asesor_nombre} | Día: ${selectedRuta.dia_ejecucion}`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRuta(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedRuta(null);
                  navigate('/rutas');
                }}
              >
                Modificar en planificador
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Navigation className="h-4 w-4 text-[#EA580C]" />
                {selectedRuta.distancia_km_aprox} km recorridos estimados
              </span>
              <span>
                Horario: {selectedRuta.hora_inicio_sugerida} a{' '}
                {selectedRuta.hora_fin_sugerida}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {(getStopsForRuta(selectedRuta).length > 0
                ? getStopsForRuta(selectedRuta)
                : [
                    {
                      id: '1',
                      orden: 1,
                      hora_sugerida: '08:30 AM',
                      cliente: {
                        nombre_comercial: 'Ferretería del Norte',
                        direccion: 'Calle 84 # 42-15',
                        tipo_cliente_nombre: 'Distribuidor',
                      },
                      estado_visita: 'VISITADO',
                    },
                    {
                      id: '2',
                      orden: 2,
                      hora_sugerida: '10:15 AM',
                      cliente: {
                        nombre_comercial: 'Metalúrgicas S.A.S',
                        direccion: 'Cra 38 # 74-120',
                        tipo_cliente_nombre: 'Industrial',
                      },
                      estado_visita: 'VISITADO',
                    },
                    {
                      id: '3',
                      orden: 3,
                      hora_sugerida: '11:45 AM',
                      cliente: {
                        nombre_comercial: 'ConstruInnova S.A.S',
                        direccion: 'Calle 30 # 12-50',
                        tipo_cliente_nombre: 'Industrial',
                      },
                      estado_visita: 'PENDIENTE',
                    },
                    {
                      id: '4',
                      orden: 4,
                      hora_sugerida: '02:00 PM',
                      cliente: {
                        nombre_comercial: 'Soluciones Industriales',
                        direccion: 'Cra 21 # 30-45',
                        tipo_cliente_nombre: 'Industrial',
                      },
                      estado_visita: 'PENDIENTE',
                    },
                    {
                      id: '5',
                      orden: 5,
                      hora_sugerida: '03:30 PM',
                      cliente: {
                        nombre_comercial: 'Aceros del Caribe Ltda.',
                        direccion: 'Vía 40 # 65-200',
                        tipo_cliente_nombre: 'Industrial',
                      },
                      estado_visita: 'PENDIENTE',
                    },
                  ]
              ).map((stop: any, idx: number) => (
                <div
                  key={stop.id || idx}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-white font-bold text-[11px]">
                      {stop.orden || idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">
                        {stop.cliente?.nombre_comercial || 'Cliente'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {stop.cliente?.direccion || ''} •{' '}
                        {stop.cliente?.tipo_cliente_nombre || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 font-semibold text-[11px]">
                      {stop.hora_sugerida}
                    </span>
                    <Badge variant={stop.estado_visita || 'pendiente'}>
                      {stop.estado_visita || 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
