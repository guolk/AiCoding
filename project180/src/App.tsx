import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Topics from "@/pages/Topics";
import Arguments from "@/pages/Arguments";
import Matches from "@/pages/Matches";
import Training from "@/pages/Training";
import { useAppStore } from "@/lib/utils";

function Layout() {
  const loc = useLocation()
  const { navOpen } = useAppStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className={navOpen ? 'px-8 lg:px-12 py-8' : 'px-8 lg:px-12 py-8'} key={loc.pathname}>
          <div className="max-w-[1400px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/topics/:id" element={<Topics />} />
              <Route path="/arguments" element={<Arguments />} />
              <Route path="/arguments/:topicId" element={<Arguments />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:id" element={<Matches />} />
              <Route path="/matches/:id/review" element={<Matches />} />
              <Route path="/training" element={<Training />} />
              <Route path="/training/:memberId" element={<Training />} />
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="text-7xl font-black font-serif text-ink-900/20 mb-4">404</div>
                  <div className="text-xl font-bold text-ink-900 mb-2">页面未找到</div>
                  <div className="text-sm text-ink-900/60">请从左侧导航选择功能模块</div>
                </div>
              } />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
