import { parseISO, isValid, startOfDay, endOfDay, addDays, differenceInMilliseconds } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz';

export const TIMEZONES = {
  'Asia/Shanghai': '北京时间 (UTC+8)',
  'Asia/Tokyo': '东京时间 (UTC+9)',
  'America/New_York': '纽约时间 (UTC-5/UTC-4)',
  'America/Los_Angeles': '洛杉矶时间 (UTC-8/UTC-7)',
  'Europe/London': '伦敦时间 (UTC+0/UTC+1)',
  'Europe/Paris': '巴黎时间 (UTC+1/UTC+2)',
} as const;

export type TimezoneKey = keyof typeof TIMEZONES;

export const DEFAULT_TIMEZONE = 'Asia/Shanghai';

export const parseDateTime = (
  dateStr: string,
  timezone: string = DEFAULT_TIMEZONE
): Date | null => {
  if (!dateStr) return null;
  
  let parsedDate: Date | null = null;
  
  if (dateStr.endsWith('Z')) {
    parsedDate = parseISO(dateStr);
  } else if (dateStr.includes('+') || dateStr.includes('-') && dateStr.length > 10) {
    parsedDate = parseISO(dateStr);
  } else {
    parsedDate = zonedTimeToUtc(dateStr, timezone);
  }
  
  if (!parsedDate || !isValid(parsedDate)) {
    return null;
  }
  
  return parsedDate;
};

export const formatDateTimeForUser = (
  date: Date,
  timezone: string = DEFAULT_TIMEZONE,
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string => {
  return formatInTimeZone(date, timezone, format);
};

export const getCurrentUtcTime = (): Date => {
  return new Date();
};

export const calculateSubscriptionEndTime = (
  startTime: Date,
  durationDays: number,
  timezone: string = DEFAULT_TIMEZONE
): Date => {
  const startInUserTimezone = utcToZonedTime(startTime, timezone);
  const endInUserTimezone = endOfDay(addDays(startInUserTimezone, durationDays));
  return zonedTimeToUtc(endInUserTimezone, timezone);
};

export const isSubscriptionActive = (
  endTime: Date,
  currentTime: Date = getCurrentUtcTime()
): boolean => {
  return endTime > currentTime;
};

export const getRemainingTime = (
  endTime: Date,
  currentTime: Date = getCurrentUtcTime()
): { milliseconds: number; days: number; hours: number; minutes: number } => {
  const remaining = differenceInMilliseconds(endTime, currentTime);
  
  if (remaining <= 0) {
    return { milliseconds: 0, days: 0, hours: 0, minutes: 0 };
  }
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return { milliseconds: remaining, days, hours, minutes };
};
