import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ProjectList from "@/pages/ProjectList";
import ProjectDetail from "@/pages/ProjectDetail";
import ProjectForm from "@/pages/ProjectForm";
import LabRecordsList from "@/pages/LabRecordsList";
import LabRecordDetail from "@/pages/LabRecordDetail";
import LabRecordForm from "@/pages/LabRecordForm";
import LiteratureList from "@/pages/LiteratureList";
import LiteratureDetail from "@/pages/LiteratureDetail";
import LiteratureForm from "@/pages/LiteratureForm";
import AchievementsList from "@/pages/AchievementsList";
import AchievementDetail from "@/pages/AchievementDetail";
import AchievementForm from "@/pages/AchievementForm";
import MeetingsList from "@/pages/MeetingsList";
import MeetingDetail from "@/pages/MeetingDetail";
import MeetingForm from "@/pages/MeetingForm";
import DiscussionsList from "@/pages/DiscussionsList";
import DiscussionDetail from "@/pages/DiscussionDetail";
import DiscussionForm from "@/pages/DiscussionForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/lab-records" element={<LabRecordsList />} />
          <Route path="/lab-records/new" element={<LabRecordForm />} />
          <Route path="/lab-records/:id" element={<LabRecordDetail />} />
          <Route path="/literature" element={<LiteratureList />} />
          <Route path="/literature/new" element={<LiteratureForm />} />
          <Route path="/literature/:id" element={<LiteratureDetail />} />
          <Route path="/achievements" element={<AchievementsList />} />
          <Route path="/achievements/new" element={<AchievementForm />} />
          <Route path="/achievements/:id" element={<AchievementDetail />} />
          <Route path="/meetings" element={<MeetingsList />} />
          <Route path="/meetings/new" element={<MeetingForm />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/discussions" element={<DiscussionsList />} />
          <Route path="/discussions/new" element={<DiscussionForm />} />
          <Route path="/discussions/:id" element={<DiscussionDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
