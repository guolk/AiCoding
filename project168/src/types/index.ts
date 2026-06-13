export type StoneColor = 'black' | 'white';

export interface Point {
  x: number;
  y: number;
}

export type MarkType = 'key' | 'doubt' | 'good' | 'custom';

export interface MoveMark {
  id: string;
  type: MarkType;
  text?: string;
}

export interface MoveNode {
  id: string;
  moveNumber: number;
  color: StoneColor;
  point: Point | null;
  comment?: string;
  marks?: MoveMark[];
  children: MoveNode[];
  parentId: string | null;
  isMain?: boolean;
}

export type GameCategory = 'joseki' | 'problem' | 'famous' | 'self' | 'teaching' | 'custom';

export interface GameRecord {
  id: string;
  title: string;
  blackPlayer: string;
  whitePlayer: string;
  result?: string;
  date: string;
  category: GameCategory;
  tags: string[];
  description?: string;
  sgfContent: string;
  rootNode: MoveNode;
  createdAt: number;
  updatedAt: number;
}

export type ProblemDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface PracticeRecord {
  id: string;
  date: number;
  isCorrect: boolean;
  timeSpent: number;
  notes?: string;
}

export interface LifeDeathProblem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  initialBoard: string;
  correctAnswer: string;
  practiceRecords: PracticeRecord[];
}

export type JosekiMastery = 'familiar' | 'memorized' | 'understood';

export interface Joseki {
  id: string;
  name: string;
  gameId: string;
  mastery: JosekiMastery;
  lastPracticedAt?: number;
}

export type DailyTaskType = 'problem' | 'joseki' | 'game' | 'review' | 'custom';

export interface DailyTask {
  id: string;
  date: string;
  type: DailyTaskType;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
  targetCount?: number;
  currentCount?: number;
}

export type GameResult = 'win' | 'loss' | 'draw' | 'unknown';

export interface KeyMoment {
  id: string;
  moveNumber: number;
  description: string;
  reflection?: string;
}

export interface MatchRecord {
  id: string;
  opponentName: string;
  opponentRank: string;
  result: GameResult;
  myColor: StoneColor;
  handicap: number;
  playedAt: number;
  reviewNotes?: string;
  keyMoments: KeyMoment[];
  gameRecordId?: string;
}

export interface RankRecord {
  id: string;
  rank: string;
  date: number;
  event?: string;
  notes?: string;
}

export interface LearningStats {
  totalStudyTime: number;
  totalMatches: number;
  totalProblems: number;
  winRate: number;
  currentStreak: number;
  problemAccuracy: number;
}

export interface AppSettings {
  boardSize: number;
  autoPlaySpeed: number;
  showCoordinates: boolean;
  showMoveNumbers: boolean;
}

export interface GoStoreState {
  games: GameRecord[];
  problems: LifeDeathProblem[];
  josekis: Joseki[];
  dailyTasks: DailyTask[];
  matches: MatchRecord[];
  ranks: RankRecord[];
  settings: AppSettings;
  currentGameId: string | null;
  currentMoveNode: MoveNode | null;
}

export interface GoStoreActions {
  addGame: (game: Omit<GameRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateGame: (id: string, updates: Partial<GameRecord>) => void;
  deleteGame: (id: string) => void;
  setCurrentGame: (id: string | null) => void;
  setCurrentMoveNode: (node: MoveNode | null) => void;
  addProblem: (problem: Omit<LifeDeathProblem, 'id'>) => string;
  updateProblem: (id: string, updates: Partial<LifeDeathProblem>) => void;
  deleteProblem: (id: string) => void;
  addPracticeRecord: (problemId: string, record: Omit<PracticeRecord, 'id'>) => void;
  addJoseki: (joseki: Omit<Joseki, 'id'>) => string;
  updateJoseki: (id: string, updates: Partial<Joseki>) => void;
  deleteJoseki: (id: string) => void;
  addDailyTask: (task: Omit<DailyTask, 'id'>) => string;
  updateDailyTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  toggleDailyTask: (id: string) => void;
  addMatch: (match: Omit<MatchRecord, 'id'>) => string;
  updateMatch: (id: string, updates: Partial<MatchRecord>) => void;
  deleteMatch: (id: string) => void;
  addRank: (rank: Omit<RankRecord, 'id'>) => string;
  updateRank: (id: string, updates: Partial<RankRecord>) => void;
  deleteRank: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addMoveMark: (gameId: string, nodeId: string, mark: Omit<MoveMark, 'id'>) => void;
  removeMoveMark: (gameId: string, nodeId: string, markId: string) => void;
  updateNodeComment: (gameId: string, nodeId: string, comment: string) => void;
}

export type GoStore = GoStoreState & GoStoreActions;

export const MARK_TYPE_LABELS: Record<MarkType, string> = {
  key: '关键点',
  doubt: '疑问手',
  good: '好手',
  custom: '自定义',
};

export const MARK_TYPE_COLORS: Record<MarkType, string> = {
  key: '#FF8F00',
  doubt: '#D32F2F',
  good: '#0288D1',
  custom: '#7CB342',
};

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  joseki: '定式',
  problem: '死活题',
  famous: '名局',
  self: '自己对局',
  teaching: '教学棋谱',
  custom: '自定义',
};

export const CATEGORY_COLORS: Record<GameCategory, string> = {
  joseki: 'bg-blue-100 text-blue-800',
  problem: 'bg-red-100 text-red-800',
  famous: 'bg-purple-100 text-purple-800',
  self: 'bg-green-100 text-green-800',
  teaching: 'bg-amber-100 text-amber-800',
  custom: 'bg-gray-100 text-gray-800',
};

export const DIFFICULTY_LABELS: Record<ProblemDifficulty, string> = {
  easy: '初级',
  medium: '中级',
  hard: '高级',
  expert: '专家',
};

export const DIFFICULTY_STARS: Record<ProblemDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export const MASTERY_LABELS: Record<JosekiMastery, string> = {
  familiar: '知道但不熟练',
  memorized: '可以背出',
  understood: '理解其变化',
};

export const MASTERY_COLORS: Record<JosekiMastery, string> = {
  familiar: 'bg-amber-100 text-amber-800',
  memorized: 'bg-blue-100 text-blue-800',
  understood: 'bg-green-100 text-green-800',
};

export const RESULT_LABELS: Record<GameResult, string> = {
  win: '胜',
  loss: '负',
  draw: '和',
  unknown: '未知',
};

export const RESULT_COLORS: Record<GameResult, string> = {
  win: 'text-green-600 bg-green-50',
  loss: 'text-red-600 bg-red-50',
  draw: 'text-gray-600 bg-gray-50',
  unknown: 'text-gray-600 bg-gray-50',
};

export const TASK_TYPE_LABELS: Record<DailyTaskType, string> = {
  problem: '死活题',
  joseki: '定式',
  game: '打谱',
  review: '复盘',
  custom: '自定义',
};
