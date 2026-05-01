import prisma from '../../plugins/prisma';
import { processPendingEmails, getEmailQueueStats, retryDeadLetter } from '../../utils/email-queue-fixed';
import { z } from 'zod';

const listEmailsSchema = z.object({
  status: z.enum(['pending', 'sending', 'sent', 'dead']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  
  const validated = listEmailsSchema.safeParse(query);
  const { status, page, pageSize } = validated.success 
    ? validated.data 
    : { status: undefined, page: 1, pageSize: 20 };
  
  const where: Record<string, unknown> = {
    userId: user.userId,
  };
  
  if (status) {
    where.status = status;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [emails, total] = await Promise.all([
    prisma.emailQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.emailQueue.count({ where }),
  ]);
  
  const emailsWithIsoDates = emails.map((email) => ({
    ...email,
    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
    sentAt: email.sentAt?.toISOString(),
  }));
  
  return {
    success: true,
    data: {
      items: emailsWithIsoDates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
