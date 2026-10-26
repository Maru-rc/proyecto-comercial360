import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Eye,
  Navigation,
} from 'lucide-react';
import { IRuta } from '../types/ruta';
import {
  getRutas,
  getAsesores,
  getParadasRuta,
  estadoRuta,
  IParadaGuardada,
} from '../api/rutas';
import { getCatalogosClientes } from '../api/clientes';
import { useClientes } from '../hooks/useClientes';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';

const hhmm = (hora: string) => (hora ? hora.slice(0, 5) : '—');

export const RutasAsignadasPage: React.FC = () => {
  const navigate = useNavigate();
  const esDirector = useAuthStore(
    (state) => state.user?.rol === 'DIRECTOR_REGIONAL',
  );
  const [rutas, setRutas] = useState<IRuta[]>([]);
  const [errorCarga, setErrorCarga] = useState('');
  // Stops of each route, loaded from GET /rutas/:id (the list has none)
  const [paradasPorRuta, setParadasPorRuta] = useState<
    Record<string, IParadaGuardada[]>
  >({});
  const [search, setSearch] = useState('');
  const [diaFiltro, setDiaFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [selectedRuta, setSelectedRuta] = useState<IRuta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores'],
    queryFn: getAsesores,
  });
  const { data: catalogos } = useQuery({
    queryKey: ['clientes', 'catalogos'],
    queryFn: getCatalogosClientes,
    staleTime: 1000 * 60 * 30,
  });
  const { clientes } = useClientes();

  useEffect(() => {
    getRutas()
      .then(async (data) => {
        setRutas(data);
        const detalles = await Promise.allSettled(
          data.map((r) => getParadasRuta(r.id_ruta)),
        );
        const porRuta: Record<string, IParadaGuardada[]> = {};
        detalles.forEach((detalle, idx) => {
          if (detalle.status === 'fulfilled') {
            porRuta[data[idx].id_ruta] = detalle.value;
          }
        });
        setParadasPorRuta(porRuta);
      })
      .catch(() =>
        setErrorCarga(
          'No se pudieron cargar las rutas. Recarga la página para intentar de nuevo.',
        ),
      );
  }, []);

  const nombreAsesor = (ruta: IRuta) =>
    asesores.find((a) => String(a.id) === ruta.id_asesor)?.name ??
    (ruta.id_asesor ? `Asesor #${ruta.id_asesor}` : 'Sin asignar');

  const nombreZona = (ruta: IRuta) =>
    catalogos?.zonas.find((z) => String(z.id) === ruta.id_zona)?.nombre ??
    ruta.territorio_zona;

  const paradasDe = (ruta: IRuta) => paradasPorRuta[ruta.id_ruta];

  const filteredRutas = rutas.filter((r) => {
    const texto = search.toLowerCase();
    const matchesSearch =
      r.codigo.toLowerCase().includes(texto) ||
      r.nombre.toLowerCase().includes(texto) ||
      nombreAsesor(r).toLowerCase().includes(texto) ||
      nombreZona(r).toLowerCase().includes(texto);

    const matchesDia = diaFiltro === 'Todos' || r.dia_ejecucion === diaFiltro;
    const matchesEstado = estadoFiltro === 'Todos' || r.estado === estadoFiltro;

    return matchesSearch && matchesDia && matchesEstado;
  });

  const asignadas = rutas.filter((r) => r.estado === 'ASIGNADA').length;
  const borradores = rutas.filter((r) => r.estado === 'BORRADOR').length;
  const paradasTotales = Object.values(paradasPorRuta).reduce(
    (total, paradas) => total + paradas.length,
    0,
  );
  const asesoresConRuta = new Set(
    rutas.filter((r) => r.id_asesor).map((r) => r.id_asesor),
  ).size;

  // The API sends the client id as a number although the type says string
  const clienteDe = (idCliente: string) =>
    clientes.find((c) => String(c.id_cliente) === idCliente);

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

        {esDirector && (
          <button
            type="button"
            onClick={() => navigate('/rutas')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva ruta en mapa
          </button>
        )}
      </div>

      {errorCarga && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"
        >
          {errorCarga}
        </div>
      )}

      {/* Summary KPI Mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Total Rutas
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {rutas.length}
          </p>
          <span className="text-[10px] text-slate-400">
            {borradores} en borrador
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Rutas Asignadas
          </p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1">
            {asignadas}
          </p>
          <span className="text-[10px] text-slate-400">
            Con asesor y visitas generadas
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Paradas Totales
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {paradasTotales}
          </p>
          <span className="text-[10px] text-slate-400">
            Clientes programados
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Asesores con Ruta
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {asesoresConRuta}
          </p>
          <span className="text-[10px] text-slate-400">
            De {asesores.length} activos
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
            <option value="Sábado">Sábado</option>
          </select>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="ASIGNADA">Asignada</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EN_CURSO">En curso</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>
      </div>

      {/* Routes Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRutas
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((ruta) => {
            const estado = estadoRuta(ruta.estado);
            const paradas = paradasDe(ruta);
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
                    <Badge variant={estado.variante}>{estado.etiqueta}</Badge>
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
                        {nombreAsesor(ruta)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{nombreZona(ruta)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {ruta.dia_ejecucion} ({ruta.frecuencia})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {hhmm(ruta.hora_inicio_sugerida)} -{' '}
                        {hhmm(ruta.hora_fin_sugerida)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs bg-slate-50 p-2 rounded-lg text-slate-700 mb-3">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Paradas
                    </span>
                    <span className="font-bold">
                      {paradas ? `${paradas.length} clientes` : 'Cargando...'}
                    </span>
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
          description={`Código: ${selectedRuta.codigo} | Asesor: ${nombreAsesor(selectedRuta)} | Día: ${selectedRuta.dia_ejecucion}`}
          maxWidth="lg"
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRuta(null)}
            >
              Cerrar
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Navigation className="h-4 w-4 text-[#EA580C]" />
                {nombreZona(selectedRuta)} · {selectedRuta.frecuencia}
              </span>
              <span>
                Horario: {hhmm(selectedRuta.hora_inicio_sugerida)} a{' '}
                {hhmm(selectedRuta.hora_fin_sugerida)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {(paradasDe(selectedRuta) ?? []).length === 0 && (
                <p className="py-3 text-slate-500">
                  {paradasDe(selectedRuta)
                    ? 'Esta ruta no tiene paradas.'
                    : 'Cargando paradas...'}
                </p>
              )}
              {(paradasDe(selectedRuta) ?? []).map((parada, idx) => {
                const cliente = clienteDe(parada.id_cliente);
                return (
                  <div
                    key={`${parada.id_cliente}-${parada.orden}`}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-white font-bold text-[11px]">
                        {parada.orden || idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">
                          {cliente?.nombre_comercial ||
                            cliente?.razon_social ||
                            `Cliente #${parada.id_cliente}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {[cliente?.direccion, cliente?.municipio]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-slate-600 font-semibold text-[11px]">
                      {parada.hora_sugerida ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
