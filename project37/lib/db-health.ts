import { prisma } from './prisma'

export interface DatabaseHealth {
  healthy: boolean
  connections: {
    active: number
    idle: number
    total: number
  }
  queryTimeMs: number
  timestamp: string
  message?: string
}

export interface ConnectionPoolStats {
  maxConnections: number
  currentConnections: number
  availableConnections: number
  waitingQueries: number
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1 as health_check`

    const queryTime = Date.now() - startTime

    const connectionStats = await prisma.$queryRaw<
      Array<{
        total: bigint
        active: bigint
        idle: bigint
      }>
    >`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
      WHERE datname = current_database()
    `

    const stats = connectionStats[0]

    return {
      healthy: queryTime < 5000,
      connections: {
        active: Number(stats?.active || 0),
        idle: Number(stats?.idle || 0),
        total: Number(stats?.total || 0),
      },
      queryTimeMs: queryTime,
      timestamp: new Date().toISOString(),
      message: `Query time: ${queryTime}ms`,
    }
  } catch (error) {
    const queryTime = Date.now() - startTime

    return {
      healthy: false,
      connections: { active: 0, idle: 0, total: 0 },
      queryTimeMs: queryTime,
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

export async function getConnectionPoolStats(): Promise<ConnectionPoolStats> {
  try {
    const settings = await prisma.$queryRaw<
      Array<{
        name: string
        setting: string
      }>
    >`
      SELECT name, setting 
      FROM pg_settings 
      WHERE name IN ('max_connections', 'superuser_reserved_connections')
    `

    const maxConnSetting = settings.find(s => s.name === 'max_connections')
    const reservedConnSetting = settings.find(s => s.name === 'superuser_reserved_connections')

    const maxConnections = parseInt(maxConnSetting?.setting || '100', 10)
    const reservedConnections = parseInt(reservedConnSetting?.setting || '3', 10)

    const currentConnections = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT count(*) 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `

    const waitingQueries = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT count(*) 
      FROM pg_stat_activity 
      WHERE wait_event IS NOT NULL 
      AND datname = current_database()
    `

    const current = Number(currentConnections[0]?.count || 0)
    const available = maxConnections - reservedConnections - current

    return {
      maxConnections,
      currentConnections: current,
      availableConnections: Math.max(0, available),
      waitingQueries: Number(waitingQueries[0]?.count || 0),
    }
  } catch (error) {
    console.error('Failed to get connection pool stats:', error)
    return {
      maxConnections: 100,
      currentConnections: 0,
      availableConnections: 100,
      waitingQueries: 0,
    }
  }
}

export async function isConnectionPoolHealthy(): Promise<boolean> {
  const stats = await getConnectionPoolStats()
  const health = await checkDatabaseHealth()

  const connectionRatio = stats.currentConnections / stats.maxConnections
  const hasAvailableConnections = stats.availableConnections > 5

  return (
    health.healthy &&
    connectionRatio < 0.8 &&
    hasAvailableConnections &&
    stats.waitingQueries < 10
  )
}
