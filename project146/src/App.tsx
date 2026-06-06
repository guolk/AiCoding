import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import WeatherAnalysis from "@/pages/Weather/WeatherAnalysis";
import AppLayout from "@/components/Layout/AppLayout";
import VoyageList from "@/pages/Voyages/VoyageList";
import VoyageDetail from "@/pages/Voyages/VoyageDetail";
import VoyageForm from "@/pages/Voyages/VoyageForm";
import BoatList from "@/pages/Boats/BoatList";
import BoatDetail from "@/pages/Boats/BoatDetail";
import BoatForm from "@/pages/Boats/BoatForm";
import MaintenanceForm from "@/pages/Boats/MaintenanceForm";
import PlanList from "@/pages/Plans/PlanList";
import PlanDetail from "@/pages/Plans/PlanDetail";
import PlanForm from "@/pages/Plans/PlanForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voyages" element={<VoyageList />} />
          <Route path="/voyages/new" element={<VoyageForm />} />
          <Route path="/voyages/:id" element={<VoyageDetail />} />
          <Route path="/voyages/:id/edit" element={<VoyageForm />} />
          <Route path="/weather" element={<WeatherAnalysis />} />
          <Route path="/boats" element={<BoatList />} />
          <Route path="/boats/new" element={<BoatForm />} />
          <Route path="/boats/:id" element={<BoatDetail />} />
          <Route path="/boats/:id/edit" element={<BoatForm />} />
          <Route path="/boats/:id/maintenance/new" element={<MaintenanceForm />} />
          <Route path="/plans" element={<PlanList />} />
          <Route path="/plans/new" element={<PlanForm />} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/plans/:id/edit" element={<PlanForm />} />
        </Route>
      </Routes>
    </Router>
  );
}
