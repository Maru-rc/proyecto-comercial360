import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useNavigate } from 'react-router-dom';
import { useVisitasAgenda } from '../../hooks/useVisitasAgenda';
import { semanasRecientes } from '../../lib/semana';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { semanaNumero, setSemanaNumero, searchQuery, setSearchQuery } =
    useFilterStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [semanas] = useState(() => semanasRecientes(6));
  const { agenda } = useVisitasAgenda();

  // Field notifications: today's visits still pending for the session.
  // Visits generated from a route are saved as PENDIENTE
  const notifications = agenda
    .filter((v) => {
      const status = (v.visitStatus || v.status || '').toUpperCase();
      return (
        status === 'SCHEDULED' ||
        status === 'PENDING' ||
        status === 'PENDIENTE' ||
        status === ''
      );
    })
    .slice(0, 5)
    .map((v) => ({
      id: String(v.id),
      titulo: 'Cliente pendiente de visita',
      detalle: `${v.clientName || `Cliente #${v.clientId}`}${
        v.suggestedTime || v.time ? ` a las ${v.suggestedTime || v.time}` : ''
      }`,
      tiempo: 'Hoy',
      ruta: '/agenda',
      color: 'bg-blue-500',
    }));
  const unreadCount = notifications.filter(
    (n) => !readIds.includes(n.id),
  ).length;
  const setUnreadCount = (_count: 0) =>
    setReadIds(notifications.map((n) => n.id));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Searches the client directory (it reads ?search= from the URL)
    if (searchQuery.trim()) {
      navigate(`/clientes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isDirector = user?.rol === 'DIRECTOR_REGIONAL';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Left side: Logo & Toggle or Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Abrir o cerrar menú lateral"
          title="Alternar barra lateral"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title ? (
          <div className="flex items-center gap-2">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    {b.href ? (
                      <button
                        onClick={() => navigate(b.href!)}
                        className="hover:text-[#EA580C] transition-colors"
                      >
                        {b.label}
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {b.label}
                      </span>
                    )}
                    {i < breadcrumbs.length - 1 && <span>&gt;</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <h1 className="text-lg font-bold text-[#0F172A]">{title}</h1>
            )}
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-[#EA580C] shadow-xs">
              {/* Custom 360 target icon */}
              <div className="flex items-center gap-0.5">
                <span className="w-1.5 h-3.5 bg-[#EA580C] rounded-full inline-block"></span>
                <span className="w-1.5 h-5 bg-[#EA580C] rounded-full inline-block"></span>
                <span className="w-1.5 h-2.5 bg-white rounded-full inline-block"></span>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">
              Comercial <span className="text-[#EA580C]">360</span>
            </span>
          </div>
        )}

        {/* Global Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex items-center relative ml-4 w-72 xl:w-96"
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes por NIT, nombre o municipio... (Enter)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </form>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Semana selector (filtra los indicadores del Dashboard) */}
        <div className="hidden sm:flex flex-col items-start bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400">
            Semana
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={semanaNumero}
              onChange={(e) => setSemanaNumero(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {semanas.map((s) => (
                <option key={s.numero} value={s.numero}>
                  {s.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Notificaciones"
            title="Ver notificaciones y alertas"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA580C] text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-extrabold text-slate-900 text-xs">
                  Notificaciones de Campo ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-1">
                {notifications.length === 0 && (
                  <p className="p-2.5 text-xs text-slate-500">
                    Sin visitas pendientes para hoy.
                  </p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifMenuOpen(false);
                      navigate(n.ruta);
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${n.color}`} />
                        <span className="font-bold text-slate-800 text-xs">
                          {n.titulo}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {n.tiempo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-3.5">
                      {n.detalle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            {/* Initials instead of the same stock photo for every user */}
            <span
              role="img"
              aria-label={user?.nombre || 'Usuario'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-[#EA580C] ring-2 ring-slate-100"
            >
              {(user?.nombre || 'U')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte[0]?.toUpperCase())
                .join('')}
            </span>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user?.cargo ||
                  (isDirector ? 'Director Regional' : 'Asesor Comercial')}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-[#0F172A]">
                  {user?.nombre}
                </p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                  {user?.rol}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/clientes');
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Catálogo de Clientes
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
