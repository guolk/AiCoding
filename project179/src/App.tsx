import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import SiteList from "@/pages/sites/SiteList";
import SiteDetail from "@/pages/sites/SiteDetail";
import SpeciesList from "@/pages/species/SpeciesList";
import SpeciesDetail from "@/pages/species/SpeciesDetail";
import InvasiveTracker from "@/pages/species/InvasiveTracker";
import EnvParamList from "@/pages/environment/EnvParamList";
import MeasurementMethods from "@/pages/environment/MeasurementMethods";
import AbnormalData from "@/pages/environment/AbnormalData";
import Analysis from "@/pages/analysis/Analysis";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sites" element={<SiteList />} />
          <Route path="/sites/:siteId" element={<SiteDetail />} />
          <Route path="/species" element={<SpeciesList />} />
          <Route path="/species/:speciesId" element={<SpeciesDetail />} />
          <Route path="/invasive-tracker" element={<InvasiveTracker />} />
          <Route path="/environment" element={<EnvParamList />} />
          <Route path="/measurement-methods" element={<MeasurementMethods />} />
          <Route path="/abnormal-data" element={<AbnormalData />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="text-6xl mb-4">🌿</div>
              <h1 className="text-3xl font-bold text-forest-800 mb-2">404 - 页面未找到</h1>
              <p className="text-forest-600 mb-6">您访问的页面不存在，请返回首页继续探索</p>
              <a
                href="/"
                className="px-6 py-3 bg-forest-500 text-white rounded-xl hover:bg-forest-600 transition-colors shadow-md"
              >
                返回仪表板
              </a>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
