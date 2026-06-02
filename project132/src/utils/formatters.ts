import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN });
};

export const formatShortDate = (date: string | Date): string => {
  return format(new Date(date), 'MM-dd', { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
};

export const formatDistance = (km: number): string => {
  return `${km.toFixed(1)} km`;
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN')}`;
};

export const getDaysUntil = (date: string): number => {
  return differenceInDays(new Date(date), new Date());
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    extreme: '极限'
  };
  return labels[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: 'text-green-400 bg-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    hard: 'text-orange-400 bg-orange-500/20',
    extreme: 'text-red-400 bg-red-500/20'
  };
  return colors[difficulty] || 'text-gray-400 bg-gray-500/20';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    new: '全新',
    good: '良好',
    worn: '磨损',
    replace: '需更换'
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    new: 'text-green-400 bg-green-500/20',
    good: 'text-blue-400 bg-blue-500/20',
    worn: 'text-yellow-400 bg-yellow-500/20',
    replace: 'text-red-400 bg-red-500/20'
  };
  return colors[status] || 'text-gray-400 bg-gray-500/20';
};

export const getMaintenanceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    oil: '机油更换',
    brake: '刹车片更换',
    tire: '轮胎更换',
    chain: '链条保养',
    other: '其他保养'
  };
  return labels[type] || type;
};

export const getGearCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    helmet: '头盔',
    jacket: '骑行服',
    gloves: '手套',
    pants: '骑行裤',
    boots: '骑行靴',
    protection: '护具',
    other: '其他'
  };
  return labels[category] || category;
};
