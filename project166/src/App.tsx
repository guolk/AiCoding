import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Cities from "@/pages/Cities";
import CityDetail from "@/pages/CityDetail";
import TravelLog from "@/pages/TravelLog";
import Workspace from "@/pages/Workspace";
import Visa from "@/pages/Visa";
import Finance from "@/pages/Finance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/cities/:cityId" element={<CityDetail />} />
          <Route path="/travel" element={<TravelLog />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/finance" element={<Finance />} />
        </Route>
      </Routes>
    </Router>
  );
}
