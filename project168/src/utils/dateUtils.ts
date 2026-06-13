import { format, formatDistanceToNow, differenceInDays, startOfDay, isToday, isYesterday, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: number | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatRelative(date: number | Date): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDaysSince(date: number): number {
  return differenceInDays(startOfDay(new Date()), startOfDay(new Date(date)));
}

export function isTodayDate(date: number | Date): boolean {
  const d = typeof date === 'number' ? new Date(date) : date;
  return isToday(d);
}

export function isYesterdayDate(date: number | Date): boolean {
  const d = typeof date === 'number' ? new Date(date) : date;
  return isYesterday(d);
}

export function isSameDayDate(date1: number | Date, date2: number | Date): boolean {
  const d1 = typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'number' ? new Date(date2) : date2;
  return isSameDay(d1, d2);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getStreak(dates: number[]): number {
  if (dates.length === 0) return 0;
  
  const today = startOfDay(new Date());
  const sortedDates = dates.map(d => startOfDay(new Date(d))).sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = today;
  
  for (const date of sortedDates) {
    const diff = differenceInDays(currentDate, date);
    if (diff === 0) {
      streak++;
      currentDate = date;
    } else if (diff === 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function getMonthDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  
  return dates;
}
