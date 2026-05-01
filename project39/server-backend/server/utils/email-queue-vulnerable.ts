import prisma from '../../plugins/prisma';
import nodemailer from 'nodemailer';

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
  });
  
  return transporter;
};

export const sendEmail = async (emailId: number): Promise<void> => {
  const email = await prisma.emailQueue.findUnique({
    where: { id: emailId },
  });
  
  if (!email) {
    throw new Error('邮件不存在');
  }
  
  if (email.status === 'sent') {
    return;
  }
  
  try {
    const transporter = getTransporter();
    const config = useRuntimeConfig();
    
    await transporter.sendMail({
      from: config.smtp.from,
      to: email.to,
      subject: email.subject,
      text: email.contentType === 'text' ? email.content : undefined,
      html: email.contentType === 'html' ? email.content : undefined,
    });
    
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
    
    console.log(`邮件 ${emailId} 发送成功`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`邮件 ${emailId} 发送失败，准备重试:`, errorMessage);
    
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'pending',
        retryCount: email.retryCount + 1,
        errorMessage,
      },
    });
    
    throw error;
  }
};

export const processEmailQueue = async (): Promise<void> => {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  console.log(`发现 ${pendingEmails.length} 封待发送邮件`);
  
  for (const email of pendingEmails) {
    try {
      await sendEmail(email.id);
    } catch (error: unknown) {
      console.error(`处理邮件 ${email.id} 失败，将在下次轮询中重试`);
    }
  }
};
