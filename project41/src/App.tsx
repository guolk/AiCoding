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
import ExamLoginPage from '@/pages/exam/LoginPage';
import ExamDashboardPage from '@/pages/exam/DashboardPage';
import QuestionsPage from '@/pages/exam/QuestionsPage';
import QuestionCreatePage from '@/pages/exam/QuestionCreatePage';
import PapersPage from '@/pages/exam/PapersPage';
import PaperCreatePage from '@/pages/exam/PaperCreatePage';
import ExamsPage from '@/pages/exam/ExamsPage';
import ExamCreatePage from '@/pages/exam/ExamCreatePage';
import ExamTakePage from '@/pages/exam/ExamTakePage';
import ExamResultPage from '@/pages/exam/ExamResultPage';
import GradingPage from '@/pages/exam/GradingPage';
import AnalyticsPage from '@/pages/exam/AnalyticsPage';
import StudentExamsPage from '@/pages/exam/StudentExamsPage';

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
              
              <Route path="/exam/login" element={<ExamLoginPage />} />
              <Route path="/exam/dashboard" element={<ExamDashboardPage />} />
              <Route path="/exam/questions" element={<QuestionsPage />} />
              <Route path="/exam/questions/new" element={<QuestionCreatePage />} />
              <Route path="/exam/questions/:id/edit" element={<QuestionCreatePage />} />
              <Route path="/exam/papers" element={<PapersPage />} />
              <Route path="/exam/papers/new" element={<PaperCreatePage />} />
              <Route path="/exam/exams" element={<ExamsPage />} />
              <Route path="/exam/exams/new" element={<ExamCreatePage />} />
              <Route path="/exam/take/:examId" element={<ExamTakePage />} />
              <Route path="/exam/result/:submissionId" element={<ExamResultPage />} />
              <Route path="/exam/grading" element={<GradingPage />} />
              <Route path="/exam/analytics/:examId" element={<AnalyticsPage />} />
              <Route path="/exam/my-exams" element={<StudentExamsPage />} />
              
              <Route path="/exam" element={<Navigate to="/exam/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/exam/login" replace />} />
              <Route path="*" element={<Navigate to="/exam/login" replace />} />
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
