import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Submissions } from './pages/Submissions';
import { Papers } from './pages/Papers';
import { Attendance } from './pages/Attendance';
import { Network } from './pages/Network';
import { Archive } from './pages/Archive';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/network" element={<Network />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
    </Router>
  );
}
