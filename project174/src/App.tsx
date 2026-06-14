import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import ArchiveList from "@/pages/ArchiveList";
import ArchiveDetail from "@/pages/ArchiveDetail";
import ArchiveNew from "@/pages/ArchiveNew";
import MapCenter from "@/pages/MapCenter";
import Heatmap from "@/pages/Heatmap";
import Analysis from "@/pages/Analysis";
import AnalysisDetail from "@/pages/AnalysisDetail";
import Collections from "@/pages/Collections";
import CollectionDetail from "@/pages/CollectionDetail";
import SoundJourney from "@/pages/SoundJourney";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        <Route path="/archive" element={<ArchiveList />} />
        <Route path="/archive/new" element={<ArchiveNew />} />
        <Route path="/archive/:id" element={<ArchiveDetail />} />
        <Route path="/archive/:id/edit" element={<ArchiveNew />} />
        
        <Route path="/map" element={<MapCenter />} />
        <Route path="/heatmap" element={<Heatmap />} />
        
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
        
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        
        <Route path="/journey" element={<SoundJourney />} />
        
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-earth-50 dark:bg-forest-950">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-forest-600 dark:text-forest-400 mb-4">404</h1>
              <p className="text-xl text-earth-600 dark:text-earth-400 mb-8">页面未找到</p>
              <a 
                href="/" 
                className="px-6 py-3 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors inline-block"
              >
                返回首页
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}
