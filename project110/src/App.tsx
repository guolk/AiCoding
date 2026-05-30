import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { PosesLibrary, PoseDetail } from '@/pages/PosesLibrary';
import { Sequences, SequenceEditor, SequencePlay } from '@/pages/Sequences';
import { PracticeHistory, PoseProgressPage, FlexibilityTestPage } from '@/pages/PracticeTracking';
import { Meditation, BreathingExercise, Meditate, MeditatePlayer, AssessmentPage } from '@/pages/Meditation';
import { useSequenceStore, usePracticeStore, useMeditationStore } from '@/stores';

function App() {
  const loadSequences = useSequenceStore((state) => state.loadSequences);
  const loadPracticeData = usePracticeStore((state) => state.loadData);
  const loadMeditationData = useMeditationStore((state) => state.loadData);

  useEffect(() => {
    loadSequences();
    loadPracticeData();
    loadMeditationData();
  }, [loadSequences, loadPracticeData, loadMeditationData]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/poses" element={<PosesLibrary />} />
          <Route path="/poses/:id" element={<PoseDetail />} />
          <Route path="/sequences" element={<Sequences />} />
          <Route path="/sequences/create" element={<SequenceEditor />} />
          <Route path="/sequences/:id" element={<SequencePlay />} />
          <Route path="/practice" element={<PracticeHistory />} />
          <Route path="/practice/progress" element={<PoseProgressPage />} />
          <Route path="/practice/flexibility" element={<FlexibilityTestPage />} />
          <Route path="/meditation" element={<Meditation />} />
          <Route path="/meditation/breathing" element={<BreathingExercise />} />
          <Route path="/meditation/meditate" element={<Meditate />} />
          <Route path="/meditation/meditate/:id" element={<MeditatePlayer />} />
          <Route path="/assessment" element={<AssessmentPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
