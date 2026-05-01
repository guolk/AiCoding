import prisma from '../../plugins/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, extractTokenFromEvent, getTokenExpiry, addToBlacklist, invalidateAllUserTokens } from '../../utils/jwt-fixed';

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '旧密码不能为空'),
  newPassword: z.string().min(8, '新密码至少需要8个字符'),
  logoutAllDevices: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  const token = extractTokenFromEvent(event);
  
  const body = await readBody(event);
  const validated = changePasswordSchema.safeParse(body);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { oldPassword, newPassword, logoutAllDevices } = validated.data;
  
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!dbUser) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }
  
  const passwordValid = await bcrypt.compare(oldPassword, dbUser.password);
  
  if (!passwordValid) {
    throw createError({
      statusCode: 400,
      message: '旧密码错误',
    });
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  
  if (logoutAllDevices) {
    const invalidatedCount = await invalidateAllUserTokens(userId);
    
    return {
      success: true,
      message: `密码修改成功，已使 ${invalidatedCount} 个设备的令牌失效`,
    };
  }
  
  if (token) {
    const expirySeconds = getTokenExpiry(user);
    await addToBlacklist(token, userId, expirySeconds);
  }
  
  return {
    success: true,
    message: '密码修改成功，请重新登录',
  };
});
