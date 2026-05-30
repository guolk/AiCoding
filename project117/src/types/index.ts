export interface Game {
  id: string;
  name: string;
  publisher: string;
  minPlayers: number;
  maxPlayers: number;
  minPlayTime: number;
  maxPlayTime: number;
  complexity: number;
  yearPublished: number;
  coverImage: string;
  bggId?: string;
  description?: string;
  tags: string[];
}

export type CollectionStatus = 'owned' | 'wishlist' | 'sold' | 'lent';

export interface CollectionItem {
  id: string;
  gameId: string;
  status: CollectionStatus;
  cabinet: string;
  shelf: string;
  locationNotes?: string;
  customComplexity?: number;
  occasionTags: string[];
  dateAdded: string;
}

export interface Player {
  name: string;
  isWinner?: boolean;
  score?: number;
}

export interface PlayRecord {
  id: string;
  gameId: string;
  playDate: string;
  duration: number;
  players: Player[];
  winner?: string;
  rating: number;
  notes?: string;
}

export type RuleNoteType = 'keyPoint' | 'qa' | 'teaching';

export interface RuleNote {
  id: string;
  gameId: string;
  type: RuleNoteType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ReviewType = 'firstImpression' | 'secondPlay' | 'longTerm';

export interface Review {
  id: string;
  gameId: string;
  type: ReviewType;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Expansion {
  id: string;
  baseGameId: string;
  name: string;
  publisher: string;
  yearPublished: number;
  coverImage: string;
  status: CollectionStatus;
  notes?: string;
}

export interface BGSearchResult {
  id: string;
  name: string;
  yearPublished?: number;
  coverImage?: string;
}

export interface GameStats {
  playCount: number;
  winCount: number;
  winRate: number;
  avgDuration: number;
  avgRating: number;
  lastPlayed: string | null;
}

export interface PlayerStats {
  name: string;
  playCount: number;
  winCount: number;
  winRate: number;
  favoriteGame?: string;
}
