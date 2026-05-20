export interface Word {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  category: 'formal' | 'informal' | 'written' | 'spoken'
  collocations: string[]
  isFavorite: boolean
}

export interface Phrase {
  id: string
  phrase: string
  meaning: string
  scenario: string
  style: 'formal' | 'informal' | 'written' | 'spoken'
  isFavorite: boolean
}

export interface DialogueLine {
  id: string
  speaker: string
  role: string
  text: string
  hint?: string
  audioUrl?: string
}

export interface DialogueScenario {
  id: string
  title: string
  description: string
  category: 'restaurant' | 'direction' | 'shopping' | 'hospital' | 'meeting'
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  roles: string[]
  lines: DialogueLine[]
}

export interface GrammarError {
  id: string
  original: string
  corrected: string
  explanation: string
  errorType: string
  timestamp: Date
  count: number
}

export interface ProgressData {
  date: string
  pronunciation: number
  grammar: number
  vocabulary: number
  fluency: number
}

export interface PracticeResult {
  id: string
  type: string
  score: number
  date: Date
  details: string
}

export interface UserProfile {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  vocabularySize: number
  vocabularyCount: number
  streak: number
  totalPracticeTime: number
}

export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  views: string
  source: string
  keyPoints: string[]
  vocabulary: string[]
}

export interface NewsVocabulary {
  word: string
  phonetic: string
  partOfSpeech: string
  meaning: string
  example: string
}

export interface NewsItem {
  id: string
  title: string
  content: string
  translation: string
  vocabulary: NewsVocabulary[]
  audioUrl?: string
  date: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  summary: string
}

export interface CollocationExercise {
  id: string
  sentence: string
  blank: string
  options: string[]
  answer: string
  category: string
}
