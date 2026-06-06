import {
  format,
  differenceInDays,
  addMinutes,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import type { Dish } from '../types';

export interface TimelineTask {
  task: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  dishName?: string;
}

export const DATE_FORMATS = {
  FULL: 'yyyy年MM月dd日 HH:mm',
  DATE: 'yyyy年MM月dd日',
  TIME: 'HH:mm',
  SHORT: 'MM/dd HH:mm',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  RELATIVE: 'relative',
} as const;

export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS];

export function formatDate(
  date: string | Date,
  formatStr: string = DATE_FORMATS.DATE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (formatStr === DATE_FORMATS.RELATIVE) {
    const now = new Date();
    const daysDiff = differenceInDays(dateObj, now);

    if (daysDiff === 0) return '今天';
    if (daysDiff === 1) return '明天';
    if (daysDiff === -1) return '昨天';
    if (daysDiff > 1 && daysDiff < 7) return `${daysDiff}天后`;
    if (daysDiff < -1 && daysDiff > -7) return `${Math.abs(daysDiff)}天前`;

    return format(dateObj, DATE_FORMATS.DATE, { locale: zhCN });
  }

  return format(dateObj, formatStr, { locale: zhCN });
}

export function calculateTimeline(
  dishes: Dish[],
  serveTime: string | Date
): TimelineTask[] {
  const serveDate = typeof serveTime === 'string' ? parseISO(serveTime) : serveTime;
  const tasks: TimelineTask[] = [];

  const sortedDishes = [...dishes].sort(
    (a, b) => (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime)
  );

  sortedDishes.forEach((dish) => {
    const cookingStart = addMinutes(serveDate, -dish.cookTime);
    const prepStart = addMinutes(cookingStart, -dish.prepTime);

    tasks.push({
      task: `${dish.name} - 备菜`,
      startTime: prepStart,
      endTime: cookingStart,
      duration: dish.prepTime,
      dishName: dish.name,
    });

    tasks.push({
      task: `${dish.name} - 烹饪`,
      startTime: cookingStart,
      endTime: serveDate,
      duration: dish.cookTime,
      dishName: dish.name,
    });
  });

  tasks.push({
    task: '食材采购',
    startTime: addMinutes(serveDate, -24 * 60),
    endTime: addMinutes(serveDate, -22 * 60),
    duration: 120,
  });

  tasks.push({
    task: '器具准备',
    startTime: addMinutes(serveDate, -60),
    endTime: addMinutes(serveDate, -45),
    duration: 15,
  });

  tasks.push({
    task: '摆盘上菜',
    startTime: addMinutes(serveDate, -15),
    endTime: serveDate,
    duration: 15,
  });

  return tasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function getDaysUntil(date: string | Date): number {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return differenceInDays(target, now);
}

export function isUpcoming(date: string | Date, days: number = 7): boolean {
  const daysUntil = getDaysUntil(date);
  return daysUntil >= 0 && daysUntil <= days;
}

export function isPast(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(targetDate, new Date());
}

export function isFuture(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(targetDate, new Date());
}
