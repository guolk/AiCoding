import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import MaterialsPage from './pages/Materials/MaterialsPage';
import JokesPage from './pages/Jokes/JokesPage';
import JokeEditorPage from './pages/Jokes/JokeEditorPage';
import PerformancesPage from './pages/Performances/PerformancesPage';
import PerformanceEditorPage from './pages/Performances/PerformanceEditorPage';
import RecordsPage from './pages/Records/RecordsPage';
import RecordDetailPage from './pages/Records/RecordDetailPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MaterialsPage />} />
        <Route path="/jokes" element={<JokesPage />} />
        <Route path="/jokes/new" element={<JokeEditorPage />} />
        <Route path="/jokes/:id" element={<JokeEditorPage />} />
        <Route path="/performances" element={<PerformancesPage />} />
        <Route path="/performances/new" element={<PerformanceEditorPage />} />
        <Route path="/performances/:id" element={<PerformanceEditorPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/new" element={<RecordDetailPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Layout>
  );
}
