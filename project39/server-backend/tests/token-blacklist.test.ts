import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateTokenHash,
  addToBlacklist,
  isTokenBlacklisted,
  invalidateAllUserTokens,
} from '../server/utils/token-blacklist';

vi.mock('../server/plugins/redis', () => {
  const mockRedis = {
    set: vi.fn(),
    get: vi.fn(),
    exists: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    smembers: vi.fn(),
    expire: vi.fn(),
    keys: vi.fn(),
    multi: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    }),
  };
  return { redis: mockRedis };
});

import { redis } from '../server/plugins/redis';

describe('Token黑名单工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTokenHash', () => {
    it('应该为相同的token生成相同的hash', () => {
      const token = 'test-jwt-token-12345';
      const hash1 = generateTokenHash(token);
      const hash2 = generateTokenHash(token);
      
      expect(hash1).toBe(hash2);
    });

    it('应该为不同的token生成不同的hash', () => {
      const token1 = 'test-jwt-token-12345';
      const token2 = 'test-jwt-token-67890';
      const hash1 = generateTokenHash(token1);
      const hash2 = generateTokenHash(token2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('addToBlacklist', () => {
    it('应该将token添加到黑名单', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.sadd).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);
      
      await addToBlacklist('test-token', 1, 3600);
      
      expect(redis.set).toHaveBeenCalled();
      expect(redis.sadd).toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('应该正确检测黑名单中的token', async () => {
      vi.mocked(redis.exists).mockResolvedValue(1);
      
      const result = await isTokenBlacklisted('test-token');
      
      expect(result).toBe(true);
    });

    it('应该正确检测不在黑名单中的token', async () => {
      vi.mocked(redis.exists).mockResolvedValue(0);
      
      const result = await isTokenBlacklisted('test-token');
      
      expect(result).toBe(false);
    });
  });
});
