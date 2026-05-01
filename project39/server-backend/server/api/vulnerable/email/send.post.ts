import prisma from '../../plugins/prisma';
import { processEmailQueue } from '../../utils/email-queue-vulnerable';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  
  const { to, subject, content, contentType } = body;
  
  if (!to || !subject || !content) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数',
    });
  }
  
  const email = await prisma.emailQueue.create({
    data: {
      to,
      subject,
      content,
      contentType: contentType || 'text',
      status: 'pending',
      userId: user.userId,
    },
  });
  
  return {
    success: true,
    data: email,
    message: '邮件已加入发送队列',
  };
});

export async function startEmailWorker() {
  console.log('邮件队列工作线程已启动');
  
  setInterval(async () => {
    try {
      await processEmailQueue();
    } catch (error) {
      console.error('邮件队列处理错误:', error);
    }
  }, 60000);
}
