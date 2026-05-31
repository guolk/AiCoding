
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Dashboard from '@/pages/Dashboard';
import WorldSetting from '@/pages/WorldSetting';
import Geography from '@/pages/Geography';
import RulesCheck from '@/pages/RulesCheck';
import Characters from '@/pages/Characters';
import Factions from '@/pages/Factions';
import PowerShifts from '@/pages/PowerShifts';
import Languages from '@/pages/Languages';
import Culture from '@/pages/Culture';
import Religion from '@/pages/Religion';
import Timeline from '@/pages/Timeline';
import WorldMap from '@/pages/WorldMap';
import References from '@/pages/References';
import Inspirations from '@/pages/Inspirations';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/world-setting" element={<WorldSetting />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/rules-check" element={<RulesCheck />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/factions" element={<Factions />} />
            <Route path="/power-shifts" element={<PowerShifts />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/religion" element={<Religion />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/map" element={<WorldMap />} />
            <Route path="/references" element={<References />} />
            <Route path="/inspirations" element={<Inspirations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
