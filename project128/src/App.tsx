import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Collection from "@/pages/Collection";
import JewelryDetail from "@/pages/Collection/JewelryDetail";
import JewelryForm from "@/pages/Collection/JewelryForm";
import ValueManagement from "@/pages/Value";
import MaintenancePage from "@/pages/Maintenance";
import OutfitPage from "@/pages/Outfit";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/new" element={<JewelryForm />} />
          <Route path="/collection/:id" element={<JewelryDetail />} />
          <Route path="/collection/:id/edit" element={<JewelryForm />} />
          <Route path="/value" element={<ValueManagement />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/outfit" element={<OutfitPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
