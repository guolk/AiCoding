import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Medicines } from "./pages/Medicines";
import { Reminders } from "./pages/Reminders";
import { Supplements } from "./pages/Supplements";
import { Safety } from "./pages/Safety";
import { MedicalRecords } from "./pages/MedicalRecords";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
        </Routes>
      </Layout>
    </Router>
  );
}
