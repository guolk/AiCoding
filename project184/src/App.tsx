import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import ClubInfo from "@/pages/club/ClubInfo";
import ClubCadres from "@/pages/club/ClubCadres";
import ClubConstitution from "@/pages/club/ClubConstitution";
import MemberList from "@/pages/members/MemberList";
import MemberPoints from "@/pages/members/MemberPoints";
import MemberRecords from "@/pages/members/MemberRecords";
import ActivityList from "@/pages/activities/ActivityList";
import ActivityPlans from "@/pages/activities/ActivityPlans";
import ActivityEvaluation from "@/pages/activities/ActivityEvaluation";
import FinanceRecords from "@/pages/finance/FinanceRecords";
import FinanceReports from "@/pages/finance/FinanceReports";
import FinanceBudget from "@/pages/finance/FinanceBudget";
import HonorAchievements from "@/pages/honors/HonorAchievements";
import HonorApplications from "@/pages/honors/HonorApplications";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/club/info" element={<ClubInfo />} />
          <Route path="/club/cadres" element={<ClubCadres />} />
          <Route path="/club/constitution" element={<ClubConstitution />} />
          <Route path="/members/list" element={<MemberList />} />
          <Route path="/members/points" element={<MemberPoints />} />
          <Route path="/members/records" element={<MemberRecords />} />
          <Route path="/activities/list" element={<ActivityList />} />
          <Route path="/activities/plans" element={<ActivityPlans />} />
          <Route path="/activities/evaluation" element={<ActivityEvaluation />} />
          <Route path="/finance/records" element={<FinanceRecords />} />
          <Route path="/finance/reports" element={<FinanceReports />} />
          <Route path="/finance/budget" element={<FinanceBudget />} />
          <Route path="/honors/achievements" element={<HonorAchievements />} />
          <Route path="/honors/applications" element={<HonorApplications />} />
        </Route>
      </Routes>
    </Router>
  );
}
