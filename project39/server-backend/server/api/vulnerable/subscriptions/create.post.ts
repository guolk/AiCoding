import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const { planId, endTime } = await readBody(event);
  
  if (!planId || !endTime) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数',
    });
  }
  
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });
  
  if (!plan) {
    throw createError({
      statusCode: 404,
      message: '套餐不存在',
    });
  }
  
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      startTime: new Date(),
      endTime: new Date(endTime),
    },
    include: {
      plan: true,
    },
  });
  
  return {
    success: true,
    data: subscription,
    message: '订阅创建成功',
  };
});
