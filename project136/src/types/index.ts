export interface CommentatorReview {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
  match: string;
}

export interface CommentatorSkills {
  speechSpeed: number;
  expertise: number;
  emotion: number;
  interaction: number;
  improvisation: number;
}

export interface Commentator {
  id: string;
  name: string;
  avatar?: string;
  style: string[];
  specialty: string;
  experience: number;
  rating: number;
  skills: CommentatorSkills;
  reviews: CommentatorReview[];
}

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  commentatorId: string;
  startTime: string;
  league: string;
  status: MatchStatus;
  homeTeam?: Team;
  awayTeam?: Team;
  commentator?: Commentator;
  homeScore?: number;
  awayScore?: number;
}

export interface CommentaryScript {
  id: string;
  matchId: string;
  background: string;
  teamIntro: string;
  tacticalAnalysis: string;
  historyBattle: string;
  suspenseSetup: string;
  createdAt: string;
  updatedAt: string;
  match?: Match;
}

export type MarkerType = 'general' | 'key' | 'warning';
export type MarkerPriority = 'high' | 'medium' | 'low';

export interface TimelineMarker {
  id: string;
  scriptId: string;
  timePoint: number;
  content: string;
  type: MarkerType;
  priority: MarkerPriority;
}

export type EmergencyCategory = 'interruption' | 'delay' | 'accident' | 'other';

export interface EmergencyLine {
  id: string;
  category: EmergencyCategory;
  content: string;
  tags: string[];
  usageCount: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  history: string;
  coach: string;
  corePlayers: string[];
  recentResults: string;
  league: string;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  avatar?: string;
  age: number;
  position: string;
  story: string;
  characteristics: string[];
  team?: Team;
}

export interface PlayerStat {
  id: string;
  playerId: string;
  season: string;
  games: number;
  goals: number;
  assists: number;
  minutes: number;
}

export interface Review {
  id: string;
  matchId: string;
  audioUrl?: string;
  highlights: string;
  improvements: string;
  createdAt: string;
  match?: Match;
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface ListenerFeedback {
  id: string;
  reviewId: string;
  source: string;
  content: string;
  sentiment: SentimentType;
  keywords: string[];
}

export type SkillCategory = 'speech_speed' | 'terminology' | 'emotion' | 'other';

export interface SkillImprovement {
  id: string;
  category: SkillCategory;
  goal: string;
  practiceLog: string;
  progress: number;
  startDate: string;
}

export type ChecklistCategory = 'data' | 'equipment' | 'script' | 'rehearsal';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  completed: boolean;
}

export interface PrepChecklist {
  id: string;
  matchId: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export interface ScriptWithDetails extends CommentaryScript {
  timelineMarkers: TimelineMarker[];
  emergencyLines: EmergencyLine[];
}
