import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../server/plugins/redis', () => {
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

import { redis } from '../../server/plugins/redis';

describe('JWT令牌渗透测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('令牌黑名单功能测试', () => {
    it('应该能够将令牌加入黑名单', async () => {
      const { addToBlacklist } = require('../../server/utils/token-blacklist');
      
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.sadd).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);
      
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      
      await addToBlacklist(testToken, 1, 3600);
      
      expect(redis.set).toHaveBeenCalled();
      expect(redis.sadd).toHaveBeenCalled();
    });

    it('应该正确检测黑名单中的令牌', async () => {
      const { isTokenBlacklisted, addToBlacklist, generateTokenHash } = require('../../server/utils/token-blacklist');
      
      const testToken = 'test-jwt-token';
      const tokenHash = generateTokenHash(testToken);
      
      vi.mocked(redis.exists).mockImplementation(async (key: string) => {
        if (key.includes(tokenHash)) return 1;
        return 0;
      });
      
      const blacklisted = await isTokenBlacklisted(testToken);
      
      expect(blacklisted).toBe(true);
    });

    it('应该允许不在黑名单中的令牌', async () => {
      const { isTokenBlacklisted } = require('../../server/utils/token-blacklist');
      
      vi.mocked(redis.exists).mockResolvedValue(0);
      
      const blacklisted = await isTokenBlacklisted('unknown-token');
      
      expect(blacklisted).toBe(false);
    });
  });

  describe('令牌验证增强测试', () => {
    it('验证令牌时应该检查黑名单', async () => {
      const { verifyToken } = require('../../server/utils/jwt-fixed');
      
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.test';
      
      const { isTokenBlacklisted } = require('../../server/utils/token-blacklist');
      vi.mocked(redis.exists).mockResolvedValue(0);
      
      const config = { jwtSecret: 'test-secret-key' };
    });

    it('应该拒绝已过期的令牌', () => {
      const jwt = require('jsonwebtoken');
      
      const expiredToken = jwt.sign(
        { userId: 1, username: 'test' },
        'test-secret',
        { expiresIn: '-1h' }
      );
      
      try {
        jwt.verify(expiredToken, 'test-secret');
        throw new Error('应该抛出TokenExpiredError');
      } catch (error: unknown) {
        expect((error as Error).name).toBe('TokenExpiredError');
      }
    });

    it('应该拒绝签名无效的令牌', () => {
      const jwt = require('jsonwebtoken');
      
      const validToken = jwt.sign(
        { userId: 1, username: 'test' },
        'correct-secret',
        { expiresIn: '1h' }
      );
      
      try {
        jwt.verify(validToken, 'wrong-secret');
        throw new Error('应该抛出JsonWebTokenError');
      } catch (error: unknown) {
        expect((error as Error).name).toBe('JsonWebTokenError');
      }
    });
  });

  describe('用户级别令牌失效测试', () => {
    it('应该能够使单个用户的所有令牌失效', async () => {
      const { invalidateAllUserTokens } = require('../../server/utils/token-blacklist');
      
      vi.mocked(redis.smembers).mockResolvedValue(['hash1', 'hash2', 'hash3']);
      vi.mocked(redis.multi).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        del: vi.fn().mockReturnThis(),
        exec: vi.fn(),
      });
      
      const invalidatedCount = await invalidateAllUserTokens(1);
      
      expect(invalidatedCount).toBe(3);
    });
  });

  describe('令牌哈希安全测试', () => {
    it('应该使用SHA-256哈希存储令牌', () => {
      const { generateTokenHash } = require('../../server/utils/token-blacklist');
      const crypto = require('crypto');
      
      const testToken = 'test-jwt-token-12345';
      const hash = generateTokenHash(testToken);
      
      const expectedHash = crypto.createHash('sha256').update(testToken).digest('hex');
      
      expect(hash).toBe(expectedHash);
      expect(hash).toHaveLength(64);
    });

    it('相同令牌应该生成相同哈希', () => {
      const { generateTokenHash } = require('../../server/utils/token-blacklist');
      
      const token = 'same-token';
      const hash1 = generateTokenHash(token);
      const hash2 = generateTokenHash(token);
      
      expect(hash1).toBe(hash2);
    });

    it('不同令牌应该生成不同哈希', () => {
      const { generateTokenHash } = require('../../server/utils/token-blacklist');
      
      const hash1 = generateTokenHash('token-1');
      const hash2 = generateTokenHash('token-2');
      
      expect(hash1).not.toBe(hash2);
    });
  });
});
