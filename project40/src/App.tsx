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
import ExercisesPage from '@/pages/ExercisesPage';
import VideoCoursesPage from '@/pages/VideoCoursesPage';
import PracticeReportPage from '@/pages/PracticeReportPage';
import CommunityPage from '@/pages/CommunityPage';
import LearningPathPage from '@/pages/LearningPathPage';
import PaymentPage from '@/pages/PaymentPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import SheetEditorPage from '@/pages/SheetEditorPage';

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
                path="/exercises"
                element={
                  <PrivateRoute>
                    <ExercisesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/video-courses"
                element={
                  <PrivateRoute>
                    <VideoCoursesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sheet-editor"
                element={
                  <PrivateRoute>
                    <SheetEditorPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/practice-report"
                element={
                  <PrivateRoute>
                    <PracticeReportPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <PrivateRoute>
                    <CommunityPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/learning-path"
                element={
                  <PrivateRoute>
                    <LearningPathPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher-dashboard"
                element={
                  <PrivateRoute>
                    <TeacherDashboardPage />
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
