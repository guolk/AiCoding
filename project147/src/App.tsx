import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Observations from "@/pages/Observations";
import Analysis from "@/pages/Analysis";
import Pedestrian from "@/pages/Pedestrian";
import Comparison from "@/pages/Comparison";
import Cases from "@/pages/Cases";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/observations/:id" element={<Observations />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/pedestrian" element={<Pedestrian />} />
          <Route path="/pedestrian/:id" element={<Pedestrian />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/comparison/:id" element={<Comparison />} />
          <Route path="/cases" element={<Cases />} />
        </Routes>
      </Layout>
    </Router>
  );
}
