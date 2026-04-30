# 修复方案2：S3 CDN缓存问题

## 问题描述

图片上传到S3后，在CDN上偶发404错误。用户访问新上传的图片时，有时会看到404或旧版本图片。

### 问题根因

1. **CDN缓存404响应**：CDN边缘节点缓存了旧的404响应
2. **旧版本缓存**：同名文件被覆盖后，CDN仍返回旧版本
3. **缓存一致性**：S3上传完成后，CDN边缘节点同步延迟
4. **Cache-Control配置不当**：过长的max-age导致缓存无法及时刷新

### 错误表现

```
用户访问：图片上传成功，但CDN返回404
用户访问：显示旧版本图片
用户访问：部分地区显示新图，部分地区显示旧图
```

---

## 解决方案

### 1. 时间戳版本化命名

**文件位置**：`lib/s3.ts`

```typescript
export function generateUniqueKey(originalKey: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 10)
  const ext = originalKey.split('.').pop() || ''
  const baseName = originalKey.replace(`.${ext}`, '')

  return `${baseName}_${timestamp}_${randomStr}.${ext}
}

// 示例：products/123/image.jpg 
// 变为：products/123/image_1714473600000_abc123.jpg
```

**工作原理**：
- 每次上传生成唯一文件名
- 避免覆盖同名文件
- 从根本上避免缓存问题

### 2. 主动触发CloudFront缓存失效

**文件位置**：`lib/s3.ts`

```typescript
export async function invalidateCdnCache(
  paths: string[],
  options: {
    waitForCompletion?: boolean
    maxWaitTime?: number
  } = {}
): Promise<InvalidationResult> {
  const cloudFrontClient = getCloudFrontClient()

  const normalizedPaths = paths.map((path) =>
    path.startsWith('/') ? path : `/${path}`
  )

  const command = new CreateInvalidationCommand({
    DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: `invalidation_${Date.now()}_${Math.random()}`,
      Paths: {
        Quantity: normalizedPaths.length,
        Items: normalizedPaths,
      },
    },
  })

  const result = await cloudFrontClient.send(command)

  return {
    invalidationId: result.Invalidation?.Id,
    status: result.Invalidation?.Status || 'InProgress',
    createTime: result.Invalidation?.CreateTime
      ? new Date(result.Invalidation.CreateTime)
      : new Date(),
  }
}
```

### 3. 上传后自动失效

**文件位置**：`lib/s3.ts`

```typescript
export async function uploadAndInvalidate(
  file: Buffer | Uint8Array | Blob,
  baseKey: string,
  options: {
    oldKey?: string
    contentType?: string
    waitForInvalidation?: boolean
  } = {}
): Promise<UploadResult & { invalidationResult?: InvalidationResult }> {
  const { oldKey, contentType, waitForInvalidation = false } = options

  const uniqueKey = generateUniqueKey(baseKey)

  const uploadResult = await uploadFile(file, uniqueKey, {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable',
  })

  const pathsToInvalidate: string[] = [uniqueKey]

  if (oldKey && oldKey !== uniqueKey) {
    pathsToInvalidate.push(oldKey)
  }

  let invalidationResult: InvalidationResult | undefined

  try {
    invalidationResult = await invalidateCdnCache(pathsToInvalidate, {
      waitForCompletion: waitForInvalidation,
    })
  } catch (error) {
    console.warn('Failed to invalidate CDN cache:', error)
  }

  if (oldKey && oldKey !== uniqueKey) {
    await deleteFile(oldKey)
  }

  return {
    ...uploadResult,
    invalidationResult,
  }
}
```

### 4. Cache-Control优化配置

```typescript
const putParams: PutObjectCommandInput = {
  Bucket: S3_BUCKET,
  Key: key,
  Body: file,
  ContentType: contentType,
  CacheControl: 'public, max-age=31536000, immutable',
  ACL: 'public-read',
}
```

**Cache-Control参数说明**：

| 参数 | 值 | 说明 |
|------|-----|------|
| `public` | - | 允许任何缓存（CDN、浏览器）缓存 |
| `max-age=31536000` | 1年 | 缓存有效期 |
| `immutable` | - | 资源内容不会改变 |

**为什么使用immutable**：
- 配合唯一文件名，内容永不过期
- 浏览器直接使用缓存，不发送验证请求
- 减少304响应，提升性能

---

## 环境变量配置

```env
# AWS S3配置
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"

# S3 Bucket
AWS_S3_BUCKET="your-bucket-name"

# CloudFront配置
AWS_CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
CDN_DOMAIN="cdn.yourdomain.com"
```

---

## IAM权限配置

需要为IAM用户以下权限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::123456789012:distribution/your-distribution-id"
    }
  ]
}
```

---

## Server Action实现

**文件位置**：`app/actions/upload.ts`

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import {
  uploadAndInvalidate,
  getPresignedUploadUrl,
  invalidateCdnCache,
} from '@/lib/s3'
import { revalidatePath } from 'next/cache'

export async function uploadProductImage(
  formData: FormData,
  productId: string
): Promise<UploadImageResult> {
  const file = formData.get('image') as File
  
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { imageKey: true },
  })

  const buffer = Buffer.from(await file.arrayBuffer())
  const baseKey = `products/${productId}/image`

  const result = await uploadAndInvalidate(buffer, baseKey, {
    oldKey: product?.imageKey || undefined,
    contentType: file.type,
  })

  await prisma.product.update({
    where: { id: productId },
    data: {
      imageUrl: result.cdnUrl,
      imageKey: result.key,
    },
  })

  revalidatePath(`/products/${productId}`)

  return {
    success: true,
    data: {
      url: result.cdnUrl,
      key: result.key,
      invalidationId: result.invalidationResult?.invalidationId,
    },
  }
}
```

---

## 预签名URL上传（大文件优化）

对于大文件上传，推荐使用预签名URL：

```typescript
export async function getPresignedUploadUrl(
  key: string,
  options: {
    contentType?: string
    expiresIn?: number
  } = {}
): Promise<{ url: string; key: string }> {
  const { contentType = 'application/octet-stream', expiresIn = 300 } = options

  const s3Client = getS3Client()
  const uniqueKey = generateUniqueKey(key)

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: uniqueKey,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn })

  return { url, key: uniqueKey }
}
```

**使用流程**：
1. 前端请求预签名URL
2. 前端直接上传到S3（跳过服务器）
3. 上传完成后调用confirmUpload
4. 服务器更新数据库并触发CDN失效

---

## 测试验证

运行测试用例：

```bash
npm test -- s3-upload
```

### 关键测试项

1. **唯一键生成**：确保文件名包含时间戳和随机字符串
2. **键验证**：正确识别有效/无效键
3. **上传功能**：模拟S3上传和CloudFront失效
4. **文件存在检查**：正确判断文件是否存在
5. **CDN URL生成**：正确生成CDN URL
6. **预签名URL**：生成正确格式的预签名URL
7. **错误处理**：正确处理S3错误

---

## 验证清单

- [ ] S3上传使用唯一文件名（时间戳版本化）
- [ ] Cache-Control设置为`immutable`
- [ ] 上传后自动触发CloudFront失效
- [ ] 更新图片时删除旧文件
- [ ] IAM权限包含CloudFront失效权限
- [ ] 环境变量配置正确
- [ ] 测试用例全部通过
- [ ] 验证CDN失效功能正常

---

## 最佳实践

### 1. 文件名策略

**推荐**：`{类型}/{ID}/{名称}_{时间戳}_{随机字符串}.{扩展名}

示例：
- `products/123/main_1714473600000_abc123.jpg`
- `users/456/avatar_1714473600000_def456.png`

### 2. 失效策略

| 场景 | 失效路径 |
|------|-----------|
| 新上传 | `新文件路径 |
| 更新图片 | `新文件路径 + 旧文件路径 |
| 删除图片 | `旧文件路径` |

### 3. 监控指标

| 指标 | 说明 |
|------|------|
| 失效延迟 | CloudFront失效完成时间（通常5-10分钟） |
| 404比例 | CDN返回404的比例 |
| 缓存命中率 | CDN缓存命中率 |

---

## 相关文件

- `lib/s3.ts` - S3上传和CDN失效服务
- `app/actions/upload.ts` - 上传Server Action
- `tests/s3-upload.test.ts` - 测试用例
- `.env.example` - 环境变量示例
