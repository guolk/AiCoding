import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useAppStore } from "@/store/appStore";

import Dashboard from "@/pages/Dashboard";
import Collection from "@/pages/Collection";
import SetDetail from "@/pages/SetDetail";
import Inventory from "@/pages/Inventory";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Gallery from "@/pages/Gallery";
import WorkDetail from "@/pages/WorkDetail";
import Analytics from "@/pages/Analytics";

function MainLayout() {
  const { sidebarCollapsed } = useAppStore();
  const location = useLocation();

  const isDetailPage =
    location.pathname.startsWith("/collection/") ||
    location.pathname.startsWith("/projects/") ||
    location.pathname.startsWith("/gallery/");

  return (
    <div className="min-h-screen bg-lego-cream">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <TopBar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/:id" element={<SetDetail />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:id" element={<WorkDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="text-6xl mb-4">🧱</div>
                  <h1 className="text-2xl font-display font-bold text-lego-dark mb-2">
                    页面不存在
                  </h1>
                  <p className="text-gray-500">您访问的页面不存在或已被移除</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
