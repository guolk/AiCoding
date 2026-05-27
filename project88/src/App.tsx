import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RequirementList from './pages/requirements/RequirementList'
import InterviewList from './pages/research/InterviewList'
import PersonaList from './pages/research/PersonaList'
import JourneyMapPage from './pages/research/JourneyMapPage'
import FeatureMatrix from './pages/competitive/FeatureMatrix'
import IterationTracking from './pages/competitive/IterationTracking'
import MarketPositioning from './pages/competitive/MarketPositioning'
import Roadmap from './pages/version/Roadmap'
import MilestonePage from './pages/version/MilestonePage'
import EffectTracking from './pages/version/EffectTracking'
import PRDList from './pages/documents/PRDList'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/requirements" element={<RequirementList />} />
        <Route path="/research/interviews" element={<InterviewList />} />
        <Route path="/research/personas" element={<PersonaList />} />
        <Route path="/research/journeys" element={<JourneyMapPage />} />
        <Route path="/competitive/features" element={<FeatureMatrix />} />
        <Route path="/competitive/iterations" element={<IterationTracking />} />
        <Route path="/competitive/positioning" element={<MarketPositioning />} />
        <Route path="/version/roadmap" element={<Roadmap />} />
        <Route path="/version/milestones" element={<MilestonePage />} />
        <Route path="/version/effects" element={<EffectTracking />} />
        <Route path="/documents/prd" element={<PRDList />} />
      </Routes>
    </Layout>
  )
}
