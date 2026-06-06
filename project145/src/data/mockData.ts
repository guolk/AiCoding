import { AppUsage, Goal, HealthMetric, AlternativeActivity, ActivityLog, ScreenFreeLog } from '../types';
import { getDaysAgo, getToday } from '../utils/date';
import { generateId } from '../utils/storage';

const generateMockUsageData = (): AppUsage[] => {
  const data: AppUsage[] = [];
  const appNames: Record<string, string[]> = {
    social: ['微信', '微博', '小红书', '抖音', 'Instagram'],
    entertainment: ['抖音', 'Bilibili', '腾讯视频', '爱奇艺', '游戏'],
    work: ['邮箱', '钉钉', '飞书', '企业微信', '浏览器'],
    study: ['Notion', '微信读书', '网易公开课', 'Anki', '浏览器'],
    communication: ['电话', '微信语音', 'Zoom', '腾讯会议'],
  };
  
  for (let i = 14; i >= 0; i--) {
    const date = getDaysAgo(i);
    const categories = ['social', 'entertainment', 'work', 'study', 'communication'] as const;
    
    categories.forEach(category => {
      const isWeekend = i % 7 === 0 || i % 7 === 6;
      let baseMinutes = 30;
      
      if (category === 'social') baseMinutes = isWeekend ? 60 : 45;
      if (category === 'entertainment') baseMinutes = isWeekend ? 90 : 40;
      if (category === 'work') baseMinutes = isWeekend ? 15 : 60;
      if (category === 'study') baseMinutes = isWeekend ? 40 : 30;
      if (category === 'communication') baseMinutes = 20;
      
      const variation = Math.floor(Math.random() * 40) - 20;
      const minutes = Math.max(5, baseMinutes + variation);
      
      const qualities = ['effective', 'mixed', 'ineffective'] as const;
      const triggers = ['boredom', 'anxiety', 'habit', 'intentional', 'stress'] as const;
      
      const usageCount = Math.floor(Math.random() * 3) + 1;
      let remaining = minutes;
      
      for (let j = 0; j < usageCount && remaining > 0; j++) {
        const duration = j === usageCount - 1 ? remaining : Math.floor(Math.random() * (remaining - 5)) + 5;
        remaining -= duration;
        
        data.push({
          id: generateId(),
          category,
          appName: appNames[category][Math.floor(Math.random() * appNames[category].length)],
          durationMinutes: duration,
          date,
          usageQuality: qualities[Math.floor(Math.random() * qualities.length)],
          emotionalTrigger: triggers[Math.floor(Math.random() * triggers.length)],
          createdAt: new Date().toISOString(),
        });
      }
    });
  }
  
  return data;
};

export const initialAppUsage: AppUsage[] = generateMockUsageData();

export const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    type: 'dailyLimit',
    category: 'social',
    targetValue: 60,
    frequency: 'daily',
    startDate: getDaysAgo(30),
    active: true,
    name: '社交媒体每日上限',
  },
  {
    id: 'goal-2',
    type: 'dailyLimit',
    category: 'entertainment',
    targetValue: 90,
    frequency: 'daily',
    startDate: getDaysAgo(30),
    active: true,
    name: '娱乐每日上限',
  },
  {
    id: 'goal-3',
    type: 'screenFreeTime',
    category: 'all',
    targetValue: 60,
    timeRange: '20:00-21:00',
    frequency: 'daily',
    startDate: getDaysAgo(14),
    active: true,
    name: '晚间无屏幕时间',
  },
  {
    id: 'goal-4',
    type: 'detoxChallenge',
    category: 'social',
    targetValue: 0,
    frequency: 'weekends',
    startDate: getDaysAgo(7),
    active: true,
    name: '周末社交媒体排毒',
  },
];

export const initialHealthMetrics: HealthMetric[] = [
  {
    id: 'health-1',
    date: getDaysAgo(6),
    sleepQuality: 7,
    sleepHours: 7,
    focusLevel: 6,
    moodLevel: 7,
  },
  {
    id: 'health-2',
    date: getDaysAgo(5),
    sleepQuality: 5,
    sleepHours: 5.5,
    focusLevel: 4,
    moodLevel: 5,
    notes: '昨晚刷手机到很晚',
  },
  {
    id: 'health-3',
    date: getDaysAgo(4),
    sleepQuality: 6,
    sleepHours: 6.5,
    focusLevel: 5,
    moodLevel: 6,
  },
  {
    id: 'health-4',
    date: getDaysAgo(3),
    sleepQuality: 8,
    sleepHours: 8,
    focusLevel: 7,
    moodLevel: 8,
    notes: '坚持了无屏幕时间',
  },
  {
    id: 'health-5',
    date: getDaysAgo(2),
    sleepQuality: 7,
    sleepHours: 7,
    focusLevel: 6,
    moodLevel: 7,
  },
  {
    id: 'health-6',
    date: getDaysAgo(1),
    sleepQuality: 6,
    sleepHours: 6,
    focusLevel: 5,
    moodLevel: 6,
  },
  {
    id: 'health-7',
    date: getToday(),
    sleepQuality: 7,
    sleepHours: 7,
    focusLevel: 6,
    moodLevel: 7,
  },
];

export const initialAlternatives: AlternativeActivity[] = [
  {
    id: 'alt-1',
    name: '出去散步',
    category: '运动',
    emoji: '🚶',
    durationMinutes: 15,
    effectivenessScore: 4.5,
    usageCount: 12,
    active: true,
  },
  {
    id: 'alt-2',
    name: '做10个深呼吸',
    category: '冥想',
    emoji: '🧘',
    durationMinutes: 2,
    effectivenessScore: 4.2,
    usageCount: 25,
    active: true,
  },
  {
    id: 'alt-3',
    name: '看一页书',
    category: '阅读',
    emoji: '📚',
    durationMinutes: 5,
    effectivenessScore: 4.0,
    usageCount: 8,
    active: true,
  },
  {
    id: 'alt-4',
    name: '喝水伸展',
    category: '运动',
    emoji: '💧',
    durationMinutes: 3,
    effectivenessScore: 3.8,
    usageCount: 18,
    active: true,
  },
  {
    id: 'alt-5',
    name: '听一首喜欢的歌',
    category: '其他',
    emoji: '🎵',
    durationMinutes: 4,
    effectivenessScore: 4.3,
    usageCount: 15,
    active: true,
  },
  {
    id: 'alt-6',
    name: '写三行日记',
    category: '创意',
    emoji: '✍️',
    durationMinutes: 5,
    effectivenessScore: 4.1,
    usageCount: 6,
    active: true,
  },
];

const generateActivityLogs = (): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  for (let i = 14; i >= 0; i--) {
    const date = getDaysAgo(i);
    const count = Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const alt = initialAlternatives[Math.floor(Math.random() * initialAlternatives.length)];
      logs.push({
        id: generateId(),
        alternativeActivityId: alt.id,
        date,
        startTime: new Date().toISOString(),
        durationMinutes: alt.durationMinutes,
        completed: Math.random() > 0.1,
        effectivenessRating: Math.floor(Math.random() * 3) + 3,
      });
    }
  }
  return logs;
};

export const initialActivityLogs: ActivityLog[] = generateActivityLogs();

export const initialScreenFreeLogs: ScreenFreeLog[] = [
  { id: 'sf-1', date: getDaysAgo(6), timeRange: '20:00-21:00', completed: true },
  { id: 'sf-2', date: getDaysAgo(5), timeRange: '20:00-21:00', completed: false, notes: '有工作需要处理' },
  { id: 'sf-3', date: getDaysAgo(4), timeRange: '20:00-21:00', completed: true },
  { id: 'sf-4', date: getDaysAgo(3), timeRange: '20:00-21:00', completed: true },
  { id: 'sf-5', date: getDaysAgo(2), timeRange: '20:00-21:00', completed: true },
  { id: 'sf-6', date: getDaysAgo(1), timeRange: '20:00-21:00', completed: false },
];
