export type EnergyType = 'electricity' | 'gas' | 'water';

export interface Bill {
  id: string;
  energyType: EnergyType;
  usage: number;
  amount: number;
  billingPeriod: string;
  date: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface SavingMeasure {
  id: string;
  name: string;
  category: string;
  cost: number;
  date: string;
  description: string;
  estimatedSavings?: number;
  actualSavings?: number;
}

export type HabitType = 'turn_off_lights' | 'cold_wash' | 'shorter_shower' | 'unplug_devices' | 'energy_saver_mode';

export interface HabitCheck {
  id: string;
  habitType: HabitType;
  date: string;
  completed: boolean;
}

export interface SavingGoal {
  id: string;
  type: 'usage_reduction' | 'cost_saving' | 'carbon_reduction';
  targetValue: number;
  currentValue: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  description: string;
}

export interface UserSettings {
  city: string;
  familyMembers: number;
  electricityPrice: number;
  gasPrice: number;
  waterPrice: number;
}

export interface Budget {
  id: string;
  year: number;
  electricityBudget: number;
  gasBudget: number;
  waterBudget: number;
}

export const CARBON_FACTORS = {
  electricity: 0.785,
  gas: 2.16,
  water: 0.91,
} as const;

export const HABIT_INFO: Record<HabitType, { name: string; icon: string; description: string }> = {
  turn_off_lights: { name: '出门关灯', icon: 'Lightbulb', description: '离开房间时记得关灯' },
  cold_wash: { name: '低温洗衣', icon: 'Droplets', description: '使用冷水或温水洗衣' },
  shorter_shower: { name: '缩短淋浴', icon: 'Timer', description: '淋浴时间控制在5分钟内' },
  unplug_devices: { name: '拔掉插头', icon: 'Plug', description: '不使用时拔掉电器插头' },
  energy_saver_mode: { name: '节能模式', icon: 'Leaf', description: '使用电器节能模式' },
};

export const ENERGY_INFO: Record<EnergyType, { name: string; unit: string; color: string; icon: string }> = {
  electricity: { name: '电力', unit: 'kWh', color: '#3B82F6', icon: 'Zap' },
  gas: { name: '燃气', unit: 'm³', color: '#F59E0B', icon: 'Flame' },
  water: { name: '水', unit: 'm³', color: '#06B6D4', icon: 'Droplets' },
};
