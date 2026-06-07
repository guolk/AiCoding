import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { RouteType, Difficulty, Season } from '@/types/route';
import type { RoadCondition } from '@/types/record';

export const routeTypeLabels: Record<RouteType, string> = {
  commute: '通勤',
  leisure: '休闲',
  race: '竞技',
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  extreme: '极限',
};

export const seasonLabels: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

export const roadConditionLabels: Record<RoadCondition, string> = {
  dry: '干燥',
  wet: '湿滑',
  sandy: '砂石',
  icy: '结冰',
};

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  return format(new Date(date), pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}米`;
  }
  return `${km.toFixed(1)}公里`;
};

export const formatElevation = (meters: number): string => {
  return `${meters}米`;
};

export const formatSpeed = (speed: number): string => {
  return `${speed.toFixed(1)} km/h`;
};

export const formatCalories = (calories: number): string => {
  return `${calories} 千卡`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-500';
  if (rating >= 4.0) return 'text-emerald-500';
  if (rating >= 3.5) return 'text-yellow-500';
  if (rating >= 3.0) return 'text-orange-500';
  return 'text-red-500';
};

export const getRatingBgColor = (rating: number): string => {
  if (rating >= 4.5) return 'bg-green-500';
  if (rating >= 4.0) return 'bg-emerald-500';
  if (rating >= 3.5) return 'bg-yellow-500';
  if (rating >= 3.0) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'hard':
      return 'bg-orange-500';
    case 'extreme':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getDifficultyTextColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'hard':
      return 'text-orange-500';
    case 'extreme':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
