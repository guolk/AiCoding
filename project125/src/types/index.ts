export type RaceDistance = '10km' | 'half' | 'full' | '5km' | 'other';

export type TrainingType = 'easy' | 'marathon' | 'threshold' | 'interval' | 'repetition' | 'long';

export interface FinishTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface SplitData {
  kilometer: number;
  time: string;
  timeInSeconds: number;
  cumulativeTime: string;
  cumulativeSeconds: number;
  pace: string;
  paceInSeconds: number;
}

export interface PaceResult {
  pacePerKm: string;
  paceInSeconds: number;
  speedKmh: number;
  splits: SplitData[];
}

export interface TrainingZone {
  type: TrainingType;
  name: string;
  description: string;
  paceRange: { min: string; max: string };
  paceRangeSeconds: { min: number; max: number };
  heartRateRange: { min: number; max: number };
  perceivedEffort: string;
  color: string;
}

export interface DanielsPrediction {
  vdot: number;
  performanceLevel: string;
  predictedTimes: {
    '5km': string;
    '10km': string;
    'half': string;
    'full': string;
  };
  predictedSeconds: {
    '5km': number;
    '10km': number;
    'half': number;
    'full': number;
  };
  trainingPaces: {
    easy: { min: string; max: string };
    marathon: string;
    threshold: string;
    interval: { min: string; max: string };
    repetition: { min: string; max: string };
  };
}

export interface UserProfile {
  recent5kTime?: number;
  recent10kTime?: number;
  halfMarathonTime?: number;
  fullMarathonTime?: number;
  restingHeartRate: number;
  maxHeartRate: number;
  age: number;
  weight: number;
  vdot: number;
}

export interface TrainingRecord {
  id: string;
  date: string;
  type: TrainingType;
  typeName: string;
  distance: number;
  targetPace: string;
  targetPaceSeconds: number;
  actualPace: string;
  actualPaceSeconds: number;
  targetHeartRate: number;
  actualHeartRate: number;
  notes: string;
}

export interface RaceSplit {
  km: number;
  time: string;
  timeInSeconds: number;
  pace: string;
  paceInSeconds: number;
  elevation: number;
  heartRate: number;
}

export interface RaceReview {
  id: string;
  date: string;
  raceName: string;
  distance: RaceDistance;
  distanceName: string;
  totalTime: string;
  totalTimeSeconds: number;
  splits: RaceSplit[];
  weather: {
    temperature: number;
    humidity: number;
  };
  strategyNotes: string;
  lessonsLearned: string;
  averagePace: string;
  fastestKm: { km: number; pace: string };
  slowestKm: { km: number; pace: string };
}

export interface RaceSegment {
  name: string;
  startKm: number;
  endKm: number;
  targetPace: string;
  targetPaceSeconds: number;
  notes: string;
}

export interface AidStation {
  km: number;
  water: boolean;
  gel: boolean;
  electrolytes: boolean;
  notes: string;
}

export interface RacePlan {
  id: string;
  raceName: string;
  date: string;
  distance: RaceDistance;
  distanceName: string;
  targetFinishTime: string;
  targetFinishTimeSeconds: number;
  averagePace: string;
  strategy: 'negative' | 'positive' | 'even';
  strategyName: string;
  segments: RaceSegment[];
  aidStations: AidStation[];
  emergencyPlan: string;
  createdAt: string;
}

export interface AppState {
  userProfile: UserProfile;
  trainingRecords: TrainingRecord[];
  raceReviews: RaceReview[];
  racePlans: RacePlan[];
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addTrainingRecord: (record: TrainingRecord) => void;
  updateTrainingRecord: (id: string, record: Partial<TrainingRecord>) => void;
  deleteTrainingRecord: (id: string) => void;
  addRaceReview: (review: RaceReview) => void;
  updateRaceReview: (id: string, review: Partial<RaceReview>) => void;
  deleteRaceReview: (id: string) => void;
  addRacePlan: (plan: RacePlan) => void;
  updateRacePlan: (id: string, plan: Partial<RacePlan>) => void;
  deleteRacePlan: (id: string) => void;
}
