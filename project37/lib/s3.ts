import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetInvalidationCommand,
} from '@aws-sdk/client-cloudfront'

let s3ClientInstance: S3Client | null = null
let cloudFrontClientInstance: CloudFrontClient | null = null

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    const region = process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    s3ClientInstance = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }
  return s3ClientInstance
}

function getCloudFrontClient(): CloudFrontClient {
  if (!cloudFrontClientInstance) {
    const region = process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    cloudFrontClientInstance = new CloudFrontClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }
  return cloudFrontClientInstance
}

const S3_BUCKET = process.env.AWS_S3_BUCKET
const CLOUDFRONT_DISTRIBUTION_ID = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID
const CDN_DOMAIN = process.env.CDN_DOMAIN

export interface UploadResult {
  key: string
  url: string
  cdnUrl: string
  versionId?: string
  etag?: string
}

export interface InvalidationResult {
  invalidationId: string
  status: string
  createTime: Date
}

export function generateUniqueKey(originalKey: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 10)
  const ext = originalKey.split('.').pop() || ''
  const baseName = originalKey.replace(`.${ext}`, '')

  return `${baseName}_${timestamp}_${randomStr}.${ext}`
}

export function isValidKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false
  if (key.length === 0 || key.length > 1024) return false
  if (key.startsWith('/') || key.endsWith('/')) return false
  if (key.includes('..')) return false
  return true
}

export async function uploadFile(
  file: Buffer | Uint8Array | Blob,
  key: string,
  options: {
    contentType?: string
    cacheControl?: string
    acl?: string
    metadata?: Record<string, string>
  } = {}
): Promise<UploadResult> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured')
  }

  if (!isValidKey(key)) {
    throw new Error(`Invalid S3 key: ${key}`)
  }

  const s3Client = getS3Client()

  const {
    contentType = 'application/octet-stream',
    cacheControl = 'public, max-age=31536000, immutable',
    acl = 'public-read',
    metadata,
  } = options

  const putParams: PutObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: cacheControl,
    ACL: acl,
    Metadata: metadata,
  }

  const command = new PutObjectCommand(putParams)
  const result = await s3Client.send(command)

  const s3Url = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`
  const cdnUrl = CDN_DOMAIN ? `https://${CDN_DOMAIN}/${key}` : s3Url

  return {
    key,
    url: s3Url,
    cdnUrl,
    versionId: result.VersionId,
    etag: result.ETag?.replace(/"/g, ''),
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured')
  }

  if (!isValidKey(key)) {
    throw new Error(`Invalid S3 key: ${key}`)
  }

  const s3Client = getS3Client()

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

export async function fileExists(key: string): Promise<boolean> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured')
  }

  if (!isValidKey(key)) {
    return false
  }

  const s3Client = getS3Client()

  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    throw error
  }
}

export async function invalidateCdnCache(
  paths: string[],
  options: {
    waitForCompletion?: boolean
    maxWaitTime?: number
  } = {}
): Promise<InvalidationResult> {
  if (!CLOUDFRONT_DISTRIBUTION_ID) {
    throw new Error('CloudFront distribution ID not configured')
  }

  const { waitForCompletion = false, maxWaitTime = 300000 } = options

  const cloudFrontClient = getCloudFrontClient()

  const normalizedPaths = paths.map((path) => {
    if (!path.startsWith('/')) {
      return `/${path}`
    }
    return path
  })

  const callerReference = `invalidation_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

  const createCommand = new CreateInvalidationCommand({
    DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: callerReference,
      Paths: {
        Quantity: normalizedPaths.length,
        Items: normalizedPaths,
      },
    },
  })

  const createResult = await cloudFrontClient.send(createCommand)

  const invalidationId = createResult.Invalidation?.Id
  if (!invalidationId) {
    throw new Error('Failed to create invalidation: no ID returned')
  }

  const result: InvalidationResult = {
    invalidationId,
    status: createResult.Invalidation?.Status || 'InProgress',
    createTime: createResult.Invalidation?.CreateTime
      ? new Date(createResult.Invalidation.CreateTime)
      : new Date(),
  }

  if (waitForCompletion) {
    return waitForInvalidationCompletion(invalidationId, maxWaitTime)
  }

  return result
}

async function waitForInvalidationCompletion(
  invalidationId: string,
  maxWaitTime: number
): Promise<InvalidationResult> {
  if (!CLOUDFRONT_DISTRIBUTION_ID) {
    throw new Error('CloudFront distribution ID not configured')
  }

  const cloudFrontClient = getCloudFrontClient()
  const startTime = Date.now()
  const pollInterval = 5000

  while (Date.now() - startTime < maxWaitTime) {
    const getCommand = new GetInvalidationCommand({
      DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
      Id: invalidationId,
    })

    const getResult = await cloudFrontClient.send(getCommand)

    if (getResult.Invalidation?.Status === 'Completed') {
      return {
        invalidationId,
        status: 'Completed',
        createTime: getResult.Invalidation.CreateTime
          ? new Date(getResult.Invalidation.CreateTime)
          : new Date(),
      }
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval))
  }

  throw new Error(`Invalidation ${invalidationId} did not complete within ${maxWaitTime}ms`)
}

export async function uploadAndInvalidate(
  file: Buffer | Uint8Array | Blob,
  baseKey: string,
  options: {
    oldKey?: string
    contentType?: string
    metadata?: Record<string, string>
    waitForInvalidation?: boolean
  } = {}
): Promise<UploadResult & { invalidationResult?: InvalidationResult }> {
  const { oldKey, contentType, metadata, waitForInvalidation = false } = options

  const uniqueKey = generateUniqueKey(baseKey)

  const uploadResult = await uploadFile(file, uniqueKey, {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable',
    metadata,
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

  return {
    ...uploadResult,
    invalidationResult,
  }
}

export async function getPresignedUploadUrl(
  key: string,
  options: {
    contentType?: string
    expiresIn?: number
    contentLengthRange?: [number, number]
  } = {}
): Promise<{ url: string; key: string }> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured')
  }

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

export function getCdnUrl(key: string): string {
  if (!CDN_DOMAIN) {
    throw new Error('CDN domain not configured')
  }
  return `https://${CDN_DOMAIN}/${key}`
}
