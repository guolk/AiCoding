import prisma from '../../plugins/prisma';
import { processPendingEmails, getEmailQueueStats, retryDeadLetter } from '../../utils/email-queue-fixed';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.string().email('请输入有效的邮箱地址'),
  subject: z.string().min(1, '邮件主题不能为空').max(255, '邮件主题不能超过255个字符'),
  content: z.string().min(1, '邮件内容不能为空'),
  contentType: z.enum(['text', 'html']).default('text'),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  
  const validated = sendEmailSchema.safeParse(body);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { to, subject, content, contentType } = validated.data;
  
  const email = await prisma.emailQueue.create({
    data: {
      to,
      subject,
      content,
      contentType,
      status: 'pending',
      userId: user.userId,
    },
  });
  
  return {
    success: true,
    data: {
      id: email.id,
      to: email.to,
      subject: email.subject,
      status: email.status,
      createdAt: email.createdAt.toISOString(),
    },
    message: '邮件已加入发送队列',
  };
});
