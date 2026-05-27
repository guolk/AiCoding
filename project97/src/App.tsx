import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import {
  Dashboard,
  QuestionBank,
  QuestionDetail,
  QuestionForm,
  Training,
  DailyPractice,
  MockExam,
  KnowledgeReinforce,
  WrongNotes,
  StudyNotes,
  NoteEditor,
  Progress,
} from './pages';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/questions" element={<QuestionBank />} />
          <Route path="/questions/new" element={<QuestionForm />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/questions/:id/edit" element={<QuestionForm />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/daily" element={<DailyPractice />} />
          <Route path="/training/exam" element={<MockExam />} />
          <Route path="/training/reinforce" element={<KnowledgeReinforce />} />
          <Route path="/errors" element={<WrongNotes />} />
          <Route path="/notes" element={<StudyNotes />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Layout>
    </Router>
  );
}
