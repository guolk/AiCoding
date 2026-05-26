import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import RoadmapPage from './pages/Learning/RoadmapPage';
import ResourcesPage from './pages/Learning/ResourcesPage';
import NotesPage from './pages/Learning/NotesPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import MediaPage from './pages/Projects/MediaPage';
import ProblemsPage from './pages/Coding/ProblemsPage';
import StatisticsPage from './pages/Coding/StatisticsPage';
import WrongBookPage from './pages/Coding/WrongBookPage';
import KnowledgePage from './pages/Interview/KnowledgePage';
import MockInterviewPage from './pages/Interview/MockInterviewPage';
import QuestionsPage from './pages/Interview/QuestionsPage';
import JobsPage from './pages/Jobs/JobsPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/learning/roadmap" replace />} />
        <Route path="/learning/roadmap" element={<RoadmapPage />} />
        <Route path="/learning/resources" element={<ResourcesPage />} />
        <Route path="/learning/notes" element={<NotesPage />} />
        <Route path="/projects/list" element={<ProjectsPage />} />
        <Route path="/projects/media" element={<MediaPage />} />
        <Route path="/coding/problems" element={<ProblemsPage />} />
        <Route path="/coding/statistics" element={<StatisticsPage />} />
        <Route path="/coding/wrong" element={<WrongBookPage />} />
        <Route path="/interview/knowledge" element={<KnowledgePage />} />
        <Route path="/interview/mock" element={<MockInterviewPage />} />
        <Route path="/interview/questions" element={<QuestionsPage />} />
        <Route path="/jobs/list" element={<JobsPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
