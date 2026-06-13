import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DataEntry from "@/pages/data/DataEntry";
import DataImport from "@/pages/data/DataImport";
import DataList from "@/pages/data/DataList";
import Instruments from "@/pages/data/Instruments";
import QualityControl from "@/pages/data/QualityControl";
import TimeSeries from "@/pages/analysis/TimeSeries";
import Extremes from "@/pages/analysis/Extremes";
import Trend from "@/pages/analysis/Trend";
import Summary from "@/pages/statistics/Summary";
import Anomaly from "@/pages/statistics/Anomaly";
import Seasons from "@/pages/statistics/Seasons";
import WindRose from "@/pages/charts/WindRose";
import Precipitation from "@/pages/charts/Precipitation";
import Temperature from "@/pages/charts/Temperature";
import DualAxis from "@/pages/charts/DualAxis";
import Report from "@/pages/charts/Report";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data/entry" element={<DataEntry />} />
          <Route path="/data/import" element={<DataImport />} />
          <Route path="/data/list" element={<DataList />} />
          <Route path="/data/instruments" element={<Instruments />} />
          <Route path="/data/quality" element={<QualityControl />} />
          <Route path="/analysis/timeseries" element={<TimeSeries />} />
          <Route path="/analysis/extremes" element={<Extremes />} />
          <Route path="/analysis/trend" element={<Trend />} />
          <Route path="/statistics/summary" element={<Summary />} />
          <Route path="/statistics/anomaly" element={<Anomaly />} />
          <Route path="/statistics/seasons" element={<Seasons />} />
          <Route path="/charts/windrose" element={<WindRose />} />
          <Route path="/charts/precipitation" element={<Precipitation />} />
          <Route path="/charts/temperature" element={<Temperature />} />
          <Route path="/charts/dualaxis" element={<DualAxis />} />
          <Route path="/charts/report" element={<Report />} />
          <Route path="*" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-slate-600">页面不存在</h2></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
