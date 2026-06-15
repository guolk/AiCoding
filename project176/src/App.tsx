import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import DevLog from "@/pages/DevLog";
import DevLogForm from "@/pages/DevLogForm";
import Versions from "@/pages/Versions";
import VersionForm from "@/pages/VersionForm";
import Testing from "@/pages/Testing";
import Business from "@/pages/Business";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-base-900 bg-grid-pattern bg-grid">
        <Sidebar />
        <main className="flex-1 ml-60 p-6 overflow-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devlog" element={<DevLog />} />
            <Route path="/devlog/new" element={<DevLogForm />} />
            <Route path="/devlog/:id" element={<DevLogForm />} />
            <Route path="/versions" element={<Versions />} />
            <Route path="/versions/new" element={<VersionForm />} />
            <Route path="/versions/:id" element={<VersionForm />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/business" element={<Business />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
