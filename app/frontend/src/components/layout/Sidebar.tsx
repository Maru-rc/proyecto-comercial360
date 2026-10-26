import React, { useState } from 'react';
import {
  LayoutDashboard,
  Route,
  CalendarDays,
  MapPin,
  Users,
  ClipboardList,
  FileText,
  ShoppingCart,
  BarChart3,
  LineChart,
  Settings,
  ChevronDown,
  Target,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getDashboardKpis } from '../../api/kpis';
import { getAsesores } from '../../api/rutas';
import { useRutas } from '../../hooks/useRutas';
import { useClientes } from '../../hooks/useClientes';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Compatibility props
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
  isDesktopOpen,
  onToggleDesktop,
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [rutasExpanded, setRutasExpanded] = useState(false);

  const mobileOpen = isMobileOpen ?? isOpen ?? false;
  // If isDesktopOpen is passed (legacy), collapsed is !isDesktopOpen
  const collapsed = isDesktopOpen !== undefined ? !isDesktopOpen : isCollapsed;
  const handleMobileClose = onMobileClose ?? onClose ?? (() => {});
  const handleToggleCollapse =
    onToggleCollapse ?? onToggleDesktop ?? (() => {});

  const isRutasRoute = location.pathname.startsWith('/rutas');
  const showRutasSubmenu = rutasExpanded || isRutasRoute;

  const isDirector = user?.rol === 'DIRECTOR_REGIONAL';
  const { data: kpis } = useQuery({
    queryKey: ['kpis', 'sidebar'],
    queryFn: () => getDashboardKpis(),
    enabled: !isDirector,
    staleTime: 1000 * 60 * 5,
  });
  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores'],
    queryFn: getAsesores,
    enabled: isDirector,
  });
  const { rutas } = useRutas();
  const { clientes } = useClientes();
  const cumplimiento = Math.min(kpis?.porcentajeCumplimiento ?? 0, 100);
  const resumenAsesor = kpis
    ? `Objetivo semanal: ${kpis.porcentajeCumplimiento}% cumplimiento (${kpis.completadasVisitas}/${kpis.metaVisitas} visitas)`
    : 'Objetivo semanal';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      name: 'Planeación de rutas',
      icon: Route,
      path: isDirector ? '/rutas' : '/rutas/asignadas',
      hasSubmenu: true,
      subItems: [
        // Crear rutas es solo del director (POST /rutas responde 403 al asesor)
        ...(isDirector ? [{ name: 'Creación de rutas', path: '/rutas' }] : []),
        { name: 'Rutas asignadas', path: '/rutas/asignadas' },
        { name: 'Agenda de asesores', path: '/rutas/agenda' },
      ],
    },
    { name: 'Agenda', icon: CalendarDays, path: '/agenda' },
    { name: 'Mapa de visitas', icon: MapPin, path: '/mapa' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Visitas', icon: ClipboardList, path: '/visitas' },
    { name: 'Cotizaciones', icon: FileText, path: '/cotizaciones' },
    { name: 'Pedidos', icon: ShoppingCart, path: '/pedidos' },
    { name: 'Indicadores', icon: BarChart3, path: '/indicadores' },
    { name: 'Reportes', icon: LineChart, path: '/reportes' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={handleMobileClose}
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#0B1527] text-slate-300 transition-[width,transform] duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          // Mobile open / close
          mobileOpen
            ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl'
            : '-translate-x-full w-72 max-w-[85vw]'
        } ${
          // Desktop width: w-20 (collapsed) vs w-64 (expanded)
          collapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Brand Header inside Sidebar */}
        <div
          className={`flex h-16 items-center border-b border-slate-800/80 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="group flex flex-col items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Expandir menú lateral"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EA580C] text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                360
              </div>
              <PanelLeftOpen className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EA580C] text-white font-black text-sm shadow-xs">
                  360
                </div>
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  Comercial <span className="text-[#EA580C]">360</span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop collapse button */}
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="hidden md:flex text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Contraer menú lateral"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                {/* Mobile close button */}
                <button
                  type="button"
                  onClick={handleMobileClose}
                  className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation list */}
        <div
          className={`flex-1 overflow-y-auto py-4 space-y-1.5 ${
            collapsed ? 'px-2' : 'px-3'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/' ||
                  location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            if (collapsed) {
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={item.name}
                  onClick={() => {
                    if (window.innerWidth < 768) handleMobileClose();
                  }}
                  className={`flex h-10 w-full items-center justify-center rounded-lg transition-colors cursor-pointer group relative ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {/* Floating tooltip */}
                  <span className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap">
                    {item.name}
                  </span>
                </NavLink>
              );
            }

            if (item.hasSubmenu) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setRutasExpanded(!rutasExpanded)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/80 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${isActive ? 'text-[#EA580C]' : 'text-slate-400'}`}
                      />
                      <span className="whitespace-nowrap">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        showRutasSubmenu
                          ? 'rotate-180 text-white'
                          : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {showRutasSubmenu && item.subItems && (
                    <div className="pl-9 pr-2 space-y-1 py-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.name}
                            to={sub.path}
                            onClick={() => {
                              if (window.innerWidth < 768) handleMobileClose();
                            }}
                            className={`block rounded-md px-2.5 py-1.5 text-[11px] transition-colors ${
                              isSubActive
                                ? 'bg-[#EA580C]/20 text-[#EA580C] font-semibold border-l-2 border-[#EA580C]'
                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                            }`}
                          >
                            {sub.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) handleMobileClose();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/80 text-white font-semibold border-l-2 border-[#EA580C]'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-[#EA580C]' : 'text-slate-400'}`}
                />
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Sidebar Widget */}
        <div
          className={`border-t border-slate-800/80 bg-[#09111E] ${
            collapsed ? 'p-2 flex flex-col items-center justify-center' : 'p-4'
          }`}
        >
          {collapsed ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50 w-full hover:bg-slate-800 cursor-pointer transition-colors"
              title={
                isDirector
                  ? `Resumen regional: ${rutas.length} rutas, ${asesores.length} asesores`
                  : resumenAsesor
              }
            >
              <Target className="h-5 w-5 text-orange-400" />
              <span className="text-[10px] font-extrabold text-white mt-1">
                {isDirector ? rutas.length : `${cumplimiento}%`}
              </span>
            </div>
          ) : isDirector ? (
            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-orange-400">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold text-white">
                  Resumen regional
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rutas:</span>
                  <span className="font-bold text-white">{rutas.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Asesores activos:</span>
                  <span className="font-bold text-white">
                    {asesores.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Clientes región:</span>
                  <span className="font-bold text-white">
                    {clientes.length.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1.5 text-orange-400">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold text-white">
                  Objetivo semanal
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl font-extrabold text-white">
                  {kpis ? `${kpis.porcentajeCumplimiento}%` : '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  de cumplimiento
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden my-2">
                <div
                  className="bg-[#EA580C] h-full rounded-full"
                  style={{ width: `${cumplimiento}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Meta: {kpis?.metaVisitas ?? '—'} visitas</span>
                <span>Completadas: {kpis?.completadasVisitas ?? '—'}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
