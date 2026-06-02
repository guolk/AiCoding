import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AssessmentPage from "@/pages/assessment/AssessmentPage";
import ResultPage from "@/pages/assessment/ResultPage";
import HistoryPage from "@/pages/assessment/HistoryPage";
import AdvicePage from "@/pages/advice/AdvicePage";
import SeasonalPage from "@/pages/advice/SeasonalPage";
import AcupointsPage from "@/pages/advice/AcupointsPage";
import DietPage from "@/pages/records/DietPage";
import SleepPage from "@/pages/records/SleepPage";
import SymptomsPage from "@/pages/records/SymptomsPage";
import MedicinePage from "@/pages/medicine/MedicinePage";
import FoodsPage from "@/pages/medicine/FoodsPage";
import KnowledgePage from "@/pages/knowledge/KnowledgePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/result" element={<ResultPage />} />
          <Route path="/assessment/history" element={<HistoryPage />} />
          <Route path="/advice" element={<AdvicePage />} />
          <Route path="/advice/seasonal" element={<SeasonalPage />} />
          <Route path="/advice/acupoints" element={<AcupointsPage />} />
          <Route path="/records/diet" element={<DietPage />} />
          <Route path="/records/sleep" element={<SleepPage />} />
          <Route path="/records/symptoms" element={<SymptomsPage />} />
          <Route path="/medicine" element={<MedicinePage />} />
          <Route path="/medicine/foods" element={<FoodsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
