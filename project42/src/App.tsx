import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/services/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { PrivateRoute, GuestRoute } from '@/router/PrivateRoute';
import ToastContainer from '@/components/ToastContainer';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import RolesPage from '@/pages/RolesPage';
import PermissionsPage from '@/pages/PermissionsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProblemsPage from '@/pages/ProblemsPage';
import ProblemDetailPage from '@/pages/ProblemDetailPage';
import ContestsPage from '@/pages/ContestsPage';
import ContestDetailPage from '@/pages/ContestDetailPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/problems"
                element={
                  <PrivateRoute>
                    <ProblemsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/problems/:id"
                element={
                  <PrivateRoute>
                    <ProblemDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contests"
                element={
                  <PrivateRoute>
                    <ContestsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contests/:id"
                element={
                  <PrivateRoute>
                    <ContestDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <UsersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <PrivateRoute>
                    <RolesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/permissions"
                element={
                  <PrivateRoute>
                    <PermissionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
