import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useNavigate } from 'react-router-dom';

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
  const { user, logout, toggleRole } = useAuthStore();
  const {
    territorio,
    setTerritorio,
    semana,
    setSemana,
    regional,
    setRegional,
    searchQuery,
    setSearchQuery,
  } = useFilterStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isDirector = user?.rol === 'DIRECTOR_REGIONAL';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Left side: Logo & Toggle or Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Abrir menú"
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
                      <span className="font-semibold text-slate-800">{b.label}</span>
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
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
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
        <div className="hidden lg:flex items-center relative ml-4 w-72 xl:w-96">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes, contactos, rutas..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Territory or Regional selector */}
        {isDirector ? (
          <div className="hidden md:flex flex-col items-start bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Regional</span>
            <div className="flex items-center gap-1">
              <select
                value={regional}
                onChange={(e) => setRegional(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Atlántico">Atlántico</option>
                <option value="Bolívar">Bolívar</option>
                <option value="Magdalena">Magdalena</option>
              </select>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-start bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Territorio</span>
            <div className="flex items-center gap-1">
              <select
                value={territorio}
                onChange={(e) => setTerritorio(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="NORTE">NORTE</option>
                <option value="SUR">SUR</option>
                <option value="CENTRO">CENTRO</option>
                <option value="ORIENTE">ORIENTE</option>
              </select>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>
        )}

        {/* Semana selector */}
        <div className="hidden sm:flex flex-col items-start bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Semana</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={semana}
              onChange={(e) => setSemana(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="20 - 26 May 2024">20 - 26 May 2024</option>
              <option value="27 May - 02 Jun 2024">27 May - 02 Jun 2024</option>
              <option value="13 - 19 May 2024">13 - 19 May 2024</option>
            </select>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA580C] text-[10px] font-bold text-white ring-2 ring-white">
            8
          </span>
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.nombre || 'Usuario'}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.nombre || 'Juan Pérez'}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user?.cargo || (isDirector ? 'Director Regional' : 'Asesor Comercial')}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-[#0F172A]">{user?.nombre}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                  {user?.rol}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleRole();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] rounded-lg cursor-pointer transition-colors"
              >
                <UserCheck className="h-4 w-4" />
                Cambiar a {isDirector ? 'Asesor (Juan Pérez)' : 'Director (Richard Lopez)'}
              </button>

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
                onClick={() => {
                  logout();
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
