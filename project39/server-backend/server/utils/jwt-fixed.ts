import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { isTokenBlacklisted } from './token-blacklist';

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const config = useRuntimeConfig();
  
  const tokenPayload = {
    ...payload,
    jti: crypto.randomUUID(),
  };
  
  return jwt.sign(tokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.warn('尝试使用已注销的令牌');
      return null;
    }
    
    const config = useRuntimeConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('令牌已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('令牌无效:', error.message);
    }
    return null;
  }
};

export const extractTokenFromEvent = (event: H3Event): string | null => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

export const requireAuth = async (event: H3Event): Promise<JwtPayload> => {
  const token = extractTokenFromEvent(event);
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: '未提供认证令牌',
    });
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: '令牌无效或已过期',
    });
  }
  
  event.context.user = payload;
  return payload;
};

export const getTokenExpiry = (payload: JwtPayload): number => {
  if (!payload.exp) {
    return 24 * 60 * 60;
  }
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
};
