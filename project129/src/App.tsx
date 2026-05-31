import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Basics from '@/pages/Basics';
import Vocabulary from '@/pages/Vocabulary';
import VocabularyReview from '@/pages/VocabularyReview';
import VocabularySentences from '@/pages/VocabularySentences';
import ExamPrep from '@/pages/ExamPrep';
import WeaknessAnalysis from '@/pages/WeaknessAnalysis';
import Listening from '@/pages/Listening';
import ExamHistory from '@/pages/ExamHistory';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/basics" element={<Basics />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary/review" element={<VocabularyReview />} />
          <Route path="/vocabulary/sentences" element={<VocabularySentences />} />
          <Route path="/exam-prep" element={<ExamPrep />} />
          <Route path="/weakness-analysis" element={<WeaknessAnalysis />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/exam-history" element={<ExamHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}
