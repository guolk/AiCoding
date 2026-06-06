export type AppCategory = 'social' | 'entertainment' | 'work' | 'study' | 'communication';

export type UsageQuality = 'effective' | 'ineffective' | 'mixed';

export type EmotionalTrigger = 'boredom' | 'anxiety' | 'habit' | 'intentional' | 'stress' | 'loneliness' | 'other';

export type GoalType = 'dailyLimit' | 'screenFreeTime' | 'detoxChallenge';

export type GoalFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export type ActivityCategory = '运动' | '冥想' | '阅读' | '社交' | '创意' | '其他';

export interface AppUsage {
  id: string;
  category: AppCategory;
  appName: string;
  durationMinutes: number;
  date: string;
  usageQuality: UsageQuality;
  emotionalTrigger: EmotionalTrigger;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  category: AppCategory | 'all';
  targetValue: number;
  timeRange?: string;
  frequency: GoalFrequency;
  startDate: string;
  endDate?: string;
  active: boolean;
  name?: string;
}

export interface HealthMetric {
  id: string;
  date: string;
  sleepQuality: number;
  sleepHours: number;
  focusLevel: number;
  moodLevel: number;
  notes?: string;
}

export interface AlternativeActivity {
  id: string;
  name: string;
  category: ActivityCategory;
  emoji: string;
  durationMinutes: number;
  effectivenessScore: number;
  usageCount: number;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  alternativeActivityId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  completed: boolean;
  effectivenessRating: number;
  notes?: string;
}

export interface ScreenFreeLog {
  id: string;
  date: string;
  timeRange: string;
  completed: boolean;
  notes?: string;
}

export interface CategoryInfo {
  key: AppCategory;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'social', label: '社交媒体', color: 'text-social', bgColor: 'bg-pink-100', icon: 'MessageCircle' },
  { key: 'entertainment', label: '娱乐', color: 'text-entertainment', bgColor: 'bg-amber-100', icon: 'Play' },
  { key: 'work', label: '工作', color: 'text-work', bgColor: 'bg-blue-100', icon: 'Briefcase' },
  { key: 'study', label: '学习', color: 'text-study', bgColor: 'bg-purple-100', icon: 'GraduationCap' },
  { key: 'communication', label: '通讯', color: 'text-communication', bgColor: 'bg-cyan-100', icon: 'Phone' },
];

export const EMOTIONAL_TRIGGERS: { key: EmotionalTrigger; label: string; emoji: string }[] = [
  { key: 'boredom', label: '无聊', emoji: '😴' },
  { key: 'anxiety', label: '焦虑', emoji: '😰' },
  { key: 'habit', label: '习惯性检查', emoji: '🔄' },
  { key: 'intentional', label: '有目的使用', emoji: '🎯' },
  { key: 'stress', label: '压力', emoji: '😫' },
  { key: 'loneliness', label: '孤独', emoji: '😔' },
  { key: 'other', label: '其他', emoji: '🤔' },
];

export const USAGE_QUALITY: { key: UsageQuality; label: string; color: string }[] = [
  { key: 'effective', label: '有效使用', color: 'text-primary-600' },
  { key: 'mixed', label: '一般', color: 'text-amber-600' },
  { key: 'ineffective', label: '无效使用', color: 'text-rose-600' },
];
