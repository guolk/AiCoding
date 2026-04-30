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

export interface CheckoutItem {
  productId: string
  quantity: number
}

export interface CheckoutRequest {
  items: CheckoutItem[]
  userId: string
  paymentMethodId: string
  idempotencyKey?: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface CheckoutResult {
  success: boolean
  orderId?: string
  paymentId?: string
  clientSecret?: string
  totalAmount?: number
  error?: string
  isDuplicate?: boolean
}

export interface OrderSummary {
  id: string
  status: OrderStatus
  totalAmount: number
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  paymentStatus: PaymentStatus
  createdAt: Date
}

export async function getCheckoutIdempotencyKey(): Promise<string> {
  return generateIdempotencyKey()
}

async function simulatePaymentIntent(
  orderId: string,
  amount: Prisma.Decimal,
  paymentMethodId: string
): Promise<{
  success: boolean
  transactionId: string
  clientSecret: string
  error?: string
}> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (Math.random() < 0.05) {
    return {
      success: false,
      transactionId: '',
      clientSecret: '',
      error: 'Payment processing failed: insufficient funds',
    }
  }

  return {
    success: true,
    transactionId: `pi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
    clientSecret: `secret_${orderId}_${Date.now()}`,
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

export async function processCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
  const { items, userId, paymentMethodId, idempotencyKey, shippingAddress } = request

  if (!items || items.length === 0) {
    return {
      success: false,
      error: 'Cart is empty',
    }
  }

  if (!userId) {
    return {
      success: false,
      error: 'User not authenticated',
    }
  }

  if (!paymentMethodId) {
    return {
      success: false,
      error: 'Payment method not provided',
    }
  }

  const idemKey = idempotencyKey || generateIdempotencyKey()

  if (!isIdempotencyKeyValid(idemKey)) {
    return {
      success: false,
      error: 'Invalid or expired idempotency key. Please refresh the page and try again.',
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
          shippingAddress,
        })
      },
      checkExistingOrder
    )

    revalidatePath('/cart')
    revalidatePath('/orders')
    revalidatePath('/')

    return result.result
  } catch (error) {
    console.error('Checkout process error:', error)

    if (isUniqueConstraintViolation(error)) {
      const existingOrder = await checkExistingOrder(idemKey)
      if (existingOrder) {
        return existingOrder
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Checkout failed. Please check your payment details and try again.',
    }
  }
}

interface ExecuteCheckoutParams {
  items: CheckoutItem[]
  userId: string
  paymentMethodId: string
  idempotencyKey: string
  shippingAddress?: CheckoutRequest['shippingAddress']
}

async function executeCheckoutTransaction(
  params: ExecuteCheckoutParams
): Promise<CheckoutResult> {
  const { items, userId, paymentMethodId, idempotencyKey, shippingAddress } = params

  return await prisma.$transaction(
    async (tx) => {
      const productIds = items.map((item) => item.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id))
        const missingIds = productIds.filter((id) => !foundIds.has(id))
        throw new Error(`Products not found: ${missingIds.join(', ')}`)
      }

      const productMap = new Map(products.map((p) => [p.id, p]))
      let totalAmount = new Prisma.Decimal(0)
      const orderItems: Prisma.OrderItemCreateManyOrderInput[] = []

      for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for product ${product.name}: ${item.quantity}`)
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          )
        }

        const itemPrice = product.price.mul(item.quantity)
        totalAmount = totalAmount.add(itemPrice)

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        })

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      if (totalAmount.lessThanOrEqualTo(0)) {
        throw new Error('Order total must be greater than zero')
      }

      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey,
          status: OrderStatus.CONFIRMED,
          totalAmount,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
        clientSecret: paymentResult.clientSecret,
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

export async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  })

  if (!order) {
    return null
  }

  const payment = order.payments[0]

  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount.toNumber(),
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price.toNumber(),
    })),
    paymentStatus: payment?.status || PaymentStatus.PENDING,
    createdAt: order.createdAt,
  }
}

export async function cancelOrder(orderId: string, reason: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === OrderStatus.CANCELLED) {
    return true
  }

  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
    throw new Error('Cannot cancel order that has already been shipped')
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
      },
    })

    await tx.payment.updateMany({
      where: { orderId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    })
  })

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')

  return true
}
