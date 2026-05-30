import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Login from "@/pages/Login/Login";
import Settings from "@/pages/Settings/Settings";
import Emergency from "@/pages/Emergency/Emergency";
import { DocumentsList, DocumentForm, DocumentDetail } from "@/pages/Documents";
import { LegalList, LegalForm, LegalDetail } from "@/pages/Legal";
import { Family, MemberDetail } from "@/pages/Family";
import { Property, InsuranceDetail } from "@/pages/Property";
import { useStore } from "@/store/useStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loadFromStorage, isInitialized } = useStore();

  if (!isInitialized) {
    loadFromStorage();
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/add"
          element={
            <ProtectedRoute>
              <DocumentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/edit/:id"
          element={
            <ProtectedRoute>
              <DocumentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal"
          element={
            <ProtectedRoute>
              <LegalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal/add"
          element={
            <ProtectedRoute>
              <LegalForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal/edit/:id"
          element={
            <ProtectedRoute>
              <LegalForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal/:id"
          element={
            <ProtectedRoute>
              <LegalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <Family />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/:id"
          element={
            <ProtectedRoute>
              <MemberDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property"
          element={
            <ProtectedRoute>
              <Property />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/insurance/:id"
          element={
            <ProtectedRoute>
              <InsuranceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
