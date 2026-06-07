import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import StudentList from "@/pages/StudentList";
import StudentProfile from "@/pages/StudentProfile";
import PortfolioPage from "@/pages/PortfolioPage";
import AssessmentPage from "@/pages/AssessmentPage";
import ReportPage from "@/pages/ReportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/students/:id/portfolio" element={<PortfolioPage />} />
          <Route path="/students/:id/assessment" element={<AssessmentPage />} />
          <Route path="/students/:id/report" element={<ReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
