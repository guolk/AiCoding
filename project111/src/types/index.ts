export type TaskType = 'daily' | 'weekly' | 'monthly' | 'timed';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  roleName: string;
  avatarUrl: string;
  level: number;
  expPoints: number;
  coins: number;
  isAdmin: boolean;
  familyId: string;
  createdAt: string;
  attributes: UserAttributes;
}

export interface UserAttributes {
  strength: number;
  agility: number;
  endurance: number;
  wisdom: number;
}

export interface Family {
  id: string;
  name: string;
  totalCoins: number;
  level: number;
  createdAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  expReward: number;
  coinReward: number;
  deadline?: string;
  assignedTo: string;
  familyId: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  icon: string;
  taskType: string;
}

export type ShopCategory = 'screen_time' | 'pocket_money' | 'privilege' | 'other';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  priceCoins: number;
  icon: string;
  isActive: boolean;
  familyId: string;
}

export interface RewardHistory {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  coinsSpent: number;
  status: 'pending' | 'completed';
  redeemedAt: string;
}

export type AchievementCategory = 'individual' | 'team' | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  coinReward: number;
  expReward: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  targetCoins: number;
  currentCoins: number;
  reward: string;
  deadline: string;
  familyId: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  roleName: string;
  avatarUrl: string;
  level: number;
  coins: number;
  expPoints: number;
  tasksCompleted: number;
  rankChange: number;
}

export interface StatsData {
  weeklyTasks: { day: string; completed: number; assigned: number }[];
  memberContribution: { name: string; tasks: number; percentage: number }[];
  spendingTrend: { week: string; spent: number; earned: number }[];
  taskTypes: { type: string; count: number }[];
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  daily: '日常任务',
  weekly: '周常任务',
  monthly: '月常任务',
  timed: '限时任务',
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  screen_time: '屏幕时间',
  pocket_money: '零花钱',
  privilege: '特权',
  other: '其他',
};

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  individual: '个人成就',
  team: '团队成就',
  hidden: '隐藏成就',
};
