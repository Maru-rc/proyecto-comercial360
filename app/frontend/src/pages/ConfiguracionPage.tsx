import React, { useState } from 'react';
import {
  User,
  Sliders,
  Bell,
  Database,
  Check,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRouteDraftStore } from '../store/useRouteDraftStore';
import { Input } from '../components/common/Input';

export const ConfiguracionPage: React.FC = () => {
  const { user } = useAuthStore();
  const { limpiarRuta } = useRouteDraftStore();

  const [activeTab, setActiveTab] = useState<'perfil' | 'rutas' | 'notificaciones' | 'sistema'>('perfil');

  // Perfil form
  const [nombre, setNombre] = useState(user?.nombre || 'Juan Pérez');
  const [email, setEmail] = useState(user?.email || 'jperez@comercial360.com');
  const [telefono, setTelefono] = useState('300 123 4567');
  const [cargo, setCargo] = useState(user?.cargo || 'Asesor Comercial Senior');

  // Parámetros de rutas
  const [tiempoVisita, setTiempoVisita] = useState('45');
  const [velocidadPromedio, setVelocidadPromedio] = useState('35');
  const [maxParadas, setMaxParadas] = useState('8');
  const [horaInicio, setHoraInicio] = useState('08:00 AM');

  // Notificaciones toggles
  const [notifRetrasos, setNotifRetrasos] = useState(true);
  const [notifResumen, setNotifResumen] = useState(true);
  const [notifInactivos, setNotifInactivos] = useState(true);
  const [notifVencimiento, setNotifVencimiento] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const handleSaveConfig = () => {
    setToastMessage('Preferencias guardadas exitosamente.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">Configuración de Comercial 360</h1>
          <p className="text-xs text-slate-500">
            Administre su cuenta, parámetros de optimización de rutas y reglas de notificación.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfig}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Save className="h-4 w-4" />
          Guardar cambios
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'perfil'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="h-4 w-4" />
          Mi Perfil y Rol
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rutas')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'rutas'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Parámetros de Rutas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notificaciones')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'notificaciones'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="h-4 w-4" />
          Notificaciones y Alertas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sistema')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'sistema'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          Sistema y Almacenamiento
        </button>
      </div>

      {/* Tab 1: Perfil */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.nombre}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-orange-100"
            />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{user?.nombre}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                  {user?.rol}
                </span>
                <span className="text-xs text-slate-400">• Territorio Atlántico</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <Input
                label="Correo Corporativo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Teléfono Móvil"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <Input
                label="Cargo Actual"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Parámetros de Rutas */}
      {activeTab === 'rutas' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Cálculo y Algoritmo de Rutas Comerciales
            </h2>
            <p className="text-xs text-slate-500">
              Estos valores determinan la optimización automática del orden de paradas y tiempos estimados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tiempo estándar por visita (Minutos)"
              type="number"
              value={tiempoVisita}
              onChange={(e) => setTiempoVisita(e.target.value)}
            />
            <Input
              label="Velocidad promedio estimada en ciudad (km/h)"
              type="number"
              value={velocidadPromedio}
              onChange={(e) => setVelocidadPromedio(e.target.value)}
            />
            <Input
              label="Máximo de paradas recomendadas por jornada diaria"
              type="number"
              value={maxParadas}
              onChange={(e) => setMaxParadas(e.target.value)}
            />
            <Input
              label="Hora sugerida de inicio de ruta"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Notificaciones */}
      {activeTab === 'notificaciones' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Alertas y Notificaciones de Campo
            </h2>
            <p className="text-xs text-slate-500">
              Configure las condiciones para el envío de alertas automáticas al asesor y director.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Alertar visitas pendientes con retraso &gt; 2 horas
                </span>
                <span className="text-[11px] text-slate-500">
                  Notifica si la visita programada en agenda no ha cambiado de estado.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifRetrasos}
                onChange={(e) => setNotifRetrasos(e.target.checked)}
                className="h-4 w-4 accent-[#EA580C] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Enviar resumen de ruta matutino
                </span>
                <span className="text-[11px] text-slate-500">
                  Envía correo a las 07:30 AM con la lista de clientes a visitar hoy.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifResumen}
                onChange={(e) => setNotifResumen(e.target.checked)}
                className="h-4 w-4 accent-[#EA580C] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Alerta de cliente sin visitar &gt; 15 días
                </span>
                <span className="text-[11px] text-slate-500">
                  Muestra insignia en el mapa cuando una cuenta prioritaria vence frecuencia.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifInactivos}
                onChange={(e) => setNotifInactivos(e.target.checked)}
                className="h-4 w-4 accent-[#EA580C] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Aviso de cotizaciones próximas a vencer (3 días)
                </span>
                <span className="text-[11px] text-slate-500">
                  Recordatorio para contactar al cliente antes de expirar la vigencia de precios.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifVencimiento}
                onChange={(e) => setNotifVencimiento(e.target.checked)}
                className="h-4 w-4 accent-[#EA580C] cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Sistema y Almacenamiento */}
      {activeTab === 'sistema' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Estado de Servicios y Caché Local
            </h2>
            <p className="text-xs text-slate-500">
              Verifique la conectividad con el backend y gestione el almacenamiento temporal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">API Base URL</span>
              <span className="font-mono text-xs font-bold text-slate-800">/api (Vite Proxy)</span>
              <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Activo</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Mapas Cartográficos</span>
              <span className="font-mono text-xs font-bold text-slate-800">OpenStreetMap + Leaflet</span>
              <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Conectado</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Almacenamiento S3</span>
              <span className="font-mono text-xs font-bold text-slate-800">Mock S3 Gateway</span>
              <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Operativo</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                Restablecer borrador de rutas
              </span>
              <span className="text-[11px] text-slate-500">
                Limpia las paradas temporales cargadas en el planificador de rutas.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                limpiarRuta();
                setToastMessage('Borrador de rutas limpiado correctamente.');
                setTimeout(() => setToastMessage(''), 3000);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar borrador
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Check className="h-5 w-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
