import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'

import { PronunciationHome } from './pages/pronunciation/PronunciationHome'
import { PronunciationCompare } from './pages/pronunciation/PronunciationCompare'
import { PronunciationRepeat } from './pages/pronunciation/PronunciationRepeat'
import { PronunciationSpeed } from './pages/pronunciation/PronunciationSpeed'

import { DialogueHome } from './pages/dialogue/DialogueHome'
import { DialoguePractice } from './pages/dialogue/DialoguePractice'

import { VocabularyHome } from './pages/vocabulary/VocabularyHome'
import { VocabularyWords } from './pages/vocabulary/VocabularyWords'
import { VocabularyPhrases } from './pages/vocabulary/VocabularyPhrases'
import { VocabularyCollocations } from './pages/vocabulary/VocabularyCollocations'

import { ErrorsHome } from './pages/errors/ErrorsHome'
import { ErrorsGrammar } from './pages/errors/ErrorsGrammar'
import { ErrorsNotebook } from './pages/errors/ErrorsNotebook'
import { ErrorsProgress } from './pages/errors/ErrorsProgress'

import { EnvironmentHome } from './pages/environment/EnvironmentHome'
import { EnvironmentNews } from './pages/environment/EnvironmentNews'
import { EnvironmentVideos } from './pages/environment/EnvironmentVideos'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/pronunciation" element={<PronunciationHome />} />
        <Route path="/pronunciation/compare" element={<PronunciationCompare />} />
        <Route path="/pronunciation/repeat" element={<PronunciationRepeat />} />
        <Route path="/pronunciation/speed" element={<PronunciationSpeed />} />

        <Route path="/dialogue" element={<DialogueHome />} />
        <Route path="/dialogue/:id" element={<DialoguePractice />} />

        <Route path="/vocabulary" element={<VocabularyHome />} />
        <Route path="/vocabulary/words" element={<VocabularyWords />} />
        <Route path="/vocabulary/phrases" element={<VocabularyPhrases />} />
        <Route path="/vocabulary/collocations" element={<VocabularyCollocations />} />

        <Route path="/errors" element={<ErrorsHome />} />
        <Route path="/errors/grammar" element={<ErrorsGrammar />} />
        <Route path="/errors/notebook" element={<ErrorsNotebook />} />
        <Route path="/errors/progress" element={<ErrorsProgress />} />

        <Route path="/environment" element={<EnvironmentHome />} />
        <Route path="/environment/news" element={<EnvironmentNews />} />
        <Route path="/environment/videos" element={<EnvironmentVideos />} />
      </Routes>
    </MainLayout>
  )
}

export default App
