export type NoteCategory = 'opening' | 'tactic' | 'endgame';

export type GameResult = 'win' | 'loss' | 'draw';

export type PieceColor = 'white' | 'black';

export interface Opening {
  id: string;
  name: string;
  eco: string;
  description: string;
  moves: string[];
  variations: Variation[];
  traps: Trap[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Variation {
  id: string;
  openingId: string;
  name: string;
  moves: string[];
  description: string;
  isMainLine: boolean;
  evaluation: number;
  createdAt: Date;
}

export interface Trap {
  id: string;
  openingId: string;
  name: string;
  triggerMoves: string[];
  refutation: string[];
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export interface Annotation {
  id: string;
  moveIndex: number;
  move: string;
  text: string;
  symbols?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplayGame {
  id: string;
  title: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteElo?: number;
  blackElo?: number;
  result: GameResult;
  moves: string[];
  annotations: Annotation[];
  fen?: string;
  event?: string;
  date?: string;
  openingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  relatedOpeningId?: string;
  relatedGameId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WrongTactic {
  id: string;
  position: string;
  wrongMove: string;
  correctMove: string;
  explanation: string;
  fen: string;
  category: NoteCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  attemptedAt: Date;
  reviewCount: number;
  lastReviewAt?: Date;
  masteryLevel: number;
}

export interface GameStatistics {
  id: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  asWhite: ColorStatistics;
  asBlack: ColorStatistics;
  winRate: number;
  averageElo?: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface ColorStatistics {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface OpeningStat {
  id: string;
  openingId: string;
  openingName: string;
  eco: string;
  color: PieceColor;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lastPlayedAt?: Date;
}

export interface UserProgress {
  id: string;
  openingsStudied: number;
  tacticsSolved: number;
  gamesPlayed: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date;
}

export interface Tactic {
  id: string;
  title: string;
  description: string;
  fen: string;
  solution: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
}

export interface UserTacticAttempt {
  id: string;
  tacticId: string;
  userId: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number;
  solvedAt: Date;
}

export interface StudySession {
  id: string;
  type: 'opening' | 'tactic' | 'game';
  title: string;
  description?: string;
  items: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewQueueItem {
  id: string;
  type: 'tactic' | 'note' | 'opening';
  itemId: string;
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt?: Date;
}
