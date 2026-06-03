import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Publications from "@/pages/Publications";
import PublicationDetail from "@/pages/PublicationDetail";
import Sales from "@/pages/Sales";
import Readers from "@/pages/Readers";
import Planning from "@/pages/Planning";
import Marketing from "@/pages/Marketing";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/publications/:id" element={<PublicationDetail />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/readers" element={<Readers />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/marketing" element={<Marketing />} />
        </Route>
      </Routes>
    </Router>
  );
}
