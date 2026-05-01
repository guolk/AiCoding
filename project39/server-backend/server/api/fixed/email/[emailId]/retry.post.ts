import prisma from '../../plugins/prisma';
import { retryDeadLetter } from '../../utils/email-queue-fixed';
import { z } from 'zod';

const retryDeadLetterSchema = z.object({
  emailId: z.coerce.number().int().positive('邮件ID无效'),
});

export default defineEventHandler(async (event) => {
  const emailIdParam = getRouterParam(event, 'emailId');
  const validated = retryDeadLetterSchema.safeParse({ emailId: emailIdParam });
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '邮件ID无效',
    });
  }
  
  const emailId = validated.data.emailId;
  
  const success = await retryDeadLetter(emailId);
  
  if (!success) {
    throw createError({
      statusCode: 404,
      message: '邮件不存在或不在死信队列中',
    });
  }
  
  return {
    success: true,
    message: '邮件已重新加入发送队列',
  };
});
