import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: JwtPayload): string => {
  const config = useRuntimeConfig();
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const config = useRuntimeConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch {
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
  
  const payload = verifyToken(token);
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: '令牌无效或已过期',
    });
  }
  
  event.context.user = payload;
  return payload;
};
