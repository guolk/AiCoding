import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import GamesPage from '@/pages/GamesPage';
import GameReplayPage from '@/pages/GameReplayPage';
import LearningPage from '@/pages/LearningPage';
import RecordsPage from '@/pages/RecordsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="games/:id" element={<GameReplayPage />} />
          <Route path="games/replay" element={<GameReplayPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="records" element={<RecordsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
