# 修复方案1：Prisma连接池耗尽问题

## 问题描述

在Serverless环境（如Vercel）中，Next.js的每个请求可能会创建一个新的Prisma客户端实例。这导致数据库连接数快速耗尽，生产环境每小时崩溃一次。

### 问题根因

1. **Serverless冷启动**：每个函数实例独立运行，不共享连接
2. **无连接池管理**：传统连接池在Serverless环境中失效
3. **连接数上限**：PostgreSQL默认最大连接数通常为100

### 错误表现

```
Error: Connection pool exhausted
Error: too many connections for role "postgres"
PrismaClientInitializationError: Can't reach database server
```

---

## 解决方案

### 1. Prisma客户端单例模式

**文件位置**：`lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**工作原理**：
- 开发环境：使用global对象缓存Prisma实例，避免热重载时重复创建
- 生产环境：每个Serverless函数实例共享单个Prisma实例

### 2. PgBouncer连接池配置

#### 环境变量配置

**开发环境**：
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db"
```

**生产环境（使用PgBouncer）**：
```env
DATABASE_URL="postgresql://user:password@pgbouncer-host:6432/ecommerce_db?pgbouncer=true&connection_limit=1"
```

#### PgBouncer配置文件示例

```ini
; pgbouncer.ini
[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 3
server_reset_query = DISCARD ALL
ignore_startup_parameters = extra_float_digits

[databases]
ecommerce_db = host=db-host port=5432 dbname=ecommerce_db
```

#### 关键配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `pool_mode` | `transaction` | 事务级连接池，最适合Serverless |
| `default_pool_size` | `20` | 每个数据库的默认连接池大小 |
| `max_client_conn` | `1000` | 最大客户端连接数 |
| `connection_limit` | `1` | 每个Prisma实例的连接数限制 |

### 3. 数据库健康检查

**文件位置**：`lib/db-health.ts`

```typescript
export interface DatabaseHealth {
  healthy: boolean
  connections: {
    active: number
    idle: number
    total: number
  }
  queryTimeMs: number
  timestamp: string
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now()
  
  await prisma.$queryRaw`SELECT 1`
  
  const connectionStats = await prisma.$queryRaw`
    SELECT 
      count(*) as total,
      count(*) FILTER (WHERE state = 'active') as active,
      count(*) FILTER (WHERE state = 'idle') as idle
    FROM pg_stat_activity
    WHERE datname = current_database()
  `
  
  return {
    healthy: Date.now() - startTime < 5000,
    connections: { /* ... */ },
    queryTimeMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  }
}
```

---

## 部署指南

### 方案A：使用托管PgBouncer（推荐）

**Supabase**：
- Supabase内置PgBouncer，端口6543
- 连接字符串：`postgresql://user:pass@db.supabase.co:6543/postgres?pgbouncer=true`

**AWS RDS Proxy**：
- 创建RDS Proxy，启用连接池
- 连接到Proxy端点而非直接数据库

**PlanetScale/Vercel Postgres**：
- 这些服务内置连接池管理
- 只需使用提供的连接字符串

### 方案B：自行部署PgBouncer

**Docker部署**：
```bash
docker run -d \
  --name pgbouncer \
  -p 6432:6432 \
  -v /path/to/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini \
  -v /path/to/userlist.txt:/etc/pgbouncer/userlist.txt \
  edoburu/pgbouncer
```

**Kubernetes部署**：
- 使用PgBouncer Operator
- 或作为Sidecar容器部署

---

## 监控和告警

### 关键指标监控

1. **连接数监控**：
   - `pg_stat_activity`中的活跃连接数
   - 连接池使用率

2. **性能指标**：
   - 查询响应时间
   - 排队等待的查询数

3. **告警阈值**：
   - 连接数 > 80% 最大连接数时告警
   - 查询时间 > 2秒时告警
   - 排队查询 > 10时告警

### 健康检查API

可以创建一个API端点用于监控：

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { checkDatabaseHealth, isConnectionPoolHealthy } from '@/lib/db-health'

export async function GET() {
  const dbHealth = await checkDatabaseHealth()
  const poolHealthy = await isConnectionPoolHealthy()
  
  const health = {
    status: dbHealth.healthy && poolHealthy ? 'healthy' : 'degraded',
    database: dbHealth,
    poolHealthy,
    timestamp: new Date().toISOString(),
  }
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  })
}
```

---

## 测试验证

运行测试用例：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- prisma-connection

# 带覆盖率
npm run test:coverage
```

### 关键测试项

1. **单例模式验证**：确认多次import返回同一实例
2. **并发查询测试**：验证连接复用，不泄漏连接
3. **健康检查测试**：验证健康状态返回正确
4. **连接池统计测试**：验证连接数统计正确

---

## 验证清单

- [ ] Prisma客户端使用单例模式
- [ ] 生产环境DATABASE_URL包含`pgbouncer=true`
- [ ] 生产环境DATABASE_URL包含`connection_limit=1`
- [ ] PgBouncer配置`pool_mode=transaction`
- [ ] 数据库连接监控已配置
- [ ] 健康检查API可访问
- [ ] 连接数告警已设置
- [ ] 测试用例全部通过

---

## 相关文件

- `lib/prisma.ts` - Prisma单例客户端
- `lib/db-health.ts` - 数据库健康检查
- `tests/prisma-connection.test.ts` - 测试用例
- `.env.example` - 环境变量示例
