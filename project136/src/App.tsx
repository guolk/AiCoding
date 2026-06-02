import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ScriptList from './pages/Scripts/ScriptList';
import ScriptEditor from './pages/Scripts/ScriptEditor';
import TeamList from './pages/Teams/TeamList';
import TeamDetail from './pages/Teams/TeamDetail';
import PlayerList from './pages/Teams/PlayerList';
import PlayerDetail from './pages/Teams/PlayerDetail';
import ReviewList from './pages/Reviews/ReviewList';
import ReviewDetail from './pages/Reviews/ReviewDetail';
import SkillImprovement from './pages/Reviews/SkillImprovement';
import ScheduleCalendar from './pages/Schedule/ScheduleCalendar';
import PrepChecklist from './pages/Schedule/PrepChecklist';
import CommentatorProfiles from './pages/Schedule/CommentatorProfiles';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scripts" element={<ScriptList />} />
          <Route path="/scripts/:id" element={<ScriptEditor />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/players" element={<PlayerList />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/reviews/skills" element={<SkillImprovement />} />
          <Route path="/schedule" element={<ScheduleCalendar />} />
          <Route path="/schedule/prep" element={<PrepChecklist />} />
          <Route path="/commentators" element={<CommentatorProfiles />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
