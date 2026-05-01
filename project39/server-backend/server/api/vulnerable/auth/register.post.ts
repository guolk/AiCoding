import prisma from '../../plugins/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password } = body;
  
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数',
    });
  }
  
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });
  
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: '用户名或邮箱已存在',
    });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      status: 'active',
    },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });
  
  return {
    success: true,
    data: user,
    message: '注册成功',
  };
});
