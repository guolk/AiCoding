import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { WorksList } from "@/pages/WorksList";
import { WorkDetail } from "@/pages/WorkDetail";
import { WorkForm } from "@/pages/WorkForm";
import { VersionCompare } from "@/pages/VersionCompare";
import { NotesList } from "@/pages/NotesList";
import { NoteDetail } from "@/pages/NoteDetail";
import { NoteForm } from "@/pages/NoteForm";
import { ComposersList } from "@/pages/ComposersList";
import { ComposerDetail } from "@/pages/ComposerDetail";
import { ConcertsList } from "@/pages/ConcertsList";
import { ConcertForm } from "@/pages/ConcertForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/works" element={<WorksList />} />
          <Route path="/works/new" element={<WorkForm />} />
          <Route path="/works/:id" element={<WorkDetail />} />
          <Route path="/works/:id/edit" element={<WorkForm />} />
          <Route path="/versions/compare" element={<VersionCompare />} />
          <Route path="/notes" element={<NotesList />} />
          <Route path="/notes/new" element={<NoteForm />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/composers" element={<ComposersList />} />
          <Route path="/composers/new" element={<div className="text-center py-12">添加作曲家页面 - 开发中</div>} />
          <Route path="/composers/:id" element={<ComposerDetail />} />
          <Route path="/concerts" element={<ConcertsList />} />
          <Route path="/concerts/new" element={<ConcertForm />} />
        </Route>
      </Routes>
    </Router>
  );
}
