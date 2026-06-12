import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import FlightList from "@/pages/FlightList";
import FlightDetail from "@/pages/FlightDetail";
import FlightNew from "@/pages/FlightNew";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";
import MaintenanceNew from "@/pages/MaintenanceNew";
import EquipmentNew from "@/pages/EquipmentNew";
import ProjectList from "@/pages/ProjectList";
import ProjectDetail from "@/pages/ProjectDetail";
import ProjectNew from "@/pages/ProjectNew";
import Compliance from "@/pages/Compliance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flights" element={<FlightList />} />
          <Route path="/flights/new" element={<FlightNew />} />
          <Route path="/flights/:id" element={<FlightDetail />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/new" element={<EquipmentNew />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/equipment/:id/maintenance/new" element={<MaintenanceNew />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectNew />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/compliance" element={<Compliance />} />
        </Route>
      </Routes>
    </Router>
  );
}
