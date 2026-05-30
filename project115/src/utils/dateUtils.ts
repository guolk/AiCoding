export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isExpiringThisMonth = (expiryDate: string): boolean => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const sameMonth = now.getMonth() === expiry.getMonth();
  const sameYear = now.getFullYear() === expiry.getFullYear();
  return sameYear && sameMonth && expiry >= now;
};

export const isExpiringNextMonth = (expiryDate: string): boolean => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const expiry = new Date(expiryDate);
  return expiry >= nextMonth && expiry <= endOfNextMonth;
};

export const isExpired = (expiryDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate: string): 'expired' | 'urgent' | 'warning' | 'safe' => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'warning';
  return 'safe';
};

export const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const getMealRelationText = (relation: 'before' | 'after' | 'any'): string => {
  const map: Record<string, string> = {
    before: '饭前',
    after: '饭后',
    any: '不限'
  };
  return map[relation];
};

export const getFrequencyText = (frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'): string => {
  const map: Record<string, string> = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义'
  };
  return map[frequency];
};

export const getDosageStatusText = (status: 'scheduled' | 'taken' | 'missed' | 'makeup'): string => {
  const map: Record<string, string> = {
    scheduled: '待服用',
    taken: '已服用',
    missed: '漏服',
    makeup: '已补服'
  };
  return map[status];
};

export const isDaysOverdue = (lastCheckDate: string, intervalDays: number): boolean => {
  const last = new Date(lastCheckDate);
  const now = new Date();
  const diffTime = now.getTime() - last.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > intervalDays;
};
