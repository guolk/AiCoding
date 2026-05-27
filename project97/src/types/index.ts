export type CompetitionType = 'CMO' | 'IMO' | '省赛' | '集训队' | '其他';

export type Topic = 'number_theory' | 'combinatorics' | 'algebra' | 'geometry';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ErrorReason = 'concept' | 'calculation' | 'approach' | 'careless';

export type NoteType = 'knowledge' | 'method' | 'experience';

export type TrainingType = 'daily' | 'exam' | 'reinforce';

export interface Solution {
  id: string;
  method: string;
  content: string;
  idea: string;
  applicableTo: string;
}

export interface Question {
  id: string;
  content: string;
  source: string;
  competitionType: CompetitionType;
  knowledgeTags: string[];
  difficulty: Difficulty;
  solutions: Solution[];
  topic: Topic;
  createdAt: string;
  updatedAt: string;
}

export interface WrongNote {
  id: string;
  questionId: string;
  errorReason: ErrorReason;
  errorReasonText: string;
  correctSolution: string;
  reviewCount: number;
  nextReviewDate: string;
  easeFactor: number;
  interval: number;
  isMastered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  topic?: Topic;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRecord {
  id: string;
  type: TrainingType;
  questionIds: string[];
  results: Record<string, boolean>;
  score?: number;
  duration?: number;
  examDuration?: number;
  createdAt: string;
}

export interface DailyGoal {
  id: string;
  date: string;
  targetCount: number;
  completedCount: number;
  knowledgeCoverage: string[];
  actualCoverage: string[];
}

export interface UserStats {
  totalQuestions: number;
  masteredQuestions: number;
  streakDays: number;
  lastPracticeDate: string | null;
  averageExamScore: number;
  examCount: number;
}
