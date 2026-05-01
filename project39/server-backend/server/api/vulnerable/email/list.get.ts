import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  const status = query.status as string | undefined;
  const page = parseInt(query.page as string || '1', 10);
  const pageSize = parseInt(query.pageSize as string || '20', 10);
  
  const where: Record<string, unknown> = {
    userId: user.userId,
  };
  
  if (status) {
    where.status = status;
  }
  
  const [emails, total] = await Promise.all([
    prisma.emailQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.emailQueue.count({ where }),
  ]);
  
  return {
    success: true,
    data: {
      items: emails,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
