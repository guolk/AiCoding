import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { useQuestionStore } from './stores/questionStore';
import { useWrongNoteStore } from './stores/wrongNoteStore';
import { useNoteStore } from './stores/noteStore';
import { useTrainingStore } from './stores/trainingStore';

useQuestionStore.getState().loadQuestions();
useWrongNoteStore.getState().loadWrongNotes();
useNoteStore.getState().loadNotes();
useTrainingStore.getState().loadTrainingData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
