import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  const now = new Date();
  
  const subscriptionsWithStatus = subscriptions.map((sub) => {
    const isActive = sub.status === 'active' && sub.endTime > now;
    
    return {
      ...sub,
      isCurrentlyActive: isActive,
      remainingTime: isActive 
        ? Math.max(0, sub.endTime.getTime() - now.getTime()) 
        : 0,
    };
  });
  
  return {
    success: true,
    data: subscriptionsWithStatus,
  };
});
