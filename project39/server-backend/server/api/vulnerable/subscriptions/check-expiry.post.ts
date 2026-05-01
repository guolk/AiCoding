import prisma from '../../plugins/prisma';

export default defineEventHandler(async () => {
  const now = new Date();
  
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      endTime: {
        lte: now,
      },
    },
  });
  
  if (expiredSubscriptions.length > 0) {
    await prisma.subscription.updateMany({
      where: {
        id: {
          in: expiredSubscriptions.map((s) => s.id),
        },
      },
      data: {
        status: 'expired',
      },
    });
  }
  
  return {
    success: true,
    processed: expiredSubscriptions.length,
    message: `已处理 ${expiredSubscriptions.length} 个过期订阅`,
  };
});
