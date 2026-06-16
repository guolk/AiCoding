import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Home from "@/pages/Home";
import BloodPressurePage from "@/pages/BloodPressure";
import MedicationPage from "@/pages/Medication";
import LifestylePage from "@/pages/Lifestyle";
import MedicalPage from "@/pages/Medical";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blood-pressure" element={<BloodPressurePage />} />
          <Route path="/medication" element={<MedicationPage />} />
          <Route path="/lifestyle" element={<LifestylePage />} />
          <Route path="/medical" element={<MedicalPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
