import { processPendingEmails, getEmailQueueStats, retryDeadLetter } from '../../utils/email-queue-fixed';
import { z } from 'zod';

const processQueueSchema = z.object({
  batchSize: z.coerce.number().int().positive().max(100).default(10),
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validated = processQueueSchema.safeParse(query);
  const batchSize = validated.success ? validated.data.batchSize : 10;
  
  const result = await processPendingEmails(batchSize);
  
  return {
    success: true,
    data: result,
    message: `已处理 ${result.processed} 封邮件`,
  };
});
