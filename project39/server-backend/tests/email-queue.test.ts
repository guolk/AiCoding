import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MAX_RETRY_COUNT,
  BASE_RETRY_DELAY_SECONDS,
  MAX_RETRY_DELAY_SECONDS,
  TEMPORARY_ERROR_PATTERNS,
  PERMANENT_ERROR_PATTERNS,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  getNextRetryTime,
  type EmailErrorType,
} from '../server/utils/email-config';

describe('邮件队列配置测试', () => {
  describe('MAX_RETRY_COUNT', () => {
    it('应该有合理的最大重试次数', () => {
      expect(MAX_RETRY_COUNT).toBeGreaterThan(0);
      expect(MAX_RETRY_COUNT).toBeLessThanOrEqual(10);
    });
  });

  describe('classifyError', () => {
    it('应该将超时错误分类为临时错误', () => {
      expect(classifyError('Connection timeout')).toBe('temporary');
      expect(classifyError('Service unavailable')).toBe('temporary');
      expect(classifyError('Try again later')).toBe('temporary');
      expect(classifyError('Rate limit exceeded')).toBe('temporary');
    });

    it('应该将收件人不存在错误分类为永久错误', () => {
      expect(classifyError('No such user')).toBe('permanent');
      expect(classifyError('User not found')).toBe('permanent');
      expect(classifyError('Recipient rejected')).toBe('permanent');
      expect(classifyError('Mailbox unavailable')).toBe('permanent');
    });

    it('应该将5xx SMTP错误分类为永久错误', () => {
      expect(classifyError('550 User unknown')).toBe('permanent');
      expect(classifyError('551 User not local')).toBe('permanent');
      expect(classifyError('552 Mailbox full')).toBe('permanent');
    });

    it('应该将4xx SMTP错误分类为临时错误', () => {
      expect(classifyError('421 Service not available')).toBe('temporary');
      expect(classifyError('450 Mailbox unavailable')).toBe('temporary');
      expect(classifyError('451 Local error')).toBe('temporary');
    });

    it('未知错误应该返回unknown', () => {
      expect(classifyError('Some random error message')).toBe('unknown');
    });
  });

  describe('calculateRetryDelay', () => {
    it('应该使用指数退避策略', () => {
      const delay1 = calculateRetryDelay(0);
      const delay2 = calculateRetryDelay(1);
      const delay3 = calculateRetryDelay(2);
      
      expect(delay2).toBe(delay1 * 2);
      expect(delay3).toBe(delay2 * 2);
    });

    it('不应该超过最大延迟时间', () => {
      const delay = calculateRetryDelay(100);
      expect(delay).toBeLessThanOrEqual(MAX_RETRY_DELAY_SECONDS);
    });
  });

  describe('shouldRetry', () => {
    it('永久错误不应该重试', () => {
      expect(shouldRetry(0, 'permanent')).toBe(false);
      expect(shouldRetry(1, 'permanent')).toBe(false);
    });

    it('临时错误在重试次数内应该允许重试', () => {
      for (let i = 0; i < MAX_RETRY_COUNT; i++) {
        expect(shouldRetry(i, 'temporary')).toBe(true);
      }
    });

    it('超过最大重试次数后不应该重试', () => {
      expect(shouldRetry(MAX_RETRY_COUNT, 'temporary')).toBe(false);
      expect(shouldRetry(MAX_RETRY_COUNT + 1, 'temporary')).toBe(false);
    });
  });

  describe('getNextRetryTime', () => {
    it('应该返回未来的时间', () => {
      const nextTime = getNextRetryTime(1);
      const now = new Date();
      
      expect(nextTime.getTime()).toBeGreaterThan(now.getTime());
    });

    it('应该根据重试次数计算延迟', () => {
      const nextTime1 = getNextRetryTime(0);
      const nextTime2 = getNextRetryTime(1);
      
      expect(nextTime2.getTime()).toBeGreaterThan(nextTime1.getTime());
    });
  });
});
