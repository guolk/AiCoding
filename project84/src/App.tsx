import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { QuestionsList } from './components/community/QuestionsList'
import { QuestionDetail } from './components/community/QuestionDetail'
import { AskQuestion } from './components/community/AskQuestion'
import { Profile } from './components/profile/Profile'
import { LearningIncentives } from './components/incentives/LearningIncentives'
import { LearningStream } from './components/stream/LearningStream'
import { KnowledgeMap } from './components/map/KnowledgeMap'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/questions" element={<QuestionsList />} />
          <Route path="/questions/ask" element={<AskQuestion />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/learning" element={<LearningIncentives />} />
          <Route path="/stream" element={<LearningStream />} />
          <Route path="/map" element={<KnowledgeMap />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
