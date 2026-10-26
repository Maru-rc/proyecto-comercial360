import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play } from 'lucide-react';
import {
  OpenStreetMapViewer,
  IMapMarkerItem,
} from '../components/maps/OpenStreetMapViewer';
import { Badge } from '../components/common/Badge';
import { useVisitasMap } from '../hooks/useVisitasMap';

// Pin states come from the backend in English
const ESTADO_PIN: Record<string, string> = {
  VISITED: 'Visitado',
  PENDING: 'Pendiente',
  ORDER_CLOSED: 'Pedido cerrado',
  NOT_VISITED: 'Sin visitar',
  RESCHEDULED: 'Reprogramado',
};

export const MapaPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<IMapMarkerItem | null>(null);

  const { mapStops, isLoading } = useVisitasMap();

  // Stops without geocoding are listed in the agenda, never placed on a guess
  const geoStops = mapStops.filter(
    (stop) => stop.latitude !== null && stop.longitude !== null,
  );
  const markerId = (stop: (typeof geoStops)[number], idx: number) =>
    String(stop.id || stop.clientId || idx + 1);

  // The backend does not store the stop order (it always sends 1), but the
  // visits come sorted by time, so the position is the real order
  const allMarkers: IMapMarkerItem[] = geoStops.map((stop, idx) => ({
    id: markerId(stop, idx),
    lat: Number(stop.latitude),
    lng: Number(stop.longitude),
    title: stop.clientName,
    subtitle: stop.address || `Parada #${idx + 1}`,
    orden: idx + 1,
    estado: stop.pinStatus,
    colorHex: stop.colorHex,
    direccion: stop.address || '',
  }));

  // "Visitar" opens the scheduled visit (it used to create a new one);
  // a visit already registered opens read-only
  const visitarParada = (marker: IMapMarkerItem) => {
    const stop = geoStops.find((s, idx) => markerId(s, idx) === marker.id);
    if (!stop?.id) {
      navigate(`/visitas/registrar?clienteId=${stop?.clientId ?? ''}`);
      return;
    }
    const registrada =
      marker.estado === 'VISITED' || marker.estado === 'ORDER_CLOSED';
    navigate(
      `/visitas/registrar?visita=${stop.id}${registrada ? '&modo=ver' : ''}`,
    );
  };

  const filteredMarkers = allMarkers.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.direccion && m.direccion.toLowerCase().includes(search.toLowerCase()));

    const estadoUpper = m.estado?.toUpperCase() || '';
    const filterUpper = estadoFilter.toUpperCase();

    const matchesEstado =
      estadoFilter === 'Todos' ||
      estadoUpper === filterUpper ||
      (filterUpper === 'VISITADO' && estadoUpper === 'VISITED') ||
      (filterUpper === 'PENDIENTE' && estadoUpper === 'PENDING') ||
      (filterUpper === 'PEDIDO_CERRADO' && estadoUpper === 'ORDER_CLOSED') ||
      (filterUpper === 'SIN_VISITAR' && estadoUpper === 'NOT_VISITED') ||
      (filterUpper === 'REPROGRAMADO' && estadoUpper === 'RESCHEDULED');

    return matchesSearch && matchesEstado;
  });

  const visitados = allMarkers.filter(
    (m) => m.estado === 'VISITED' || m.estado === 'VISITADO',
  ).length;
  const pendientes = allMarkers.filter(
    (m) => m.estado === 'PENDING' || m.estado === 'PENDIENTE',
  ).length;
  const pedidos = allMarkers.filter(
    (m) => m.estado === 'ORDER_CLOSED' || m.estado === 'PEDIDO_CERRADO',
  ).length;

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Mapa de Visitas y Clientes
          </h1>
          <p className="text-xs text-slate-500">
            Georreferenciación en tiempo real de cartera comercial y estados de
            ruta en territorio.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
            <span className="text-emerald-800 font-bold">
              {visitados} Visitados
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
            <span className="text-orange-800 font-bold">
              {pendientes} Pendientes
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span className="text-blue-800 font-bold">{pedidos} Pedidos</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de cliente o dirección..."
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
            <option value="VISITADO">Visitado (Verde)</option>
            <option value="PENDIENTE">Pendiente (Naranja)</option>
            <option value="PEDIDO_CERRADO">Pedido cerrado (Azul)</option>
            <option value="SIN_VISITAR">Sin visitar (Gris)</option>
            <option value="REPROGRAMADO">Reprogramado (Rojo)</option>
          </select>
        </div>
      </div>

      {/* Main Map + Client Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Client List Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Puntos en mapa ({filteredMarkers.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Clic para enfocar
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
            {isLoading && (
              <p className="p-3 text-xs text-slate-500">Cargando mapa...</p>
            )}
            {!isLoading && filteredMarkers.length === 0 && (
              <p className="p-3 text-xs text-slate-500">
                No hay paradas georreferenciadas para hoy.
              </p>
            )}
            {filteredMarkers.map((marker) => {
              const isSelected = selectedItem?.id === marker.id;
              return (
                <div
                  key={marker.id}
                  onClick={() => setSelectedItem(marker)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      #{marker.orden} {marker.title}
                    </span>
                    <Badge variant={marker.estado?.toLowerCase() || 'default'}>
                      {ESTADO_PIN[marker.estado ?? ''] ?? marker.estado}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {marker.direccion}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[10px] text-slate-400">
                      {marker.subtitle}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        visitarParada(marker);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EA580C] hover:underline"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Visitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-2 shadow-xs h-[520px]">
          <OpenStreetMapViewer
            markers={filteredMarkers}
            center={
              selectedItem
                ? [selectedItem.lat, selectedItem.lng]
                : [10.9685, -74.7813]
            }
            zoom={selectedItem ? 14 : 12}
            height="100%"
            legendTitle="Convención de estados"
            onMarkerClick={(item) => setSelectedItem(item)}
          />
        </div>
      </div>
    </div>
  );
};
