import prisma from '../../plugins/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;
  
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: '用户名和密码不能为空',
    });
  }
  
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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
      },
    },
    message: '登录成功',
  };
});
