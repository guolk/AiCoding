export type SportType = 'climbing' | 'skateboarding' | 'surfing';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  primarySport: SportType;
  joinedDate: string;
}

export interface VideoAnnotation {
  id: string;
  timestamp: number;
  label: string;
  description: string;
}

export interface ClimbingDetails {
  routeName: string;
  grade: string;
  completionType: 'onsight' | 'flash' | 'redpoint' | 'attempt';
  attempts: number;
  keyMoves: string[];
  wallType: 'bouldering' | 'sport' | 'trad';
}

export interface SkateTrick {
  id: string;
  name: string;
  attempts: number;
  successes: number;
  falls: number;
  notes: string;
}

export interface SkateboardingDetails {
  tricks: SkateTrick[];
  locationType: 'street' | 'park' | 'vert' | 'bowl';
}

export interface SurfingDetails {
  waveHeight: string;
  rideTime: number;
  maneuvers: string[];
  boardType: string;
  conditions: string;
}

export interface TrainingRecord {
  id: string;
  sportType: SportType;
  date: string;
  location: string;
  duration: number;
  details: ClimbingDetails | SkateboardingDetails | SurfingDetails;
  videoAnnotations: VideoAnnotation[];
  notes: string;
  createdAt: string;
}

export interface InjuryRecord {
  id: string;
  bodyPart: string;
  severity: 'mild' | 'moderate' | 'severe';
  injuryDate: string;
  treatment: string;
  status: 'recovering' | 'recovered' | 'chronic';
  recoveryProgress: number;
  expectedReturn: string;
  rehabilitationLogs: {
    date: string;
    activity: string;
    painLevel: number;
  }[];
  createdAt: string;
}

export interface Skill {
  id: string;
  sportType: SportType;
  category: string;
  skillName: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  progressPercent: number;
  firstAttemptDate?: string;
  masteryDate?: string;
  trainingSessions: number;
  prerequisites: string[];
  isUnlocked: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'goal' | 'achievement';
  achievedDate: string;
  sportType: SportType;
  achievementDetails: Record<string, unknown>;
  isPublic: boolean;
  icon: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'harness' | 'helmet' | 'rope' | 'shoes' | 'board' | 'wetsuit' | 'other';
  brand: string;
  model: string;
  purchaseDate: string;
  lastCheckDate: string;
  nextCheckDate: string;
  checkIntervalDays: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_replacement';
  maintenanceLogs: {
    date: string;
    action: string;
    notes: string;
  }[];
  notes: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'climbing_gym' | 'skate_park' | 'surf_spot' | 'outdoor';
  address: string;
  safetyRating: number;
  riskFactors: {
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  emergencyPlan: {
    nearestHospital: string;
    emergencyPhone: string;
    evacuationRoute: string;
  };
  photos: string[];
  notes: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  medicalInfo: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  sportType: SportType;
  category: 'skill' | 'fitness' | 'competition' | 'travel';
  targetDate: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'abandoned';
  milestones: {
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    completedDate?: string;
  }[];
  createdAt: string;
}

export interface PartnerProgress {
  id: string;
  activity: string;
  date: string;
  notes?: string;
}

export interface PartnerMotivation {
  id: string;
  message: string;
  sentAt: string;
}

export interface Partner {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  phone: string;
  email?: string;
  primarySport: SportType;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  achievements: string[];
  notes?: string;
  progressHistory: PartnerProgress[];
  motivations: PartnerMotivation[];
  progressComparison: number;
  sharedGoals: string[];
  lastActivity: string;
  streak: number;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  location: string;
  sportType: SportType;
  category: 'day_trip' | 'weekend' | 'vacation' | 'competition' | 'expedition';
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost?: number;
  weather?: string;
  safetyConsiderations?: string;
  packingList: {
    id: string;
    item: string;
    checked: boolean;
  }[];
  activityNotes?: string;
  createdAt: string;
}

export interface PartnerMessage {
  id: string;
  partnerId: string;
  content: string;
  timestamp: string;
  type: 'encouragement' | 'update' | 'challenge';
}

export interface AnalyticsData {
  totalTrainingHours: number;
  totalSessions: number;
  averageSessionsPerWeek: number;
  skillMasteryAverageDays: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  weeklyData: {
    week: string;
    hours: number;
    sessions: number;
  }[];
  skillDistribution: {
    category: string;
    progress: number;
  }[];
}
