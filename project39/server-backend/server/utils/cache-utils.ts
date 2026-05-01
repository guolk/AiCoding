import { redis } from '../plugins/redis';

const ARTICLE_LIKE_CACHE_PREFIX = 'article:likes:';
const CACHE_TTL = 300;

export const getLikeCountCacheKey = (articleId: number): string => {
  return `${ARTICLE_LIKE_CACHE_PREFIX}${articleId}`;
};

export const getLikeCountFromCache = async (articleId: number): Promise<number | null> => {
  const key = getLikeCountCacheKey(articleId);
  const value = await redis.get(key);
  return value ? parseInt(value, 10) : null;
};

export const setLikeCountToCache = async (articleId: number, count: number): Promise<void> => {
  const key = getLikeCountCacheKey(articleId);
  await redis.set(key, count.toString(), 'EX', CACHE_TTL);
};

export const invalidateLikeCountCache = async (articleId: number): Promise<void> => {
  const key = getLikeCountCacheKey(articleId);
  await redis.del(key);
};

export const acquireLock = async (
  key: string,
  ttl: number = 10000
): Promise<{ lockValue: string; acquired: boolean }> => {
  const lockValue = `${Date.now()}:${Math.random().toString(36).substring(2)}`;
  const result = await redis.set(key, lockValue, 'PX', ttl, 'NX');
  return {
    lockValue,
    acquired: result === 'OK',
  };
};

export const releaseLock = async (key: string, lockValue: string): Promise<void> => {
  const currentValue = await redis.get(key);
  if (currentValue === lockValue) {
    await redis.del(key);
  }
};

export const withLock = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 10000,
  maxRetries: number = 3
): Promise<T> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    const { lockValue, acquired } = await acquireLock(key, ttl);
    
    if (acquired) {
      try {
        return await fn();
      } finally {
        await releaseLock(key, lockValue);
      }
    }
    
    retries++;
    await new Promise((resolve) => setTimeout(resolve, 100 * retries));
  }
  
  throw new Error('无法获取锁，请稍后重试');
};
