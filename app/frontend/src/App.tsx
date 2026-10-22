import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RutasPage } from './pages/RutasPage';
import { RutasAsignadasPage } from './pages/RutasAsignadasPage';
import { AgendaAsesoresPage } from './pages/AgendaAsesoresPage';
import { AgendaPage } from './pages/AgendaPage';
import { MapaPage } from './pages/MapaPage';
import { VisitasListPage } from './pages/VisitasListPage';
import { VisitasPage } from './pages/VisitasPage';
import { ClientesPage } from './pages/ClientesPage';
import { CotizacionesPage } from './pages/CotizacionesPage';
import { PedidosPage } from './pages/PedidosPage';
import { IndicadoresPage } from './pages/IndicadoresPage';
import { ReportesPage } from './pages/ReportesPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

export const App: React.FC = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  // Al abrir o recargar la app se recupera la sesión desde la cookie
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<LoginPage />} />

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
            <Route path="/rutas" element={<RutasPage />} />
            <Route path="/rutas/asignadas" element={<RutasAsignadasPage />} />
            <Route path="/rutas/agenda" element={<AgendaAsesoresPage />} />
            <Route path="/rutas/*" element={<RutasPage />} />

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
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
