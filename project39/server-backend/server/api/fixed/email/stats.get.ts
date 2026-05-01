import { getEmailQueueStats } from '../../utils/email-queue-fixed';

export default defineEventHandler(async () => {
  const stats = await getEmailQueueStats();
  
  return {
    success: true,
    data: stats,
  };
});
