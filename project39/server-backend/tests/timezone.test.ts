import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseDateTime,
  formatDateTimeForUser,
  isSubscriptionActive,
  getRemainingTime,
  calculateSubscriptionEndTime,
  getCurrentUtcTime,
  DEFAULT_TIMEZONE,
} from '../server/utils/timezone';

describe('时区处理工具函数测试', () => {
  describe('parseDateTime', () => {
    it('应该正确解析带时区的ISO格式时间', () => {
      const dateStr = '2024-12-31T23:59:59+08:00';
      const result = parseDateTime(dateStr, 'Asia/Shanghai');
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-12-31T15:59:59.000Z');
    });

    it('应该正确解析不带时区的时间（使用用户时区）', () => {
      const dateStr = '2024-12-31 23:59:59';
      const result = parseDateTime(dateStr, 'Asia/Shanghai');
      
      expect(result).not.toBeNull();
    });

    it('应该正确解析Z结尾的UTC时间', () => {
      const dateStr = '2024-12-31T15:59:59Z';
      const result = parseDateTime(dateStr);
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-12-31T15:59:59.000Z');
    });

    it('无效的时间字符串应该返回null', () => {
      expect(parseDateTime('invalid-date')).toBeNull();
      expect(parseDateTime('')).toBeNull();
    });
  });

  describe('isSubscriptionActive', () => {
    it('到期时间晚于当前时间应该返回true', () => {
      const futureDate = new Date(Date.now() + 86400000);
      expect(isSubscriptionActive(futureDate)).toBe(true);
    });

    it('到期时间早于当前时间应该返回false', () => {
      const pastDate = new Date(Date.now() - 86400000);
      expect(isSubscriptionActive(pastDate)).toBe(false);
    });

    it('应该正确处理自定义当前时间', () => {
      const endTime = new Date('2024-12-31T23:59:59Z');
      const beforeEnd = new Date('2024-12-31T23:59:58Z');
      const afterEnd = new Date('2025-01-01T00:00:00Z');
      
      expect(isSubscriptionActive(endTime, beforeEnd)).toBe(true);
      expect(isSubscriptionActive(endTime, afterEnd)).toBe(false);
    });
  });

  describe('calculateSubscriptionEndTime', () => {
    it('应该正确计算不同时区的到期时间', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const durationDays = 30;
      
      const endTime = calculateSubscriptionEndTime(startTime, durationDays, 'Asia/Shanghai');
      
      expect(endTime).toBeInstanceOf(Date);
    });
  });

  describe('formatDateTimeForUser', () => {
    it('应该正确格式化时间到用户时区', () => {
      const utcDate = new Date('2024-01-01T12:00:00Z');
      
      const shanghaiTime = formatDateTimeForUser(utcDate, 'Asia/Shanghai', 'yyyy-MM-dd HH:mm:ss');
      const newYorkTime = formatDateTimeForUser(utcDate, 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
      
      expect(shanghaiTime).toBe('2024-01-01 20:00:00');
    });
  });

  describe('订阅时区问题场景测试', () => {
    it('应该正确处理北京时间和UTC时间的差异', () => {
      const userTimezone = 'Asia/Shanghai';
      const userEndTimeStr = '2024-12-31 23:59:59';
      
      const parsedEndTime = parseDateTime(userEndTimeStr, userTimezone);
      
      expect(parsedEndTime).not.toBeNull();
      
      const utcEndTime = parsedEndTime!;
      
      const userLocalTime = formatDateTimeForUser(utcEndTime, userTimezone, 'yyyy-MM-dd HH:mm:ss');
      expect(userLocalTime).toBe('2024-12-31 23:59:59');
      
      const now = new Date('2024-12-31T15:00:00Z');
      expect(isSubscriptionActive(utcEndTime, now)).toBe(true);
      
      const expiredTime = new Date('2025-01-01T00:00:00Z');
      expect(isSubscriptionActive(utcEndTime, expiredTime)).toBe(false);
    });
  });
});
