import {
  format,
  parseISO,
  differenceInDays,
  differenceInMonths,
  isAfter,
  isBefore,
  addDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr: string, pattern: string = 'yyyy年MM月dd日'): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'MM/dd');
}

export function daysBetween(startStr: string, endStr: string): number {
  return differenceInDays(parseISO(endStr), parseISO(startStr));
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function monthsBetween(startStr: string, endStr: string): number {
  return differenceInMonths(parseISO(endStr), parseISO(startStr));
}

export function isExpired(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date());
}

export function isExpiringSoon(dateStr: string, days: number = 30): boolean {
  const target = addDays(new Date(), days);
  return isBefore(parseISO(dateStr), target) && !isExpired(dateStr);
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
