import { randomBytes, createHash } from 'crypto'

export interface IdempotencyConfig {
  keyPrefix?: string
  keyLength?: number
  maxAgeMs?: number
}

const DEFAULT_CONFIG: Required<IdempotencyConfig> = {
  keyPrefix: 'idem',
  keyLength: 16,
  maxAgeMs: 24 * 60 * 60 * 1000,
}

let config: Required<IdempotencyConfig> = { ...DEFAULT_CONFIG }

export function configureIdempotency(customConfig: IdempotencyConfig): void {
  config = { ...DEFAULT_CONFIG, ...customConfig }
}

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

export function getKeyTimestamp(key: string): number | null {
  const match = key.match(/_(\d+)_/)
  return match ? parseInt(match[1], 10) : null
}

export function isKeyExpired(key: string): boolean {
  const timestamp = getKeyTimestamp(key)
  if (!timestamp) return true
  return Date.now() - timestamp > config.maxAgeMs
}

export function generateDeterministicKey(
  inputs: Record<string, unknown>,
  salt?: string
): string {
  const sortedInputs = Object.entries(inputs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
    .join('|')

  const hashInput = salt ? `${salt}|${sortedInputs}` : sortedInputs
  const hash = createHash('sha256').update(hashInput).digest('hex').substring(0, 32)

  return `${config.keyPrefix}_${Date.now()}_${hash}`
}

export interface IdempotencyResult<T> {
  isNew: boolean
  result: T
}

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

export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as {
    code?: string
    meta?: { target?: string[] }
    message?: string
  }

  if (err.code === 'P2002') {
    return true
  }

  if (err.message?.includes('unique constraint') || err.message?.includes('duplicate key')) {
    return true
  }

  if (err.meta?.target?.some((t) => t.includes('idempotency'))) {
    return true
  }

  return false
}

export interface IdempotencyStore {
  save(key: string, data: unknown, expiresAt?: Date): Promise<void>
  get<T = unknown>(key: string): Promise<T | null>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store: Map<
    string,
    {
      data: unknown
      expiresAt?: Date
    }
  > = new Map()

  async save(key: string, data: unknown, expiresAt?: Date): Promise<void> {
    this.store.set(key, { data, expiresAt })
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key)
    if (!entry) return false

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.store.delete(key)
      return false
    }

    return true
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }
}

export const inMemoryStore = new InMemoryIdempotencyStore()
