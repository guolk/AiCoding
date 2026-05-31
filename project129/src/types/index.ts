export type MasteryStatus = 'unlearned' | 'learning' | 'mastered';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type KanaType = 'hiragana' | 'katakana';
export type ListeningSourceType = 'nhk' | 'drama' | 'anime' | 'other';

export interface UserProfile {
  id: string;
  targetLevel: JLPTLevel;
  examDate: string;
  createdAt: string;
  isSetup: boolean;
}

export interface KanaProgress {
  id: string;
  character: string;
  romaji: string;
  type: KanaType;
  status: MasteryStatus;
  lastTested: string;
  correctCount: number;
  totalTests: number;
}

export interface KanjiProgress {
  id: string;
  kanji: string;
  level: JLPTLevel;
  status: MasteryStatus;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  lastStudied: string;
}

export interface GrammarProgress {
  id: string;
  grammarPoint: string;
  level: JLPTLevel;
  status: MasteryStatus;
  meaning: string;
  example: string;
  lastStudied: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: JLPTLevel;
  status: MasteryStatus;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  addedDate: string;
}

export interface ExampleSentence {
  id: string;
  vocabularyId: string;
  sentence: string;
  translation: string;
  createdAt: string;
}

export interface MockExam {
  id: string;
  date: string;
  level: JLPTLevel;
  vocabularyScore: number;
  vocabularyTotal: number;
  grammarScore: number;
  grammarTotal: number;
  readingScore: number;
  readingTotal: number;
  listeningScore: number;
  listeningTotal: number;
}

export interface ListeningRecord {
  id: string;
  title: string;
  source: string;
  type: ListeningSourceType;
  completionPercent: number;
  comprehensionScore: number;
  notes: string;
  date: string;
}

export interface SpeakingRecord {
  id: string;
  title: string;
  audioData: string;
  selfRating: number;
  notes: string;
  date: string;
}

export interface DiaryEntry {
  id: string;
  content: string;
  date: string;
  wordCount: number;
}

export interface ExamHistory {
  id: string;
  date: string;
  level: JLPTLevel;
  totalScore: number;
  vocabularyGrammarScore: number;
  readingScore: number;
  listeningScore: number;
  passed: boolean;
}
