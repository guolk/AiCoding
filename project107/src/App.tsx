import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Openings from "@/pages/Openings";
import Replay from "@/pages/Replay";
import Notes from "@/pages/Notes";
import Training from "@/pages/Training";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/openings" element={<Openings />} />
        <Route path="/replay" element={<Replay />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </Router>
  );
}
