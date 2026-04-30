import { PrismaClient } from '@prisma/client'
import { mockClient } from 'aws-sdk-client-mock'
import { S3Client } from '@aws-sdk/client-s3'
import { CloudFrontClient } from '@aws-sdk/client-cloudfront'

const prisma = new PrismaClient()

export const s3Mock = mockClient(S3Client)
export const cloudFrontMock = mockClient(CloudFrontClient)

beforeAll(async () => {
  process.env.AWS_REGION = 'us-east-1'
  process.env.AWS_ACCESS_KEY_ID = 'test-access-key'
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'
  process.env.AWS_S3_BUCKET = 'test-bucket'
  process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID = 'test-distribution'
  process.env.CDN_DOMAIN = 'cdn.example.com'
})

beforeEach(() => {
  s3Mock.reset()
  cloudFrontMock.reset()
})

afterAll(async () => {
  await prisma.$disconnect()
})

export { prisma }
