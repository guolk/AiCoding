import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ScriptCreation } from "@/pages/ScriptCreation";
import { CluesSystem } from "@/pages/CluesSystem";
import { TestingManagement } from "@/pages/TestingManagement";
import { ReviewMaterials } from "@/pages/ReviewMaterials";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:projectId/script" element={<ScriptCreation />} />
        <Route path="/project/:projectId/clues" element={<CluesSystem />} />
        <Route path="/project/:projectId/testing" element={<TestingManagement />} />
        <Route path="/project/:projectId/review" element={<ReviewMaterials />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
