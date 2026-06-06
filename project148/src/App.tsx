import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import TankList from "@/pages/TankList";
import TankNew from "@/pages/TankNew";
import TankDetail from "@/pages/TankDetail";
import Profile from "@/pages/TankDetail/Profile";
import Water from "@/pages/TankDetail/Water";
import Biology from "@/pages/TankDetail/Biology";
import Maintenance from "@/pages/TankDetail/Maintenance";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

export default function App() {
  const { initialize } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tanks" element={<TankList />} />
          <Route path="/tanks/new" element={<TankNew />} />
          <Route path="/tanks/:id" element={<TankDetail />}>
            <Route index element={<Profile />} />
            <Route path="water" element={<Water />} />
            <Route path="life" element={<Biology />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
