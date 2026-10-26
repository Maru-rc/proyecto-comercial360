import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '../common/Badge';

const ESTADO_COLORES: Record<string, string> = {
  VISITADO: '#16A34A', // Verde
  VISITED: '#16A34A',
  PENDIENTE: '#EA580C', // Naranja
  PENDING: '#EA580C',
  SIN_VISITAR: '#64748B', // Gris
  NOT_VISITED: '#64748B',
  PEDIDO_CERRADO: '#2563EB', // Azul
  ORDER_CLOSED: '#2563EB',
  REPROGRAMADO: '#DC2626', // Rojo
  RESCHEDULED: '#DC2626',
  NO_ASIGNADO: '#3B82F6', // Azul claro
};

export interface IMapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  orden?: number;
  estado?: string;
  direccion?: string;
  colorHex?: string;
}

interface OpenStreetMapViewerProps {
  markers: IMapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showPolyline?: boolean;
  legendTitle?: string;
  onMarkerClick?: (item: IMapMarkerItem) => void;
}

// Custom DivIcon generator to display colored numbered markers
const createColoredMarkerIcon = (
  orden: number | undefined,
  estado: string = 'PENDIENTE',
  colorHex?: string,
) => {
  const normalizedEstado = (estado || 'PENDIENTE').toUpperCase();
  const color = colorHex || ESTADO_COLORES[normalizedEstado] || '#EA580C';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        border: 2px solid white;
        position: relative;
        cursor: pointer;
      ">
        ${orden !== undefined ? orden : ''}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Recenter helper component
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const OpenStreetMapViewer: React.FC<OpenStreetMapViewerProps> = ({
  markers,
  center = [10.9685, -74.7813], // Default Barranquilla
  zoom = 12,
  height = '380px',
  showPolyline = true,
  legendTitle,
  onMarkerClick,
}) => {
  // Polyline positions based on markers in order
  const polylinePositions: [number, number][] = markers
    .filter((m) => !isNaN(m.lat) && !isNaN(m.lng) && m.lat !== 0)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((m) => [m.lat, m.lng]);

  const mapCenter =
    markers.length > 0 && !isNaN(markers[0].lat)
      ? ([markers[0].lat, markers[0].lng] as [number, number])
      : center;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs z-10"
      style={{ height }}
    >
      {/* Floating Legend from diseno_02.png / diseno_04.png */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-md border border-slate-200/80 text-xs">
        {legendTitle && (
          <p className="font-bold text-slate-800 mb-1.5">{legendTitle}</p>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] border border-white shadow-xs"></span>
            <span className="text-slate-600 font-medium text-[11px]">
              Visitado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EA580C] border border-white shadow-xs"></span>
            <span className="text-slate-600 font-medium text-[11px]">
              Pendiente
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#64748B] border border-white shadow-xs"></span>
            <span className="text-slate-600 font-medium text-[11px]">
              Sin visitar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2563EB] border border-white shadow-xs"></span>
            <span className="text-slate-600 font-medium text-[11px]">
              Pedido cerrado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] border border-white shadow-xs"></span>
            <span className="text-slate-600 font-medium text-[11px]">
              Reprogramado
            </span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <MapRecenter center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polylines connecting stops */}
        {showPolyline && polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#0F172A',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '2, 6',
            }}
          />
        )}

        {/* Markers */}
        {markers.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createColoredMarkerIcon(
              item.orden,
              item.estado,
              item.colorHex,
            )}
            eventHandlers={{
              click: () => onMarkerClick?.(item),
            }}
          >
            <Popup className="rounded-lg shadow-lg">
              <div className="p-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    #{item.orden} {item.title}
                  </span>
                  <Badge variant={item.estado || 'pendiente'}>
                    {item.estado || 'Pendiente'}
                  </Badge>
                </div>
                {item.direccion && (
                  <p className="text-[11px] text-slate-500">{item.direccion}</p>
                )}
                {item.subtitle && (
                  <p className="text-[11px] font-medium text-[#EA580C]">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
