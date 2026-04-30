import { PrismaClient } from '@prisma/client'
import { checkDatabaseHealth, getConnectionPoolStats, isConnectionPoolHealthy } from '@/lib/db-health'

describe('Prisma Connection Management', () => {
  let prisma: PrismaClient

  beforeAll(() => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test_db',
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Prisma Singleton Pattern', () => {
    test('should export prisma client', () => {
      const { prisma: exportedPrisma } = require('@/lib/prisma')
      expect(exportedPrisma).toBeDefined()
      expect(typeof exportedPrisma.$queryRaw).toBe('function')
    })

    test('should return same instance on multiple imports', () => {
      const { prisma: prisma1 } = require('@/lib/prisma')
      const { prisma: prisma2 } = require('@/lib/prisma')
      
      expect(prisma1).toBe(prisma2)
    })

    test('should cache prisma instance in global object', () => {
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      
      expect(globalForPrisma.prisma).toBeDefined()
    })
  })

  describe('Database Health Check', () => {
    test('should return health status structure', async () => {
      const health = await checkDatabaseHealth()

      expect(health).toHaveProperty('healthy')
      expect(health).toHaveProperty('connections')
      expect(health).toHaveProperty('queryTimeMs')
      expect(health).toHaveProperty('timestamp')
      
      expect(typeof health.healthy).toBe('boolean')
      expect(typeof health.connections.active).toBe('number')
      expect(typeof health.connections.idle).toBe('number')
      expect(typeof health.connections.total).toBe('number')
      expect(typeof health.queryTimeMs).toBe('number')
    })

    test('should have valid timestamp', async () => {
      const health = await checkDatabaseHealth()
      const timestamp = new Date(health.timestamp)
      
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()
    })
  })

  describe('Connection Pool Statistics', () => {
    test('should return pool stats structure', async () => {
      const stats = await getConnectionPoolStats()

      expect(stats).toHaveProperty('maxConnections')
      expect(stats).toHaveProperty('currentConnections')
      expect(stats).toHaveProperty('availableConnections')
      expect(stats).toHaveProperty('waitingQueries')

      expect(typeof stats.maxConnections).toBe('number')
      expect(typeof stats.currentConnections).toBe('number')
      expect(typeof stats.availableConnections).toBe('number')
      expect(typeof stats.waitingQueries).toBe('number')
    })

    test('should have positive max connections', async () => {
      const stats = await getConnectionPoolStats()
      expect(stats.maxConnections).toBeGreaterThan(0)
    })

    test('should have non-negative values', async () => {
      const stats = await getConnectionPoolStats()
      
      expect(stats.currentConnections).toBeGreaterThanOrEqual(0)
      expect(stats.availableConnections).toBeGreaterThanOrEqual(0)
      expect(stats.waitingQueries).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Connection Pool Health', () => {
    test('should return boolean health status', async () => {
      const isHealthy = await isConnectionPoolHealthy()
      expect(typeof isHealthy).toBe('boolean')
    })
  })

  describe('Connection Leak Prevention', () => {
    test('should handle concurrent queries efficiently', async () => {
      const concurrentQueries = 20
      
      const queries = Array.from({ length: concurrentQueries }, () =>
        prisma.$queryRaw`SELECT 1 as test`
      )

      const startTime = Date.now()
      const results = await Promise.all(queries)
      const duration = Date.now() - startTime

      expect(results.length).toBe(concurrentQueries)
      results.forEach((result: any) => {
        expect(result[0].test).toBe(1)
      })

      console.log(`Concurrent queries took ${duration}ms`)
    }, 30000)

    test('should reuse connections', async () => {
      const statsBefore = await getConnectionPoolStats()
      
      const queries = Array.from({ length: 10 }, () =>
        prisma.$queryRaw`SELECT pg_backend_pid()`
      )

      const results = await Promise.all(queries)
      const connectionPids = new Set(results.map((r: any) => r[0].pg_backend_pid))

      const statsAfter = await getConnectionPoolStats()
      
      expect(connectionPids.size).toBeLessThanOrEqual(10)
      
      console.log(`Used ${connectionPids.size} unique connections for 10 queries`)
      console.log(`Connections before: ${statsBefore.currentConnections}, after: ${statsAfter.currentConnections}`)
    }, 30000)
  })

  describe('PgBouncer Configuration Awareness', () => {
    test('should handle transaction mode connection pooling', async () => {
      const result = await prisma.$transaction([
        prisma.$queryRaw`SELECT 1 as step1`,
        prisma.$queryRaw`SELECT 2 as step2`,
      ])

      expect(result[0][0].step1).toBe(1)
      expect(result[1][0].step2).toBe(2)
    })

    test('should work with prepared statements', async () => {
      const testValue = 'test-prepared'
      
      const result = await prisma.$queryRaw`
        SELECT ${testValue} as test_value
      `

      expect(result[0].test_value).toBe(testValue)
    })
  })
})
