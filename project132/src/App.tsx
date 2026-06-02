import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Rides from "@/pages/Rides";
import RideForm from "@/pages/RideForm";
import RideDetail from "@/pages/RideDetail";
import RoutesPage from "@/pages/Routes";
import RouteDetail from "@/pages/RouteDetail";
import Motorcycle from "@/pages/Motorcycle";
import Maintenance from "@/pages/Maintenance";
import Gear from "@/pages/Gear";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/rides/new" element={<RideForm />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:id" element={<RouteDetail />} />
          <Route path="/motorcycle" element={<Motorcycle />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/gear" element={<Gear />} />
        </Route>
      </Routes>
    </Router>
  );
}
