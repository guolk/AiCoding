import { Bill, SavingMeasure, HabitCheck, SavingGoal, UserSettings, Budget, HabitType } from '../types';
import { generateId, getLast12Months } from './formatter';
import { SEASON_FACTORS } from './calculator';

export const generateMockBills = (): Bill[] => {
  const bills: Bill[] = [];
  const months = getLast12Months();
  
  months.forEach((period, index) => {
    const monthIndex = index + 1;
    const seasonFactor = SEASON_FACTORS[((monthIndex - 1) % 12 + 1).toString()] || 1;
    
    const electricityBase = 200 + Math.random() * 50;
    const gasBase = 15 + Math.random() * 5;
    const waterBase = 5 + Math.random() * 2;
    
    const electricityUsage = Math.round(electricityBase * seasonFactor);
    const gasUsage = Math.round((gasBase * (monthIndex >= 11 || monthIndex <= 3 ? 1.3 : 0.8)) * 10) / 10;
    const waterUsage = Math.round(waterBase * 10) / 10;
    
    const isAnomaly = period === '2025-12';
    
    bills.push({
      id: generateId(),
      energyType: 'electricity',
      usage: isAnomaly ? electricityUsage * 1.45 : electricityUsage,
      amount: Math.round((isAnomaly ? electricityUsage * 1.45 : electricityUsage) * 0.6 * 100) / 100,
      billingPeriod: period,
      date: `${period}-15`,
      isAnomaly,
      anomalyReason: isAnomaly ? '同比增长 45.2%' : undefined,
    });
    
    bills.push({
      id: generateId(),
      energyType: 'gas',
      usage: gasUsage,
      amount: Math.round(gasUsage * 2.5 * 100) / 100,
      billingPeriod: period,
      date: `${period}-15`,
    });
    
    bills.push({
      id: generateId(),
      energyType: 'water',
      usage: waterUsage,
      amount: Math.round(waterUsage * 5 * 100) / 100,
      billingPeriod: period,
      date: `${period}-15`,
    });
  });
  
  return bills;
};

export const generateMockSavingMeasures = (): SavingMeasure[] => {
  return [
    {
      id: generateId(),
      name: '更换LED灯泡',
      category: 'lighting',
      cost: 200,
      date: '2025-06-15',
      description: '全屋更换为LED节能灯泡，共20个',
      estimatedSavings: 50,
      actualSavings: 45,
    },
    {
      id: generateId(),
      name: '安装智能温控器',
      category: 'heating',
      cost: 500,
      date: '2025-08-20',
      description: '安装Nest智能温控器，优化空调使用',
      estimatedSavings: 80,
      actualSavings: 65,
    },
    {
      id: generateId(),
      name: '更换节能冰箱',
      category: 'appliance',
      cost: 3500,
      date: '2025-09-10',
      description: '更换为一级能效节能冰箱',
      estimatedSavings: 100,
    },
  ];
};

export const generateMockHabitChecks = (): HabitCheck[] => {
  const habits: HabitCheck[] = [];
  const habitTypes: HabitType[] = ['turn_off_lights', 'cold_wash', 'shorter_shower', 'unplug_devices', 'energy_saver_mode'];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    habitTypes.forEach((habitType) => {
      if (Math.random() > 0.3) {
        habits.push({
          id: generateId(),
          habitType,
          date: dateStr,
          completed: true,
        });
      }
    });
  }
  
  return habits;
};

export const generateMockGoals = (): SavingGoal[] => {
  return [
    {
      id: generateId(),
      type: 'cost_saving',
      targetValue: 200,
      currentValue: 145,
      period: 'monthly',
      startDate: '2025-12-01',
      description: '本月节省电费200元',
    },
    {
      id: generateId(),
      type: 'carbon_reduction',
      targetValue: 50,
      currentValue: 32,
      period: 'monthly',
      startDate: '2025-12-01',
      description: '本月减少碳排放50kg',
    },
    {
      id: generateId(),
      type: 'usage_reduction',
      targetValue: 300,
      currentValue: 180,
      period: 'yearly',
      startDate: '2025-01-01',
      description: '年度节电300度',
    },
  ];
};

export const defaultSettings: UserSettings = {
  city: '上海',
  familyMembers: 3,
  electricityPrice: 0.6,
  gasPrice: 2.5,
  waterPrice: 5,
};

export const generateMockBudget = (): Budget => {
  return {
    id: generateId(),
    year: new Date().getFullYear(),
    electricityBudget: 2400,
    gasBudget: 600,
    waterBudget: 400,
  };
};
