export type RunType = 'easy' | 'tempo' | 'interval' | 'long' | 'race' | 'rest';

export interface RaceGoal {
  id: string;
  name: string;
  raceDate: string;
  targetTime: number;
  distance: number;
  createdAt: string;
}

export interface TrainingDay {
  id: string;
  weekNumber: number;
  dayOfWeek: number;
  date: string;
  type: RunType;
  distance: number;
  duration?: number;
  description: string;
  completed: boolean;
  actualDistance?: number;
  actualDuration?: number;
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  raceGoalId: string;
  startDate: string;
  totalWeeks: number;
  currentWeeklyMileage: number;
  days: TrainingDay[];
  createdAt: string;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  minBpm: number;
  maxBpm: number;
  percentage: number;
}

export interface RunRecord {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  type: RunType;
  route?: string;
  gpxData?: string;
  gpxPoints?: { lat: number; lng: number; time?: string; elevation?: number }[];
  feelings?: string;
  notes?: string;
  temperature?: number;
  weather?: string;
  createdAt: string;
}

export interface InjuryRecord {
  id: string;
  startDate: string;
  endDate?: string;
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendations: string;
  active: boolean;
}

export interface CheckListItem {
  id: string;
  category: 'gear' | 'nutrition' | 'logistics';
  item: string;
  checked: boolean;
}

export interface AppState {
  raceGoal: RaceGoal | null;
  trainingPlan: TrainingPlan | null;
  runRecords: RunRecord[];
  injuries: InjuryRecord[];
  checkList: CheckListItem[];
  userProfile: UserProfile | null;
}

export interface UserProfile {
  name: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  currentWeeklyMileage: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface PaceSegment {
  km: number;
  pace: number;
  cumulativeTime: number;
}
