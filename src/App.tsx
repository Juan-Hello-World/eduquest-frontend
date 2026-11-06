import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Spinner } from './components/common/Spinner';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Navbar } from './components/layout/Navbar';

// Lazy Loading de vistas (Criterio 3.3 de la rúbrica)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashBoardPage').then((m) => ({ default: m.DashboardPage }))
);
const ExploreDocumentsPage = lazy(() =>
  import('./pages/ExploreDocumentsPage').then((m) => ({ default: m.ExploreDocumentsPage }))
);
const GroupsPage = lazy(() =>
  import('./pages/GroupPage').then((m) => ({ default: m.GroupsPage }))
);
const GroupDetailPage = lazy(() =>
  import('./pages/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage }))
);
const StudyPlannerPage = lazy(() =>
  import('./pages/StudyPlannerPage').then((m) => ({ default: m.StudyPlannerPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const ProtectedLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Outlet />
    </main>
  </div>
);

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <Suspense fallback={<Spinner fullScreen label="Cargando módulo de EduQuest..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rutas protegidas con JWT */}
              <Route element={<PrivateRoute />}>
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/documents" element={<ExploreDocumentsPage />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/groups/:groupId" element={<GroupDetailPage />} />
                  <Route path="/study-planner" element={<StudyPlannerPage />} />
                </Route>
              </Route>

              {/* Ruta 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;