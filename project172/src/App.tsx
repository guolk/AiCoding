import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { StrainList, StrainDetail, StrainForm } from "@/pages/Strains";
import { CultureIndex, MediaForm, CultureForm } from "@/pages/Cultures";
import { ExperimentList, ExperimentDetail, ExperimentForm } from "@/pages/Experiments";
import { StorageIndex, AuditPage, DisposalForm } from "@/pages/Storage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/strains" element={<StrainList />} />
        <Route path="/strains/new" element={<StrainForm />} />
        <Route path="/strains/:id" element={<StrainDetail />} />
        <Route path="/strains/:id/edit" element={<StrainForm />} />
        <Route path="/cultures" element={<CultureIndex />} />
        <Route path="/cultures/new" element={<CultureForm />} />
        <Route path="/cultures/media/new" element={<MediaForm />} />
        <Route path="/cultures/media/:id/edit" element={<MediaForm />} />
        <Route path="/experiments" element={<ExperimentList />} />
        <Route path="/experiments/new" element={<ExperimentForm />} />
        <Route path="/experiments/:id" element={<ExperimentDetail />} />
        <Route path="/experiments/:id/edit" element={<ExperimentForm />} />
        <Route path="/storage" element={<StorageIndex />} />
        <Route path="/storage/audit/:id" element={<AuditPage />} />
        <Route path="/storage/disposal/new" element={<DisposalForm />} />
      </Routes>
    </Router>
  );
}
