import {
  format,
  parseISO,
  isBefore,
  isAfter,
  differenceInDays,
  addYears as dateFnsAddYears,
  getYear,
  addDays,
  isValid,
  parse,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function parseDate(dateStr: string): Date {
  try {
    const formats = [
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      "yyyy-MM-dd'T'HH:mm:ss",
      'yyyy-MM-dd',
      'yyyy/MM/dd',
      'MM/dd/yyyy',
      'dd-MM-yyyy',
    ];

    for (const fmt of formats) {
      const parsed = parse(dateStr, fmt, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }

    const isoParsed = parseISO(dateStr);
    if (isValid(isoParsed)) {
      return isoParsed;
    }

    throw new Error(`Unable to parse date: ${dateStr}`);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(NaN);
  }
}

export function isExpired(dateStr: string): boolean {
  try {
    const date = parseDate(dateStr);
    if (!isValid(date)) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  } catch (error) {
    console.error('Error checking expiration:', error);
    return false;
  }
}

export function isExpiringSoon(dateStr: string, days: number = 30): boolean {
  try {
    const date = parseDate(dateStr);
    if (!isValid(date)) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warningDate = addDays(today, days);
    return isAfter(date, today) && !isAfter(date, warningDate);
  } catch (error) {
    console.error('Error checking expiring soon:', error);
    return false;
  }
}

export function daysBetween(date1: string, date2: string): number {
  try {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    if (!isValid(d1) || !isValid(d2)) {
      return 0;
    }
    return Math.abs(differenceInDays(d1, d2));
  } catch (error) {
    console.error('Error calculating days between:', error);
    return 0;
  }
}

export function addYears(date: string | Date, years: number): string {
  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    const result = dateFnsAddYears(dateObj, years);
    return format(result, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error adding years:', error);
    return '';
  }
}

export function getCurrentYear(): number {
  return getYear(new Date());
}
