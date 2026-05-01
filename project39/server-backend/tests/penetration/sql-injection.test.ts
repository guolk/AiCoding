import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "'; DROP TABLE users;--",
  "' UNION SELECT * FROM users--",
  "admin'--",
  "' OR 'a'='a",
  "' OR 1=1#",
  "1' OR '1'='1",
  "1' OR 1=1--",
  "' OR username LIKE '%",
  "' OR 1=1 ORDER BY 1--",
  "' UNION SELECT NULL, username, password FROM users--",
];

describe('SQL注入渗透测试', () => {
  describe('输入验证测试', () => {
    it('应该使用白名单验证搜索关键词', () => {
      const { searchSchema } = require('../server/utils/search-utils');
      
      for (const payload of SQL_INJECTION_PAYLOADS) {
        const result = searchSchema.safeParse({
          keyword: payload,
          page: 1,
          pageSize: 10,
        });
        
        expect(result.success).toBe(false);
      }
    });

    it('应该允许合法的搜索关键词', () => {
      const { searchSchema } = require('../server/utils/search-utils');
      
      const validKeywords = [
        '正常搜索',
        'test search',
        'test_search',
        '测试123',
        '中文搜索 test',
      ];
      
      for (const keyword of validKeywords) {
        const result = searchSchema.safeParse({
          keyword,
          page: 1,
          pageSize: 10,
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('SQL注入检测测试', () => {
    it('应该检测常见的SQL注入模式', () => {
      const { detectSqlInjectionAttempt } = require('../server/utils/search-utils');
      
      for (const payload of SQL_INJECTION_PAYLOADS) {
        const detected = detectSqlInjectionAttempt(payload);
        expect(detected).toBe(true);
      }
    });

    it('不应该误报正常的输入', () => {
      const { detectSqlInjectionAttempt } = require('../server/utils/search-utils');
      
      const normalInputs = [
        '正常搜索',
        'test search 123',
        'test_search',
        'user@example.com',
        'order by name',
      ];
      
      for (const input of normalInputs) {
        const detected = detectSqlInjectionAttempt(input);
        expect(detected).toBe(false);
      }
    });
  });

  describe('搜索模式清理测试', () => {
    it('应该清理危险的SQL字符', () => {
      const { sanitizeSearchKeyword } = require('../server/utils/search-utils');
      
      const testCases = [
        { input: "test'; --", expected: 'test' },
        { input: 'test" OR 1=1', expected: 'test OR 1 1' },
        { input: 'test; DROP TABLE', expected: 'test DROP TABLE' },
      ];
      
      for (const { input, expected } of testCases) {
        const result = sanitizeSearchKeyword(input);
        expect(result).not.toContain("'");
        expect(result).not.toContain('"');
        expect(result).not.toContain(';');
      }
    });

    it('应该转义SQL LIKE特殊字符', () => {
      const { escapeSqlLikePattern } = require('../server/utils/search-utils');
      
      const testCases = [
        { input: 'test%', expected: 'test\\%' },
        { input: 'test_', expected: 'test\\_' },
        { input: 'test[]', expected: 'test\\[\\]' },
      ];
      
      for (const { input, expected } of testCases) {
        const result = escapeSqlLikePattern(input);
        expect(result).toBe(expected);
      }
    });
  });
});
