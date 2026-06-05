import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import SeatingChart from "@/pages/Students/SeatingChart";
import Attendance from "@/pages/Attendance";
import LeavesPage from "@/pages/Attendance/LeavesPage";
import Grades from "@/pages/Grades";
import GradeAnalysis from "@/pages/Grades/Analysis";
import Classroom from "@/pages/Classroom";
import GroupsPage from "@/pages/Classroom/GroupsPage";
import Communication from "@/pages/Communication";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/seating" element={<SeatingChart />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/leaves" element={<LeavesPage />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/grades/analysis" element={<GradeAnalysis />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/classroom/groups" element={<GroupsPage />} />
          <Route path="/communication" element={<Communication />} />
        </Route>
      </Routes>
    </Router>
  );
}
