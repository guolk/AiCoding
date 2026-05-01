import { redis } from '../plugins/redis';
import crypto from 'crypto';

const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
const USER_TOKEN_PREFIX = 'user:tokens:';
const DEFAULT_TOKEN_EXPIRY = 24 * 60 * 60;

export const generateTokenHash = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const getBlacklistKey = (tokenHash: string): string => {
  return `${TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const getUserTokensKey = (userId: number): string => {
  return `${USER_TOKEN_PREFIX}${userId}`;
};

export const addToBlacklist = async (
  token: string,
  userId: number,
  expiresInSeconds?: number
): Promise<void> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  const userTokensKey = getUserTokensKey(userId);
  
  const ttl = expiresInSeconds || DEFAULT_TOKEN_EXPIRY;
  
  await redis.set(blacklistKey, userId.toString(), 'EX', ttl);
  
  await redis.sadd(userTokensKey, tokenHash);
  await redis.expire(userTokensKey, ttl);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  
  const result = await redis.exists(blacklistKey);
  return result === 1;
};

export const invalidateAllUserTokens = async (
  userId: number
): Promise<number> => {
  const userTokensKey = getUserTokensKey(userId);
  
  const tokenHashes = await redis.smembers(userTokensKey);
  
  if (tokenHashes.length === 0) {
    return 0;
  }
  
  const blacklistKeys = tokenHashes.map(getBlacklistKey);
  
  const multi = redis.multi();
  
  for (const key of blacklistKeys) {
    multi.set(key, userId.toString(), 'EX', DEFAULT_TOKEN_EXPIRY);
  }
  
  multi.del(userTokensKey);
  
  await multi.exec();
  
  return tokenHashes.length;
};

export const getBlacklistStats = async (): Promise<{
  totalBlacklisted: number;
}> => {
  const keys = await redis.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
  return {
    totalBlacklisted: keys.length,
  };
};

export const cleanupExpiredBlacklist = async (): Promise<number> => {
  const keys = await redis.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
  let cleaned = 0;
  
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {
      await redis.del(key);
      cleaned++;
    }
  }
  
  return cleaned;
};
