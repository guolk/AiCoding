import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import IdeasPage from '@/pages/IdeasPage';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import ConvertIdeaPage from '@/pages/ConvertIdeaPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import PortfolioPage from '@/pages/PortfolioPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/ideas" replace />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/ideas/:id" element={<IdeaDetailPage />} />
          <Route path="/convert/:id" element={<ConvertIdeaPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="*" element={<Navigate to="/ideas" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
