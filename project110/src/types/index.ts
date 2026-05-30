export type PoseCategory = 'standing' | 'seated' | 'supine' | 'prone' | 'inversion' | 'arm-balance' | 'backbend';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SequenceType = 'standard' | 'custom';

export type TargetGoal = 'stress-relief' | 'strength' | 'flexibility' | 'relaxation' | 'energy';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type MasteryLevel = 'first-contact' | 'learning' | 'practicing' | 'improving' | 'stable';

export type OverallRating = 'poor' | 'fair' | 'good' | 'excellent';

export type AssessmentType = 'post-practice' | 'daily';

export type MeditationCategory = 'breath-awareness' | 'body-scan' | 'loving-kindness' | 'mindfulness';

export interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'rest';
  duration: number;
}

export interface BreathingCycle {
  phases: BreathingPhase[];
}

export interface YogaPose {
  id: string;
  nameSanskrit: string;
  nameChinese: string;
  category: PoseCategory;
  difficulty: DifficultyLevel;
  benefits: string;
  contraindications: string;
  images: string[];
  precautions: string[];
  transitionsFrom: string[];
  transitionsTo: string[];
  defaultDuration: number;
}

export interface PoseSequenceItem {
  poseId: string;
  poseName: string;
  duration: number;
  notes?: string;
}

export interface YogaSequence {
  id: string;
  name: string;
  description: string;
  type: SequenceType;
  targetGoal: TargetGoal;
  totalDuration: number;
  poses: PoseSequenceItem[];
  isBuiltIn: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeRecord {
  id: string;
  date: string;
  duration: number;
  sequenceId?: string;
  sequenceName: string;
  bodyFeelings: string;
  energyLevel: EnergyLevel;
  completedPoses: string[];
  notes?: string;
  createdAt: string;
}

export interface PoseProgress {
  poseId: string;
  masteryLevel: MasteryLevel;
  practiceCount: number;
  lastPracticed?: string;
  notes?: string;
}

export interface FlexibilityMeasurement {
  hamstrings: number;
  shoulders: number;
  hips: number;
  spine: number;
  [key: string]: number;
}

export interface FlexibilityTest {
  id: string;
  date: string;
  measurements: FlexibilityMeasurement;
  overallRating: OverallRating;
  notes?: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  steps: string[];
  cyclesPerMinute: number;
  benefits: string;
  contraindications: string;
}

export interface MeditationScript {
  id: string;
  title: string;
  content: string;
  defaultDuration: number;
  category: MeditationCategory;
  isFavorite: boolean;
  isBuiltIn: boolean;
}

export interface WellnessRatings {
  physical: number;
  mental: number;
  emotional: number;
  overall: number;
}

export interface WellnessAssessment {
  id: string;
  date: string;
  type: AssessmentType;
  ratings: WellnessRatings;
  notes?: string;
}

export interface PracticeStatistics {
  totalPractices: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  favoriteSequence: string | null;
  mostPracticedPose: string | null;
  progressByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export const POSE_CATEGORIES: { value: PoseCategory; label: string }[] = [
  { value: 'standing', label: '站立体式' },
  { value: 'seated', label: '坐姿体式' },
  { value: 'supine', label: '仰卧体式' },
  { value: 'prone', label: '俯卧体式' },
  { value: 'inversion', label: '倒立体式' },
  { value: 'arm-balance', label: '手臂平衡' },
  { value: 'backbend', label: '后弯体式' },
];

export const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'beginner', label: '初级', color: 'olive' },
  { value: 'intermediate', label: '中级', color: 'sage' },
  { value: 'advanced', label: '高级', color: 'terracotta' },
];

export const MASTERY_LEVELS: { value: MasteryLevel; label: string; percentage: number }[] = [
  { value: 'first-contact', label: '初次接触', percentage: 20 },
  { value: 'learning', label: '学习中', percentage: 40 },
  { value: 'practicing', label: '练习中', percentage: 60 },
  { value: 'improving', label: '进步中', percentage: 80 },
  { value: 'stable', label: '稳定保持', percentage: 100 },
];

export const TARGET_GOALS: { value: TargetGoal; label: string; icon: string }[] = [
  { value: 'stress-relief', label: '减压放松', icon: 'cloud' },
  { value: 'strength', label: '力量提升', icon: 'dumbbell' },
  { value: 'flexibility', label: '柔韧性改善', icon: 'flower' },
  { value: 'relaxation', label: '深度放松', icon: 'moon' },
  { value: 'energy', label: '能量提升', icon: 'sun' },
];
