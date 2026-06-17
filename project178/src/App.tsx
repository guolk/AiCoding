import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import KnowledgePlanning from "@/pages/KnowledgePlanning";
import OKRPlanning from "@/pages/OKRPlanning";
import ResourcePlanning from "@/pages/ResourcePlanning";
import OutputTracking from "@/pages/OutputTracking";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/knowledge" element={<KnowledgePlanning />} />
          <Route path="/okr" element={<OKRPlanning />} />
          <Route path="/resources" element={<ResourcePlanning />} />
          <Route path="/output" element={<OutputTracking />} />
        </Routes>
      </Layout>
    </Router>
  );
}
