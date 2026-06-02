import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetail from './pages/Projects/ProjectDetail';
import MilestoneList from './pages/Milestones/MilestoneList';
import MentorList from './pages/Resources/MentorList';
import InvestorList from './pages/Resources/InvestorList';
import ProviderList from './pages/Resources/ProviderList';
import ActivityList from './pages/Activities/ActivityList';
import ActivityDetail from './pages/Activities/ActivityDetail';
import DataRoomList from './pages/DataRoom/DataRoomList';
import DataRoomDetail from './pages/DataRoom/DataRoomDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/milestones" element={<MilestoneList />} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/investors" element={<InvestorList />} />
          <Route path="/providers" element={<ProviderList />} />
          <Route path="/activities" element={<ActivityList />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/dataroom" element={<DataRoomList />} />
          <Route path="/dataroom/:projectId" element={<DataRoomDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
