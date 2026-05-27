import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import TextTools from "@/pages/TextTools";
import DataTools from "@/pages/DataTools";
import ImageTools from "@/pages/ImageTools";
import DevTools from "@/pages/DevTools";
import ProductivityTools from "@/pages/ProductivityTools";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/text" element={<TextTools />} />
        <Route path="/data" element={<DataTools />} />
        <Route path="/image" element={<ImageTools />} />
        <Route path="/dev" element={<DevTools />} />
        <Route path="/productivity" element={<ProductivityTools />} />
      </Routes>
    </Router>
  );
}
