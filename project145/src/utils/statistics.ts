import { AppUsage, HealthMetric, AppCategory, AlternativeActivity, ActivityLog, Goal } from '../types';
import { isWeekday, isWeekend } from './date';

export function sumByCategory(usageData: AppUsage[], date?: string): Record<AppCategory, number> {
  const filtered = date ? usageData.filter(u => u.date === date) : usageData;
  return filtered.reduce((acc, usage) => {
    acc[usage.category] = (acc[usage.category] || 0) + usage.durationMinutes;
    return acc;
  }, {} as Record<AppCategory, number>);
}

export function sumByDate(usageData: AppUsage[], dates: string[]): Record<string, number> {
  return dates.reduce((acc, date) => {
    const dayTotal = usageData
      .filter(u => u.date === date)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
    acc[date] = dayTotal;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateAverage(usageData: AppUsage[], dates: string[]): number {
  const byDate = sumByDate(usageData, dates);
  const values = Object.values(byDate).filter(v => v > 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function compareWeekdayVsWeekend(usageData: AppUsage[]): { weekday: number; weekend: number } {
  const weekdayTotal = usageData
    .filter(u => isWeekday(u.date))
    .reduce((sum, u) => sum + u.durationMinutes, 0);
  const weekendTotal = usageData
    .filter(u => isWeekend(u.date))
    .reduce((sum, u) => sum + u.durationMinutes, 0);
  
  const weekdayCount = [...new Set(usageData.filter(u => isWeekday(u.date)).map(u => u.date))].length || 1;
  const weekendCount = [...new Set(usageData.filter(u => isWeekend(u.date)).map(u => u.date))].length || 1;
  
  return {
    weekday: Math.round(weekdayTotal / weekdayCount),
    weekend: Math.round(weekendTotal / weekendCount),
  };
}

export function calculateUsageQualityStats(usageData: AppUsage[]): { effective: number; mixed: number; ineffective: number } {
  return usageData.reduce((acc, usage) => {
    acc[usage.usageQuality] += usage.durationMinutes;
    return acc;
  }, { effective: 0, mixed: 0, ineffective: 0 });
}

export function calculateEmotionalTriggerStats(usageData: AppUsage[]): Record<string, number> {
  return usageData.reduce((acc, usage) => {
    acc[usage.emotionalTrigger] = (acc[usage.emotionalTrigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateCorrelation(usageData: AppUsage[], healthData: HealthMetric[], metric: 'sleepQuality' | 'focusLevel' | 'moodLevel'): number {
  const pairedData: { usage: number; metric: number }[] = [];
  
  healthData.forEach(h => {
    const dayUsage = usageData
      .filter(u => u.date === h.date)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
    if (dayUsage > 0 && h[metric] > 0) {
      pairedData.push({ usage: dayUsage, metric: h[metric] });
    }
  });
  
  if (pairedData.length < 2) return 0;
  
  const n = pairedData.length;
  const sumX = pairedData.reduce((sum, d) => sum + d.usage, 0);
  const sumY = pairedData.reduce((sum, d) => sum + d.metric, 0);
  const sumXY = pairedData.reduce((sum, d) => sum + d.usage * d.metric, 0);
  const sumX2 = pairedData.reduce((sum, d) => sum + d.usage * d.usage, 0);
  const sumY2 = pairedData.reduce((sum, d) => sum + d.metric * d.metric, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateActivityEffectiveness(activities: AlternativeActivity[], logs: ActivityLog[]): AlternativeActivity[] {
  return activities.map(activity => {
    const activityLogs = logs.filter(l => l.alternativeActivityId === activity.id && l.completed);
    if (activityLogs.length === 0) return activity;
    
    const avgRating = activityLogs.reduce((sum, l) => sum + l.effectivenessRating, 0) / activityLogs.length;
    return {
      ...activity,
      effectivenessScore: Math.round(avgRating * 10) / 10,
      usageCount: activityLogs.length,
    };
  }).sort((a, b) => b.effectivenessScore - a.effectivenessScore);
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function calculateGoalProgress(goal: Goal | undefined, appUsage: AppUsage[], today: string) {
  if (!goal) return { current: 0, target: 0, progress: 0 };

  let current = 0;

  if (goal.type === 'dailyLimit' && goal.category !== 'all') {
    current = appUsage
      .filter((u) => u.category === goal.category && u.date === today)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
  } else if (goal.type === 'dailyLimit' && goal.category === 'all') {
    current = appUsage
      .filter((u) => u.date === today)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
  }

  const progress = Math.min(100, Math.round((current / goal.targetValue) * 100));
  return { current, target: goal.targetValue, progress };
}

export function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-3);
  const earlier = values.slice(0, 3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const change = (recentAvg - earlierAvg) / earlierAvg;
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

export function getGoalProgress(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
}
