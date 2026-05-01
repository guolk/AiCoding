import prisma from '../../plugins/prisma';
import { parseDateTime, getCurrentUtcTime, calculateSubscriptionEndTime } from '../../utils/timezone';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  planId: z.number().int().positive('套餐ID必须是正整数'),
  endTime: z.string().optional(),
  timezone: z.string().optional().default('Asia/Shanghai'),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const body = await readBody(event);
  
  const validated = createSubscriptionSchema.safeParse(body);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { planId, endTime, timezone } = validated.data;
  
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });
  
  if (!plan) {
    throw createError({
      statusCode: 404,
      message: '套餐不存在',
    });
  }
  
  const now = getCurrentUtcTime();
  let subscriptionEndTime: Date;
  
  if (endTime) {
    const parsedEndTime = parseDateTime(endTime, timezone);
    
    if (!parsedEndTime) {
      throw createError({
        statusCode: 400,
        message: '到期时间格式无效',
      });
    }
    
    if (parsedEndTime <= now) {
      throw createError({
        statusCode: 400,
        message: '到期时间必须晚于当前时间',
      });
    }
    
    subscriptionEndTime = parsedEndTime;
  } else {
    subscriptionEndTime = calculateSubscriptionEndTime(now, plan.durationDays, timezone);
  }
  
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      startTime: now,
      endTime: subscriptionEndTime,
    },
    include: {
      plan: true,
    },
  });
  
  return {
    success: true,
    data: {
      ...subscription,
      startTime: subscription.startTime.toISOString(),
      endTime: subscription.endTime.toISOString(),
      timezoneUsed: timezone,
    },
    message: '订阅创建成功',
  };
});
