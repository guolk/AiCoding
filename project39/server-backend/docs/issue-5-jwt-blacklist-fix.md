# 问题5: JWT令牌黑名单 - 详细修复方案

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 目录

1. [修复策略](#1-修复策略)
2. [新增令牌黑名单工具类](#2-新增令牌黑名单工具类)
3. [增强的JWT验证工具](#3-增强的jwt验证工具)
4. [修复注销API](#4-修复注销api)
5. [数据库模型建议](#5-数据库模型建议)
6. [验证方法](#6-验证方法)

---

## 1. 修复策略

### 1.1 核心原则

1. **Redis黑名单存储**: 使用Redis存储已注销的令牌
2. **SHA-256哈希**: 不存储原始令牌，只存储哈希
3. **自动过期**: 黑名单条目设置与令牌相同的TTL
4. **验证时检查**: 每次验证令牌都检查是否在黑名单中
5. **用户级别撤销**: 支持撤销单个用户的所有令牌

### 1.2 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **注销处理** | 只是打印日志 | 将令牌加入黑名单 |
| **令牌验证** | 只验证签名和过期时间 | 同时检查是否在黑名单 |
| **数据存储** | 无 | Redis存储令牌哈希 |
| **用户撤销** | 无 | 支持撤销用户所有令牌 |
| **安全日志** | 无 | 记录安全事件 |

---

## 2. 新增令牌黑名单工具类

**文件**: `server/utils/token-blacklist.ts`

### 2.1 完整代码

```typescript
import { redis } from '../plugins/redis';
import crypto from 'crypto';

const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
const USER_TOKEN_PREFIX = 'user:tokens:';
const DEFAULT_TOKEN_EXPIRY = 24 * 60 * 60;

export const generateTokenHash = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const getBlacklistKey = (tokenHash: string): string => {
  return `${TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const getUserTokensKey = (userId: number): string => {
  return `${USER_TOKEN_PREFIX}${userId}`;
};

export const addToBlacklist = async (
  token: string,
  userId: number,
  expiresInSeconds?: number
): Promise<void> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  const userTokensKey = getUserTokensKey(userId);
  
  const ttl = expiresInSeconds || DEFAULT_TOKEN_EXPIRY;
  
  await redis.set(blacklistKey, userId.toString(), 'EX', ttl);
  
  await redis.sadd(userTokensKey, tokenHash);
  await redis.expire(userTokensKey, ttl);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  
  const result = await redis.exists(blacklistKey);
  return result === 1;
};

export const invalidateAllUserTokens = async (
  userId: number
): Promise<number> => {
  const userTokensKey = getUserTokensKey(userId);
  
  const tokenHashes = await redis.smembers(userTokensKey);
  
  if (tokenHashes.length === 0) {
    return 0;
  }
  
  const blacklistKeys = tokenHashes.map(getBlacklistKey);
  
  const multi = redis.multi();
  
  for (const key of blacklistKeys) {
    multi.set(key, userId.toString(), 'EX', DEFAULT_TOKEN_EXPIRY);
  }
  
  multi.del(userTokensKey);
  
  await multi.exec();
  
  return tokenHashes.length;
};

export const getBlacklistStats = async (): Promise<{
  totalBlacklisted: number;
}> => {
  const keys = await redis.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
  return {
    totalBlacklisted: keys.length,
  };
};

export const cleanupExpiredBlacklist = async (): Promise<number> => {
  const keys = await redis.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
  let cleaned = 0;
  
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {
      await redis.del(key);
      cleaned++;
    }
  }
  
  return cleaned;
};
```

### 2.2 核心函数说明

#### 2.2.1 `generateTokenHash`

```typescript
export const generateTokenHash = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

**为什么使用哈希**:

| 考虑因素 | 说明 |
|----------|------|
| **安全性** | 不存储原始令牌，即使Redis被攻破，攻击者也无法获取有效令牌 |
| **隐私保护** | 符合数据保护法规，不存储敏感数据 |
| **一致性** | 相同令牌生成相同哈希，便于查询 |
| **性能** | SHA-256计算快速，不影响性能 |

**哈希值特点**:
- 固定长度: 64个字符
- 不可逆: 无法从哈希还原原始令牌
- 抗碰撞: 不同令牌产生不同哈希的概率极高

#### 2.2.2 `addToBlacklist`

```typescript
export const addToBlacklist = async (
  token: string,
  userId: number,
  expiresInSeconds?: number
): Promise<void> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  const userTokensKey = getUserTokensKey(userId);
  
  const ttl = expiresInSeconds || DEFAULT_TOKEN_EXPIRY;
  
  // 存储黑名单条目
  await redis.set(blacklistKey, userId.toString(), 'EX', ttl);
  
  // 记录用户的令牌，便于批量撤销
  await redis.sadd(userTokensKey, tokenHash);
  await redis.expire(userTokensKey, ttl);
};
```

**Redis数据结构**:

```
令牌黑名单 (String):
key: token:blacklist:<token_hash>
value: <user_id>
TTL: <token_expiry_seconds>

用户令牌集合 (Set):
key: user:tokens:<user_id>
value: { <token_hash_1>, <token_hash_2>, ... }
TTL: <max_token_expiry_seconds>
```

**为什么使用两个数据结构**:

1. **黑名单String**: 快速检查单个令牌是否在黑名单
   ```typescript
   // O(1) 操作
   const isBlacklisted = await redis.exists(blacklistKey);
   ```

2. **用户令牌Set**: 支持批量撤销用户所有令牌
   ```typescript
   // 获取用户的所有令牌哈希
   const tokenHashes = await redis.smembers(userTokensKey);
   
   // 批量加入黑名单
   for (const hash of tokenHashes) {
     await redis.set(getBlacklistKey(hash), userId, 'EX', ttl);
   }
   ```

#### 2.2.3 `isTokenBlacklisted`

```typescript
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = generateTokenHash(token);
  const blacklistKey = getBlacklistKey(tokenHash);
  
  const result = await redis.exists(blacklistKey);
  return result === 1;
};
```

**调用时机**:

```typescript
// 在每次验证令牌时调用
export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    // 第1步: 检查是否在黑名单
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.warn('尝试使用已注销的令牌');
      return null;
    }
    
    // 第2步: 验证签名和过期时间
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
```

#### 2.2.4 `invalidateAllUserTokens`

```typescript
export const invalidateAllUserTokens = async (
  userId: number
): Promise<number> => {
  const userTokensKey = getUserTokensKey(userId);
  
  // 获取用户的所有令牌哈希
  const tokenHashes = await redis.smembers(userTokensKey);
  
  if (tokenHashes.length === 0) {
    return 0;
  }
  
  // 批量加入黑名单
  const blacklistKeys = tokenHashes.map(getBlacklistKey);
  
  const multi = redis.multi();
  
  for (const key of blacklistKeys) {
    multi.set(key, userId.toString(), 'EX', DEFAULT_TOKEN_EXPIRY);
  }
  
  // 删除用户令牌集合
  multi.del(userTokensKey);
  
  // 原子执行
  await multi.exec();
  
  return tokenHashes.length;
};
```

**使用场景**:

| 场景 | 说明 |
|------|------|
| **修改密码** | 撤销所有设备的令牌 |
| **账户被盗** | 用户可以远程注销所有会话 |
| **强制下线** | 管理员可以强制用户下线 |
| **安全事件** | 检测到异常行为时批量撤销 |

**事务处理**:

```typescript
// 使用 Redis MULTI/EXEC 保证原子性
const multi = redis.multi();

// 所有令牌加入黑名单
for (const key of blacklistKeys) {
  multi.set(key, userId.toString(), 'EX', DEFAULT_TOKEN_EXPIRY);
}

// 删除用户令牌集合
multi.del(userTokensKey);

// 原子执行
await multi.exec();
```

### 2.3 Redis Key设计

| Key类型 | Key格式 | 说明 |
|---------|---------|------|
| 黑名单 | `token:blacklist:<sha256_hash>` | 存储已注销的令牌哈希 |
| 用户令牌 | `user:tokens:<user_id>` | 存储用户的所有令牌哈希 |

**Key示例**:

```
令牌哈希: 
  原始: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  SHA256: a1b2c3d4e5f6... (64字符)

Redis Keys:
  token:blacklist:a1b2c3d4e5f6...  →  "1" (userId)
  user:tokens:1                      →  { "a1b2c3d4...", "x9y8z7w6..." }
```

### 2.4 TTL策略

```typescript
// 黑名单条目的TTL = 令牌剩余有效期
// 这样当令牌自然过期后，黑名单条目也会自动清理

// 场景:
// 令牌有效期: 24小时
// 用户在令牌创建后10小时注销
// 黑名单条目的TTL: 14小时 (24 - 10)
```

**为什么需要TTL**:

1. **自动清理**: 令牌过期后，黑名单条目自动删除
2. **节省内存**: 不需要手动清理过期数据
3. **数据一致性**: Redis的EXPIRE保证最终一致

---

## 3. 增强的JWT验证工具

**文件**: `server/utils/jwt-fixed.ts`

### 3.1 完整代码

```typescript
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { isTokenBlacklisted } from './token-blacklist';

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const config = useRuntimeConfig();
  
  const tokenPayload = {
    ...payload,
    jti: crypto.randomUUID(),  // 新增: JWT ID，便于追踪
  };
  
  return jwt.sign(tokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    // 第1层: 检查是否在黑名单
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.warn('[SECURITY] 尝试使用已注销的令牌');
      return null;
    }
    
    // 第2层: 验证签名和过期时间
    const config = useRuntimeConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('令牌已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('令牌无效:', error.message);
    }
    return null;
  }
};

export const extractTokenFromEvent = (event: H3Event): string | null => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

export const requireAuth = async (event: H3Event): Promise<JwtPayload> => {
  const token = extractTokenFromEvent(event);
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: '未提供认证令牌',
    });
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: '令牌无效或已过期',
    });
  }
  
  event.context.user = payload;
  return payload;
};

export const getTokenExpiry = (payload: JwtPayload): number => {
  if (!payload.exp) {
    return 24 * 60 * 60;
  }
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
};
```

### 3.2 关键改进

#### 3.2.1 新增JTI (JWT ID)

```typescript
export const generateToken = (payload: JwtPayload): string => {
  const tokenPayload = {
    ...payload,
    jti: crypto.randomUUID(),  // 新增
  };
  
  return jwt.sign(tokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};
```

**JTI的作用**:

| 用途 | 说明 |
|------|------|
| **唯一标识** | 每个令牌有唯一的ID |
| **审计追踪** | 可以追踪哪个令牌被使用 |
| **黑名单替代** | 可以使用JTI作为黑名单的key |

#### 3.2.2 验证流程改进

```typescript
// 修复前 (问题代码)
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);  // 只验证签名
  } catch {
    return null;
  }
};

// 修复后
export const verifyToken = async (token: string) => {
  try {
    // 第1步: 检查黑名单
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.warn('[SECURITY] 尝试使用已注销的令牌');
      return null;
    }
    
    // 第2步: 验证签名
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    // 处理过期、无效签名等
    return null;
  }
};
```

**验证流程图**:

```
用户请求 (携带令牌)
     ↓
extractTokenFromEvent()
     ↓
     ├─ 没有令牌 → 401 Unauthorized
     ↓
verifyToken()
     ↓
     ├─ isTokenBlacklisted()
     │   ├─ 在黑名单中 → 401 Unauthorized
     │   └─ 不在黑名单 → 继续
     ↓
     ├─ jwt.verify()
     │   ├─ 签名无效 → 401 Unauthorized
     │   ├─ 已过期 → 401 Unauthorized
     │   └─ 验证通过 → 继续
     ↓
请求处理完成
```

---

## 4. 修复注销API

**文件**: `server/api/fixed/auth/logout.post.ts`

### 4.1 完整代码

```typescript
import { requireAuth, extractTokenFromEvent, getTokenExpiry } from '../../utils/jwt-fixed';
import { addToBlacklist, logSecurityEvent } from '../../utils/token-blacklist';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const token = extractTokenFromEvent(event);
  
  if (!token) {
    throw createError({
      statusCode: 400,
      message: '无法提取令牌',
    });
  }
  
  // 计算令牌剩余有效期
  const remainingSeconds = getTokenExpiry(user);
  
  // 将令牌加入黑名单
  await addToBlacklist(token, user.userId, remainingSeconds);
  
  // 记录安全事件
  const clientIp = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip');
  logSecurityEvent(
    'USER_LOGOUT',
    {
      userId: user.userId,
      username: user.username,
      tokenExpiryRemaining: remainingSeconds,
    },
    clientIp
  );
  
  return {
    success: true,
    message: '注销成功',
    data: {
      userId: user.userId,
      loggedOutAt: new Date().toISOString(),
    },
  };
});
```

### 4.2 关键改进

#### 4.2.1 计算剩余有效期

```typescript
// 不使用固定的TTL，而是使用令牌剩余有效期
const remainingSeconds = getTokenExpiry(user);

await addToBlacklist(token, user.userId, remainingSeconds);
```

**为什么使用剩余有效期**:

| 场景 | 固定TTL (24h) | 剩余TTL (动态) |
|------|----------------|----------------|
| 令牌刚创建时注销 | 存储24小时 | 存储24小时 |
| 令牌还剩1小时注销 | 存储24小时 (浪费) | 存储1小时 (节省) |
| 令牌已过期注销 | 存储24小时 (无用) | 存储0秒 (不存储) |

#### 4.2.2 记录安全事件

```typescript
logSecurityEvent(
  'USER_LOGOUT',
  {
    userId: user.userId,
    username: user.username,
    tokenExpiryRemaining: remainingSeconds,
  },
  clientIp
);
```

**日志内容示例**:

```json
{
  "timestamp": "2026-05-01T10:30:00.000Z",
  "eventType": "USER_LOGOUT",
  "ip": "192.168.1.100",
  "details": {
    "userId": 1,
    "username": "testuser",
    "tokenExpiryRemaining": 3600
  }
}
```

---

## 5. 数据库模型建议

### 5.1 会话管理表 (可选)

```prisma
model UserSession {
  id          Int      @id @default(autoincrement())
  userId      Int
  jti         String   @unique  // JWT ID
  userAgent   String?
  ipAddress   String?
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  revokedAt   DateTime?
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([jti])
  @@index([expiresAt])
}
```

**用途**:

| 功能 | 说明 |
|------|------|
| **会话查看** | 用户可以查看所有登录的设备 |
| **会话管理** | 用户可以单独注销某个设备 |
| **安全审计** | 记录登录的时间、IP、设备 |
| **异常检测** | 检测异常登录行为 |

### 5.2 安全事件日志表

```prisma
model SecurityEvent {
  id          Int      @id @default(autoincrement())
  eventType   String
  userId      Int?
  ipAddress   String?
  details     String?  // JSON格式
  createdAt   DateTime @default(now())
  
  @@index([eventType])
  @@index([userId])
  @@index([createdAt])
}
```

---

## 6. 验证方法

### 6.1 单元测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateTokenHash,
  addToBlacklist,
  isTokenBlacklisted,
  invalidateAllUserTokens,
} from '../server/utils/token-blacklist';

vi.mock('../server/plugins/redis', () => {
  const mockRedis = {
    set: vi.fn(),
    get: vi.fn(),
    exists: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    smembers: vi.fn(),
    expire: vi.fn(),
    multi: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    }),
  };
  return { redis: mockRedis };
});

import { redis } from '../server/plugins/redis';

describe('Token黑名单测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTokenHash', () => {
    it('应该为相同的token生成相同的hash', () => {
      const token = 'test-jwt-token-12345';
      const hash1 = generateTokenHash(token);
      const hash2 = generateTokenHash(token);
      
      expect(hash1).toBe(hash2);
    });

    it('应该为不同的token生成不同的hash', () => {
      const token1 = 'test-jwt-token-12345';
      const token2 = 'test-jwt-token-67890';
      const hash1 = generateTokenHash(token1);
      const hash2 = generateTokenHash(token2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('应该生成64字符的SHA-256 hash', () => {
      const token = 'test-jwt-token-12345';
      const hash = generateTokenHash(token);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('addToBlacklist', () => {
    it('应该将token添加到黑名单', async () => {
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.sadd).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);
      
      await addToBlacklist('test-token', 1, 3600);
      
      expect(redis.set).toHaveBeenCalled();
      expect(redis.sadd).toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('应该返回true当token在黑名单中', async () => {
      vi.mocked(redis.exists).mockResolvedValue(1);
      
      const result = await isTokenBlacklisted('test-token');
      
      expect(result).toBe(true);
    });

    it('应该返回false当token不在黑名单中', async () => {
      vi.mocked(redis.exists).mockResolvedValue(0);
      
      const result = await isTokenBlacklisted('test-token');
      
      expect(result).toBe(false);
    });
  });

  describe('invalidateAllUserTokens', () => {
    it('应该撤销用户的所有token', async () => {
      const mockTokenHashes = ['hash1', 'hash2', 'hash3'];
      vi.mocked(redis.smembers).mockResolvedValue(mockTokenHashes);
      
      const result = await invalidateAllUserTokens(1);
      
      expect(result).toBe(3);
    });

    it('应该返回0当用户没有token', async () => {
      vi.mocked(redis.smembers).mockResolvedValue([]);
      
      const result = await invalidateAllUserTokens(1);
      
      expect(result).toBe(0);
    });
  });
});
```

### 6.2 集成测试

```typescript
describe('JWT注销集成测试', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    // 1. 用户登录获取token
    const loginResponse = await fetch('http://localhost:3000/api/fixed/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass',
      }),
    });
    
    const loginData = await loginResponse.json();
    token = loginData.data.token;
    userId = loginData.data.user.id;
  });

  it('应该在注销前能访问受保护资源', async () => {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    expect(response.status).toBe(200);
  });

  it('应该成功注销', async () => {
    const response = await fetch('http://localhost:3000/api/fixed/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    expect(response.status).toBe(200);
  });

  it('应该在注销后无法访问受保护资源', async () => {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    expect(response.status).toBe(401);
  });
});
```

### 6.3 手动测试步骤

1. **获取有效令牌**:
```bash
# 登录
curl -X POST http://localhost:3000/api/fixed/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# 记录返回的token
export TOKEN="<your_token_here>"
```

2. **验证令牌有效**:
```bash
# 访问受保护资源
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# 应该返回200 OK和用户信息
```

3. **注销令牌**:
```bash
curl -X POST http://localhost:3000/api/fixed/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

4. **验证令牌已失效**:
```bash
# 再次访问受保护资源
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# 应该返回401 Unauthorized
```

### 6.4 预期结果

```
步骤1: 登录成功，获取token
步骤2: 访问成功，返回用户信息
步骤3: 注销成功
步骤4: 访问失败，返回401
```

---

## 7. 高可用考虑

### 7.1 Redis单点故障

**问题**: 如果Redis挂了，黑名单功能失效

**解决方案**:

1. **Redis集群模式**:
```typescript
// 使用Redis Cluster
import Redis from 'ioredis';

const redis = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
  { host: 'redis-node-3', port: 6379 },
]);
```

2. **降级策略**:
```typescript
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const tokenHash = generateTokenHash(token);
    const blacklistKey = getBlacklistKey(tokenHash);
    
    const result = await redis.exists(blacklistKey);
    return result === 1;
  } catch (error) {
    // Redis不可用时的降级策略
    console.error('Redis连接失败，无法检查黑名单:', error);
    
    // 选项1: 严格模式 - 拒绝所有请求 (安全优先)
    // throw new Error('服务暂时不可用');
    
    // 选项2: 宽松模式 - 允许请求 (可用性优先)
    return false;
  }
};
```

### 7.2 性能考虑

**问题**: 每次验证都需要Redis查询，可能成为性能瓶颈

**解决方案**:

1. **本地缓存层**:
```typescript
import LRU from 'lru-cache';

// 本地缓存最近的黑名单检查结果
const blacklistCache = new LRU<string, boolean>({
  max: 10000,
  ttl: 5 * 60 * 1000,  // 5分钟
});

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = generateTokenHash(token);
  
  // 先查本地缓存
  const cached = blacklistCache.get(tokenHash);
  if (cached !== undefined) {
    return cached;
  }
  
  // 查Redis
  const blacklistKey = getBlacklistKey(tokenHash);
  const result = await redis.exists(blacklistKey);
  const isBlacklisted = result === 1;
  
  // 更新本地缓存
  blacklistCache.set(tokenHash, isBlacklisted);
  
  return isBlacklisted;
};
```

2. **注意事项**:
- 本地缓存可能导致短暂的不一致窗口
- 需要权衡一致性和性能
- 对于注销场景，短暂的窗口是可接受的

---

**文档完成日期**: 2026-05-01  
**版本**: 1.0
