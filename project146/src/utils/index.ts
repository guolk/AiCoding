import { format, differenceInDays, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd') => {
  return format(new Date(date), formatStr, { locale: zhCN });
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatDuration = (hours: number) => {
  if (hours < 24) {
    return `${hours.toFixed(1)}小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}天${remainingHours > 0 ? ` ${remainingHours.toFixed(0)}小时` : ''}`;
};

export const formatDistance = (distance: number) => {
  return `${distance.toFixed(1)} 海里`;
};

export const formatSpeed = (speed: number) => {
  return `${speed.toFixed(1)} 节`;
};

export const getWindDirectionText = (direction: string) => {
  const directions: Record<string, string> = {
    N: '北风',
    NE: '东北风',
    E: '东风',
    SE: '东南风',
    S: '南风',
    SW: '西南风',
    W: '西风',
    NW: '西北风',
  };
  return directions[direction] || direction;
};

export const getWindDirectionArrow = (direction: string) => {
  const arrows: Record<string, string> = {
    N: '↓',
    NE: '↙',
    E: '←',
    SE: '↖',
    S: '↑',
    SW: '↗',
    W: '→',
    NW: '↘',
  };
  return arrows[direction] || '•';
};

export const getDaysUntil = (date: string) => {
  return differenceInDays(new Date(date), new Date());
};

export const getHoursUntil = (date: string) => {
  return differenceInHours(new Date(date), new Date());
};

export const getCertificateStatus = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  if (days < 0) return { status: 'expired', label: '已过期', color: 'text-red-600 bg-red-100' };
  if (days <= 30) return { status: 'urgent', label: `还有${days}天`, color: 'text-nautical-600 bg-nautical-100' };
  if (days <= 90) return { status: 'warning', label: `还有${days}天`, color: 'text-yellow-600 bg-yellow-100' };
  return { status: 'valid', label: '有效', color: 'text-green-600 bg-green-100' };
};

export const getPlanStatus = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'text-gray-600 bg-gray-100' },
    planned: { label: '已计划', color: 'text-ocean-600 bg-ocean-100' },
    'in-progress': { label: '进行中', color: 'text-nautical-600 bg-nautical-100' },
    completed: { label: '已完成', color: 'text-green-600 bg-green-100' },
    cancelled: { label: '已取消', color: 'text-red-600 bg-red-100' },
  };
  return statusMap[status] || statusMap.draft;
};

export const getEventType = (type: string) => {
  const typeMap: Record<string, { label: string; color: string; icon: string }> = {
    weather: { label: '天气事件', color: 'bg-blue-500', icon: 'cloud-lightning' },
    equipment: { label: '设备故障', color: 'bg-red-500', icon: 'alert-triangle' },
    wildlife: { label: '野生动物', color: 'bg-green-500', icon: 'fish' },
    other: { label: '其他事件', color: 'bg-gray-500', icon: 'flag' },
  };
  return typeMap[type] || typeMap.other;
};

export const getMaintenanceCategory = (category: string) => {
  const categoryMap: Record<string, { label: string; color: string }> = {
    engine: { label: '发动机', color: 'bg-ocean-100 text-ocean-700' },
    sails: { label: '帆具', color: 'bg-nautical-100 text-nautical-700' },
    rigging: { label: '索具', color: 'bg-yellow-100 text-yellow-700' },
    safety: { label: '安全设备', color: 'bg-green-100 text-green-700' },
    other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
  };
  return categoryMap[category] || categoryMap.other;
};

export const getSupplyCategory = (category: string) => {
  const categoryMap: Record<string, { label: string; color: string }> = {
    fuel: { label: '燃油', color: 'bg-ocean-100 text-ocean-700' },
    water: { label: '淡水', color: 'bg-blue-100 text-blue-700' },
    food: { label: '食物', color: 'bg-green-100 text-green-700' },
    parts: { label: '配件', color: 'bg-yellow-100 text-yellow-700' },
    safety: { label: '安全', color: 'bg-red-100 text-red-700' },
    other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
  };
  return categoryMap[category] || categoryMap.other;
};

export const getSeverityLevel = (severity: string) => {
  const severityMap: Record<string, { label: string; color: string }> = {
    low: { label: '低', color: 'bg-green-100 text-green-700' },
    medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
    high: { label: '高', color: 'bg-nautical-100 text-nautical-700' },
    critical: { label: '严重', color: 'bg-red-100 text-red-700' },
  };
  return severityMap[severity] || severityMap.low;
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
