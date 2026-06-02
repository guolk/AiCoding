export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getStatusColor = (status: string, options: { value: string; color: string }[]): string => {
  const option = options.find(o => o.value === status);
  return option?.color || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string, options: { value: string; label: string }[]): string => {
  const option = options.find(o => o.value === status);
  return option?.label || status;
};

export const calculateMilestoneCompletionRate = (milestones: { status: string }[]): number => {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / milestones.length) * 100);
};

export const calculateDataRoomProgress = (items: { status: string }[]): number => {
  if (items.length === 0) return 0;
  const completed = items.filter(i => i.status === 'verified').length;
  return Math.round((completed / items.length) * 100);
};

export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};
