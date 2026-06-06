import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import UsageTracking from "@/pages/UsageTracking";
import GoalSetting from "@/pages/GoalSetting";
import ImpactAnalysis from "@/pages/ImpactAnalysis";
import AlternativeManagement from "@/pages/AlternativeManagement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usage" element={<UsageTracking />} />
          <Route path="/goals" element={<GoalSetting />} />
          <Route path="/impact" element={<ImpactAnalysis />} />
          <Route path="/alternatives" element={<AlternativeManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
