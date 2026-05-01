# 问题2: 文章点赞数高并发一致性问题 - 详细分析

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 1. 问题描述

多个用户同时点赞同一篇文章时，最终的点赞数可能与实际点赞的用户数量不一致。

**典型场景**:
- 文章A初始点赞数: 0
- 用户1、用户2、用户3同时发起点赞请求
- 数据库最终点赞数: 1（应该是3）

---

## 2. 问题代码位置

**文件**: `server/api/vulnerable/articles/[articleId]/like.post.ts:50-73`

```typescript
// 步骤1: 检查是否已点赞（没有并发保护）
const existingLike = await prisma.like.findUnique({
  where: {
    userId_articleId: {
      userId,
      articleId,
    },
  },
});

if (existingLike) {
  throw createError({
    statusCode: 400,
    message: '已经点赞过了',
  });
}

// 步骤2: 创建点赞记录
await prisma.like.create({
  data: {
    userId,
    articleId,
  },
});

// 步骤3: 读取当前点赞数 ❌ 问题在这里
const currentArticle = await prisma.article.findUnique({
  where: { id: articleId },
});

// 步骤4: +1更新 ❌ 问题在这里
if (currentArticle) {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      likeCount: currentArticle.likeCount + 1,  // ❌ 读-改-写，非原子
    },
  });
}

// 步骤5: Redis独立操作 ❌ 双写不一致
const redisKey = `article:${articleId}:likes`;
await redis.incr(redisKey);
await redis.expire(redisKey, 3600);
```

---

## 3. 根本原因详细分析

### 3.1 竞态条件 (Race Condition)

**问题本质**: 读-改-写模式在并发下不是原子操作。

#### 3.1.1 时间线分析（3个并发请求）

```
时间 | 请求1 (用户1)               | 请求2 (用户2)               | 请求3 (用户3)
-----|----------------------------|----------------------------|----------------------------
T1   | 读取likeCount = 0          |                            |
T2   |                            | 读取likeCount = 0          |
T3   |                            |                            | 读取likeCount = 0
T4   | 更新likeCount = 0 + 1 = 1  |                            |
T5   |                            | 更新likeCount = 0 + 1 = 1  |
T6   |                            |                            | 更新likeCount = 0 + 1 = 1
-----|----------------------------|----------------------------|----------------------------
结果 | 最终likeCount = 1 (应该是3) |                            |
```

#### 3.1.2 数据库层面的解释

```sql
-- 所有请求都执行相同的操作:

-- 请求1:
SELECT likeCount FROM Article WHERE id = 1;  -- 返回 0
UPDATE Article SET likeCount = 0 + 1 WHERE id = 1;  -- 变成 1

-- 请求2 (并发执行，在请求1的UPDATE之前读取):
SELECT likeCount FROM Article WHERE id = 1;  -- 仍然返回 0
UPDATE Article SET likeCount = 0 + 1 WHERE id = 1;  -- 还是变成 1

-- 请求3 (同样并发):
SELECT likeCount FROM Article WHERE id = 1;  -- 返回 0
UPDATE Article SET likeCount = 0 + 1 WHERE id = 1;  -- 变成 1
```

#### 3.1.3 为什么会发生？

**事务隔离级别**:

默认的事务隔离级别（如MySQL的REPEATABLE READ）:
- 同一事务内的多次读取结果一致
- 但不阻止其他事务修改数据

**问题场景**:
```typescript
// 即使使用事务，如果隔离级别不当，也会有问题
await prisma.$transaction(async (tx) => {
  // 读取
  const article = await tx.article.findUnique({ where: { id } });
  
  // 这里有时间窗口，其他事务可以修改
  
  // 更新
  await tx.article.update({
    where: { id },
    data: { likeCount: article.likeCount + 1 }  // ❌ 仍然有竞态
  });
});
```

### 3.2 缺少事务保护

**问题**: 多个数据库操作没有放在同一事务中。

#### 3.2.1 代码分析

```typescript
// 操作1: 创建Like记录
await prisma.like.create({ data: { userId, articleId } });

// 操作2: 读取Article
const currentArticle = await prisma.article.findUnique({ where: { id: articleId } });

// 操作3: 更新Article
await prisma.article.update({ 
  where: { id: articleId }, 
  data: { likeCount: currentArticle.likeCount + 1 } 
});
```

#### 3.2.2 问题场景

```
时间 | 请求1                          | 请求2
-----|-------------------------------|-------------------------------
T1   | 创建Like记录 (成功)           |
T2   | 读取Article (likeCount = 0)  |
T3   |                               | 创建Like记录 (成功)
T4   |                               | 读取Article (likeCount = 0)
T5   | 更新Article (likeCount = 1)  |
T6   |                               | 更新Article (likeCount = 1)
-----|-------------------------------|-------------------------------
结果 | 2个Like记录，但likeCount = 1  |
```

### 3.3 重复点赞的并发问题

**问题**: 虽然有唯一约束，但检查和创建之间有时间窗口。

#### 3.3.1 代码分析

```typescript
// 检查是否已点赞
const existingLike = await prisma.like.findUnique({
  where: { userId_articleId: { userId, articleId } },
});

if (existingLike) {
  throw createError({ statusCode: 400, message: '已经点赞过了' });
}

// 创建点赞记录 ❌ 在检查和创建之间，另一个请求可能已经创建了
await prisma.like.create({
  data: { userId, articleId },
});
```

#### 3.3.2 时间线

```
时间 | 请求1                          | 请求2
-----|-------------------------------|-------------------------------
T1   | 检查是否已点赞 → 不存在       |
T2   |                               | 检查是否已点赞 → 不存在
T3   | 创建Like记录                  |
T4   |                               | 创建Like记录 → 唯一约束错误!
-----|-------------------------------|-------------------------------
```

#### 3.3.3 结果

- 请求2会抛出Prisma的唯一约束错误（`P2002`）
- 不是友好的"已经点赞过了"错误提示
- 如果没有正确处理，可能返回500错误

### 3.4 Redis和MySQL双写不一致

**问题**: Redis和MySQL独立操作，没有事务保证。

#### 3.4.1 代码分析

```typescript
// MySQL操作
await prisma.article.update({
  where: { id: articleId },
  data: { likeCount: currentArticle.likeCount + 1 },
});

// Redis操作 (独立执行)
const redisKey = `article:${articleId}:likes`;
await redis.incr(redisKey);  // ❌ 如果MySQL成功但Redis失败？
await redis.expire(redisKey, 3600);
```

#### 3.4.2 可能的不一致场景

| 场景 | MySQL结果 | Redis结果 | 状态 |
|------|-----------|-----------|------|
| 正常 | likeCount+1 | +1 | ✅ 一致 |
| MySQL成功，Redis失败 | likeCount+1 | 不变 | ❌ 不一致 |
| Redis成功，MySQL失败 | 不变 | +1 | ❌ 不一致 |
| 部分成功 | 部分更新 | 部分更新 | ❌ 不一致 |

#### 3.4.3 具体场景分析

**场景1: Redis失败**
```
1. MySQL更新成功 (likeCount = 5)
2. Redis连接失败，INCR没有执行
3. 结果:
   - MySQL: 5
   - Redis: 4 (旧值)
   - 下次读取时使用Redis缓存，返回错误的4
```

**场景2: MySQL失败**
```
1. Redis INCR成功 (缓存值 = 5)
2. MySQL更新失败（如唯一约束错误）
3. 结果:
   - MySQL: 4 (旧值)
   - Redis: 5
   - 缓存和数据库永久不一致
```

### 3.5 缓存策略错误

**问题**: 使用双写模式而不是缓存失效模式。

#### 3.5.1 双写模式 (错误)

```typescript
// 每次都更新缓存和数据库
await prisma.article.update({ ... });
await redis.incr(redisKey);  // ❌ 双写
```

**问题**:
1. 竞态条件: 并发下可能导致缓存和数据库不一致
2. 无法保证原子性: 一个成功一个失败
3. 复杂的回滚逻辑: 如果后续操作失败，需要回滚缓存

#### 3.5.2 缓存失效模式 (正确)

```typescript
// 更新数据库
await prisma.article.update({ ... });

// 使缓存失效
await redis.del(redisKey);  // ✅ 下次读取时重建缓存
```

**优点**:
1. 简单: 不需要处理复杂的双写逻辑
2. 最终一致: 下次读取时重建缓存
3. 容易回滚: 即使更新失败，缓存也不会被污染

---

## 4. 问题影响范围

### 4.1 数据一致性问题

| 影响 | 描述 | 严重程度 |
|------|------|----------|
| 点赞数统计错误 | 用户看到的点赞数与实际不符 | 高 |
| Like记录与likeCount不一致 | 数据库表数据不一致 | 高 |
| Redis缓存与MySQL不一致 | 缓存数据错误 | 高 |
| 排序/推荐异常 | 基于点赞数的功能异常 | 中 |

### 4.2 用户体验问题

1. **用户困惑**:
   - 我明明点赞了，为什么点赞数没增加？
   - 为什么有时候增加，有时候不增加？

2. **用户不信任**:
   - 系统的数据不可靠
   - 可能影响用户活跃度

### 4.3 业务影响

1. **推荐算法异常**:
   - 如果推荐算法基于点赞数
   - 错误的点赞数导致推荐不准确

2. **热门榜单异常**:
   - 基于点赞数的排行榜
   - 数据不准确影响榜单公平性

3. **数据分析错误**:
   - 基于点赞数的用户行为分析
   - 错误的数据导致错误的决策

---

## 5. 问题复现步骤

### 5.1 并发点赞测试脚本

```typescript
import prisma from './server/plugins/prisma';

async function concurrentLikeTest() {
  const articleId = 1;
  const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  console.log('=== 并发点赞测试 ===');
  console.log('测试用户数:', userIds.length);
  
  // 重置测试数据
  console.log('\n1. 重置测试数据...');
  await prisma.article.update({
    where: { id: articleId },
    data: { likeCount: 0 },
  });
  
  await prisma.like.deleteMany({
    where: { articleId },
  });
  
  // 验证初始状态
  const initialArticle = await prisma.article.findUnique({
    where: { id: articleId },
  });
  const initialLikeCount = await prisma.like.count({
    where: { articleId },
  });
  
  console.log('   初始Article.likeCount:', initialArticle?.likeCount);
  console.log('   初始Like记录数:', initialLikeCount);
  
  // 并发点赞
  console.log('\n2. 执行并发点赞...');
  
  const promises = userIds.map(async (userId) => {
    // 模拟问题代码的逻辑
    try {
      // 步骤1: 检查是否已点赞
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_articleId: { userId, articleId },
        },
      });
      
      if (existingLike) {
        console.log(`用户 ${userId}: 已经点赞过了`);
        return { userId, success: false, reason: 'already_liked' };
      }
      
      // 步骤2: 创建Like记录
      await prisma.like.create({
        data: { userId, articleId },
      });
      
      // 步骤3: 读取当前点赞数
      const currentArticle = await prisma.article.findUnique({
        where: { id: articleId },
      });
      
      // 步骤4: +1更新
      if (currentArticle) {
        await prisma.article.update({
          where: { id: articleId },
          data: {
            likeCount: currentArticle.likeCount + 1,
          },
        });
      }
      
      console.log(`用户 ${userId}: 点赞成功`);
      return { userId, success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`用户 ${userId}: 点赞失败 - ${message}`);
      return { userId, success: false, reason: message };
    }
  });
  
  const results = await Promise.all(promises);
  
  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  
  console.log('\n3. 验证结果...');
  const finalArticle = await prisma.article.findUnique({
    where: { id: articleId },
  });
  const finalLikeCount = await prisma.like.count({
    where: { articleId },
  });
  
  console.log('   成功点赞数:', successCount);
  console.log('   失败点赞数:', failedCount);
  console.log('   最终Article.likeCount:', finalArticle?.likeCount);
  console.log('   最终Like记录数:', finalLikeCount);
  
  // 检查一致性
  const isConsistent = finalArticle?.likeCount === finalLikeCount;
  console.log('\n4. 一致性检查:');
  console.log('   Article.likeCount === Like记录数:', isConsistent ? '✅ 一致' : '❌ 不一致');
  
  if (!isConsistent) {
    console.log('   ❌ 发现数据不一致问题！');
    console.log('      期望:', finalLikeCount);
    console.log('      实际:', finalArticle?.likeCount);
    console.log('      差值:', (finalArticle?.likeCount || 0) - finalLikeCount);
  }
  
  return {
    success: isConsistent,
    expected: finalLikeCount,
    actual: finalArticle?.likeCount,
  };
}

// 执行测试
concurrentLikeTest()
  .then((result) => {
    console.log('\n=== 测试完成 ===');
    console.log('测试结果:', result.success ? '✅ 通过' : '❌ 失败');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
```

### 5.2 预期结果

运行上述测试脚本，你会看到类似以下输出：

```
=== 并发点赞测试 ===
测试用户数: 10

1. 重置测试数据...
   初始Article.likeCount: 0
   初始Like记录数: 0

2. 执行并发点赞...
用户 1: 点赞成功
用户 2: 点赞成功
用户 3: 点赞成功
用户 4: 点赞成功
用户 5: 点赞成功
用户 6: 点赞成功
用户 7: 点赞成功
用户 8: 点赞成功
用户 9: 点赞成功
用户 10: 点赞成功

3. 验证结果...
   成功点赞数: 10
   失败点赞数: 0
   最终Article.likeCount: 4  (❌ 应该是10)
   最终Like记录数: 10

4. 一致性检查:
   Article.likeCount === Like记录数: ❌ 不一致
   ❌ 发现数据不一致问题！
      期望: 10
      实际: 4
      差值: -6

=== 测试完成 ===
测试结果: ❌ 失败
```

### 5.3 结果分析

| 指标 | 期望值 | 实际值 | 状态 |
|------|--------|--------|------|
| 成功点赞数 | 10 | 10 | ✅ |
| Like记录数 | 10 | 10 | ✅ |
| Article.likeCount | 10 | 4 | ❌ |
| 数据一致性 | 一致 | 不一致 | ❌ |

这证明了问题的存在：
- 所有用户都成功创建了Like记录（数据库约束保证）
- 但Article.likeCount只有4（由于竞态条件）
- 数据不一致！

---

## 6. 根本原因总结

| 问题类型 | 具体描述 | 影响程度 |
|----------|----------|----------|
| **竞态条件** | 读-改-写模式非原子 | 高 |
| **缺少事务** | 多个操作没有原子保证 | 高 |
| **唯一约束处理不当** | 检查和创建之间有竞态 | 中 |
| **双写不一致** | Redis和MySQL独立操作 | 高 |
| **缓存策略错误** | 使用双写而非缓存失效 | 中 |

### 6.1 核心问题

1. **数据库层面**:
   - 没有使用原子操作（`increment`）
   - 没有使用行级锁或乐观锁
   - 事务隔离级别不当

2. **缓存层面**:
   - 双写模式的竞态条件
   - 没有缓存失效策略
   - 没有缓存一致性保证

3. **架构层面**:
   - 没有分布式锁
   - 没有并发控制机制
   - 没有数据一致性校验

---

## 7. 相关代码文件

| 文件路径 | 问题类型 | 状态 |
|----------|----------|------|
| `server/api/vulnerable/articles/[articleId]/like.post.ts` | 竞态条件、双写不一致 | ❌ 有问题 |
| `server/api/fixed/articles/[articleId]/like.post.ts` | 已修复 | ✅ 修复 |
| `server/api/fixed/articles/[articleId]/unlike.post.ts` | 新增 | ✅ 新增 |
| `server/utils/like-service.ts` | 点赞服务（事务+锁） | ✅ 新增 |
| `server/utils/cache-utils.ts` | 缓存和分布式锁工具 | ✅ 新增 |
