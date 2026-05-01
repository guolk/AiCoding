import prisma from '../../plugins/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, getTokenExpiry, addToBlacklist, invalidateAllUserTokens } from '../../utils/jwt-fixed';
import type { JwtPayload } from '../../utils/jwt-fixed';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const validated = loginSchema.safeParse(body);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { username, password } = validated.data;
  
  const user = await prisma.user.findUnique({
    where: { username },
  });
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误',
    });
  }
  
  const passwordValid = await bcrypt.compare(password, user.password);
  
  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误',
    });
  }
  
  if (user.status !== 'active') {
    throw createError({
      statusCode: 403,
      message: '账户已被禁用',
    });
  }
  
  const token = generateToken({
    userId: user.id,
    username: user.username,
    email: user.email,
  });
  
  return {
    success: true,
    data: {
      token,
      tokenType: 'Bearer',
      expiresIn: 24 * 60 * 60,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    },
    message: '登录成功',
  };
});
