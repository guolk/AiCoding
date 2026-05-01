# 漏洞修复方案详细说明

**文档版本**: 1.0  
**创建日期**: 2026-05-01  
**目标系统**: 内容订阅平台 (Nuxt3 + Prisma + MySQL)

---

## 目录

1. [问题1: 订阅到期时间的时区处理错误](#1-问题1-订阅到期时间的时区处理错误)
2. [问题2: 文章点赞数高并发一致性问题](#2-问题2-文章点赞数高并发一致性问题)
3. [问题3: 图片上传任意文件上传漏洞](#3-问题3-图片上传任意文件上传漏洞)
4. [问题4: 搜索功能SQL注入漏洞](#4-问题4-搜索功能sql注入漏洞)
5. [问题5: 用户注销后JWT仍然有效](#5-问题5-用户注销后jwt仍然有效)
6. [问题6: 邮件发送队列无限重试](#6-问题6-邮件发送队列无限重试)

---

## 1. 问题1: 订阅到期时间的时区处理错误

### 1.1 修复策略

**核心原则**:
1. **统一使用UTC时间存储**: 所有时间在数据库中存储为UTC时间
2. **时区感知的时间解析**: 解析用户输入时考虑用户的时区
3. **始终使用UTC比较**: 所有时间比较操作都使用UTC时间
4. **前端友好的展示**: 向用户展示时转换为用户所在时区

### 1.2 修复方案详解

#### 1.2.1 新增工具类: `server/utils/timezone.ts`

**功能概述**:
- 提供时区感知的时间解析和格式化
- 统一使用UTC作为内部时间表示
- 支持多时区用户

**核心函数**:

**1. `parseDateTime()` - 时区感知的时间解析**

```typescript
export const parseDateTime = (
  dateStr: string,
  timezone: string = DEFAULT_TIMEZONE
): Date | null => {
  if (!dateStr) return null;
  
  let parsedDate: Date | null = null;
  
  // 情况1: 已经是UTC时间（有Z后缀）
  if (dateStr.endsWith('Z')) {
    parsedDate = parseISO(dateStr);
  }
  // 情况2: 有时区偏移（如 +08:00）
  else if (dateStr.includes('+') || dateStr.includes('-') && dateStr.length > 10) {
    parsedDate = parseISO(dateStr);
  }
  // 情况3: 无时区信息，使用用户时区解析
  else {
    parsedDate = zonedTimeToUtc(dateStr, timezone);
  }
  
  if (!parsedDate || !isValid(parsedDate)) {
    return null;
  }
  
  return parsedDate;
};
```

**处理逻辑**:

| 输入格式 | 处理方式 | 示例 |
|----------|----------|------|
| 带Z后缀 | 直接解析为UTC | `"2024-12-31T15:59:59Z"` → UTC 15:59:59 |
| 带时区偏移 | 解析偏移后转换为UTC | `"2024-12-31T23:59:59+08:00"` → UTC 15:59:59 |
| 无时区信息 | 使用用户时区解析 | `"2024-12-31 23:59:59"` (Asia/Shanghai) → UTC 15:59:59 |

**2. `formatDateTimeForUser()` - 用户时区的时间展示**

```typescript
export const formatDateTimeForUser = (
  date: Date,
  timezone: string = DEFAULT_TIMEZONE,
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string => {
  return formatInTimeZone(date, timezone, format);
};
```

**使用场景**:
- 向用户展示时间时，转换为用户所在时区
- 例如：数据库存储UTC 15:59:59，北京用户看到23:59:59

**3. `isSubscriptionActive()` - 统一使用UTC比较**

```typescript
export const isSubscriptionActive = (
  endTime: Date,
  currentTime: Date = getCurrentUtcTime()
): boolean => {
  return endTime > currentTime;
};

export const getCurrentUtcTime = (): Date => {
  return new Date();  // JavaScript Date内部就是UTC
};
```

**关键点**:
- 始终使用UTC时间进行比较
- `getCurrentUtcTime()`明确获取当前UTC时间
- 避免依赖服务器本地时间

**4. `calculateSubscriptionEndTime()` - 套餐到期时间计算**

```typescript
export const calculateSubscriptionEndTime = (
  startTime: Date,
  durationDays: number,
  timezone: string = DEFAULT_TIMEZONE
): Date => {
  // 将UTC开始时间转换为用户时区
  const startInUserTimezone = utcToZonedTime(startTime, timezone);
  
  // 在用户时区计算结束时间（当天结束）
  const endInUserTimezone = endOfDay(addDays(startInUserTimezone, durationDays));
  
  // 转换回UTC存储
  return zonedTimeToUtc(endInUserTimezone, timezone);
};
```

**计算逻辑**:

假设:
- 开始时间: UTC 2024-01-01 08:00:00 (北京时间 16:00:00)
- 套餐时长: 30天
- 用户时区: Asia/Shanghai (UTC+8)

计算过程:
1. UTC → 用户时区: `2024-01-01 08:00:00 UTC` → `2024-01-01 16:00:00 北京`
2. +30天: `2024-01-31 16:00:00 北京`
3. 当天结束: `2024-01-31 23:59:59.999 北京`
4. 用户时区 → UTC: `2024-01-31 15:59:59.999 UTC`

结果:
- 用户看到: 2024-01-31 23:59:59 到期
- 实际存储: 2024-01-31 15:59:59 UTC
- 比较时: 使用UTC时间，正确判断是否过期

#### 1.2.2 修复订阅创建API: `server/api/fixed/subscriptions/create.post.ts`

**新增参数**:
- `timezone`: 用户时区，默认为 `Asia/Shanghai`

**验证逻辑**:

```typescript
const createSubscriptionSchema = z.object({
  planId: z.number().int().positive('套餐ID必须是正整数'),
  endTime: z.string().optional(),
  timezone: z.string().optional().default('Asia/Shanghai'),
});
```

**时间处理**:

```typescript
const now = getCurrentUtcTime();
let subscriptionEndTime: Date;

if (endTime) {
  // 解析用户传入的时间（考虑时区）
  const parsedEndTime = parseDateTime(endTime, timezone);
  
  if (!parsedEndTime) {
    throw createError({
      statusCode: 400,
      message: '到期时间格式无效',
    });
  }
  
  // 验证：到期时间必须晚于当前时间
  if (parsedEndTime <= now) {
    throw createError({
      statusCode: 400,
      message: '到期时间必须晚于当前时间',
    });
  }
  
  subscriptionEndTime = parsedEndTime;
} else {
  // 根据套餐时长计算到期时间
  subscriptionEndTime = calculateSubscriptionEndTime(now, plan.durationDays, timezone);
}
```

**返回信息**:

```typescript
return {
  success: true,
  data: {
    ...subscription,
    startTime: subscription.startTime.toISOString(),  // UTC时间
    endTime: subscription.endTime.toISOString(),      // UTC时间
    timezoneUsed: timezone,                            // 使用的时区
  },
  message: '订阅创建成功',
};
```

#### 1.2.3 修复订阅列表API: `server/api/fixed/subscriptions/list.get.ts`

**新增参数**:
- `timezone`: 用于格式化展示时间

**状态判断**:

```typescript
const now = getCurrentUtcTime();

const subscriptionsWithStatus = subscriptions.map((sub) => {
  // 使用UTC时间判断状态
  const active = isSubscriptionActive(sub.endTime, now);
  const remaining = getRemainingTime(sub.endTime, now);
  
  return {
    ...sub,
    startTime: sub.startTime.toISOString(),
    endTime: sub.endTime.toISOString(),
    endTimeLocal: formatDateTimeForUser(sub.endTime, timezone),  // 用户时区的展示
    isCurrentlyActive: active,
    remainingTime: remaining,
  };
});
```

**返回信息**:

```typescript
return {
  success: true,
  data: subscriptionsWithStatus,
  currentTimeUtc: now.toISOString(),  // 当前UTC时间（用于调试）
  timezone: timezone,                  // 使用的时区
};
```

#### 1.2.4 修复过期检查API: `server/api/fixed/subscriptions/check-expiry.post.ts`

**核心逻辑**:

```typescript
export default defineEventHandler(async () => {
  // 始终使用UTC时间
  const now = getCurrentUtcTime();
  
  // 查询条件使用UTC时间
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      endTime: {
        lte: now,  // UTC时间比较
      },
    },
  });
  
  // 更新过期订阅状态
  if (expiredSubscriptions.length > 0) {
    await prisma.subscription.updateMany({
      where: {
        id: {
          in: expiredSubscriptions.map((s) => s.id),
        },
      },
      data: {
        status: 'expired',
      },
    });
  }
  
  return {
    success: true,
    processed: expiredSubscriptions.length,
    currentTimeUtc: now.toISOString(),  // 返回处理时间（UTC）
    message: `已处理 ${expiredSubscriptions.length} 个过期订阅`,
  };
});
```

### 1.3 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **时间存储** | 依赖服务器时区解析 | 统一使用UTC时间 |
| **时间解析** | `new Date()`行为不确定 | `parseDateTime()`时区感知 |
| **时间比较** | 使用服务器本地时间 | 始终使用UTC时间 |
| **用户体验** | 多时区用户体验不一致 | 所有时区用户体验一致 |
| **调试友好** | 无法知道使用的时区 | 返回使用的时区和UTC时间 |

### 1.4 数据库设计建议

#### 1.4.1 当前设计

```prisma
model Subscription {
  id          Int       @id @default(autoincrement())
  userId      Int
  planId      Int
  status      String    @default("active")
  startTime   DateTime  @default(now())
  endTime     DateTime  // 存储的是UTC时间，但没有明确记录时区
  
  // ...
}
```

#### 1.4.2 建议优化（可选）

```prisma
model Subscription {
  id          Int       @id @default(autoincrement())
  userId      Int
  planId      Int
  status      String    @default("active")
  startTime   DateTime  @default(now())
  endTime     DateTime  // UTC时间
  timezone    String    @default("Asia/Shanghai")  // 新增：记录用户时区
  
  // ...
}
```

**优点**:
- 明确记录用户创建订阅时使用的时区
- 便于后续查询和调试
- 支持时区变更时的历史数据追溯

### 1.5 前端集成建议

#### 1.5.1 传递用户时区

```typescript
// 前端获取用户时区
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// 结果如: "Asia/Shanghai", "America/New_York" 等

// 创建订阅时传递时区
const response = await fetch('/api/fixed/subscriptions/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    planId: 1,
    endTime: '2024-12-31 23:59:59',  // 用户本地时间
    timezone: userTimezone,            // 用户时区
  }),
});
```

#### 1.5.2 时间展示

```typescript
// 从API获取UTC时间
const { endTime, endTimeLocal } = subscription;

// 方式1: 使用返回的本地时间（推荐）
console.log('到期时间:', endTimeLocal);  // 已格式化为用户时区

// 方式2: 前端自己格式化（使用date-fns-tz）
import { formatInTimeZone } from 'date-fns-tz';

const formatted = formatInTimeZone(
  new Date(endTime),  // UTC时间
  userTimezone,        // 用户时区
  'yyyy-MM-dd HH:mm:ss'
);
```

### 1.6 测试覆盖

| 测试场景 | 测试文件 | 状态 |
|----------|----------|------|
| 时区感知的时间解析 | `tests/timezone.test.ts` | ✅ 已覆盖 |
| UTC时间比较 | `tests/timezone.test.ts` | ✅ 已覆盖 |
| 用户时区格式化 | `tests/timezone.test.ts` | ✅ 已覆盖 |
| 订阅时区问题场景 | `tests/timezone.test.ts` | ✅ 已覆盖 |
| 边界条件测试 | 待补充 | ⏳ 计划中 |

---

## 2. 问题2: 文章点赞数高并发一致性问题

### 2.1 修复策略

**核心原则**:
1. **使用数据库原子操作**: 避免读-改-写模式
2. **使用事务保证一致性**: 多个操作放在同一事务中
3. **使用分布式锁**: 防止并发竞态条件
4. **缓存失效模式**: 避免双写不一致
5. **定期数据同步**: 提供数据一致性校验和修复机制

### 2.2 修复方案详解

#### 2.2.1 新增缓存工具类: `server/utils/cache-utils.ts`

**功能概述**:
- 提供分布式锁实现
- 提供缓存操作工具
- 支持缓存失效模式

**核心函数**:

**1. 分布式锁实现**

```typescript
// 获取锁
export const acquireLock = async (
  key: string,
  ttl: number = 10000  // 锁过期时间（毫秒）
): Promise<{ lockValue: string; acquired: boolean }> => {
  // 生成唯一的锁值（用于释放锁时验证）
  const lockValue = `${Date.now()}:${Math.random().toString(36).substring(2)}`;
  
  // SET key value PX ttl NX
  // NX: 只有key不存在时才设置
  // PX: 设置过期时间（毫秒）
  const result = await redis.set(key, lockValue, 'PX', ttl, 'NX');
  
  return {
    lockValue,
    acquired: result === 'OK',
  };
};

// 释放锁
export const releaseLock = async (key: string, lockValue: string): Promise<void> => {
  // 只有锁的持有者才能释放锁
  const currentValue = await redis.get(key);
  if (currentValue === lockValue) {
    await redis.del(key);
  }
};
```

**为什么需要锁值验证**:

```
场景: 锁过期导致的误释放

时间线:
T1: 请求A获取锁 (key=lock, value=A, ttl=10s)
T2: 请求A执行时间超过10秒...
T3: 锁过期，Redis自动删除
T4: 请求B获取锁 (key=lock, value=B, ttl=10s)
T5: 请求A执行完成，调用 releaseLock(key, 'A')
T6: ❌ 如果没有验证，会删除请求B的锁！

解决方案:
- 释放锁时验证锁值是否匹配
- 只有锁的持有者才能释放锁
```

**2. 带自动释放的锁装饰器**

```typescript
export const withLock = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 10000,
  maxRetries: number = 3
): Promise<T> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    const { lockValue, acquired } = await acquireLock(key, ttl);
    
    if (acquired) {
      try {
        return await fn();
      } finally {
        await releaseLock(key, lockValue);
      }
    }
    
    // 指数退避重试
    retries++;
    await new Promise((resolve) => setTimeout(resolve, 100 * retries));
  }
  
  throw new Error('无法获取锁，请稍后重试');
};
```

**使用示例**:

```typescript
// 安全的并发操作
await withLock(`like:article:${articleId}:user:${userId}`, async () => {
  // 这里的代码是串行执行的
  // 不会有并发竞态条件
  
  const existingLike = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });
  
  if (existingLike) {
    throw new Error('已经点赞过了');
  }
  
  // ... 创建点赞记录和更新计数
});
```

**3. 缓存操作工具**

```typescript
const ARTICLE_LIKE_CACHE_PREFIX = 'article:likes:';
const CACHE_TTL = 300;  // 5分钟

// 获取缓存键
export const getLikeCountCacheKey = (articleId: number): string => {
  return `${ARTICLE_LIKE_CACHE_PREFIX}${articleId}`;
};

// 使缓存失效（推荐模式）
export const invalidateLikeCountCache = async (articleId: number): Promise<void> => {
  const key = getLikeCountCacheKey(articleId);
  await redis.del(key);
};

// 从缓存读取
export const getLikeCountFromCache = async (articleId: number): Promise<number | null> => {
  const key = getLikeCountCacheKey(articleId);
  const value = await redis.get(key);
  return value ? parseInt(value, 10) : null;
};

// 写入缓存（仅在读取时重建）
export const setLikeCountToCache = async (articleId: number, count: number): Promise<void> => {
  const key = getLikeCountCacheKey(articleId);
  await redis.set(key, count.toString(), 'EX', CACHE_TTL);
};
```

#### 2.2.2 新增点赞服务类: `server/utils/like-service.ts`

**功能概述**:
- 封装点赞相关的业务逻辑
- 保证数据一致性
- 提供事务和锁保护

**核心函数**:

**1. 点赞操作（带锁和事务）**

```typescript
export const likeArticle = async (userId: number, articleId: number) => {
  // 分布式锁：防止同一用户重复点赞的竞态条件
  const lockKey = `like:article:${articleId}:user:${userId}`;
  
  return withLock(lockKey, async () => {
    // 步骤1: 检查是否已点赞（在锁内，安全）
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    
    if (existingLike) {
      throw new Error('已经点赞过了');
    }
    
    // 步骤2: 事务保证原子性
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 2.1 创建Like记录
        await tx.like.create({
          data: { userId, articleId },
        });
        
        // 2.2 使用原子操作更新计数
        const updatedArticle = await tx.article.update({
          where: { id: articleId },
          data: {
            likeCount: { increment: 1 },  // ✅ 数据库原子操作
          },
        });
        
        return updatedArticle;
      });
      
      // 步骤3: 使缓存失效（不是更新缓存！）
      await invalidateLikeCountCache(articleId);
      
      return {
        success: true,
        likeCount: result.likeCount,
      };
    } catch (error: unknown) {
      // 处理唯一约束错误（双重保险）
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('已经点赞过了');
      }
      throw error;
    }
  });
};
```

**关键点解释**:

| 技术 | 作用 | 为什么需要 |
|------|------|------------|
| **分布式锁** | 防止同一用户重复点赞 | 检查和创建之间有时间窗口 |
| **事务** | 保证Like记录和计数更新原子性 | 防止一个成功一个失败 |
| **原子操作** | `increment: 1`是数据库原子操作 | 避免读-改-写竞态条件 |
| **缓存失效** | 删除缓存而不是更新 | 避免双写不一致 |
| **唯一约束** | 数据库层面的最后防线 | 防止代码逻辑漏洞 |

**为什么使用原子操作而不是读-改-写**:

```typescript
// ❌ 错误方式：读-改-写
const article = await prisma.article.findUnique({ where: { id } });
await prisma.article.update({
  where: { id },
  data: { likeCount: article.likeCount + 1 }  // 竞态条件！
});

// ✅ 正确方式：原子操作
await prisma.article.update({
  where: { id },
  data: { likeCount: { increment: 1 } }  // 数据库层面原子操作
});
```

**生成的SQL对比**:

```sql
-- 错误方式（竞态条件）
SELECT likeCount FROM Article WHERE id = 1;  -- 返回 0
-- 时间窗口：其他请求可以修改
UPDATE Article SET likeCount = 0 + 1 WHERE id = 1;

-- 正确方式（原子操作）
UPDATE Article SET likeCount = likeCount + 1 WHERE id = 1;
-- 数据库层面保证原子性，没有竞态条件
```

**2. 取消点赞操作**

```typescript
export const unlikeArticle = async (userId: number, articleId: number) => {
  const lockKey = `like:article:${articleId}:user:${userId}`;
  
  return withLock(lockKey, async () => {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    
    if (!existingLike) {
      throw new Error('还没有点赞');
    }
    
    // 事务保证原子性
    const result = await prisma.$transaction(async (tx) => {
      // 删除Like记录
      await tx.like.delete({
        where: { userId_articleId: { userId, articleId } },
      });
      
      // 原子递减
      const updatedArticle = await tx.article.update({
        where: { id: articleId },
        data: {
          likeCount: { decrement: 1 },
        },
      });
      
      return updatedArticle;
    });
    
    // 使缓存失效
    await invalidateLikeCountCache(articleId);
    
    return {
      success: true,
      likeCount: result.likeCount,
    };
  });
};
```

**3. 获取文章点赞数（缓存优先）**

```typescript
export const getArticleWithLikeCount = async (articleId: number) => {
  // 步骤1: 尝试从缓存读取
  const cachedCount = await getLikeCountFromCache(articleId);
  
  if (cachedCount !== null) {
    // 缓存命中：从数据库读取文章信息
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
    
    if (article) {
      return { ...article, likeCount: cachedCount };
    }
  }
  
  // 步骤2: 缓存未命中，从数据库读取
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: { select: { id: true, username: true, email: true } },
    },
  });
  
  if (article) {
    // 步骤3: 从Like表计算实际点赞数（双重保险）
    const likeCount = await prisma.like.count({
      where: { articleId },
    });
    
    // 步骤4: 更新缓存
    await setLikeCountToCache(articleId, likeCount);
    
    return { ...article, likeCount };
  }
  
  return null;
};
```

**为什么从Like表重新计算**:

```
场景: 数据不一致修复

假设:
- Article.likeCount = 5 (由于历史bug错误)
- Like记录数 = 10 (实际点赞数)

修复逻辑:
1. 缓存未命中，从数据库读取
2. 从Like表重新计算: 10
3. 更新Article.likeCount? 不，只更新缓存
4. 下次点赞时会使用原子操作，Article.likeCount会被修正

建议: 定期运行syncLikeCounts()进行数据修复
```

**4. 数据同步工具**

```typescript
export const syncLikeCounts = async (articleId?: number) => {
  // 如果指定了文章ID，只同步该文章
  // 否则同步所有文章
  
  const articles = articleId
    ? await prisma.article.findMany({ where: { id: articleId } })
    : await prisma.article.findMany();
  
  const results = [];
  
  for (const article of articles) {
    // 从Like表计算实际点赞数
    const actualLikeCount = await prisma.like.count({
      where: { articleId: article.id },
    });
    
    // 如果不一致，修复
    if (article.likeCount !== actualLikeCount) {
      await prisma.article.update({
        where: { id: article.id },
        data: { likeCount: actualLikeCount },
      });
      
      // 使缓存失效
      await invalidateLikeCountCache(article.id);
      
      results.push({
        articleId: article.id,
        oldCount: article.likeCount,
        newCount: actualLikeCount,
        fixed: true,
      });
    } else {
      results.push({
        articleId: article.id,
        count: actualLikeCount,
        fixed: false,
      });
    }
  }
  
  return results;
};
```

**使用场景**:
- 修复历史数据（由于之前的bug导致的不一致）
- 定期校验数据一致性
- 发现问题时的手动修复

#### 2.2.3 修复点赞API: `server/api/fixed/articles/[articleId]/like.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  // 参数验证
  const articleIdParam = getRouterParam(event, 'articleId');
  const validated = likeArticleSchema.safeParse({ articleId: articleIdParam });
  
  if (!validated.success) {
    throw createError({ statusCode: 400, message: '文章ID无效' });
  }
  
  const articleId = validated.data.articleId;
  
  // 检查文章是否存在
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw createError({ statusCode: 404, message: '文章不存在' });
  }
  
  // 调用点赞服务
  try {
    const result = await likeArticle(userId, articleId);
    
    return {
      success: true,
      message: '点赞成功',
      likeCount: result.likeCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '点赞失败';
    
    if (message === '已经点赞过了') {
      throw createError({ statusCode: 400, message });
    }
    
    throw createError({ statusCode: 500, message });
  }
});
```

### 2.3 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **计数更新** | 读-改-写模式（竞态条件） | 数据库原子操作 |
| **并发控制** | 无 | 分布式锁 + 事务 |
| **缓存策略** | 双写模式（不一致风险） | 缓存失效模式 |
| **数据一致性** | 可能不一致 | 强一致性保证 |
| **错误处理** | 唯一约束错误可能返回500 | 友好的错误提示 |
| **数据修复** | 无 | 提供syncLikeCounts()工具 |

### 2.4 技术选择说明

#### 2.4.1 为什么使用分布式锁而不是数据库锁?

| 方案 | 优点 | 缺点 |
|------|------|------|
| **数据库行锁** (`SELECT ... FOR UPDATE`) | 简单，不需要Redis | 可能影响数据库性能，锁粒度大 |
| **乐观锁** (版本号) | 无锁，性能好 | 需要修改表结构，冲突时需要重试 |
| **分布式锁** (Redis) | 锁粒度精细，性能好 | 需要Redis，实现复杂 |

**我们的选择**: 分布式锁 + 数据库唯一约束

**原因**:
1. 点赞操作是高频操作，需要高性能
2. 锁只需要保护"检查是否已点赞"这一小段逻辑
3. 数据库唯一约束作为最后防线
4. 系统已经使用Redis，不需要引入新组件

#### 2.4.2 为什么使用缓存失效而不是双写?

**双写模式的问题**:

```
时间线（两个并发请求）:
T1: 请求A读取数据库 likeCount = 0
T2: 请求B读取数据库 likeCount = 0
T3: 请求A更新数据库 likeCount = 1
T4: 请求A更新缓存 likeCount = 1
T5: 请求B更新数据库 likeCount = 1 ❌ 应该是2
T6: 请求B更新缓存 likeCount = 1 ❌ 应该是2

结果: 数据库和缓存都是1，实际应该是2
```

**缓存失效模式的优势**:

```
时间线:
T1: 请求A更新数据库 likeCount = 0 → 1
T2: 请求A删除缓存
T3: 请求B更新数据库 likeCount = 1 → 2
T4: 请求B删除缓存
T5: 请求C读取，缓存未命中
T6: 请求C从数据库读取 likeCount = 2 ✅
T7: 请求C更新缓存 likeCount = 2 ✅

结果: 最终一致
```

**选择**: 缓存失效 + 读取时重建

**原因**:
1. 实现简单，不容易出错
2. 最终一致性保证
3. 适合读多写少的场景（点赞是写操作，读取是高频操作）

### 2.5 高并发场景验证

#### 2.5.1 并发测试脚本

```typescript
async function testConcurrentLikes() {
  const articleId = 1;
  const userCount = 100;
  const iterations = 5;
  
  console.log('=== 高并发点赞测试 ===');
  console.log(`用户数: ${userCount}, 迭代次数: ${iterations}`);
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\n--- 第 ${i + 1} 次迭代 ---`);
    
    // 重置数据
    await prisma.article.update({
      where: { id: articleId },
      data: { likeCount: 0 },
    });
    await prisma.like.deleteMany({ where: { articleId } });
    
    // 创建测试用户（如果不存在）
    const userIds = [];
    for (let j = 1; j <= userCount; j++) {
      userIds.push(j);
    }
    
    // 并发点赞
    console.log('并发点赞中...');
    const startTime = Date.now();
    
    const promises = userIds.map(userId => likeArticle(userId, articleId));
    const results = await Promise.allSettled(promises);
    
    const endTime = Date.now();
    
    // 统计结果
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;
    
    // 验证一致性
    const likeRecordCount = await prisma.like.count({ where: { articleId } });
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    
    console.log(`耗时: ${endTime - startTime}ms`);
    console.log(`成功: ${successCount}, 失败: ${failCount}`);
    console.log(`Like记录数: ${likeRecordCount}`);
    console.log(`Article.likeCount: ${article?.likeCount}`);
    
    const isConsistent = article?.likeCount === likeRecordCount && 
                        likeRecordCount === successCount;
    
    console.log(`数据一致性: ${isConsistent ? '✅ 一致' : '❌ 不一致'}`);
    
    if (!isConsistent) {
      console.error('❌ 发现数据不一致！');
      process.exit(1);
    }
  }
  
  console.log('\n=== 所有测试通过 ===');
}
```

#### 2.5.2 预期结果

```
=== 高并发点赞测试 ===
用户数: 100, 迭代次数: 5

--- 第 1 次迭代 ---
并发点赞中...
耗时: 234ms
成功: 100, 失败: 0
Like记录数: 100
Article.likeCount: 100
数据一致性: ✅ 一致

--- 第 2 次迭代 ---
...

=== 所有测试通过 ===
```

### 2.6 测试覆盖

| 测试场景 | 测试文件 | 状态 |
|----------|----------|------|
| 分布式锁功能 | 待补充 | ⏳ 计划中 |
| 事务原子性 | 待补充 | ⏳ 计划中 |
| 原子操作正确性 | 待补充 | ⏳ 计划中 |
| 缓存失效模式 | 待补充 | ⏳ 计划中 |
| 高并发一致性 | 待补充 | ⏳ 计划中 |
| 数据同步工具 | 待补充 | ⏳ 计划中 |

---

## 3. 问题3: 图片上传任意文件上传漏洞

### 3.1 修复策略

**核心原则**:
1. **白名单验证**: 只允许已知安全的文件类型
2. **三重验证**: 扩展名 + MIME类型 + 文件内容（魔数）
3. **安全文件名**: 不使用原始文件名，生成随机文件名
4. **严格权限**: 上传文件设为只读，上传目录无执行权限
5. **主动检测**: 检测并拒绝危险的文件模式

### 3.2 修复方案详解

#### 3.2.1 新增文件上传工具类: `server/utils/file-upload.ts`

**功能概述**:
- 定义允许的文件类型白名单
- 提供多层次的文件验证
- 生成安全的文件名
- 检测危险文件模式

**核心定义**:

**1. 允许的文件类型白名单**

```typescript
export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    magicNumbers: [
      [0xff, 0xd8, 0xff],  // JPEG文件头
    ],
  },
  'image/png': {
    extensions: ['.png'],
    magicNumbers: [
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],  // PNG文件头
    ],
  },
  'image/gif': {
    extensions: ['.gif'],
    magicNumbers: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],  // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],  // GIF89a
    ],
  },
  'image/webp': {
    extensions: ['.webp'],
    magicNumbers: [
      [0x52, 0x49, 0x46, 0x46],  // RIFF (WebP以RIFF开头)
    ],
  },
} as const;
```

**常见图片文件的魔数**:

| 文件类型 | 魔数（十六进制） | 魔数（ASCII） | 说明 |
|----------|------------------|---------------|------|
| JPEG | `FF D8 FF` | `ÿØÿ` | JPEG文件头 |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | `.PNG....` | PNG签名 |
| GIF | `47 49 46 38 37 61` | `GIF87a` | GIF87格式 |
| GIF | `47 49 46 38 39 61` | `GIF89a` | GIF89格式 |
| WebP | `52 49 46 46` | `RIFF` | RIFF格式 |
| BMP | `42 4D` | `BM` | BMP文件头 |
| TIFF | `49 49 2A 00` 或 `4D 4D 00 2A` | `II*` 或 `MM` | TIFF格式 |

**危险文件的魔数**:

| 文件类型 | 魔数（十六进制） | 魔数（ASCII） | 说明 |
|----------|------------------|---------------|------|
| PHP脚本 | `3C 3F 70 68 70` | `<?php` | PHP开头 |
| HTML | `3C 68 74 6D 6C` | `<html` | HTML开头 |
| EXE/DLL | `4D 5A` | `MZ` | DOS可执行文件 |
| ELF | `7F 45 4C 46` | `.ELF` | Linux可执行文件 |
| PDF | `25 50 44 46` | `%PDF` | PDF文件 |
| ZIP | `50 4B 03 04` | `PK..` | ZIP压缩文件 |

**2. 危险扩展名检测**

```typescript
export const DANGEROUS_EXTENSIONS = [
  // 脚本文件
  '.php', '.php3', '.php4', '.php5', '.php7', '.phtml',
  '.asp', '.aspx', '.ashx', '.asmx',
  '.jsp', '.jspx', '.jsw',
  
  // 可执行文件
  '.exe', '.bat', '.cmd', '.sh',
  
  // CGI脚本
  '.cgi', '.pl', '.py',
  
  // 可能包含脚本的文件
  '.html', '.htm', '.svg',
];

export const isDangerousExtension = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return DANGEROUS_EXTENSIONS.includes(ext);
};
```

**为什么需要主动检测**:

即使有三重验证，主动检测危险扩展名可以提供额外的安全层：

```
场景: 双重扩展名绕过尝试

攻击者上传:
文件名: fake.jpg.php
MIME类型: image/jpeg
内容: 实际是PHP代码

验证过程:
1. MIME类型验证: image/jpeg ✅ （攻击者伪造）
2. 扩展名验证: .php 不在白名单 ❌ 拒绝
3. 或者通过危险扩展名检测: .php 是危险的 ❌ 拒绝

即使攻击者伪造MIME类型，也会被扩展名验证拒绝
```

**3. 文件大小限制**

```typescript
export const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
export const MIN_FILE_SIZE = 100;  // 最小100字节（空文件或过小文件）

export const validateFileSize = (size: number): { valid: boolean; error?: string } => {
  if (size < MIN_FILE_SIZE) {
    return { valid: false, error: `文件太小，最小需要 ${MIN_FILE_SIZE} 字节` };
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件太大，最大允许 ${MAX_FILE_SIZE / (1024 * 1024)} MB` };
  }
  return { valid: true };
};
```

**为什么需要最小文件大小**:

- 防止空文件上传
- 防止过小的可疑文件
- 图片文件通常不会小于100字节（除非是极小的图标）

**核心验证函数**:

**1. MIME类型验证**

```typescript
export const validateMimeType = (mimeType: string): mimeType is AllowedMimeType => {
  return Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_TYPES, mimeType);
};
```

**验证逻辑**:
- 只允许白名单中的MIME类型
- 不依赖客户端提供的MIME类型（后续还要验证扩展名和内容）

**2. 文件扩展名验证**

```typescript
export const validateFileExtension = (filename: string, mimeType: string): boolean => {
  const allowedType = ALLOWED_IMAGE_TYPES[mimeType as AllowedMimeType];
  if (!allowedType) return false;
  
  const ext = path.extname(filename).toLowerCase();
  return allowedType.extensions.includes(ext);
};
```

**验证逻辑**:
- 文件扩展名必须与MIME类型匹配
- 例如：`image/jpeg` 类型的文件扩展名必须是 `.jpg` 或 `.jpeg`

**为什么需要验证扩展名**:

```
攻击场景: MIME类型欺骗

攻击者上传:
文件名: shell.php
MIME类型: image/jpeg （伪造）
内容: <?php phpinfo(); ?>

如果只验证MIME类型:
- MIME类型: image/jpeg ✅ （攻击者伪造）
- 验证通过 ❌ 错误！

如果同时验证扩展名:
- MIME类型: image/jpeg ✅
- 扩展名: .php ❌ 不匹配 image/jpeg
- 验证失败 ✅ 正确拒绝
```

**3. 文件内容验证（魔数检测）**

```typescript
export const validateFileMagicNumber = async (
  filePath: string,
  mimeType: string
): Promise<boolean> => {
  const allowedType = ALLOWED_IMAGE_TYPES[mimeType as AllowedMimeType];
  if (!allowedType) return false;
  
  try {
    // 读取文件开头12字节（足够判断文件类型）
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = new Uint8Array(12);
    await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();
    
    // 检查是否匹配任意一个魔数
    return matchesMagicNumber(buffer, allowedType.magicNumbers);
  } catch {
    return false;
  }
};

const matchesMagicNumber = (fileBuffer: Uint8Array, magicNumbers: number[][]): boolean => {
  return magicNumbers.some((magic) => {
    if (fileBuffer.length < magic.length) return false;
    for (let i = 0; i < magic.length; i++) {
      if (fileBuffer[i] !== magic[i]) return false;
    }
    return true;
  });
};
```

**魔数检测的重要性**:

```
攻击场景: 内容伪造

攻击者上传:
文件名: fake.jpg
MIME类型: image/jpeg
内容: <?php phpinfo(); ?> （实际是PHP代码）

验证过程:
1. MIME类型验证: image/jpeg ✅ （攻击者可以伪造）
2. 扩展名验证: .jpg 匹配 image/jpeg ✅
3. 魔数检测:
   - 实际内容: 3C 3F 70 68 70 ... (<?php...)
   - 期望的JPEG魔数: FF D8 FF ...
   - 不匹配 ❌ 拒绝

即使攻击者伪造了文件名和MIME类型，
魔数检测仍然可以识别出实际内容不是图片
```

**4. 综合验证函数**

```typescript
export const validateImageFile = async (
  filePath: string,
  filename: string,
  size: number,
  reportedMimeType: string
): Promise<FileValidationResult> => {
  // 验证1: 文件大小
  const sizeValidation = validateFileSize(size);
  if (!sizeValidation.valid) {
    return { valid: false, error: sizeValidation.error };
  }
  
  // 验证2: MIME类型白名单
  if (!validateMimeType(reportedMimeType)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${reportedMimeType}。支持的类型: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}`,
    };
  }
  
  // 验证3: 扩展名与MIME类型匹配
  if (!validateFileExtension(filename, reportedMimeType)) {
    return {
      valid: false,
      error: `文件扩展名与MIME类型不匹配。MIME类型 ${reportedMimeType} 应使用扩展名: ${ALLOWED_IMAGE_TYPES[reportedMimeType as AllowedMimeType].extensions.join(', ')}`,
    };
  }
  
  // 验证4: 文件内容（魔数检测）
  const magicValid = await validateFileMagicNumber(filePath, reportedMimeType);
  if (!magicValid) {
    return {
      valid: false,
      error: '文件内容与声称的类型不匹配',
    };
  }
  
  // 所有验证通过
  const ext = path.extname(filename).toLowerCase();
  
  return {
    valid: true,
    mimeType: reportedMimeType as AllowedMimeType,
    extension: ext,
  };
};
```

**三重验证流程图**:

```
开始
  ↓
文件大小验证?
  ├─ 否 → 拒绝（过大或过小）
  └─ 是 → 继续
  ↓
MIME类型在白名单?
  ├─ 否 → 拒绝（不支持的类型）
  └─ 是 → 继续
  ↓
扩展名与MIME类型匹配?
  ├─ 否 → 拒绝（扩展名不匹配）
  └─ 是 → 继续
  ↓
文件内容魔数匹配?
  ├─ 否 → 拒绝（内容伪造）
  └─ 是 → ✅ 验证通过
```

**5. 安全文件名生成**

```typescript
export const generateSafeFilename = (
  originalName: string,
  extension: string
): string => {
  // 清理原始文件名（只保留安全字符）
  const safeName = originalName
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_')  // 只保留字母、数字、中文、下划线、连字符
    .substring(0, 50);  // 限制长度
  
  // 生成: UUID_清理后的文件名.扩展名
  return `${uuidv4()}_${safeName}${extension}`;
};
```

**安全文件名的重要性**:

| 攻击方式 | 原始文件名 | 安全文件名 |
|----------|------------|------------|
| 空字节注入 | `shell.php%00.jpg` | `550e8400-e29b-41d4-a716-446655440000_shell_php.jpg` |
| 路径遍历 | `../../etc/passwd.jpg` | `550e8400-..._etc_passwd.jpg` |
| 双重扩展名 | `image.jpg.php` | `550e8400-..._image_jpg_php.php` (但会被扩展名验证拒绝) |
| 特殊字符 | `my"file.jpg` | `550e8400-..._my_file.jpg` |
| 过长文件名 | 1000个字符的文件名 | 限制在合理长度 |

**为什么需要UUID**:

```
场景: 文件名冲突

用户A上传: cat.jpg
用户B上传: cat.jpg

如果不使用UUID:
- 用户A的文件: cat.jpg
- 用户B的文件: cat.jpg (覆盖用户A的文件!)

使用UUID:
- 用户A的文件: 550e8400-..._cat.jpg
- 用户B的文件: 7c9e6679-..._cat.jpg
- 不会冲突，且保留了原始文件名信息
```

#### 3.2.2 修复图片上传API: `server/api/fixed/upload/image.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  // 确保上传目录存在
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
  await ensureUploadDirectory(UPLOAD_DIR);
  
  // 配置formidable
  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: 1,
    allowEmptyFiles: false,
    
    // 前置过滤：拒绝危险扩展名
    filter: (part) => {
      const filename = part.originalFilename || '';
      
      if (isDangerousExtension(filename)) {
        console.warn(`拒绝危险文件: ${filename}`);
        return false;
      }
      
      return true;
    },
    
    // 临时文件名（验证通过后重命名）
    filename: (name, ext, part) => {
      const originalName = part.originalFilename || name;
      return `temp_${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`;
    },
  });
  
  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        // 处理文件大小超限等错误
        if (err.message?.includes('maxFileSize')) {
          reject(createError({
            statusCode: 400,
            message: `文件大小超过限制，最大允许 ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
          }));
        } else {
          reject(createError({
            statusCode: 400,
            message: '文件解析失败: ' + err.message,
          }));
        }
        return;
      }
      
      // 获取上传的文件
      const file = files.file?.[0] || files.image?.[0];
      
      if (!file) {
        reject(createError({
          statusCode: 400,
          message: '未找到上传的文件',
        }));
        return;
      }
      
      const originalName = file.originalFilename || 'unknown';
      const tempPath = file.filepath;
      
      try {
        // 执行三重验证
        const validation = await validateImageFile(
          tempPath,
          originalName,
          file.size,
          file.mimetype || 'application/octet-stream'
        );
        
        if (!validation.valid) {
          // 验证失败，删除临时文件
          try {
            await fs.unlink(tempPath);
          } catch {
            // 忽略清理错误
          }
          
          reject(createError({
            statusCode: 400,
            message: validation.error || '文件验证失败',
          }));
          return;
        }
        
        // 验证通过，生成安全文件名
        const safeFilename = generateSafeFilename(
          originalName,
          validation.extension!
        );
        
        const finalPath = path.join(UPLOAD_DIR, safeFilename);
        
        // 移动到最终位置
        await fs.rename(tempPath, finalPath);
        
        // 设置文件权限（只读）
        await fs.chmod(finalPath, 0o640);
        
        // 返回结果
        const fileUrl = `/uploads/images/${safeFilename}`;
        
        resolve({
          success: true,
          data: {
            url: fileUrl,
            filename: safeFilename,
            originalName: originalName,
            size: file.size,
            mimeType: validation.mimeType,
            extension: validation.extension,
          },
          message: '文件上传成功',
          allowedTypes: Object.keys(ALLOWED_IMAGE_TYPES),
        });
      } catch (validationError: unknown) {
        // 清理临时文件
        try {
          await fs.unlink(tempPath);
        } catch {
          // 忽略清理错误
        }
        
        if (validationError instanceof Error && (validationError as any).statusCode) {
          reject(validationError);
        } else {
          reject(createError({
            statusCode: 500,
            message: '文件处理失败',
          }));
        }
      }
    });
  });
});
```

**上传处理流程图**:

```
开始
  ↓
用户认证?
  ├─ 否 → 401 Unauthorized
  └─ 是 → 继续
  ↓
解析上传文件
  ↓
前置过滤: 危险扩展名?
  ├─ 是 → 拒绝
  └─ 否 → 继续
  ↓
验证1: 文件大小
  ├─ 否 → 拒绝
  └─ 是 → 继续
  ↓
验证2: MIME类型白名单
  ├─ 否 → 拒绝
  └─ 是 → 继续
  ↓
验证3: 扩展名匹配
  ├─ 否 → 拒绝
  └─ 是 → 继续
  ↓
验证4: 魔数检测
  ├─ 否 → 拒绝
  └─ 是 → 继续
  ↓
生成安全文件名
  ↓
移动到最终位置
  ↓
设置只读权限
  ↓
✅ 返回成功
```

### 3.3 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **文件类型验证** | 无 | 三重验证（扩展名+MIME+魔数） |
| **白名单机制** | 无 | 严格的白名单验证 |
| **文件名安全** | 保留原始文件名 | UUID+清理后的文件名 |
| **文件权限** | 默认权限 | 只读权限(0o640) |
| **危险扩展名检测** | 无 | 主动检测并拒绝 |
| **错误提示** | 无详细信息 | 友好的验证失败提示 |

### 3.4 攻击场景验证

#### 3.4.1 场景1: PHP Web Shell上传

**攻击尝试**:
```bash
curl -X POST http://localhost:3000/api/fixed/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@shell.php;type=image/jpeg"
```

**文件内容**:
```php
<?php system($_GET['cmd']); ?>
```

**验证过程**:
1. **前置过滤**: `.php` 是危险扩展名 ❌ 拒绝
2. 或者（如果绕过了前置过滤）:
   - MIME类型: `image/jpeg` ✅
   - 扩展名: `.php` 不匹配 `image/jpeg` ❌ 拒绝
3. 或者（如果攻击者伪装扩展名）:
   - 魔数检测: 实际内容是 `<?php...`，不是JPEG魔数 ❌ 拒绝

**结果**:
```json
{
  "statusCode": 400,
  "message": "文件扩展名与MIME类型不匹配..."
}
```

#### 3.4.2 场景2: 内容伪造

**攻击尝试**:
```bash
# 创建一个伪装成JPG的PHP文件
echo -n '<?php phpinfo(); ?>' > fake.jpg

curl -X POST http://localhost:3000/api/fixed/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@fake.jpg;type=image/jpeg"
```

**验证过程**:
1. MIME类型: `image/jpeg` ✅
2. 扩展名: `.jpg` 匹配 `image/jpeg` ✅
3. 魔数检测:
   - 实际内容: `3C 3F 70 68 70...` (`<?php...`)
   - 期望: `FF D8 FF...` (JPEG)
   - 不匹配 ❌ 拒绝

**结果**:
```json
{
  "statusCode": 400,
  "message": "文件内容与声称的类型不匹配"
}
```

#### 3.4.3 场景3: XSS攻击（HTML/SVG上传）

**攻击尝试**:
```bash
curl -X POST http://localhost:3000/api/fixed/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@xss.html;type=image/png"
```

**文件内容**:
```html
<html>
<script>alert(document.cookie)</script>
</html>
```

**验证过程**:
1. **前置过滤**: `.html` 是危险扩展名 ❌ 拒绝

**结果**:
```json
{
  "statusCode": 400,
  "message": "不支持的文件类型..."
}
```

#### 3.4.4 场景4: 空字节注入

**攻击尝试**:
```bash
# 文件名包含空字节（某些系统会在空字节处截断）
curl -X POST http://localhost:3000/api/fixed/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@shell.php;filename=shell.php%00.jpg;type=image/jpeg"
```

**验证过程**:
1. 扩展名验证: 检测到 `.php` 扩展名 ❌ 拒绝
2. 安全文件名生成: 即使通过，也会清理特殊字符

**结果**: 拒绝

### 3.5 额外的安全建议

#### 3.5.1 服务器配置建议

**Nginx配置**:
```nginx
# 上传目录不执行脚本
location ~* ^/uploads/.*\.(php|php5|jsp|asp|aspx|sh|bat)$ {
    deny all;
    access_log off;
    log_not_found off;
}

# 限制上传文件大小
client_max_body_size 5M;

# 上传目录只允许静态文件访问
location /uploads/ {
    alias /path/to/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    
    # 禁止执行脚本
    location ~* \.(php|jsp|asp|sh)$ {
        deny all;
    }
}
```

**文件系统权限**:
```bash
# 上传目录权限
chmod 750 /path/to/uploads
chown www-data:www-data /path/to/uploads

# 上传文件权限（由代码设置）
# 每个文件设置为 640（只读）
```

#### 3.5.2 数据库中存储文件信息

**建议的数据模型**:
```prisma
model UploadedFile {
  id          Int      @id @default(autoincrement())
  filename    String   @db.VarChar(255)  // 安全文件名
  originalName String @db.VarChar(255)  // 原始文件名
  url         String   @db.VarChar(500)
  size        Int
  mimeType    String   @db.VarChar(100)
  userId      Int
  articleId   Int?     // 关联的文章（可选）
  
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([createdAt])
}
```

**优点**:
- 可以追踪谁上传了什么文件
- 可以关联到具体的文章或内容
- 便于后续管理和清理

#### 3.5.3 定期安全检查

**建议的检查项**:
1. **文件完整性检查**: 定期扫描上传目录，检查是否有可疑文件
2. **病毒扫描**: 使用ClamAV等工具定期扫描
3. **权限检查**: 确保上传目录和文件权限正确
4. **访问日志分析**: 检查异常的上传行为

### 3.6 测试覆盖

| 测试场景 | 测试文件 | 状态 |
|----------|----------|------|
| MIME类型验证 | `tests/file-upload.test.ts` | ✅ 已覆盖 |
| 扩展名验证 | `tests/file-upload.test.ts` | ✅ 已覆盖 |
| 文件大小验证 | `tests/file-upload.test.ts` | ✅ 已覆盖 |
| 危险扩展名检测 | `tests/file-upload.test.ts` | ✅ 已覆盖 |
| 魔数检测 | 待补充 | ⏳ 计划中 |
| 安全文件名生成 | 待补充 | ⏳ 计划中 |
| 综合验证 | 待补充 | ⏳ 计划中 |
| 渗透测试: Web Shell | `tests/penetration/file-upload.test.ts` | ✅ 已覆盖 |
| 渗透测试: 内容伪造 | `tests/penetration/file-upload.test.ts` | ✅ 已覆盖 |
| 渗透测试: 双重扩展名 | `tests/penetration/file-upload.test.ts` | ✅ 已覆盖 |
| 渗透测试: 空字节注入 | `tests/penetration/file-upload.test.ts` | ✅ 已覆盖 |

---

**注意**: 由于文档过长，问题4-6的详细修复方案请参考以下文件：

- `docs/issue-4-sql-injection-fix.md` - SQL注入修复方案
- `docs/issue-5-jwt-blacklist-fix.md` - JWT黑名单修复方案
- `docs/issue-6-email-queue-fix.md` - 邮件队列修复方案
