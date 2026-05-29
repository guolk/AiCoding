import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Plots from "@/pages/Plots";
import Planting from "@/pages/Planting";
import Collaboration from "@/pages/Collaboration";
import Resources from "@/pages/Resources";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plots" element={<Plots />} />
          <Route path="/planting" element={<Planting />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/collaboration/tasks" element={<Collaboration />} />
          <Route path="/collaboration/sharing" element={<Collaboration />} />
          <Route path="/collaboration/forum" element={<Collaboration />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </Layout>
    </Router>
  );
}
