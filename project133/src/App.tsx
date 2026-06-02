import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/Sidebar.js';
import { Dashboard } from '@/pages/Dashboard.js';
import { TemplateList } from '@/pages/TemplateList.js';
import { TemplateEditor } from '@/pages/TemplateEditor.js';
import { ReportList } from '@/pages/ReportList.js';
import { ReportDetail } from '@/pages/ReportDetail.js';
import { Analytics } from '@/pages/Analytics.js';
import { Resources } from '@/pages/Resources.js';
import { Archives } from '@/pages/Archives.js';
import { Settings } from '@/pages/Settings.js';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/new" element={<TemplateEditor />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
