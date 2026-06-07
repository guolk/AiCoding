import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import Home from "@/pages/Home";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Tracking from "@/pages/Tracking";
import TrackingDetail from "@/pages/TrackingDetail";
import Exhibitions from "@/pages/Exhibitions";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/tracking/:id" element={<TrackingDetail />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
