# 问题4: SQL注入漏洞 - 详细修复方案

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 目录

1. [修复策略](#1-修复策略)
2. [新增搜索安全工具类](#2-新增搜索安全工具类)
3. [修复搜索API](#3-修复搜索api)
4. [多层防护机制](#4-多层防护机制)
5. [验证方法](#5-验证方法)

---

## 1. 修复策略

### 1.1 核心原则

1. **使用ORM查询构建器**: 完全避免手动拼接SQL字符串
2. **严格的输入验证**: 使用Zod进行参数验证
3. **主动注入检测**: 检测常见的SQL注入模式
4. **参数化查询**: 任何原始查询都使用参数化
5. **安全事件日志**: 记录可疑的安全事件

### 1.2 修复前后对比

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **查询方式** | 字符串拼接 + $queryRawUnsafe | ORM查询构建器 |
| **输入验证** | 无 | Zod严格验证 |
| **注入检测** | 无 | 主动检测常见注入模式 |
| **LIKE转义** | 无 | 自动转义特殊字符 |
| **安全日志** | 无 | 记录可疑攻击事件 |

---

## 2. 新增搜索安全工具类

**文件**: `server/utils/search-utils.ts`

### 2.1 参数验证Schema

```typescript
export const searchSchema = z.object({
  keyword: z.string()
    .max(100, '搜索关键词不能超过100个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s_-]*$/, '搜索关键词包含非法字符')
    .optional(),
  page: z.coerce.number()
    .int('页码必须是整数')
    .positive('页码必须是正整数')
    .default(1),
  pageSize: z.coerce.number()
    .int('每页数量必须是整数')
    .positive('每页数量必须是正整数')
    .max(100, '每页数量不能超过100')
    .default(10),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  sortBy: z.enum(['createdAt', 'likeCount', 'viewCount', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

**验证规则说明**:

| 字段 | 验证规则 | 目的 |
|------|----------|------|
| keyword | 最大100字符 | 防止超长输入导致DoS |
| keyword | 只允许中文、字母、数字、空格、下划线、连字符 | 防止特殊字符注入 |
| page | 必须是正整数 | 防止负数或非数字 |
| pageSize | 1-100之间 | 防止返回过多数据 |

### 2.2 SQL注入模式检测

```typescript
export const SQL_INJECTION_PATTERNS = [
  /'.*--/,           // 注释绕过
  /'.*;/,            // 堆叠查询
  /'.*OR.*'/,        // 布尔盲注
  /'.*AND.*'/,       // 布尔盲注
  /UNION.*SELECT/i,  // 联合查询
  /INSERT.*INTO/i,   // 数据插入
  /DELETE.*FROM/i,   // 数据删除
  /UPDATE.*SET/i,    // 数据更新
  /DROP.*TABLE/i,    // 表删除
  /CREATE.*TABLE/i,  // 表创建
  /ALTER.*TABLE/i,   // 表修改
  /EXEC.*xp_/i,      // 存储过程执行
  /sp_executesql/i,  // 动态SQL执行
  /WAITFOR.*DELAY/i, // 时间盲注
];

export const detectSqlInjectionAttempt = (input: string): boolean => {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
};
```

**注入模式说明**:

| 模式 | 攻击类型 | 示例 |
|------|----------|------|
| `'.*--` | 注释绕过 | `admin'--` |
| `'.*;` | 堆叠查询 | `'; DROP TABLE--` |
| `'.*OR.*'` | 布尔盲注 | `' OR '1'='1` |
| `UNION.*SELECT` | 联合查询 | `' UNION SELECT *--` |
| `WAITFOR.*DELAY` | 时间盲注 | `'; WAITFOR DELAY '0:0:5'--` |

### 2.3 LIKE特殊字符转义

```typescript
export const SQL_SPECIAL_CHARS = ['%', '_', '[', ']', '^'];

export const escapeSqlLikePattern = (pattern: string): string => {
  let escaped = pattern;
  for (const char of SQL_SPECIAL_CHARS) {
    escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
  }
  return escaped;
};
```

**为什么需要转义**:

```sql
-- 问题: 用户搜索 "test%"
-- 期望: 查找包含 "test%" 的记录
-- 实际: % 被解释为通配符，匹配所有以test开头的记录

SELECT * FROM Article WHERE title LIKE '%test%%';  -- ❌ 问题

-- 修复: 转义 % 字符
SELECT * FROM Article WHERE title LIKE '%test\%%';  -- ✅ 正确
```

### 2.4 关键词清理函数

```typescript
export const sanitizeSearchKeyword = (keyword: string): string => {
  const trimmed = keyword.trim();
  
  if (trimmed.length === 0) {
    return '';
  }
  
  // 移除危险的SQL字符
  const withoutSpecialChars = trimmed.replace(/[;'"\-\\]/g, ' ');
  
  // 合并多个空格为单个
  const singleSpaces = withoutSpecialChars.replace(/\s+/g, ' ');
  
  return singleSpaces.trim();
};
```

### 2.5 搜索模式构建

```typescript
export const buildSearchPattern = (keyword: string): string => {
  const sanitized = sanitizeSearchKeyword(keyword);
  if (!sanitized) return '';
  
  const escaped = escapeSqlLikePattern(sanitized);
  
  return `%${escaped}%`;
};
```

### 2.6 安全事件日志

```typescript
export const logSecurityEvent = (
  eventType: string,
  details: Record<string, unknown>,
  ip?: string
): void => {
  const timestamp = new Date().toISOString();
  const logMessage = JSON.stringify({
    timestamp,
    eventType,
    ip: ip || 'unknown',
    details,
  });
  
  console.warn(`[SECURITY] ${logMessage}`);
};
```

---

## 3. 修复搜索API

**文件**: `server/api/fixed/search/articles.get.ts`

### 3.1 完整代码

```typescript
import prisma from '../../plugins/prisma';
import { Prisma } from '@prisma/client';
import {
  searchSchema,
  buildSearchPattern,
  detectSqlInjectionAttempt,
  logSecurityEvent,
} from '../../utils/search-utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // 第1层防护: Zod参数验证
  const validated = searchSchema.safeParse(query);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { keyword, page, pageSize, status, sortBy, sortOrder } = validated.data;
  const clientIp = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip');
  
  // 第2层防护: 主动SQL注入检测
  if (keyword && detectSqlInjectionAttempt(keyword)) {
    logSecurityEvent(
      'SQL_INJECTION_ATTEMPT',
      {
        endpoint: '/api/fixed/search/articles',
        keyword,
        queryParams: query,
      },
      clientIp
    );
    
    throw createError({
      statusCode: 400,
      message: '搜索参数无效',
    });
  }
  
  // 第3层防护: 使用ORM查询构建器
  const where: Prisma.ArticleWhereInput = {
    status: status || 'published',
  };
  
  if (keyword) {
    const searchPattern = buildSearchPattern(keyword);
    
    if (searchPattern) {
      where.OR = [
        {
          title: {
            contains: searchPattern,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchPattern,
            mode: 'insensitive',
          },
        },
      ];
    }
  }
  
  const orderBy: Prisma.ArticleOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  // 使用Promise.all并行查询
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
    prisma.article.count({
      where,
    }),
  ]);
  
  // 格式化日期
  const articlesWithIsoDates = articles.map((article) => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
  }));
  
  return {
    success: true,
    data: {
      items: articlesWithIsoDates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    searchParams: {
      keyword: keyword || '',
      status: status || 'published',
      sortBy,
      sortOrder,
    },
  };
});
```

### 3.2 关键改进说明

#### 3.2.1 第1层: Zod参数验证

```typescript
// 问题代码 (修复前)
const keyword = query.keyword as string || '';
const page = parseInt(query.page as string || '1', 10);
const pageSize = parseInt(query.pageSize as string || '10', 10);

// 修复代码
const validated = searchSchema.safeParse(query);

if (!validated.success) {
  throw createError({
    statusCode: 400,
    message: '参数验证失败',
    data: validated.error.issues,
  });
}
```

**Zod验证的优势**:
1. **类型安全**: 自动类型转换和验证
2. **声明式**: 使用Schema定义验证规则
3. **详细错误**: 返回具体的验证失败原因
4. **可组合**: 可以复用和组合Schema

#### 3.2.2 第2层: 主动注入检测

```typescript
// 新增：检测并记录注入尝试
if (keyword && detectSqlInjectionAttempt(keyword)) {
  logSecurityEvent(
    'SQL_INJECTION_ATTEMPT',
    {
      endpoint: '/api/fixed/search/articles',
      keyword,
      queryParams: query,
    },
    clientIp
  );
  
  throw createError({
    statusCode: 400,
    message: '搜索参数无效',
  });
}
```

**为什么需要主动检测**:
1. **早期拦截**: 在执行查询前就拦截可疑请求
2. **安全审计**: 记录攻击事件，便于分析和防护
3. **多层防护**: 即使其他层有漏洞，这层也能提供保护

#### 3.2.3 第3层: ORM查询构建器

```typescript
// 问题代码 (修复前)
const sql = `
  SELECT * FROM Article 
  WHERE status = 'published' 
  AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
  ORDER BY createdAt DESC
  LIMIT ${(page - 1) * pageSize}, ${pageSize}
`;
const result = await prisma.$queryRawUnsafe(sql);

// 修复代码
const where: Prisma.ArticleWhereInput = {
  status: status || 'published',
};

if (keyword) {
  const searchPattern = buildSearchPattern(keyword);
  
  if (searchPattern) {
    where.OR = [
      {
        title: {
          contains: searchPattern,
          mode: 'insensitive',
        },
      },
      {
        content: {
          contains: searchPattern,
          mode: 'insensitive',
        },
      },
    ];
  }
}

const articles = await prisma.article.findMany({
  where,
  orderBy,
  skip,
  take,
  include: {
    author: {
      select: {
        id: true,
        username: true,
      },
    },
  },
});
```

**ORM查询构建器的优势**:

| 特性 | 说明 |
|------|------|
| **参数化查询** | Prisma自动处理参数化，防止注入 |
| **类型安全** | TypeScript类型检查，编译时发现错误 |
| **自动转义** | 特殊字符自动转义 |
| **查询优化** | Prisma优化生成的SQL |
| **关系查询** | 方便处理表关联 |

### 3.3 生成的SQL对比

#### 修复前 (危险)

```typescript
// 用户输入: keyword = "' OR '1'='1"
const sql = `
  SELECT * FROM Article 
  WHERE status = 'published' 
  AND (title LIKE '%' OR '1'='1%' OR content LIKE '%' OR '1'='1%')
  ORDER BY createdAt DESC
  LIMIT 0, 10
`;

// ❌ 问题: '1'='1 永远为真，返回所有文章
```

#### 修复后 (安全)

```typescript
// 用户输入: keyword = "' OR '1'='1"

// 第1层: Zod验证失败，因为regex不匹配
// 或
// 第2层: detectSqlInjectionAttempt 检测到注入模式

// 如果通过前两层（假设输入是 "test"）:
const where = {
  status: 'published',
  OR: [
    { title: { contains: '%test%', mode: 'insensitive' } },
    { content: { contains: '%test%', mode: 'insensitive' } },
  ],
};

// Prisma生成的SQL (参数化):
// SELECT * FROM Article 
// WHERE status = 'published' 
// AND (
//   title LIKE ? ESCAPE '\' 
//   OR content LIKE ? ESCAPE '\'
// )
// ORDER BY createdAt DESC
// LIMIT ? OFFSET ?

// ✅ 参数值: ['%test%', '%test%', 10, 0]
```

---

## 4. 多层防护机制

### 4.1 防护架构图

```
用户输入
   ↓
┌─────────────────────────────────────────┐
│ 第1层: Zod参数验证                        │
│  - 格式验证 (regex)                      │
│  - 长度限制 (max 100)                    │
│  - 类型转换 (coerce)                      │
└─────────────────────────────────────────┘
   ↓ 通过
┌─────────────────────────────────────────┐
│ 第2层: 主动注入检测                       │
│  - 检测常见注入模式                        │
│  - 记录安全事件                           │
│  - 拒绝可疑请求                           │
└─────────────────────────────────────────┘
   ↓ 通过
┌─────────────────────────────────────────┐
│ 第3层: 输入清理和转义                     │
│  - 移除危险字符                           │
│  - 转义LIKE特殊字符 (% _ [ ])            │
│  - 构建安全的搜索模式                      │
└─────────────────────────────────────────┘
   ↓ 通过
┌─────────────────────────────────────────┐
│ 第4层: ORM查询构建器                      │
│  - 使用Prisma的findMany/count            │
│  - 参数化查询                            │
│  - 类型安全                              │
└─────────────────────────────────────────┘
   ↓ 执行
数据库
```

### 4.2 各层职责

| 层级 | 职责 | 失败行为 |
|------|------|----------|
| **第1层** | 格式和类型验证 | 返回400错误，提示具体问题 |
| **第2层** | 注入检测 | 返回400错误，记录安全事件 |
| **第3层** | 输入清理 | 静默清理，不影响正常请求 |
| **第4层** | 安全查询 | 框架层保护，无法绕过 |

### 4.3 纵深防御原则

```
为什么需要多层防护?

场景1: 某一层有漏洞
- 第1层验证规则有bug
- 但第2层注入检测可以拦截
- 或第4层ORM可以保护

场景2: 新的注入技术出现
- 攻击者发现新的注入模式
- 第2层可能无法检测
- 但第1层regex可能拦截
- 或第4层ORM保护

场景3: 配置错误
- 开发人员不小心使用了$queryRawUnsafe
- 但第1层和第2层已经拦截了危险输入
```

---

## 5. 验证方法

### 5.1 单元测试

```typescript
describe('搜索安全测试', () => {
  describe('参数验证', () => {
    it('应该拒绝包含特殊字符的关键词', () => {
      const result = searchSchema.safeParse({
        keyword: "test'; DROP TABLE--",
        page: 1,
        pageSize: 10,
      });
      
      expect(result.success).toBe(false);
    });
    
    it('应该拒绝超过长度限制的关键词', () => {
      const result = searchSchema.safeParse({
        keyword: 'a'.repeat(200),
        page: 1,
        pageSize: 10,
      });
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('注入检测', () => {
    it('应该检测常见的注入模式', () => {
      expect(detectSqlInjectionAttempt("' OR '1'='1")).toBe(true);
      expect(detectSqlInjectionAttempt("admin'--")).toBe(true);
      expect(detectSqlInjectionAttempt("'; DROP TABLE--")).toBe(true);
      expect(detectSqlInjectionAttempt("' UNION SELECT *--")).toBe(true);
    });
    
    it('不应该误报正常输入', () => {
      expect(detectSqlInjectionAttempt('正常搜索')).toBe(false);
      expect(detectSqlInjectionAttempt('test search 123')).toBe(false);
    });
  });
  
  describe('LIKE转义', () => {
    it('应该转义特殊字符', () => {
      expect(escapeSqlLikePattern('test%')).toBe('test\\%');
      expect(escapeSqlLikePattern('test_')).toBe('test\\_');
      expect(escapeSqlLikePattern('test[]')).toBe('test\\[\\]');
    });
  });
});
```

### 5.2 渗透测试

```typescript
describe('SQL注入渗透测试', () => {
  const SQL_INJECTION_PAYLOADS = [
    // 布尔盲注
    "' OR '1'='1",
    "' OR 1=1--",
    "' OR 'a'='a",
    
    // 注释绕过
    "admin'--",
    "admin' #",
    "admin'/*",
    
    // 联合查询
    "' UNION SELECT * FROM users--",
    "' UNION SELECT NULL, username, password FROM users--",
    
    // 堆叠查询
    "'; DROP TABLE users;--",
    "'; INSERT INTO users (username,password) VALUES ('hacker','123456');--",
    
    // 时间盲注
    "' AND SLEEP(5)--",
    "'; WAITFOR DELAY '0:0:5'--",
    
    // 基于错误的注入
    "' AND extractvalue(1,concat(0x7e,VERSION(),0x7e))--",
  ];
  
  it('应该拦截所有注入尝试', async () => {
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await fetch(
        `http://localhost:3000/api/fixed/search/articles?keyword=${encodeURIComponent(payload)}`
      );
      
      // 应该返回400或403，而不是200
      expect(response.status).not.toBe(200);
      
      // 或者验证返回的数据不应该包含意外内容
      const data = await response.json();
      console.log(`Payload: ${payload}, Status: ${response.status}`);
    }
  });
});
```

### 5.3 手动测试步骤

1. **测试布尔盲注**:
```bash
# 正常搜索
curl "http://localhost:3000/api/fixed/search/articles?keyword=test"

# 注入尝试 (应该被拦截)
curl "http://localhost:3000/api/fixed/search/articles?keyword=' OR '1'='1"
```

2. **测试联合查询注入**:
```bash
curl "http://localhost:3000/api/fixed/search/articles?keyword=' UNION SELECT * FROM users--"
```

3. **测试时间盲注**:
```bash
# 测量响应时间
time curl "http://localhost:3000/api/fixed/search/articles?keyword=' AND SLEEP(5)--"
# 应该立即返回，而不是等待5秒
```

4. **测试堆叠查询**:
```bash
curl "http://localhost:3000/api/fixed/search/articles?keyword='; DROP TABLE Article;--"
```

### 5.4 预期结果

所有注入尝试都应该被拦截，返回 `400 Bad Request` 或类似错误：

```json
{
  "statusCode": 400,
  "message": "参数验证失败"
}
```

或

```json
{
  "statusCode": 400,
  "message": "搜索参数无效"
}
```

---

## 6. 额外建议

### 6.1 数据库权限控制

```sql
-- 应用数据库用户应该只有必要的权限
-- 不应该有 DROP TABLE、ALTER TABLE 等权限

CREATE USER 'app_user'@'localhost' 
IDENTIFIED BY 'YourStrongPassword123!';

-- 只授予必要的权限
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON content_subscription.* 
  TO 'app_user'@'localhost';

-- 禁止危险权限
-- REVOKE DROP, ALTER, CREATE, EXECUTE 
--   ON content_subscription.* 
--   FROM 'app_user'@'localhost';

FLUSH PRIVILEGES;
```

### 6.2 数据库用户最小权限原则

| 权限 | 是否需要 | 说明 |
|------|----------|------|
| SELECT | ✅ 需要 | 查询数据 |
| INSERT | ✅ 需要 | 创建数据 |
| UPDATE | ✅ 需要 | 更新数据 |
| DELETE | ✅ 需要 | 删除数据 |
| DROP | ❌ 禁止 | 删除表 |
| ALTER | ❌ 禁止 | 修改表结构 |
| CREATE | ❌ 禁止 | 创建表 |
| EXECUTE | ❌ 禁止 | 执行存储过程 |

### 6.3 定期安全扫描

建议集成以下工具：

1. **OWASP ZAP**: 自动化安全扫描
2. **SQLMap**: SQL注入测试工具
3. **Semgrep**: 代码静态分析
4. **Husky + lint-staged**: 提交前检查

### 6.4 代码审查清单

在代码审查时检查以下几点：

1. **是否使用了 `$queryRawUnsafe`**?
   ```typescript
   // ❌ 危险
   await prisma.$queryRawUnsafe(`SELECT * FROM Article WHERE title LIKE '%${keyword}%'`);
   
   // ✅ 安全
   await prisma.$queryRaw`SELECT * FROM Article WHERE title LIKE ${'%' + keyword + '%'}`;
   
   // ✅ 更安全
   await prisma.article.findMany({
     where: { title: { contains: keyword } }
   });
   ```

2. **是否验证了所有用户输入**?
   - URL参数 (`getQuery`)
   - 请求体 (`readBody`)
   - 路由参数 (`getRouterParam`)
   - 请求头 (`getHeader`)

3. **是否记录了安全事件**?
   - 注入尝试
   - 认证失败
   - 越权访问

---

**文档完成日期**: 2026-05-01  
**版本**: 1.0
