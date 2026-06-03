import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import FirstAidKit from "@/pages/FirstAidKit";
import EmergencySupplies from "@/pages/EmergencySupplies";
import Medicine from "@/pages/Medicine";
import Records from "@/pages/Records";
import Knowledge from "@/pages/Knowledge";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/first-aid-kit" element={<FirstAidKit />} />
          <Route path="/emergency-supplies" element={<EmergencySupplies />} />
          <Route path="/medicine" element={<Medicine />} />
          <Route path="/records" element={<Records />} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Route>
      </Routes>
    </Router>
  );
}
