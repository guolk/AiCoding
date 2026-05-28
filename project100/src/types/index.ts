export type QuestionCategory = 'product' | 'regulation' | 'industry' | 'safety';
export type DifficultyLevel = 'basic' | 'advanced' | 'expert';
export type QuestionType = 'single' | 'multiple' | 'judgment';

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswers: number[];
  validityStart: string;
  validityEnd: string;
  isActive: boolean;
  stats: {
    totalAttempts: number;
    correctAttempts: number;
  };
}

export interface LeaderboardItem {
  userId: string;
  userName: string;
  score: number;
  timeSpent: number;
  completedAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  questionCount: number;
  randomQuestions: boolean;
  shuffleOptions: boolean;
  noBacktrack: boolean;
  participants: string[];
  leaderboard: LeaderboardItem[];
  categories: QuestionCategory[];
  difficulties: DifficultyLevel[];
}

export interface Certificate {
  id: string;
  title: string;
  issuedTo: string;
  issuedDate: string;
  validUntil: string;
  certificateNumber: string;
  score: number;
}

export interface CompetitionHistory {
  competitionId: string;
  competitionTitle: string;
  score: number;
  rank: number;
  completedAt: string;
}

export interface User {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar: string;
  certificates: Certificate[];
  competitionHistory: CompetitionHistory[];
  knowledgeRadar: { [key: string]: number };
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  passScore: number;
  questions: string[];
}

export interface Assessment {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  score: number;
  passed: boolean;
  attempts: number;
  completedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'competition' | 'training' | 'system';
  publishDate: string;
  isRead: boolean;
}

export interface Honor {
  id: string;
  userId: string;
  userName: string;
  competitionTitle: string;
  rank: number;
  awardDate: string;
}
