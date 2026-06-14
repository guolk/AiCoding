export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'YYYY年MM月DD日 HH:mm');
};

export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffMonths < 12) return `${diffMonths}个月前`;
  return `${diffYears}年前`;
};

export const getMonthName = (month: number): string => {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month];
};

export const getWeekdayName = (day: number): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[day];
};

export const getSeasonFromDate = (date: Date | string): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const d = new Date(date);
  const month = d.getMonth();
  
  if (month >= 2 && month < 5) return 'spring';
  if (month >= 5 && month < 8) return 'summer';
  if (month >= 8 && month < 11) return 'autumn';
  return 'winter';
};

export const getTimeOfDayFromDate = (
  date: Date | string
): 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night' | 'midnight' => {
  const d = new Date(date);
  const hour = d.getHours();
  
  if (hour >= 4 && hour < 6) return 'dawn';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 22) return 'night';
  return 'midnight';
};

export const generateDateRange = (start: Date | string, end: Date | string): Date[] => {
  const dates: Date[] = [];
  const s = new Date(start);
  const e = new Date(end);
  
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
};

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getMonthDays = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};
