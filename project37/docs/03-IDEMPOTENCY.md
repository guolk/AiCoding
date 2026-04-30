# 修复方案3：Server Action幂等性（防止重复扣款）

## 问题描述

结算页面的Server Action在网络不稳定时被重复触发，导致用户被重复扣款。

### 问题根因

1. **网络不稳定**：请求超时后浏览器自动重试
2. **用户重复点击**：提交按钮未禁用，用户多次点击
3. **无幂等性保证**：相同请求多次执行产生不同结果
4. **缺乏防重机制**：数据库层面无唯一约束

### 错误表现

```
用户一次操作产生多个订单
同一订单被多次扣款
库存被多次扣减
用户账户余额异常减少
```

---

## 解决方案

### 1. 数据库层面：唯一约束

**文件位置**：`prisma/schema.prisma`

```prisma
model Order {
  id            String    @id @default(uuid())
  idempotencyKey String    @unique(map: "Order_idempotencyKey_key")
  userId        String
  status        OrderStatus @default(PENDING)
  totalAmount   Decimal
  // ... 其他字段
}

model Payment {
  id              String        @id @default(uuid())
  orderId         String
  amount          Decimal
  idempotencyKey  String        @unique(map: "Payment_idempotencyKey_key")
  // ... 其他字段
}
```

**关键设计**：
- `idempotencyKey`字段设置唯一索引
- 数据库层面确保同一幂等键只能创建一条记录
- 最终防线，防止任何层的重复请求

### 2. 幂等键生成和验证

**文件位置**：`lib/idempotency.ts`

```typescript
export function generateIdempotencyKey(): string {
  const timestamp = Date.now()
  const randomHex = randomBytes(config.keyLength).toString('hex')
  return `${config.keyPrefix}_${timestamp}_${randomHex}`
}

export function isIdempotencyKeyValid(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false
  }

  const pattern = new RegExp(
    `^${config.keyPrefix}_\\d+_[a-f0-9]{${config.keyLength * 2}}$`
  )

  if (!pattern.test(key)) {
    return false
  }

  const timestampMatch = key.match(/_(\d+)_/)
  if (timestampMatch) {
    const timestamp = parseInt(timestampMatch[1], 10)
    const age = Date.now() - timestamp
    if (age > config.maxAgeMs) {
      return false
    }
  }

  return true
}
```

**幂等键格式**：`idem_{时间戳}_{32位随机Hex}`

示例：`idem_1714473600000_abcdef0123456789abcdef0123456789`

**验证逻辑**：
1. 格式验证：正则匹配
2. 过期验证：默认24小时过期

### 3. withIdempotency包装器

**文件位置**：`lib/idempotency.ts`

```typescript
export async function withIdempotency<T>(
  key: string,
  operation: () => Promise<T>,
  checkExisting: (key: string) => Promise<T | null>,
  options: {
    onConflict?: () => Promise<T>
  } = {}
): Promise<IdempotencyResult<T>> {
  if (!isIdempotencyKeyValid(key)) {
    throw new Error(`Invalid or expired idempotency key: ${key}`)
  }

  const existing = await checkExisting(key)
  if (existing !== null) {
    return {
      isNew: false,
      result: existing,
    }
  }

  try {
    const result = await operation()
    return {
      isNew: true,
      result,
    }
  } catch (error: any) {
    if (isUniqueConstraintViolation(error)) {
      const existingAfterConflict = await checkExisting(key)
      if (existingAfterConflict !== null) {
        return {
          isNew: false,
          result: existingAfterConflict,
        }
      }

      if (options.onConflict) {
        const conflictResult = await options.onConflict()
        return {
          isNew: false,
          result: conflictResult,
        }
      }
    }
    throw error
  }
}
```

**工作流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                    withIdempotency 执行流程                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 验证幂等键有效性                                          │
│        │                                                      │
│        ▼                                                      │
│  2. 检查是否存在已有记录                                        │
│        │                                                      │
│     ┌──┴──┐                                                   │
│    是     否                                                  │
│    │       │                                                  │
│    ▼       ▼                                                  │
│ 返回已有   执行业务操作                                         │
│ 结果      │                                                    │
│           ▼                                                    │
│      ┌─────────┐                                               │
│     成功      失败                                             │
│      │         │                                               │
│      ▼         ▼                                               │
│   返回结果   检查是否唯一约束错误                                │
│               │                                                │
│            ┌──┴──┐                                             │
│           是     否                                            │
│           │       │                                            │
│           ▼       ▼                                            │
│        再次检查   抛出错误                                       │
│        已有记录                                                  │
│           │                                                    │
│           ▼                                                    │
│        返回已有结果                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. 结算Server Action实现

**文件位置**：`app/actions/checkout.ts`

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import {
  generateIdempotencyKey,
  isIdempotencyKeyValid,
  withIdempotency,
  isUniqueConstraintViolation,
} from '@/lib/idempotency'
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function processCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
  const { items, userId, paymentMethodId, idempotencyKey } = request

  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  const idemKey = idempotencyKey || generateIdempotencyKey()

  if (!isIdempotencyKeyValid(idemKey)) {
    return {
      success: false,
      error: 'Invalid or expired idempotency key',
    }
  }

  try {
    const result = await withIdempotency(
      idemKey,
      async () => {
        return await executeCheckoutTransaction({
          items,
          userId,
          paymentMethodId,
          idempotencyKey: idemKey,
        })
      },
      checkExistingOrder
    )

    revalidatePath('/cart')
    revalidatePath('/orders')

    return result.result
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      const existingOrder = await checkExistingOrder(idemKey)
      if (existingOrder) {
        return existingOrder
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed',
    }
  }
}

async function checkExistingOrder(
  idempotencyKey: string
): Promise<CheckoutResult | null> {
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: {
      payments: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!existingOrder) {
    return null
  }

  const payment = existingOrder.payments[0]

  return {
    success: true,
    orderId: existingOrder.id,
    paymentId: payment?.id,
    totalAmount: existingOrder.totalAmount.toNumber(),
    isDuplicate: true,
  }
}
```

### 5. 数据库事务隔离

```typescript
async function executeCheckoutTransaction(
  params: ExecuteCheckoutParams
): Promise<CheckoutResult> {
  return await prisma.$transaction(
    async (tx) => {
      const productIds = items.map((item) => item.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      const productMap = new Map(products.map((p) => [p.id, p]))
      let totalAmount = new Prisma.Decimal(0)

      for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        const itemPrice = product.price.mul(item.quantity)
        totalAmount = totalAmount.add(itemPrice)

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey,
          status: OrderStatus.CONFIRMED,
          totalAmount,
        },
      })

      const paymentResult = await simulatePaymentIntent(
        order.id,
        totalAmount,
        paymentMethodId
      )

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed')
      }

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          status: PaymentStatus.COMPLETED,
          paymentMethod: paymentMethodId,
          transactionId: paymentResult.transactionId,
          idempotencyKey: `pay_${idempotencyKey}`,
        },
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paymentIntentId: payment.transactionId,
        },
      })

      return {
        success: true,
        orderId: order.id,
        paymentId: payment.id,
        totalAmount: totalAmount.toNumber(),
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 10000,
      timeout: 30000,
    }
  )
}
```

**关键事务配置**：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `isolationLevel` | `Serializable` | 最高隔离级别，防止幻读 |
| `maxWait` | `10000` | 最多等待10秒获取连接 |
| `timeout` | `30000` | 事务30秒超时 |

### 6. 前端组件实现

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { processCheckout, getCheckoutIdempotencyKey } from '@/app/actions/checkout'
import { useRouter } from 'next/navigation'

export function CheckoutForm({ items, userId }: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchKey = async () => {
      const key = await getCheckoutIdempotencyKey()
      setIdempotencyKey(key)
    }
    fetchKey()
  }, [])

  const regenerateKey = useCallback(async () => {
    const key = await getCheckoutIdempotencyKey()
    setIdempotencyKey(key)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!idempotencyKey) {
      setError('系统准备中，请稍后重试')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const checkoutItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))

      const result = await processCheckout({
        items: checkoutItems,
        userId,
        paymentMethodId: 'pm_card_visa',
        idempotencyKey,
      })

      if (result.success) {
        if (result.isDuplicate) {
          setSuccessMessage(`订单 ${result.orderId} 已存在（幂等性保护）`)
        } else {
          setSuccessMessage(`订单 ${result.orderId} 创建成功！`)
        }

        setTimeout(() => {
          router.push(`/orders/${result.orderId}`)
        }, 2000)
      } else {
        setError(result.error || '结算失败')
        await regenerateKey()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
      await regenerateKey()
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, idempotencyKey, items, userId, router, regenerateKey])

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      
      <button
        type="submit"
        disabled={isSubmitting || !idempotencyKey}
        className={`${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin ..." />
            处理中...
          </span>
        ) : (
          `立即支付 ¥${total.toFixed(2)}`
        )}
      </button>
    </form>
  )
}
```

**前端防重机制**：

1. **页面加载时获取幂等键**：确保每个页面实例有唯一键
2. **提交时禁用按钮**：防止用户多次点击
3. **显示加载状态**：明确告知用户正在处理
4. **失败后重新生成键**：错误后需要新的幂等键
5. **检测重复请求**：返回`isDuplicate`标志

---

## 数据库迁移

创建迁移文件添加幂等键字段：

```sql
-- migrations/002_add_idempotency_keys.sql

-- 为Order表添加idempotencyKey字段
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" VARCHAR(255);

-- 更新现有数据的idempotencyKey
UPDATE "Order" SET "idempotencyKey" = 'migrated_' || "id" WHERE "idempotencyKey" IS NULL;

-- 设置非空约束
ALTER TABLE "Order" ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- 创建唯一索引
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- 为Payment表添加idempotencyKey字段
ALTER TABLE "Payment" ADD COLUMN "idempotencyKey" VARCHAR(255);

UPDATE "Payment" SET "idempotencyKey" = 'pay_migrated_' || "id" WHERE "idempotencyKey" IS NULL;

ALTER TABLE "Payment" ALTER COLUMN "idempotencyKey" SET NOT NULL;

CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
```

---

## 测试验证

运行测试用例：

```bash
npm test -- idempotency
```

### 关键测试项

1. **幂等键生成**：验证格式唯一、包含时间戳
2. **键验证**：正确验证有效/无效/过期键
3. **withIdempotency**：首次执行、重复请求返回已有结果
4. **唯一约束检测**：正确识别Prisma唯一约束错误
5. **内存存储**：保存、获取、删除、过期检查
6. **并发请求**：多个并发请求使用同一键，只执行一次

---

## 验证清单

- [ ] Order表添加idempotencyKey字段并设置唯一索引
- [ ] Payment表添加idempotencyKey字段并设置唯一索引
- [ ] 结算流程使用withIdempotency包装
- [ ] 前端提交时禁用按钮
- [ ] 前端显示加载状态
- [ ] 失败后重新生成幂等键
- [ ] 检测重复请求并返回已有订单
- [ ] 事务隔离级别设置为Serializable
- [ ] 测试用例全部通过
- [ ] 并发测试通过

---

## 多层防重机制

| 层级 | 机制 | 说明 |
|------|------|------|
| 前端UI | 按钮禁用、加载状态 | 防止用户多次点击 |
| 应用层 | 幂等键检查、withIdempotency | 检测重复请求 |
| 数据库层 | 唯一约束、事务隔离 | 最终防线 |
| 支付网关 | 幂等键传递 | 支付端防重 |

---

## 监控指标

| 指标 | 说明 |
|------|------|
| 重复请求比例 | 检测到的重复请求占比 |
| 唯一约束错误数 | 数据库层面捕获的重复 |
| 订单创建成功率 | 成功创建的订单比例 |
| 支付成功率 | 成功支付的比例 |

---

## 相关文件

- `prisma/schema.prisma` - 数据库模型（含唯一约束）
- `lib/idempotency.ts` - 幂等性工具函数
- `app/actions/checkout.ts` - 结算Server Action
- `tests/idempotency.test.ts` - 测试用例
