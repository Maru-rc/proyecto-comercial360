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
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [rutasExpanded, setRutasExpanded] = useState(
    location.pathname.startsWith('/rutas')
  );

  const isDirector = user?.rol === 'DIRECTOR_REGIONAL';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      name: 'Planeación de rutas',
      icon: Route,
      path: '/rutas',
      hasSubmenu: true,
      subItems: [
        { name: 'Creación de rutas', path: '/rutas' },
        { name: 'Rutas asignadas', path: '/rutas/asignadas' },
        { name: 'Agenda de asesores', path: '/rutas/agenda' },
      ],
    },
    { name: 'Agenda', icon: CalendarDays, path: '/agenda' },
    { name: 'Mapa de visitas', icon: MapPin, path: '/mapa' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Visitas', icon: ClipboardList, path: '/visitas/registrar' },
    { name: 'Cotizaciones', icon: FileText, path: '/cotizaciones' },
    { name: 'Pedidos', icon: ShoppingCart, path: '/pedidos' },
    { name: 'Indicadores', icon: BarChart3, path: '/indicadores' },
    { name: 'Reportes', icon: LineChart, path: '/reportes' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col justify-between bg-[#0B1527] text-slate-300 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header inside Sidebar */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EA580C] text-white font-black text-sm">
              360
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Comercial <span className="text-[#EA580C]">360</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

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
                      <Icon className={`h-4 w-4 ${isActive ? 'text-[#EA580C]' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        rutasExpanded ? 'rotate-180 text-white' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {rutasExpanded && item.subItems && (
                    <div className="pl-9 pr-2 space-y-1 py-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.name}
                            to={sub.path}
                            onClick={() => {
                              if (window.innerWidth < 768) onClose();
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
                  if (window.innerWidth < 768) onClose();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/80 text-white font-semibold border-l-2 border-[#EA580C]'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#EA580C]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Sidebar Widget */}
        <div className="p-4 border-t border-slate-800/80 bg-[#09111E]">
          {isDirector ? (
            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-orange-400">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold text-white">Resumen regional</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rutas activas:</span>
                  <span className="font-bold text-white">24</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Asesores activos:</span>
                  <span className="font-bold text-white">12</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Clientes región:</span>
                  <span className="font-bold text-white">1.285</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1.5 text-orange-400">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold text-white">Objetivo semanal</span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl font-extrabold text-white">78%</span>
                <span className="text-[11px] text-slate-400">de cumplimiento</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden my-2">
                <div className="bg-[#EA580C] h-full rounded-full w-[78%]"></div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Meta: 24 visitas</span>
                <span>Completadas: 19</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
