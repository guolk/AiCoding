import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Home from '@/pages/Home';

import Climbing from '@/pages/training/Climbing';
import Skateboarding from '@/pages/training/Skateboarding';
import Surfing from '@/pages/training/Surfing';
import Injury from '@/pages/training/Injury';

import Skills from '@/pages/progress/Skills';
import Milestones from '@/pages/progress/Milestones';
import Analytics from '@/pages/progress/Analytics';

import Equipment from '@/pages/safety/Equipment';
import Locations from '@/pages/safety/Locations';
import Emergency from '@/pages/safety/Emergency';

import Goals from '@/pages/community/Goals';
import Partners from '@/pages/community/Partners';
import Trips from '@/pages/community/Trips';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/app"
          element={<AppLayout />}
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="training/climbing" element={<Climbing />} />
          <Route path="training/skateboarding" element={<Skateboarding />} />
          <Route path="training/surfing" element={<Surfing />} />
          <Route path="training/injury" element={<Injury />} />

          <Route path="progress/skills" element={<Skills />} />
          <Route path="progress/milestones" element={<Milestones />} />
          <Route path="progress/analytics" element={<Analytics />} />

          <Route path="safety/equipment" element={<Equipment />} />
          <Route path="safety/locations" element={<Locations />} />
          <Route path="safety/emergency" element={<Emergency />} />

          <Route path="community/goals" element={<Goals />} />
          <Route path="community/partners" element={<Partners />} />
          <Route path="community/trips" element={<Trips />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
