export type MaterialCategory = 'family' | 'workplace' | 'society' | 'personal' | 'other';

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string; color: string }[] = [
  { value: 'family', label: '家庭', color: 'bg-pink-600' },
  { value: 'workplace', label: '职场', color: 'bg-blue-600' },
  { value: 'society', label: '社会现象', color: 'bg-purple-600' },
  { value: 'personal', label: '个人经历', color: 'bg-emerald-600' },
  { value: 'other', label: '其他', color: 'bg-gray-600' },
];

export interface Material {
  id: string;
  content: string;
  category: MaterialCategory;
  tags: string[];
  potential: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface Joke {
  id: string;
  materialId?: string;
  title: string;
  setup: string;
  punchline: string;
  tag: string;
  estimatedDuration: number;
  category: MaterialCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JokeVersion {
  id: string;
  jokeId: string;
  versionNumber: number;
  setup: string;
  punchline: string;
  tag: string;
  changeReason: string;
  createdAt: string;
}

export type OccasionType = 'club' | 'corporate' | 'open_mic' | 'special' | 'other';

export const OCCASION_TYPES: { value: OccasionType; label: string }[] = [
  { value: 'club', label: '俱乐部演出' },
  { value: 'corporate', label: '商务活动' },
  { value: 'open_mic', label: '开放麦' },
  { value: 'special', label: '专场演出' },
  { value: 'other', label: '其他场合' },
];

export interface JokeSlot {
  id: string;
  jokeId: string;
  order: number;
  transition?: string;
  actualDuration?: number;
}

export interface Performance {
  id: string;
  name: string;
  occasion: OccasionType;
  targetDuration: number;
  date?: string;
  venue?: string;
  jokeSlots: JokeSlot[];
  createdAt: string;
  updatedAt: string;
}

export type AudienceType = 'general' | 'professional' | 'student' | 'family' | 'international' | 'other';

export const AUDIENCE_TYPES: { value: AudienceType; label: string }[] = [
  { value: 'general', label: '普通观众' },
  { value: 'professional', label: '行业人士' },
  { value: 'student', label: '学生群体' },
  { value: 'family', label: '家庭观众' },
  { value: 'international', label: '国际观众' },
  { value: 'other', label: '其他' },
];

export interface JokeFeedback {
  jokeId: string;
  landed: boolean;
  feedback?: string;
  laughterDuration?: number;
  bestLines: string[];
  weakPoints: string[];
}

export interface SelfEvaluation {
  rhythmRating: number;
  bodyLanguageRating: number;
  interactionRating: number;
  comment?: string;
}

export type VideoNoteType = 'good' | 'bad' | 'improvement' | 'note';

export const VIDEO_NOTE_TYPES: { value: VideoNoteType; label: string; color: string }[] = [
  { value: 'good', label: '亮点', color: 'text-spotlight-gold' },
  { value: 'bad', label: '问题', color: 'text-red-400' },
  { value: 'improvement', label: '改进', color: 'text-cyan-400' },
  { value: 'note', label: '备注', color: 'text-gray-400' },
];

export interface VideoNote {
  id: string;
  timestamp: number;
  note: string;
  type: VideoNoteType;
}

export interface ShowRecord {
  id: string;
  performanceId?: string;
  date: string;
  venue?: string;
  audienceType: AudienceType;
  audienceSize: number;
  overallFeedback?: string;
  overallRating: number;
  jokeFeedbacks: JokeFeedback[];
  selfEvaluation?: SelfEvaluation;
  videoNotes: VideoNote[];
  createdAt: string;
}

export interface HitRateAnalysis {
  totalJokes: number;
  landedJokes: number;
  hitRate: number;
  byCategory: Record<MaterialCategory, { total: number; landed: number; rate: number }>;
}
