import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Specimens from "@/pages/Specimens";
import Acquisition from "@/pages/Acquisition";
import Scientific from "@/pages/Scientific";
import Display from "@/pages/Display";
import Knowledge from "@/pages/Knowledge";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/specimens" element={<Specimens />} />
          <Route path="/acquisition" element={<Acquisition />} />
          <Route path="/scientific" element={<Scientific />} />
          <Route path="/display" element={<Display />} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Route>
      </Routes>
    </Router>
  );
}
