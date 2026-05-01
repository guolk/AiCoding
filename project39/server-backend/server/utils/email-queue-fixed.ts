import prisma from '../plugins/prisma';
import nodemailer from 'nodemailer';
import {
  MAX_RETRY_COUNT,
  classifyError,
  shouldRetry,
  calculateRetryDelay,
  getNextRetryTime,
  type EmailSendResult,
  type EmailStatus,
} from './email-config';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;
  
  const config = useRuntimeConfig();
  
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user && config.smtp.pass ? {
      user: config.smtp.user,
      pass: config.smtp.pass,
    } : undefined,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
    rateDelta: 1000,
    socketTimeout: 30000,
    connectionTimeout: 10000,
  });
  
  return transporter;
};

export const sendSingleEmail = async (
  to: string,
  subject: string,
  content: string,
  contentType: 'text' | 'html' = 'text'
): Promise<EmailSendResult> => {
  try {
    const transporter = getTransporter();
    const config = useRuntimeConfig();
    
    const mailOptions: nodemailer.SendMailOptions = {
      from: config.smtp.from,
      to,
      subject,
    };
    
    if (contentType === 'html') {
      mailOptions.html = content;
    } else {
      mailOptions.text = content;
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`邮件发送成功: ${info.messageId}`);
    
    return {
      success: true,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = classifyError(errorMessage);
    
    console.error(`邮件发送失败 [${errorType}]:`, errorMessage);
    
    return {
      success: false,
      errorType,
      errorMessage,
    };
  }
};

export const processEmailFromQueue = async (emailId: number): Promise<EmailSendResult> => {
  const email = await prisma.emailQueue.findUnique({
    where: { id: emailId },
  });
  
  if (!email) {
    return {
      success: false,
      errorType: 'permanent',
      errorMessage: '邮件记录不存在',
    };
  }
  
  if (email.status === 'sent') {
    return {
      success: true,
    };
  }
  
  if (email.status === 'dead') {
    return {
      success: false,
      errorType: 'permanent',
      errorMessage: '邮件已进入死信队列',
    };
  }
  
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: {
      status: 'sending',
    },
  });
  
  const result = await sendSingleEmail(
    email.to,
    email.subject,
    email.content,
    email.contentType as 'text' | 'html'
  );
  
  if (result.success) {
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        errorMessage: null,
      },
    });
    
    return result;
  }
  
  const newRetryCount = email.retryCount + 1;
  const canRetry = shouldRetry(newRetryCount, result.errorType || 'unknown');
  
  if (canRetry) {
    const nextRetryAt = getNextRetryTime(newRetryCount);
    const retryDelay = calculateRetryDelay(newRetryCount);
    
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'pending',
        retryCount: newRetryCount,
        errorMessage: result.errorMessage,
      },
    });
    
    return {
      ...result,
      shouldRetry: true,
      retryDelay,
    };
  }
  
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: {
      status: 'dead',
      retryCount: newRetryCount,
      errorMessage: result.errorMessage,
    },
  });
  
  console.warn(`邮件 ${emailId} 已进入死信队列，重试次数: ${newRetryCount}`);
  
  return {
    ...result,
    shouldRetry: false,
  };
};

export const processPendingEmails = async (batchSize: number = 10): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  dead: number;
}> => {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: batchSize,
  });
  
  let succeeded = 0;
  let failed = 0;
  let dead = 0;
  
  for (const email of pendingEmails) {
    try {
      const result = await processEmailFromQueue(email.id);
      
      if (result.success) {
        succeeded++;
      } else if (result.shouldRetry) {
        failed++;
      } else {
        dead++;
      }
    } catch (error: unknown) {
      console.error(`处理邮件 ${email.id} 时发生未知错误:`, error);
      failed++;
    }
  }
  
  return {
    processed: pendingEmails.length,
    succeeded,
    failed,
    dead,
  };
};

export const getEmailQueueStats = async (): Promise<{
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  dead: number;
  total: number;
}> => {
  const [pending, sending, sent, dead] = await Promise.all([
    prisma.emailQueue.count({ where: { status: 'pending' } }),
    prisma.emailQueue.count({ where: { status: 'sending' } }),
    prisma.emailQueue.count({ where: { status: 'sent' } }),
    prisma.emailQueue.count({ where: { status: 'dead' } }),
  ]);
  
  const total = pending + sending + sent + dead;
  
  return {
    pending,
    sending,
    sent,
    failed: 0,
    dead,
    total,
  };
};

export const retryDeadLetter = async (emailId: number): Promise<boolean> => {
  const email = await prisma.emailQueue.findUnique({
    where: { id: emailId },
  });
  
  if (!email || email.status !== 'dead') {
    return false;
  }
  
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: {
      status: 'pending',
      retryCount: 0,
      errorMessage: '手动重试',
    },
  });
  
  return true;
};
