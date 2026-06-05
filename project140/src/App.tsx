import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import TopicLibrary from "@/pages/Planning/TopicLibrary";
import GuestManagement from "@/pages/Planning/GuestManagement";
import OutlineEditor from "@/pages/Planning/OutlineEditor";
import RecordingSessions from "@/pages/Recording/RecordingSessions";
import RecordingRecords from "@/pages/Recording/RecordingRecords";
import FileManagement from "@/pages/Recording/FileManagement";
import EditingTasks from "@/pages/PostProduction/EditingTasks";
import AssetManagement from "@/pages/PostProduction/AssetManagement";
import TranscriptEditor from "@/pages/PostProduction/TranscriptEditor";
import PlatformManagement from "@/pages/Publishing/PlatformManagement";
import ContentCalendar from "@/pages/Publishing/ContentCalendar";
import DataAnalytics from "@/pages/Publishing/DataAnalytics";
import FeedbackManagement from "@/pages/Audience/FeedbackManagement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planning/topics" element={<TopicLibrary />} />
          <Route path="/planning/guests" element={<GuestManagement />} />
          <Route path="/planning/outline" element={<OutlineEditor />} />
          <Route path="/recording/sessions" element={<RecordingSessions />} />
          <Route path="/recording/records" element={<RecordingRecords />} />
          <Route path="/recording/files" element={<FileManagement />} />
          <Route path="/postproduction/editing" element={<EditingTasks />} />
          <Route path="/postproduction/assets" element={<AssetManagement />} />
          <Route path="/postproduction/transcript" element={<TranscriptEditor />} />
          <Route path="/publishing/platforms" element={<PlatformManagement />} />
          <Route path="/publishing/calendar" element={<ContentCalendar />} />
          <Route path="/publishing/analytics" element={<DataAnalytics />} />
          <Route path="/audience/feedback" element={<FeedbackManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
