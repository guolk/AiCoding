import {
  uploadFile,
  deleteFile,
  fileExists,
  invalidateCdnCache,
  uploadAndInvalidate,
  getPresignedUploadUrl,
  generateUniqueKey,
  isValidKey,
  getCdnUrl,
} from '@/lib/s3'
import { s3Mock, cloudFrontMock } from './setup'
import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import {
  CreateInvalidationCommand,
  GetInvalidationCommand,
} from '@aws-sdk/client-cloudfront'

describe('S3 Upload Service', () => {
  describe('Key Generation', () => {
    test('should generate unique keys with timestamp', () => {
      const key1 = generateUniqueKey('products/test/image.jpg')
      const key2 = generateUniqueKey('products/test/image.jpg')

      expect(key1).not.toBe(key2)
      expect(key1).toMatch(/^products\/test\/image_\d+_[a-z0-9]+\.jpg$/)
    })

    test('should preserve file extension', () => {
      const pngKey = generateUniqueKey('images/logo.png')
      const jpgKey = generateUniqueKey('images/photo.jpg')
      const webpKey = generateUniqueKey('images/avatar.webp')

      expect(pngKey).toEndWith('.png')
      expect(jpgKey).toEndWith('.jpg')
      expect(webpKey).toEndWith('.webp')
    })

    test('should handle keys without extension', () => {
      const key = generateUniqueKey('files/document')
      expect(key).toMatch(/^files\/document_\d+_[a-z0-9]+\.$/)
    })
  })

  describe('Key Validation', () => {
    test('should validate valid keys', () => {
      expect(isValidKey('products/test/image.jpg')).toBe(true)
      expect(isValidKey('users/avatars/123.png')).toBe(true)
      expect(isValidKey('documents/report-2024.pdf')).toBe(true)
    })

    test('should reject invalid keys', () => {
      expect(isValidKey('')).toBe(false)
      expect(isValidKey(null as any)).toBe(false)
      expect(isValidKey(undefined as any)).toBe(false)
      expect(isValidKey('/leading/slash.jpg')).toBe(false)
      expect(isValidKey('trailing/slash/')).toBe(false)
      expect(isValidKey('../escape/attempt.jpg')).toBe(false)
    })

    test('should reject keys that are too long', () => {
      const longKey = 'a'.repeat(1025)
      expect(isValidKey(longKey)).toBe(false)
    })
  })

  describe('CDN URL Generation', () => {
    test('should generate correct CDN URL', () => {
      process.env.CDN_DOMAIN = 'cdn.example.com'
      
      const url = getCdnUrl('products/test/image.jpg')
      
      expect(url).toBe('https://cdn.example.com/products/test/image.jpg')
    })

    test('should throw error when CDN domain not configured', () => {
      const originalDomain = process.env.CDN_DOMAIN
      delete process.env.CDN_DOMAIN

      expect(() => getCdnUrl('test.jpg')).toThrow('CDN domain not configured')

      if (originalDomain) {
        process.env.CDN_DOMAIN = originalDomain
      }
    })
  })

  describe('File Upload', () => {
    beforeEach(() => {
      s3Mock.reset()
    })

    test('should upload file successfully', async () => {
      s3Mock.on(PutObjectCommand).resolves({
        VersionId: 'test-version-123',
        ETag: '"abc123"',
        $metadata: { httpStatusCode: 200 },
      })

      const testBuffer = Buffer.from('test image data')
      const result = await uploadFile(testBuffer, 'test/image.jpg', {
        contentType: 'image/jpeg',
      })

      expect(result.key).toBe('test/image.jpg')
      expect(result.url).toContain('s3.amazonaws.com')
      expect(result.cdnUrl).toContain('cdn.example.com')
      expect(result.versionId).toBe('test-version-123')
      expect(result.etag).toBe('abc123')
    })

    test('should throw error for invalid key', async () => {
      await expect(
        uploadFile(Buffer.from('test'), '/invalid/key.jpg')
      ).rejects.toThrow('Invalid S3 key')
    })

    test('should throw error when bucket not configured', async () => {
      const originalBucket = process.env.AWS_S3_BUCKET
      delete process.env.AWS_S3_BUCKET

      await expect(
        uploadFile(Buffer.from('test'), 'test.jpg')
      ).rejects.toThrow('S3 bucket not configured')

      if (originalBucket) {
        process.env.AWS_S3_BUCKET = originalBucket
      }
    })

    test('should use default cache control', async () => {
      let capturedParams: any

      s3Mock.on(PutObjectCommand).callsFake((params) => {
        capturedParams = params
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } })
      })

      await uploadFile(Buffer.from('test'), 'test.jpg')

      expect(capturedParams.CacheControl).toBe('public, max-age=31536000, immutable')
    })

    test('should accept custom cache control', async () => {
      let capturedParams: any

      s3Mock.on(PutObjectCommand).callsFake((params) => {
        capturedParams = params
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } })
      })

      await uploadFile(Buffer.from('test'), 'test.jpg', {
        cacheControl: 'no-cache',
      })

      expect(capturedParams.CacheControl).toBe('no-cache')
    })
  })

  describe('File Existence Check', () => {
    test('should return true for existing file', async () => {
      s3Mock.on(HeadObjectCommand).resolves({
        $metadata: { httpStatusCode: 200 },
      })

      const exists = await fileExists('existing/file.jpg')
      expect(exists).toBe(true)
    })

    test('should return false for non-existing file', async () => {
      s3Mock.on(HeadObjectCommand).rejects({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      })

      const exists = await fileExists('nonexistent/file.jpg')
      expect(exists).toBe(false)
    })

    test('should return false for invalid key', async () => {
      const exists = await fileExists('/invalid/key')
      expect(exists).toBe(false)
    })

    test('should throw error for other S3 errors', async () => {
      s3Mock.on(HeadObjectCommand).rejects({
        name: 'AccessDenied',
        message: 'Access denied',
        $metadata: { httpStatusCode: 403 },
      })

      await expect(fileExists('restricted/file.jpg')).rejects.toThrow()
    })
  })

  describe('File Deletion', () => {
    test('should delete file successfully', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({
        $metadata: { httpStatusCode: 204 },
      })

      await deleteFile('test/image.jpg')
    })

    test('should throw error for invalid key', async () => {
      await expect(deleteFile('/invalid/key')).rejects.toThrow('Invalid S3 key')
    })
  })

  describe('CDN Cache Invalidation', () => {
    beforeEach(() => {
      cloudFrontMock.reset()
    })

    test('should create invalidation successfully', async () => {
      const testInvalidationId = 'test-invalidation-123'

      cloudFrontMock.on(CreateInvalidationCommand).resolves({
        Invalidation: {
          Id: testInvalidationId,
          Status: 'InProgress',
          CreateTime: new Date(),
        },
        $metadata: { httpStatusCode: 201 },
      })

      const result = await invalidateCdnCache(['/path/to/image.jpg'])

      expect(result.invalidationId).toBe(testInvalidationId)
      expect(result.status).toBe('InProgress')
    })

    test('should normalize paths with leading slash', async () => {
      let capturedPaths: string[] | undefined

      cloudFrontMock.on(CreateInvalidationCommand).callsFake((params) => {
        capturedPaths = params.InvalidationBatch?.Paths?.Items
        return Promise.resolve({
          Invalidation: {
            Id: 'test-id',
            Status: 'InProgress',
            CreateTime: new Date(),
          },
        })
      })

      await invalidateCdnCache(['path/without/slash.jpg', '/path/with/slash.jpg'])

      expect(capturedPaths).toBeDefined()
      expect(capturedPaths![0]).toBe('/path/without/slash.jpg')
      expect(capturedPaths![1]).toBe('/path/with/slash.jpg')
    })

    test('should throw error when distribution ID not configured', async () => {
      const originalDistId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID
      delete process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID

      await expect(
        invalidateCdnCache(['/test.jpg'])
      ).rejects.toThrow('CloudFront distribution ID not configured')

      if (originalDistId) {
        process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID = originalDistId
      }
    })

    test('should wait for invalidation completion when requested', async () => {
      const testInvalidationId = 'test-invalidation-wait'

      let callCount = 0
      cloudFrontMock.on(CreateInvalidationCommand).resolves({
        Invalidation: {
          Id: testInvalidationId,
          Status: 'InProgress',
          CreateTime: new Date(),
        },
      })

      cloudFrontMock.on(GetInvalidationCommand).callsFake(() => {
        callCount++
        return Promise.resolve({
          Invalidation: {
            Id: testInvalidationId,
            Status: callCount >= 2 ? 'Completed' : 'InProgress',
            CreateTime: new Date(),
          },
        })
      })

      const result = await invalidateCdnCache(['/test.jpg'], {
        waitForCompletion: true,
        maxWaitTime: 10000,
      })

      expect(result.status).toBe('Completed')
      expect(callCount).toBeGreaterThanOrEqual(2)
    }, 15000)
  })

  describe('Upload and Invalidate', () => {
    test('should upload and invalidate with old key', async () => {
      s3Mock.on(PutObjectCommand).resolves({
        VersionId: 'v1',
        $metadata: { httpStatusCode: 200 },
      })

      cloudFrontMock.on(CreateInvalidationCommand).resolves({
        Invalidation: {
          Id: 'inv-1',
          Status: 'InProgress',
          CreateTime: new Date(),
        },
      })

      const result = await uploadAndInvalidate(
        Buffer.from('new image'),
        'products/123/image.jpg',
        {
          oldKey: 'products/123/image_1234567890.jpg',
        }
      )

      expect(result.cdnUrl).toBeDefined()
      expect(result.invalidationResult).toBeDefined()
    })

    test('should handle invalidation failure gracefully', async () => {
      s3Mock.on(PutObjectCommand).resolves({
        VersionId: 'v1',
        $metadata: { httpStatusCode: 200 },
      })

      cloudFrontMock.on(CreateInvalidationCommand).rejects(new Error('Invalidation failed'))

      const result = await uploadAndInvalidate(
        Buffer.from('test'),
        'test/image.jpg'
      )

      expect(result.success).toBe(true)
      expect(result.cdnUrl).toBeDefined()
      expect(result.invalidationResult).toBeUndefined()
    })
  })

  describe('Presigned URL', () => {
    test('should generate presigned upload URL with unique key', async () => {
      const result = await getPresignedUploadUrl('products/test/image.jpg', {
        contentType: 'image/jpeg',
        expiresIn: 300,
      })

      expect(result.url).toContain('https://')
      expect(result.key).toMatch(/^products\/test\/image_\d+_[a-z0-9]+\.jpg$/)
    })

    test('should use default expires time', async () => {
      const result = await getPresignedUploadUrl('test.jpg')
      
      expect(result.url).toBeDefined()
    })
  })
})
