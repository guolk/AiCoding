import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getLikeCountCacheKey,
  getLikeCountFromCache,
  setLikeCountToCache,
  invalidateLikeCountCache,
  acquireLock,
  releaseLock,
  withLock,
} from '../server/utils/cache-utils';

vi.mock('../server/plugins/redis', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    multi: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    }),
  };
  return { redis: mockRedis };
});

import { redis } from '../server/plugins/redis';

describe('缓存工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getLikeCountCacheKey', () => {
    it('应该生成正确的缓存键', () => {
      const key = getLikeCountCacheKey(123);
      expect(key).toBe('article:likes:123');
    });

    it('应该为不同的文章ID生成不同的键', () => {
      const key1 = getLikeCountCacheKey(1);
      const key2 = getLikeCountCacheKey(2);
      expect(key1).not.toBe(key2);
    });
  });

  describe('getLikeCountFromCache', () => {
    it('应该从缓存获取点赞数', async () => {
      vi.mocked(redis.get).mockResolvedValue('42');
      
      const result = await getLikeCountFromCache(1);
      
      expect(redis.get).toHaveBeenCalledWith('article:likes:1');
      expect(result).toBe(42);
    });

    it('缓存不存在时应该返回null', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      
      const result = await getLikeCountFromCache(1);
      
      expect(result).toBeNull();
    });
  });

  describe('setLikeCountToCache', () => {
    it('应该设置缓存并设置过期时间', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      
      await setLikeCountToCache(1, 42);
      
      expect(redis.set).toHaveBeenCalledWith(
        'article:likes:1',
        '42',
        'EX',
        300
      );
    });
  });

  describe('invalidateLikeCountCache', () => {
    it('应该删除缓存', async () => {
      vi.mocked(redis.del).mockResolvedValue(1);
      
      await invalidateLikeCountCache(1);
      
      expect(redis.del).toHaveBeenCalledWith('article:likes:1');
    });
  });

  describe('acquireLock', () => {
    it('应该成功获取锁', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      
      const result = await acquireLock('test-lock', 10000);
      
      expect(redis.set).toHaveBeenCalledWith(
        'test-lock',
        expect.any(String),
        'PX',
        10000,
        'NX'
      );
      expect(result.acquired).toBe(true);
      expect(result.lockValue).toBeDefined();
    });

    it('获取锁失败时应该返回false', async () => {
      vi.mocked(redis.set).mockResolvedValue(null);
      
      const result = await acquireLock('test-lock', 10000);
      
      expect(result.acquired).toBe(false);
    });

    it('应该生成唯一的锁值', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      
      const result1 = await acquireLock('test-lock', 10000);
      const result2 = await acquireLock('test-lock', 10000);
      
      expect(result1.lockValue).not.toBe(result2.lockValue);
    });
  });

  describe('releaseLock', () => {
    it('应该释放锁（当值匹配时）', async () => {
      vi.mocked(redis.get).mockResolvedValue('my-lock-value');
      vi.mocked(redis.del).mockResolvedValue(1);
      
      await releaseLock('test-lock', 'my-lock-value');
      
      expect(redis.get).toHaveBeenCalledWith('test-lock');
      expect(redis.del).toHaveBeenCalledWith('test-lock');
    });

    it('不应该释放锁（当值不匹配时）', async () => {
      vi.mocked(redis.get).mockResolvedValue('other-value');
      
      await releaseLock('test-lock', 'my-lock-value');
      
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('锁不存在时应该不报错', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      
      await expect(releaseLock('test-lock', 'value')).resolves.not.toThrow();
    });
  });

  describe('withLock', () => {
    it('应该在获取锁后执行函数', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.get).mockResolvedValue('lock-value');
      vi.mocked(redis.del).mockResolvedValue(1);
      
      const mockFn = vi.fn().mockResolvedValue('result');
      
      const result = await withLock('test-lock', mockFn, 10000, 3);
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('应该在函数执行后释放锁', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.get).mockResolvedValue(expect.any(String));
      vi.mocked(redis.del).mockResolvedValue(1);
      
      const mockFn = vi.fn().mockResolvedValue('result');
      
      await withLock('test-lock', mockFn);
      
      expect(redis.del).toHaveBeenCalled();
    });

    it('函数抛出异常时也应该释放锁', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.get).mockResolvedValue(expect.any(String));
      vi.mocked(redis.del).mockResolvedValue(1);
      
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));
      
      await expect(withLock('test-lock', mockFn)).rejects.toThrow('test error');
      expect(redis.del).toHaveBeenCalled();
    });

    it('获取锁失败时应该重试', async () => {
      let callCount = 0;
      vi.mocked(redis.set).mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
          return null;
        }
        return 'OK';
      });
      vi.mocked(redis.get).mockResolvedValue('lock-value');
      vi.mocked(redis.del).mockResolvedValue(1);
      
      const mockFn = vi.fn().mockResolvedValue('result');
      
      await withLock('test-lock', mockFn, 10000, 3);
      
      expect(redis.set).toHaveBeenCalledTimes(3);
      expect(mockFn).toHaveBeenCalled();
    });

    it('超过最大重试次数后应该抛出错误', async () => {
      vi.mocked(redis.set).mockResolvedValue(null);
      
      const mockFn = vi.fn().mockResolvedValue('result');
      
      await expect(withLock('test-lock', mockFn, 10000, 3)).rejects.toThrow('无法获取锁');
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('缓存一致性测试', () => {
    it('应该正确设置和获取缓存', async () => {
      let cachedValue: string | null = null;
      vi.mocked(redis.set).mockImplementation(async (key: string, value: string) => {
        cachedValue = value;
        return 'OK';
      });
      vi.mocked(redis.get).mockImplementation(async (key: string) => {
        return cachedValue;
      });
      
      await setLikeCountToCache(1, 100);
      const result = await getLikeCountFromCache(1);
      
      expect(result).toBe(100);
    });

    it('应该正确失效缓存', async () => {
      let cachedValue: string | null = '100';
      vi.mocked(redis.set).mockImplementation(async (key: string, value: string) => {
        cachedValue = value;
        return 'OK';
      });
      vi.mocked(redis.get).mockImplementation(async (key: string) => {
        return cachedValue;
      });
      vi.mocked(redis.del).mockImplementation(async (key: string) => {
        cachedValue = null;
        return 1;
      });
      
      await setLikeCountToCache(1, 100);
      await invalidateLikeCountCache(1);
      const result = await getLikeCountFromCache(1);
      
      expect(result).toBeNull();
    });
  });
});
