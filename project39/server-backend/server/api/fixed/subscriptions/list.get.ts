import prisma from '../../plugins/prisma';
import { getCurrentUtcTime, isSubscriptionActive, getRemainingTime, formatDateTimeForUser } from '../../utils/timezone';
import { z } from 'zod';

const listSubscriptionsSchema = z.object({
  timezone: z.string().optional().default('Asia/Shanghai'),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const query = getQuery(event);
  const validated = listSubscriptionsSchema.safeParse(query);
  const timezone = validated.success ? validated.data.timezone : 'Asia/Shanghai';
  
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  const now = getCurrentUtcTime();
  
  const subscriptionsWithStatus = subscriptions.map((sub) => {
    const active = isSubscriptionActive(sub.endTime, now);
    const remaining = getRemainingTime(sub.endTime, now);
    
    return {
      ...sub,
      startTime: sub.startTime.toISOString(),
      endTime: sub.endTime.toISOString(),
      endTimeLocal: formatDateTimeForUser(sub.endTime, timezone),
      isCurrentlyActive: active,
      remainingTime: remaining,
    };
  });
  
  return {
    success: true,
    data: subscriptionsWithStatus,
    currentTimeUtc: now.toISOString(),
    timezone: timezone,
  };
});
