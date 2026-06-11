import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ArchiveList from '@/pages/ArchiveList';
import ArchiveDetail from '@/pages/ArchiveDetail';
import ArchiveForm from '@/pages/ArchiveForm';
import HealthList from '@/pages/HealthList';
import HealthDetail from '@/pages/HealthDetail';
import HealthForm from '@/pages/HealthForm';
import SurveyGridPage from '@/pages/SurveyGrid';
import SurveyProgress from '@/pages/SurveyProgress';
import SurveyReview from '@/pages/SurveyReview';
import Analysis from '@/pages/Analysis';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/archives" element={<ArchiveList />} />
          <Route path="/archives/:id" element={<ArchiveDetail />} />
          <Route path="/archives/new" element={<ArchiveForm />} />
          <Route path="/archives/:id/edit" element={<ArchiveForm />} />
          <Route path="/health" element={<HealthList />} />
          <Route path="/health/:id" element={<HealthDetail />} />
          <Route path="/health/new" element={<HealthForm />} />
          <Route path="/survey" element={<SurveyGridPage />} />
          <Route path="/survey/progress" element={<SurveyProgress />} />
          <Route path="/survey/review" element={<SurveyReview />} />
          <Route path="/analysis" element={<Analysis />} />
        </Route>
      </Routes>
    </Router>
  );
}
