import { format, addDays, differenceInDays, startOfWeek, parseISO, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { RunType, TrainingDay, UserProfile } from '../types';

export const formatPace = (pace: number): string => {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const parseDuration = (durationStr: string): number => {
  const parts = durationStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
};

export const calculatePace = (distance: number, duration: number): number => {
  if (distance === 0 || duration === 0) return 0;
  return (duration / 60) / distance;
};

export const getRunTypeLabel = (type: RunType): string => {
  const labels: Record<RunType, string> = {
    easy: '轻松跑',
    tempo: '节奏跑',
    interval: '间歇训练',
    long: '长距离慢跑',
    race: '比赛',
    rest: '休息'
  };
  return labels[type];
};

export const getRunTypeColor = (type: RunType): string => {
  const colors: Record<RunType, string> = {
    easy: '#4CAF50',
    tempo: '#FF9800',
    interval: '#F44336',
    long: '#2196F3',
    race: '#9C27B0',
    rest: '#9E9E9E'
  };
  return colors[type];
};

export const getWeekNumber = (date: string, startDate: string): number => {
  const daysDiff = differenceInDays(parseISO(date), parseISO(startDate));
  return Math.floor(daysDiff / 7) + 1;
};

export const getWeeksUntilRace = (raceDate: string): number => {
  const today = new Date();
  const race = parseISO(raceDate);
  const days = differenceInDays(race, today);
  return Math.max(0, Math.ceil(days / 7));
};

export const calculateMaxHeartRate = (age: number, gender?: 'male' | 'female'): number => {
  if (gender === 'female') {
    return Math.round(206 - 0.88 * age);
  }
  return Math.round(220 - age);
};

export const getHeartRateZones = (maxHr: number, restingHr: number) => {
  const reserve = maxHr - restingHr;
  return [
    { zone: 1, name: '恢复区', minBpm: Math.round(restingHr + reserve * 0.5), maxBpm: Math.round(restingHr + reserve * 0.6), percentage: 0 },
    { zone: 2, name: '脂肪燃烧区', minBpm: Math.round(restingHr + reserve * 0.6), maxBpm: Math.round(restingHr + reserve * 0.7), percentage: 0 },
    { zone: 3, name: '有氧区', minBpm: Math.round(restingHr + reserve * 0.7), maxBpm: Math.round(restingHr + reserve * 0.8), percentage: 0 },
    { zone: 4, name: '无氧区', minBpm: Math.round(restingHr + reserve * 0.8), maxBpm: Math.round(restingHr + reserve * 0.9), percentage: 0 },
    { zone: 5, name: '极限区', minBpm: Math.round(restingHr + reserve * 0.9), maxBpm: maxHr, percentage: 0 }
  ];
};

export const getTrainingPace = (racePace: number, type: RunType): number => {
  const multipliers: Record<RunType, number> = {
    easy: 1.25,
    tempo: 1.05,
    interval: 0.95,
    long: 1.15,
    race: 1.0,
    rest: 0
  };
  return racePace * multipliers[type];
};

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: zhCN });
};

export const getDayOfWeek = (date: string): number => {
  return parseISO(date).getDay();
};

export const generateWeekDays = (startDate: string, weekNumber: number): Date[] => {
  const weekStart = addDays(parseISO(startDate), (weekNumber - 1) * 7);
  return eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });
};

export const calculateWeeklyMileage = (records: { date: string; distance: number }[], weekStart: string): number => {
  const weekStartDate = startOfWeek(parseISO(weekStart), { weekStartsOn: 1 });
  const weekEndDate = addDays(weekStartDate, 6);
  
  return records
    .filter(r => {
      const d = parseISO(r.date);
      return d >= weekStartDate && d <= weekEndDate;
    })
    .reduce((sum, r) => sum + r.distance, 0);
};

export const checkOverload = (currentWeek: number, previousWeek: number): { overload: boolean; increasePercent: number } => {
  if (previousWeek === 0) return { overload: false, increasePercent: 0 };
  const increasePercent = ((currentWeek - previousWeek) / previousWeek) * 100;
  return {
    overload: increasePercent > 10,
    increasePercent
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
