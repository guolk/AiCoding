import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchSchema,
  escapeSqlLikePattern,
  sanitizeSearchKeyword,
  buildSearchPattern,
  detectSqlInjectionAttempt,
  SQL_INJECTION_PATTERNS,
} from '../server/utils/search-utils';

describe('搜索安全工具函数测试', () => {
  describe('searchSchema', () => {
    it('应该验证合法的搜索参数', () => {
      const result = searchSchema.safeParse({
        keyword: '测试搜索',
        page: 1,
        pageSize: 10,
      });
      expect(result.success).toBe(true);
    });

    it('应该拒绝非法的页码', () => {
      const result = searchSchema.safeParse({
        keyword: 'test',
        page: -1,
        pageSize: 10,
      });
      expect(result.success).toBe(false);
    });

    it('应该限制每页数量', () => {
      const result = searchSchema.safeParse({
        keyword: 'test',
        page: 1,
        pageSize: 200,
      });
      expect(result.success).toBe(false);
    });

    it('应该限制关键词长度', () => {
      const longKeyword = 'a'.repeat(200);
      const result = searchSchema.safeParse({
        keyword: longKeyword,
        page: 1,
        pageSize: 10,
      });
      expect(result.success).toBe(false);
    });

    it('应该拒绝包含特殊字符的关键词', () => {
      const result = searchSchema.safeParse({
        keyword: "test'; DROP TABLE--",
        page: 1,
        pageSize: 10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('escapeSqlLikePattern', () => {
    it('应该转义SQL LIKE特殊字符', () => {
      expect(escapeSqlLikePattern('test%')).toBe('test\\%');
      expect(escapeSqlLikePattern('test_')).toBe('test\\_');
      expect(escapeSqlLikePattern('test[]')).toBe('test\\[\\]');
      expect(escapeSqlLikePattern('test^')).toBe('test\\^');
    });
  });

  describe('sanitizeSearchKeyword', () => {
    it('应该移除危险的SQL字符', () => {
      expect(sanitizeSearchKeyword("test'; --")).toBe('test');
      expect(sanitizeSearchKeyword('test" OR 1=1')).toBe('test OR 1 1');
      expect(sanitizeSearchKeyword('test; DROP TABLE')).toBe('test DROP TABLE');
    });

    it('应该清理多余的空格', () => {
      expect(sanitizeSearchKeyword('  test   search  ')).toBe('test search');
    });
  });

  describe('detectSqlInjectionAttempt', () => {
    it('应该检测常见的SQL注入模式', () => {
      expect(detectSqlInjectionAttempt("' OR '1'='1")).toBe(true);
      expect(detectSqlInjectionAttempt("' OR 1=1--")).toBe(true);
      expect(detectSqlInjectionAttempt("admin'--")).toBe(true);
      expect(detectSqlInjectionAttempt("'; DROP TABLE users;--")).toBe(true);
      expect(detectSqlInjectionAttempt("' UNION SELECT * FROM users--")).toBe(true);
    });

    it('不应该误报正常的搜索关键词', () => {
      expect(detectSqlInjectionAttempt('正常搜索')).toBe(false);
      expect(detectSqlInjectionAttempt('test search 123')).toBe(false);
      expect(detectSqlInjectionAttempt('order by')).toBe(false);
    });
  });

  describe('buildSearchPattern', () => {
    it('应该构建安全的搜索模式', () => {
      const pattern = buildSearchPattern('test');
      expect(pattern).toBe('%test%');
    });

    it('应该转义特殊字符', () => {
      const pattern = buildSearchPattern('test%');
      expect(pattern).toBe('%test\\%%');
    });

    it('空关键词应该返回空字符串', () => {
      expect(buildSearchPattern('')).toBe('');
      expect(buildSearchPattern('   ')).toBe('');
    });
  });
});
