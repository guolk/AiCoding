export type MaterialType = 'news' | 'ted' | 'movie' | 'song' | 'podcast';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type PracticeType = 'intensive' | 'extensive';

export type AnnotationType = 'linking' | 'reduction' | 'elision' | 'intonation';

export type DifficultyType = 'vocabulary' | 'pronunciation' | 'speed';

export type AccentType = 'american' | 'british' | 'australian';

export interface Annotation {
  id: string;
  type: AnnotationType;
  startIndex: number;
  endIndex: number;
  description: string;
  ruleId?: string;
}

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  annotations: Annotation[];
}

export interface ListeningMaterial {
  id: string;
  title: string;
  type: MaterialType;
  difficulty: Difficulty;
  practiceType: PracticeType;
  accent: AccentType;
  audioUrl: string;
  transcript: string;
  segments: Segment[];
  vocabulary: string[];
  duration: number;
  speed: number;
  createdAt: string;
  isFavorite: boolean;
  description: string;
  speaker: string;
}

export interface PronunciationRule {
  id: string;
  name: string;
  type: AnnotationType;
  description: string;
  examples: string[];
}

export interface WrongWord {
  id: string;
  word: string;
  correctWord: string;
  materialId: string;
  segmentId: string;
  timestamp: string;
  practiceCount: number;
  correctCount: number;
}

export interface AccentAnalysis {
  score: number;
  features: string[];
  suggestions: string[];
}

export interface SpeakingRecord {
  id: string;
  materialId: string;
  segmentId: string;
  audioUrl: string;
  duration: number;
  similarityScore: number;
  timestamp: string;
  accentAnalysis: AccentAnalysis;
}

export interface PracticeRecord {
  id: string;
  materialId: string;
  type: 'dictation' | 'analysis' | 'speaking';
  duration: number;
  accuracy: number;
  timestamp: string;
  difficulties: DifficultyType[];
}

export interface DailyStats {
  date: string;
  practiceDuration: number;
  dictationAccuracy: number;
  materialsCompleted: number;
  wrongWords: string[];
}

export interface DiffWord {
  text: string;
  type: 'correct' | 'wrong' | 'missing' | 'extra';
  index: number;
}

export interface DictationResult {
  segmentId: string;
  userInput: string;
  diff: DiffWord[];
  accuracy: number;
  wrongWords: WrongWord[];
}

export const MaterialTypeLabels: Record<MaterialType, string> = {
  news: '新闻广播',
  ted: 'TED演讲',
  movie: '电影台词',
  song: '歌曲',
  podcast: '播客',
};

export const DifficultyLabels: Record<Difficulty, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

export const PracticeTypeLabels: Record<PracticeType, string> = {
  intensive: '精听',
  extensive: '泛听',
};

export const AnnotationTypeLabels: Record<AnnotationType, string> = {
  linking: '连读',
  reduction: '弱读',
  elision: '吞音',
  intonation: '语调',
};

export const DifficultyTypeLabels: Record<DifficultyType, string> = {
  vocabulary: '词汇问题',
  pronunciation: '发音问题',
  speed: '语速问题',
};

export const AccentTypeLabels: Record<AccentType, string> = {
  american: '美音',
  british: '英音',
  australian: '澳音',
};
