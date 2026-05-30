import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import PatternList from "@/pages/PatternList";
import PatternEditor from "@/pages/PatternEditor";
import ProjectList from "@/pages/ProjectList";
import ProjectDetail from "@/pages/ProjectDetail";
import MaterialLibrary from "@/pages/MaterialLibrary";
import LearningNotes from "@/pages/LearningNotes";
import SettingsPage from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patterns" element={<PatternList />} />
          <Route path="/patterns/new" element={<PatternEditor />} />
          <Route path="/patterns/:id" element={<PatternEditor />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/materials" element={<MaterialLibrary />} />
          <Route path="/learning" element={<LearningNotes />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
