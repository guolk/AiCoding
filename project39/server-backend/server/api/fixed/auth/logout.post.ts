import { extractTokenFromEvent, getTokenExpiry, addToBlacklist } from '../../utils/jwt-fixed';
import { logSecurityEvent } from '../../utils/search-utils';

export default defineEventHandler(async (event) => {
  const token = extractTokenFromEvent(event);
  const clientIp = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip');
  
  if (!token) {
    return {
      success: true,
      message: '注销成功（未提供令牌）',
    };
  }
  
  try {
    const { verifyToken } = await import('../../utils/jwt-fixed');
    const payload = await verifyToken(token);
    
    if (payload) {
      const expirySeconds = getTokenExpiry(payload);
      
      await addToBlacklist(token, payload.userId, expirySeconds);
      
      logSecurityEvent(
        'USER_LOGOUT',
        {
          userId: payload.userId,
          username: payload.username,
          tokenExpiryRemaining: expirySeconds,
        },
        clientIp
      );
    }
    
    return {
      success: true,
      message: '注销成功',
    };
  } catch (error: unknown) {
    console.error('注销处理错误:', error);
    
    return {
      success: true,
      message: '注销成功',
    };
  }
});
