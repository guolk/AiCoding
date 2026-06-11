import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FacilityList from '@/pages/facilities/FacilityList';
import InspectionList from '@/pages/facilities/InspectionList';
import MaintenanceList from '@/pages/facilities/MaintenanceList';
import HazardList from '@/pages/hazards/HazardList';
import HazardLevelA from '@/pages/hazards/HazardLevelA';
import HazardLevelB from '@/pages/hazards/HazardLevelB';
import HazardStatistics from '@/pages/hazards/HazardStatistics';
import PlanList from '@/pages/emergency/PlanList';
import TeamList from '@/pages/emergency/TeamList';
import DrillList from '@/pages/emergency/DrillList';
import TrainingList from '@/pages/training/TrainingList';
import OnboardingList from '@/pages/training/OnboardingList';
import QuestionList from '@/pages/training/QuestionList';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/facilities" element={<FacilityList />} />
          <Route path="/facilities/inspection" element={<InspectionList />} />
          <Route path="/facilities/maintenance" element={<MaintenanceList />} />
          <Route path="/hazards" element={<HazardList />} />
          <Route path="/hazards/level-a" element={<HazardLevelA />} />
          <Route path="/hazards/level-b" element={<HazardLevelB />} />
          <Route path="/hazards/statistics" element={<HazardStatistics />} />
          <Route path="/emergency/plans" element={<PlanList />} />
          <Route path="/emergency/team" element={<TeamList />} />
          <Route path="/emergency/drills" element={<DrillList />} />
          <Route path="/training/records" element={<TrainingList />} />
          <Route path="/training/onboarding" element={<OnboardingList />} />
          <Route path="/training/questions" element={<QuestionList />} />
        </Routes>
      </Layout>
    </Router>
  );
}
