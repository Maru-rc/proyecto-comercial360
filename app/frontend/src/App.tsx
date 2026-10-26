import React, { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Each screen is its own chunk: the login loads without the map or the forms
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const RutasPage = lazy(() =>
  import('./pages/RutasPage').then((m) => ({ default: m.RutasPage })),
);
const RutasAsignadasPage = lazy(() =>
  import('./pages/RutasAsignadasPage').then((m) => ({
    default: m.RutasAsignadasPage,
  })),
);
const AdvisorAgendaPage = lazy(() =>
  import('./pages/AdvisorAgendaPage').then((m) => ({
    default: m.AdvisorAgendaPage,
  })),
);
const AgendaPage = lazy(() =>
  import('./pages/AgendaPage').then((m) => ({ default: m.AgendaPage })),
);
const MapaPage = lazy(() =>
  import('./pages/MapaPage').then((m) => ({ default: m.MapaPage })),
);
const VisitasListPage = lazy(() =>
  import('./pages/VisitasListPage').then((m) => ({
    default: m.VisitasListPage,
  })),
);
const VisitasPage = lazy(() =>
  import('./pages/VisitasPage').then((m) => ({ default: m.VisitasPage })),
);
const ClientesPage = lazy(() =>
  import('./pages/ClientesPage').then((m) => ({ default: m.ClientesPage })),
);
const CotizacionesPage = lazy(() =>
  import('./pages/CotizacionesPage').then((m) => ({
    default: m.CotizacionesPage,
  })),
);
const PedidosPage = lazy(() =>
  import('./pages/PedidosPage').then((m) => ({ default: m.PedidosPage })),
);
const IndicadoresPage = lazy(() =>
  import('./pages/IndicadoresPage').then((m) => ({
    default: m.IndicadoresPage,
  })),
);
const ReportesPage = lazy(() =>
  import('./pages/ReportesPage').then((m) => ({ default: m.ReportesPage })),
);
const ConfiguracionPage = lazy(() =>
  import('./pages/ConfiguracionPage').then((m) => ({
    default: m.ConfiguracionPage,
  })),
);
const RecuperarContrasenaPage = lazy(() =>
  import('./pages/RecuperarContrasenaPage').then((m) => ({
    default: m.RecuperarContrasenaPage,
  })),
);
const RestablecerContrasenaPage = lazy(() =>
  import('./pages/RestablecerContrasenaPage').then((m) => ({
    default: m.RestablecerContrasenaPage,
  })),
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isCheckingSession } = useAuthStore();
  const location = useLocation();

  // Mientras se revisa la cookie de sesión no se redirige al login
  if (isCheckingSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route creation is the director's job: an advisor who types the URL lands on
// their assigned routes instead of a form the backend would reject (403)
const DirectorOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isDirector = useAuthStore(
    (state) => state.user?.rol === 'DIRECTOR_REGIONAL',
  );
  return isDirector ? (
    <>{children}</>
  ) : (
    <Navigate to="/rutas/asignadas" replace />
  );
};

export const App: React.FC = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  // Al abrir o recargar la app se recupera la sesión desde la cookie
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={<p className="p-6 text-xs text-slate-500">Cargando...</p>}
        >
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/recuperar-contrasena"
              element={<RecuperarContrasenaPage />}
            />
            <Route
              path="/restablecer-contrasena"
              element={<RestablecerContrasenaPage />}
            />

            {/* Protected layout routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Rutas (Creación, Asignadas, Agenda asesores) */}
              <Route
                path="/rutas"
                element={
                  <DirectorOnly>
                    <RutasPage />
                  </DirectorOnly>
                }
              />
              <Route path="/rutas/asignadas" element={<RutasAsignadasPage />} />
              <Route path="/rutas/agenda" element={<AdvisorAgendaPage />} />
              <Route
                path="/rutas/*"
                element={
                  <DirectorOnly>
                    <RutasPage />
                  </DirectorOnly>
                }
              />

              {/* Agenda & Mapa */}
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/mapa" element={<MapaPage />} />

              {/* Clientes */}
              <Route path="/clientes" element={<ClientesPage />} />

              {/* Visitas (Bitácora y Formulario de registro) */}
              <Route path="/visitas" element={<VisitasListPage />} />
              <Route path="/visitas/registrar" element={<VisitasPage />} />

              {/* Cotizaciones & Pedidos */}
              <Route path="/cotizaciones" element={<CotizacionesPage />} />
              <Route path="/pedidos" element={<PedidosPage />} />

              {/* Indicadores & Reportes */}
              <Route path="/indicadores" element={<IndicadoresPage />} />
              <Route path="/reportes" element={<ReportesPage />} />

              {/* Configuración */}
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
