import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectList from "@/pages/ProjectList";
import Dashboard from "@/pages/Dashboard";
import SpacePlanning from "@/pages/SpacePlanning";
import DesignManagement from "@/pages/DesignManagement";
import BudgetManagement from "@/pages/BudgetManagement";
import ConstructionManagement from "@/pages/ConstructionManagement";
import SupplierManagement from "@/pages/SupplierManagement";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-100">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:id" element={<Dashboard />} />
          <Route path="/projects/:id/space-planning" element={<SpacePlanning />} />
          <Route path="/projects/:id/design" element={<DesignManagement />} />
          <Route path="/projects/:id/budget" element={<BudgetManagement />} />
          <Route path="/projects/:id/construction" element={<ConstructionManagement />} />
          <Route path="/projects/:id/suppliers" element={<SupplierManagement />} />
        </Routes>
      </div>
    </Router>
  );
}
