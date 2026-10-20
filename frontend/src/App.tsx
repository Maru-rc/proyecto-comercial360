import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RutasPage } from './pages/RutasPage';
import { VisitasPage } from './pages/VisitasPage';
import { ClientesPage } from './pages/ClientesPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agenda" element={<DashboardPage />} />
          <Route path="/mapa" element={<DashboardPage />} />

          {/* Rutas */}
          <Route path="/rutas" element={<RutasPage />} />
          <Route path="/rutas/*" element={<RutasPage />} />

          {/* Visitas */}
          <Route path="/visitas" element={<VisitasPage />} />
          <Route path="/visitas/registrar" element={<VisitasPage />} />

          {/* Clientes */}
          <Route path="/clientes" element={<ClientesPage />} />

          {/* Fallbacks */}
          <Route path="/cotizaciones" element={<VisitasPage />} />
          <Route path="/pedidos" element={<VisitasPage />} />
          <Route path="/indicadores" element={<DashboardPage />} />
          <Route path="/reportes" element={<DashboardPage />} />
          <Route path="/configuracion" element={<DashboardPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  );
};

export default App;
