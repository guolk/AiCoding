'use server'

import { prisma } from '@/lib/prisma'
import {
  uploadAndInvalidate,
  getPresignedUploadUrl,
  invalidateCdnCache,
  getCdnUrl,
  generateUniqueKey,
  fileExists,
  deleteFile,
} from '@/lib/s3'
import { revalidatePath } from 'next/cache'

export interface UploadImageResult {
  success: boolean
  error?: string
  data?: {
    url: string
    key: string
    invalidationId?: string
  }
}

export async function uploadProductImage(
  formData: FormData,
  productId: string
): Promise<UploadImageResult> {
  try {
    const file = formData.get('image') as File | null

    if (!file) {
      return {
        success: false,
        error: 'No image file provided',
      }
    }

    if (file.size === 0) {
      return {
        success: false,
        error: 'Empty file provided',
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size exceeds 10MB limit',
      }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`,
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, imageKey: true },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const baseKey = `products/${productId}/image`

    const result = await uploadAndInvalidate(buffer, baseKey, {
      oldKey: product.imageKey || undefined,
      contentType: file.type,
      waitForInvalidation: false,
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: result.cdnUrl,
        imageKey: result.key,
      },
    })

    if (product.imageKey && product.imageKey !== result.key) {
      try {
        await deleteFile(product.imageKey)
      } catch (error) {
        console.warn(`Failed to delete old image ${product.imageKey}:`, error)
      }
    }

    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')
    revalidatePath('/')

    return {
      success: true,
      data: {
        url: result.cdnUrl,
        key: result.key,
        invalidationId: result.invalidationResult?.invalidationId,
      },
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export interface PresignedUrlResult {
  success: boolean
  error?: string
  data?: {
    url: string
    key: string
    expiresAt: number
  }
}

export async function getProductUploadUrl(
  productId: string,
  fileType: string
): Promise<PresignedUrlResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: `Unsupported file type: ${fileType}`,
      }
    }

    const baseKey = `products/${productId}/image`
    const { url, key } = await getPresignedUploadUrl(baseKey, {
      contentType: fileType,
      expiresIn: 300,
    })

    return {
      success: true,
      data: {
        url,
        key,
        expiresAt: Date.now() + 300 * 1000,
      },
    }
  } catch (error) {
    console.error('Get upload URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get upload URL',
    }
  }
}

export interface ConfirmUploadResult {
  success: boolean
  error?: string
  data?: {
    url: string
    invalidationId?: string
  }
}

export async function confirmProductUpload(
  productId: string,
  newKey: string,
  oldKey?: string
): Promise<ConfirmUploadResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, imageKey: true },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    const exists = await fileExists(newKey)
    if (!exists) {
      return {
        success: false,
        error: 'Uploaded file not found in S3',
      }
    }

    const pathsToInvalidate: string[] = [newKey]

    const currentOldKey = oldKey || product.imageKey
    if (currentOldKey && currentOldKey !== newKey) {
      pathsToInvalidate.push(currentOldKey)
    }

    let invalidationId: string | undefined

    try {
      const invalidationResult = await invalidateCdnCache(pathsToInvalidate)
      invalidationId = invalidationResult.invalidationId
    } catch (error) {
      console.warn('CDN invalidation failed:', error)
    }

    const cdnUrl = getCdnUrl(newKey)

    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: cdnUrl,
        imageKey: newKey,
      },
    })

    if (currentOldKey && currentOldKey !== newKey) {
      try {
        await deleteFile(currentOldKey)
      } catch (error) {
        console.warn(`Failed to delete old image ${currentOldKey}:`, error)
      }
    }

    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')

    return {
      success: true,
      data: {
        url: cdnUrl,
        invalidationId,
      },
    }
  } catch (error) {
    console.error('Confirm upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm upload',
    }
  }
}

export interface InvalidateCacheResult {
  success: boolean
  error?: string
  data?: {
    invalidationId: string
    status: string
  }
}

export async function invalidateProductCache(
  productId: string
): Promise<InvalidateCacheResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { imageKey: true },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    const paths: string[] = []

    if (product.imageKey) {
      paths.push(product.imageKey)
    }

    if (paths.length === 0) {
      return {
        success: true,
        data: {
          invalidationId: '',
          status: 'skipped',
        },
      }
    }

    const result = await invalidateCdnCache(paths)

    return {
      success: true,
      data: {
        invalidationId: result.invalidationId,
        status: result.status,
      },
    }
  } catch (error) {
    console.error('Invalidate cache error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invalidate cache',
    }
  }
}
