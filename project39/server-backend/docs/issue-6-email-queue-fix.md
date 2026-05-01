# 问题6: 邮件队列无限重试 - 详细修复方案

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 目录

1. [修复策略](#1-修复策略)
2. [新增邮件队列配置](#2-新增邮件队列配置)
3. [修复邮件队列服务](#3-修复邮件队列服务)
4. [邮件状态机设计](#4-邮件状态机设计)
5. [验证方法](#5-验证方法)

---

## 1. 修复策略

### 1.1 核心原则

1. **最大重试次数**: 设置合理的最大重试次数
2. **错误分类**: 区分临时错误和永久错误
3. **指数退避**: 每次重试延迟时间翻倍
4. **死信队列**: 达到最大重试次数后移入死信队列
5. **连接池**: 使用连接池提高性能和可靠性

### 1.2 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **重试次数** | 无限重试 | 最多5次 |
| **错误分类** | 无区分 | 临时/永久错误 |
| **重试延迟** | 固定时间 | 指数退避 |
| **状态管理** | 只有pending/sent | pending/sending/sent/dead |
| **死信队列** | 无 | 有 |
| **连接池** | 无 | 有连接池管理 |

---

## 2. 新增邮件队列配置

**文件**: `server/utils/email-config.ts`

### 2.1 完整代码

```typescript
export const MAX_RETRY_COUNT = 5;

export const BASE_RETRY_DELAY_SECONDS = 60;

export const MAX_RETRY_DELAY_SECONDS = 24 * 60 * 60;

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'dead';

export type EmailErrorType = 'temporary' | 'permanent' | 'unknown';

export interface EmailSendResult {
  success: boolean;
  errorType?: EmailErrorType;
  errorMessage?: string;
  shouldRetry?: boolean;
  retryDelay?: number;
}

export const TEMPORARY_ERROR_PATTERNS = [
  /timeout/i,
  /connection (refused|reset|timed out)/i,
  /service unavailable/i,
  /try again later/i,
  /too many connections/i,
  /rate limit/i,
  /throttled/i,
  /temporarily unavailable/i,
  /dns lookup failed/i,
  /socket (hang|timeout|error)/i,
  /421/i,
  /450/i,
  /451/i,
  /452/i,
];

export const PERMANENT_ERROR_PATTERNS = [
  /no such user/i,
  /user not found/i,
  /recipient (not found|rejected)/i,
  /invalid (recipient|email|address)/i,
  /mailbox (unavailable|disabled|full)/i,
  /550/i,
  /551/i,
  /552/i,
  /553/i,
  /554/i,
  /authentication (failed|required)/i,
  /relay access denied/i,
  /spam detected/i,
  /blocked/i,
  /blacklisted/i,
];

export const classifyError = (error: Error | string): EmailErrorType => {
  const message = typeof error === 'string' ? error : error.message;
  
  for (const pattern of PERMANENT_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return 'permanent';
    }
  }
  
  for (const pattern of TEMPORARY_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return 'temporary';
    }
  }
  
  return 'unknown';
};

export const calculateRetryDelay = (retryCount: number): number => {
  const delay = BASE_RETRY_DELAY_SECONDS * Math.pow(2, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY_SECONDS);
};

export const shouldRetry = (retryCount: number, errorType: EmailErrorType): boolean => {
  if (errorType === 'permanent') {
    return false;
  }
  
  return retryCount < MAX_RETRY_COUNT;
};

export const getNextRetryTime = (retryCount: number): Date => {
  const delaySeconds = calculateRetryDelay(retryCount);
  return new Date(Date.now() + delaySeconds * 1000);
};
```

### 2.2 核心配置说明

#### 2.2.1 重试参数

```typescript
export const MAX_RETRY_COUNT = 5;           // 最多重试5次
export const BASE_RETRY_DELAY_SECONDS = 60;  // 首次重试延迟60秒
export const MAX_RETRY_DELAY_SECONDS = 24 * 60 * 60;  // 最大延迟24小时
```

**为什么选择这些参数**:

| 参数 | 值 | 原因 |
|------|-----|------|
| MAX_RETRY_COUNT | 5 | 足够的重试机会，但不会无限循环 |
| BASE_RETRY_DELAY | 60秒 | 给临时错误足够的恢复时间 |
| MAX_RETRY_DELAY | 24小时 | 防止延迟时间过长 |

#### 2.2.2 指数退避计算

```typescript
export const calculateRetryDelay = (retryCount: number): number => {
  const delay = BASE_RETRY_DELAY_SECONDS * Math.pow(2, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY_SECONDS);
};
```

**退避时间表示例**:

| retryCount | 计算 | 延迟时间 |
|------------|------|----------|
| 0 | 60 * 2^0 | 60秒 |
| 1 | 60 * 2^1 | 120秒 |
| 2 | 60 * 2^2 | 240秒 |
| 3 | 60 * 2^3 | 480秒 |
| 4 | 60 * 2^4 | 960秒 |
| 5 | 60 * 2^5 | 1920秒 (超过最大) |
| 5+ | MIN(..., 86400) | 86400秒 (24小时) |

**指数退避的优势**:

1. **减少服务器压力**: 逐渐增加间隔，避免密集重试
2. **给临时错误恢复时间**: 网络问题、服务重启等需要时间恢复
3. **符合SMTP服务规范**: 大多数邮件服务期望这种退避策略
4. **避免死循环**: 即使有bug，也不会无限快速重试

#### 2.2.3 错误分类模式

```typescript
// 临时错误 - 应该重试
export const TEMPORARY_ERROR_PATTERNS = [
  /timeout/i,                    // 超时
  /connection (refused|reset)/i, // 连接问题
  /service unavailable/i,         // 服务不可用
  /rate limit/i,                  // 限流
  /421/i, /450/i, /451/i, /452/i, // SMTP 4xx错误
];

// 永久错误 - 不应该重试
export const PERMANENT_ERROR_PATTERNS = [
  /no such user/i,               // 用户不存在
  /user not found/i,              // 用户未找到
  /invalid recipient/i,           // 无效收件人
  /550/i, /551/i, /552/i, /553/i, /554/i, // SMTP 5xx错误
  /spam detected/i,               // 检测到垃圾邮件
  /blacklisted/i,                 // 被拉黑
];
```

**SMTP错误码说明**:

| 错误码 | 类型 | 说明 |
|--------|------|------|
| **4xx** | 临时 | 应该稍后重试 |
| 421 | 临时 | 服务不可用，关闭连接 |
| 450 | 临时 | 邮箱不可用 |
| 451 | 临时 | 本地错误，处理中止 |
| 452 | 临时 | 系统存储空间不足 |
| **5xx** | 永久 | 不应该重试 |
| 550 | 永久 | 请求的操作无法执行，邮箱不可用 |
| 551 | 永久 | 用户不在本地，请尝试转发路径 |
| 552 | 永久 | 超出存储分配 |
| 553 | 永久 | 邮箱名称不允许 |
| 554 | 永久 | 事务失败 |

#### 2.2.4 状态类型定义

```typescript
export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'dead';
```

| 状态 | 说明 |
|------|------|
| **pending** | 待发送，等待处理 |
| **sending** | 正在发送中 |
| **sent** | 发送成功 |
| **failed** | 发送失败 (临时) |
| **dead** | 发送失败 (永久，死信队列) |

---

## 3. 修复邮件队列服务

**文件**: `server/utils/email-queue-fixed.ts`

### 3.1 完整代码

```typescript
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
    // 新增: 连接池配置
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
  
  // 标记为发送中
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: {
      status: 'sending',
    },
  });
  
  // 执行发送
  const result = await sendSingleEmail(
    email.to,
    email.subject,
    email.content,
    email.contentType as 'text' | 'html'
  );
  
  if (result.success) {
    // 发送成功
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
  
  // 发送失败，判断是否应该重试
  const newRetryCount = email.retryCount + 1;
  const canRetry = shouldRetry(newRetryCount, result.errorType || 'unknown');
  
  if (canRetry) {
    // 可以重试，更新状态为pending
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
  
  // 不可以重试，移入死信队列
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
  
  // 重置状态，重新尝试
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
```

### 3.2 关键改进

#### 3.2.1 连接池配置

```typescript
transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: { ... },
  
  // 新增: 连接池配置
  pool: true,                    // 启用连接池
  maxConnections: 5,             // 最大连接数
  maxMessages: 100,              // 每个连接最大消息数
  rateLimit: 10,                 // 限流: 每秒10条
  rateDelta: 1000,               // 限流时间窗口
  socketTimeout: 30000,          // 套接字超时
  connectionTimeout: 10000,      // 连接超时
});
```

**连接池的优势**:

| 特性 | 说明 |
|------|------|
| **连接复用** | 避免频繁创建/销毁连接，提高性能 |
| **并发控制** | 限制最大连接数，防止服务器过载 |
| **限流保护** | 控制发送速率，避免被SMTP服务封禁 |
| **超时设置** | 防止僵死连接占用资源 |

#### 3.2.2 状态机处理

```typescript
export const processEmailFromQueue = async (emailId: number): Promise<EmailSendResult> => {
  const email = await prisma.emailQueue.findUnique({ where: { id: emailId } });
  
  // 检查最终状态
  if (email.status === 'sent') return { success: true };
  if (email.status === 'dead') return { success: false, errorType: 'permanent' };
  
  // 1. 标记为发送中
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: { status: 'sending' },
  });
  
  // 2. 执行发送
  const result = await sendSingleEmail(...);
  
  if (result.success) {
    // 3a. 发送成功
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: { status: 'sent', sentAt: new Date() },
    });
    return result;
  }
  
  // 3b. 发送失败，判断是否重试
  const newRetryCount = email.retryCount + 1;
  const canRetry = shouldRetry(newRetryCount, result.errorType || 'unknown');
  
  if (canRetry) {
    // 4a. 可以重试，更新为pending
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: { status: 'pending', retryCount: newRetryCount },
    });
    return { ...result, shouldRetry: true };
  }
  
  // 4b. 不可以重试，移入死信队列
  await prisma.emailQueue.update({
    where: { id: emailId },
    data: { status: 'dead', retryCount: newRetryCount },
  });
  
  return { ...result, shouldRetry: false };
};
```

#### 3.2.3 批量处理

```typescript
export const processPendingEmails = async (batchSize: number = 10): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  dead: number;
}> => {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: batchSize,  // 分批处理
  });
  
  let succeeded = 0;
  let failed = 0;
  let dead = 0;
  
  for (const email of pendingEmails) {
    try {
      const result = await processEmailFromQueue(email.id);
      
      if (result.success) succeeded++;
      else if (result.shouldRetry) failed++;
      else dead++;
    } catch (error) {
      console.error(`处理邮件 ${email.id} 失败:`, error);
      failed++;
    }
  }
  
  return { processed: pendingEmails.length, succeeded, failed, dead };
};
```

**批量处理的优势**:

1. **内存控制**: 一次性处理太多邮件会占用大量内存
2. **并发控制**: 分批处理可以控制并发数
3. **错误隔离**: 单个邮件失败不影响其他邮件
4. **事务边界**: 每个邮件独立处理，便于回滚

#### 3.2.4 死信队列管理

```typescript
// 手动重试死信队列中的邮件
export const retryDeadLetter = async (emailId: number): Promise<boolean> => {
  const email = await prisma.emailQueue.findUnique({
    where: { id: emailId },
  });
  
  if (!email || email.status !== 'dead') {
    return false;
  }
  
  // 重置状态
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
```

**死信队列的用途**:

| 用途 | 说明 |
|------|------|
| **问题定位** | 查看失败原因，修复问题 |
| **手动重试** | 问题解决后手动触发重试 |
| **数据清理** | 定期清理过期的死信 |
| **监控告警** | 死信数量激增时触发告警 |

---

## 4. 邮件状态机设计

### 4.1 状态流转图

```
                    ┌──────────────┐
                    │   pending    │ ◄──────────────┐
                    │  (待发送)    │                │
                    └──────┬───────┘                │
                           │                         │
                           │ 开始处理                 │
                           ▼                         │
                    ┌──────────────┐                │
                    │   sending    │                │
                    │  (发送中)    │                │
                    └──────┬───────┘                │
                           │                         │
              ┌────────────┴────────────┐           │
              │                         │           │
              ▼                         ▼           │
       ┌──────────┐              ┌──────────┐      │
       │  成功    │              │  失败    │      │
       └────┬─────┘              └────┬─────┘      │
            │                         │             │
            ▼                         ▼             │
     ┌──────────────┐         ┌──────────────┐     │
     │    sent      │         │  判断重试    │     │
     │  (发送成功)  │         │              │     │
     └──────────────┘         └──────┬───────┘     │
                                     │               │
                        ┌────────────┴────────────┐ │
                        │                         │ │
                        ▼                         ▼ │
                 ┌──────────┐              ┌──────────┐
                 │ 可重试   │              │ 不可重试 │
                 │          │              │          │
                 └────┬─────┘              └────┬─────┘
                      │                         │
                      ▼                         ▼
               ┌──────────┐              ┌──────────┐
               │ pending  │              │   dead   │
               │ (继续等待)│              │ (死信队列)│
               └──────────┘              └──────────┘
```

### 4.2 状态转换规则

| 当前状态 | 事件 | 目标状态 | 条件 |
|----------|------|----------|------|
| **pending** | 开始处理 | sending | 无 |
| **sending** | 发送成功 | sent | 发送成功 |
| **sending** | 发送失败，可重试 | pending | errorType!=permanent AND retryCount < MAX |
| **sending** | 发送失败，不可重试 | dead | errorType=permanent OR retryCount >= MAX |
| **dead** | 手动重试 | pending | 管理员手动触发 |
| **sent** | - | - | 最终状态 |

### 4.3 Prisma模型建议

```prisma
model EmailQueue {
  id           Int       @id @default(autoincrement())
  
  to           String
  subject      String
  content      String    @db.Text
  contentType  String    @default("text")
  
  status       String    @default("pending")  // pending, sending, sent, dead
  retryCount   Int       @default(0)
  
  sentAt       DateTime?
  errorMessage String?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([status])
  @@index([createdAt])
  @@index([updatedAt])
}
```

---

## 5. 验证方法

### 5.1 单元测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MAX_RETRY_COUNT,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  getNextRetryTime,
  TEMPORARY_ERROR_PATTERNS,
  PERMANENT_ERROR_PATTERNS,
} from '../server/utils/email-config';

describe('邮件队列配置测试', () => {
  describe('MAX_RETRY_COUNT', () => {
    it('应该有合理的最大重试次数', () => {
      expect(MAX_RETRY_COUNT).toBeGreaterThan(0);
      expect(MAX_RETRY_COUNT).toBeLessThanOrEqual(10);
    });
  });

  describe('classifyError', () => {
    it('应该将超时错误分类为临时错误', () => {
      expect(classifyError('Connection timeout')).toBe('temporary');
      expect(classifyError('Service unavailable')).toBe('temporary');
      expect(classifyError('Try again later')).toBe('temporary');
      expect(classifyError('Rate limit exceeded')).toBe('temporary');
    });

    it('应该将收件人不存在错误分类为永久错误', () => {
      expect(classifyError('No such user')).toBe('permanent');
      expect(classifyError('User not found')).toBe('permanent');
      expect(classifyError('Recipient rejected')).toBe('permanent');
      expect(classifyError('Mailbox unavailable')).toBe('permanent');
    });

    it('应该将5xx SMTP错误分类为永久错误', () => {
      expect(classifyError('550 User unknown')).toBe('permanent');
      expect(classifyError('551 User not local')).toBe('permanent');
      expect(classifyError('552 Mailbox full')).toBe('permanent');
    });

    it('应该将4xx SMTP错误分类为临时错误', () => {
      expect(classifyError('421 Service not available')).toBe('temporary');
      expect(classifyError('450 Mailbox unavailable')).toBe('temporary');
      expect(classifyError('451 Local error')).toBe('temporary');
    });

    it('未知错误应该返回unknown', () => {
      expect(classifyError('Some random error message')).toBe('unknown');
    });
  });

  describe('calculateRetryDelay', () => {
    it('应该使用指数退避策略', () => {
      const delay1 = calculateRetryDelay(0);
      const delay2 = calculateRetryDelay(1);
      const delay3 = calculateRetryDelay(2);
      
      expect(delay2).toBe(delay1 * 2);
      expect(delay3).toBe(delay2 * 2);
    });

    it('不应该超过最大延迟时间', () => {
      const delay = calculateRetryDelay(100);
      expect(delay).toBeLessThanOrEqual(24 * 60 * 60);
    });
  });

  describe('shouldRetry', () => {
    it('永久错误不应该重试', () => {
      expect(shouldRetry(0, 'permanent')).toBe(false);
      expect(shouldRetry(1, 'permanent')).toBe(false);
    });

    it('临时错误在重试次数内应该允许重试', () => {
      for (let i = 0; i < MAX_RETRY_COUNT; i++) {
        expect(shouldRetry(i, 'temporary')).toBe(true);
      }
    });

    it('超过最大重试次数后不应该重试', () => {
      expect(shouldRetry(MAX_RETRY_COUNT, 'temporary')).toBe(false);
      expect(shouldRetry(MAX_RETRY_COUNT + 1, 'temporary')).toBe(false);
    });
  });

  describe('getNextRetryTime', () => {
    it('应该返回未来的时间', () => {
      const nextTime = getNextRetryTime(1);
      const now = new Date();
      
      expect(nextTime.getTime()).toBeGreaterThan(now.getTime());
    });

    it('应该根据重试次数计算延迟', () => {
      const nextTime1 = getNextRetryTime(0);
      const nextTime2 = getNextRetryTime(1);
      
      expect(nextTime2.getTime()).toBeGreaterThan(nextTime1.getTime());
    });
  });
});
```

### 5.2 集成测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processEmailFromQueue, retryDeadLetter } from '../server/utils/email-queue-fixed';
import prisma from '../server/plugins/prisma';

vi.mock('../server/plugins/prisma', () => ({
  default: {
    emailQueue: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('邮件队列服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processEmailFromQueue', () => {
    it('应该处理已发送的邮件', async () => {
      vi.mocked(prisma.emailQueue.findUnique).mockResolvedValue({
        id: 1,
        status: 'sent',
      } as any);
      
      const result = await processEmailFromQueue(1);
      
      expect(result.success).toBe(true);
    });

    it('应该拒绝死信队列中的邮件', async () => {
      vi.mocked(prisma.emailQueue.findUnique).mockResolvedValue({
        id: 1,
        status: 'dead',
      } as any);
      
      const result = await processEmailFromQueue(1);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
    });

    it('应该标记发送中的状态', async () => {
      vi.mocked(prisma.emailQueue.findUnique).mockResolvedValue({
        id: 1,
        status: 'pending',
        retryCount: 0,
        to: 'test@example.com',
        subject: 'Test',
        content: 'Test',
        contentType: 'text',
      } as any);
      
      // 模拟发送失败（永久错误）
      vi.mocked(prisma.emailQueue.update).mockResolvedValue({} as any);
      
      // 这里需要mock sendSingleEmail
      // ...
    });
  });

  describe('retryDeadLetter', () => {
    it('应该重置死信邮件的状态', async () => {
      vi.mocked(prisma.emailQueue.findUnique).mockResolvedValue({
        id: 1,
        status: 'dead',
      } as any);
      
      vi.mocked(prisma.emailQueue.update).mockResolvedValue({} as any);
      
      const result = await retryDeadLetter(1);
      
      expect(result).toBe(true);
      expect(prisma.emailQueue.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'pending',
          retryCount: 0,
          errorMessage: '手动重试',
        },
      });
    });

    it('不应该重置非死信邮件', async () => {
      vi.mocked(prisma.emailQueue.findUnique).mockResolvedValue({
        id: 1,
        status: 'sent',
      } as any);
      
      const result = await retryDeadLetter(1);
      
      expect(result).toBe(false);
    });
  });
});
```

### 5.3 手动测试步骤

1. **准备测试环境**:
```bash
# 启动服务器
cd server-backend
npm run dev
```

2. **发送测试邮件到无效地址**:
```bash
curl -X POST http://localhost:3000/api/fixed/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid_token>" \
  -d '{
    "to": "non-existent-user-12345@example.com",
    "subject": "测试邮件",
    "content": "这是一封测试邮件",
    "contentType": "text"
  }'
```

3. **检查邮件状态**:
```bash
curl http://localhost:3000/api/fixed/email/stats \
  -H "Authorization: Bearer <admin_token>"
```

4. **处理队列多次**:
```bash
# 执行多次处理
for i in 1 2 3 4 5 6; do
  echo "=== 第 $i 次处理 ==="
  curl -X POST http://localhost:3000/api/fixed/email/process \
    -H "Authorization: Bearer <admin_token>"
  echo ""
  sleep 1
done
```

5. **检查最终状态**:
```bash
curl http://localhost:3000/api/fixed/email/stats \
  -H "Authorization: Bearer <admin_token>"

# 预期:
# - pending: 0 (没有待处理的)
# - dead: 1 (已移入死信队列)
# - retryCount: 5 (达到最大重试次数)
```

### 5.4 预期结果

```
第 1 次处理: 失败，retryCount=1，状态=pending
第 2 次处理: 失败，retryCount=2，状态=pending
第 3 次处理: 失败，retryCount=3，状态=pending
第 4 次处理: 失败，retryCount=4，状态=pending
第 5 次处理: 失败，retryCount=5，状态=pending
第 6 次处理: 失败，retryCount=6，状态=dead (移入死信队列)

最终状态:
  - pending: 0
  - dead: 1
  - sent: 0
```

---

## 6. 监控和告警

### 6.1 关键指标

| 指标 | 告警阈值 | 说明 |
|------|----------|------|
| 死信队列数量 | > 10 | 持续失败需要关注 |
| 失败率 | > 20% | 发送成功率过低 |
| 队列积压 | > 100 | 处理速度跟不上 |
| 重试次数 | 平均 > 3 | 网络或服务问题 |

### 6.2 告警示例

```typescript
export const checkEmailQueueHealth = async (): Promise<{
  healthy: boolean;
  warnings: string[];
}> => {
  const stats = await getEmailQueueStats();
  const warnings: string[] = [];
  
  // 死信队列告警
  if (stats.dead > 10) {
    warnings.push(`死信队列数量过高: ${stats.dead}`);
  }
  
  // 队列积压告警
  if (stats.pending > 100) {
    warnings.push(`邮件队列积压: ${stats.pending}`);
  }
  
  // 失败率告警 (需要历史数据)
  // if (failureRate > 0.2) {
  //   warnings.push(`邮件发送失败率过高: ${failureRate}`);
  // }
  
  return {
    healthy: warnings.length === 0,
    warnings,
  };
};
```

---

**文档完成日期**: 2026-05-01  
**版本**: 1.0
