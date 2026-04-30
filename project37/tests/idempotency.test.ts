import {
  generateIdempotencyKey,
  isIdempotencyKeyValid,
  getKeyTimestamp,
  isKeyExpired,
  generateDeterministicKey,
  withIdempotency,
  isUniqueConstraintViolation,
  InMemoryIdempotencyStore,
  configureIdempotency,
} from '@/lib/idempotency'

describe('Idempotency Key Generation', () => {
  describe('generateIdempotencyKey', () => {
    test('should generate keys with correct format', () => {
      const key = generateIdempotencyKey()
      
      expect(typeof key).toBe('string')
      expect(key).toMatch(/^idem_\d+_[a-f0-9]{32}$/)
    })

    test('should generate unique keys', () => {
      const keys = new Set<string>()
      
      for (let i = 0; i < 100; i++) {
        const key = generateIdempotencyKey()
        keys.add(key)
      }
      
      expect(keys.size).toBe(100)
    })

    test('should include current timestamp', () => {
      const before = Date.now()
      const key = generateIdempotencyKey()
      const after = Date.now()
      
      const timestamp = getKeyTimestamp(key)
      
      expect(timestamp).toBeDefined()
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after + 1000)
    })
  })

  describe('Key Validation', () => {
    test('should validate correct keys', () => {
      const validKey = generateIdempotencyKey()
      
      expect(isIdempotencyKeyValid(validKey)).toBe(true)
    })

    test('should reject invalid formats', () => {
      expect(isIdempotencyKeyValid('')).toBe(false)
      expect(isIdempotencyKeyValid(null as any)).toBe(false)
      expect(isIdempotencyKeyValid(undefined as any)).toBe(false)
      expect(isIdempotencyKeyValid(123 as any)).toBe(false)
      expect(isIdempotencyKeyValid('invalid-key')).toBe(false)
      expect(isIdempotencyKeyValid('idem_invalid_hex')).toBe(false)
      expect(isIdempotencyKeyValid('OTHER_1234567890_abcdef0123456789abcdef0123456789')).toBe(false)
    })

    test('should reject expired keys', async () => {
      configureIdempotency({ maxAgeMs: 100 })
      
      const key = generateIdempotencyKey()
      
      expect(isIdempotencyKeyValid(key)).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(isIdempotencyKeyValid(key)).toBe(false)
      
      configureIdempotency({ maxAgeMs: 24 * 60 * 60 * 1000 })
    })
  })

  describe('Key Timestamp', () => {
    test('should extract timestamp from key', () => {
      const key = 'idem_1714473600000_abcdef0123456789abcdef0123456789'
      const timestamp = getKeyTimestamp(key)
      
      expect(timestamp).toBe(1714473600000)
    })

    test('should return null for invalid keys', () => {
      expect(getKeyTimestamp('invalid')).toBeNull()
      expect(getKeyTimestamp('')).toBeNull()
      expect(getKeyTimestamp(null as any)).toBeNull()
    })
  })

  describe('Key Expiration', () => {
    test('should detect expired keys', () => {
      const oldKey = 'idem_1000000000000_abcdef0123456789abcdef0123456789'
      
      expect(isKeyExpired(oldKey)).toBe(true)
    })

    test('should not detect fresh keys as expired', () => {
      const freshKey = generateIdempotencyKey()
      
      expect(isKeyExpired(freshKey)).toBe(false)
    })

    test('should return true for invalid keys', () => {
      expect(isKeyExpired('invalid')).toBe(true)
    })
  })

  describe('Deterministic Key Generation', () => {
    test('should generate same key for same inputs', () => {
      const inputs = { userId: 'user123', action: 'checkout', amount: 100 }
      
      const key1 = generateDeterministicKey(inputs, 'salt1')
      const key2 = generateDeterministicKey(inputs, 'salt1')
      
      expect(key1).toBe(key2)
    })

    test('should generate different keys for different inputs', () => {
      const inputs1 = { userId: 'user123', action: 'checkout', amount: 100 }
      const inputs2 = { userId: 'user123', action: 'checkout', amount: 200 }
      
      const key1 = generateDeterministicKey(inputs1)
      const key2 = generateDeterministicKey(inputs2)
      
      expect(key1).not.toBe(key2)
    })

    test('should generate different keys with different salts', () => {
      const inputs = { userId: 'user123', action: 'checkout' }
      
      const key1 = generateDeterministicKey(inputs, 'salt1')
      const key2 = generateDeterministicKey(inputs, 'salt2')
      
      expect(key1).not.toBe(key2)
    })

    test('should handle various input types', () => {
      const inputs = {
        string: 'value',
        number: 123,
        boolean: true,
        nullValue: null,
        nested: { a: 1, b: 2 },
        array: [1, 2, 3],
      }
      
      expect(() => generateDeterministicKey(inputs)).not.toThrow()
      
      const key = generateDeterministicKey(inputs)
      expect(isIdempotencyKeyValid(key)).toBe(true)
    })
  })
})

describe('withIdempotency', () => {
  test('should execute operation on first call', async () => {
    const key = generateIdempotencyKey()
    let operationCalled = false
    
    const result = await withIdempotency(
      key,
      async () => {
        operationCalled = true
        return { value: 'test-result' }
      },
      async () => null
    )

    expect(operationCalled).toBe(true)
    expect(result.isNew).toBe(true)
    expect(result.result).toEqual({ value: 'test-result' })
  })

  test('should return existing result without calling operation', async () => {
    const key = generateIdempotencyKey()
    const existingResult = { value: 'existing', isDuplicate: true }
    let operationCalled = false

    const firstResult = await withIdempotency(
      key,
      async () => {
        operationCalled = true
        return { value: 'first' }
      },
      async () => null
    )

    expect(firstResult.isNew).toBe(true)
    expect(operationCalled).toBe(true)

    operationCalled = false

    const secondResult = await withIdempotency(
      key,
      async () => {
        operationCalled = true
        return { value: 'second' }
      },
      async () => existingResult
    )

    expect(secondResult.isNew).toBe(false)
    expect(secondResult.result).toBe(existingResult)
    expect(operationCalled).toBe(false)
  })

  test('should throw error for invalid key', async () => {
    await expect(
      withIdempotency(
        'invalid-key',
        async () => ({ value: 'test' }),
        async () => null
      )
    ).rejects.toThrow('Invalid or expired idempotency key')
  })

  test('should handle unique constraint violation and return existing', async () => {
    const key = generateIdempotencyKey()
    const existingResult = { value: 'found-after-conflict' }
    let callCount = 0

    const result = await withIdempotency(
      key,
      async () => {
        callCount++
        if (callCount === 1) {
          const error: any = new Error('Unique constraint violation')
          error.code = 'P2002'
          error.meta = { target: ['idempotencyKey'] }
          throw error
        }
        return { value: 'should-not-reach' }
      },
      async (k) => {
        if (callCount > 0) {
          return existingResult
        }
        return null
      }
    )

    expect(result.isNew).toBe(false)
    expect(result.result).toBe(existingResult)
  })

  test('should call onConflict when provided', async () => {
    const key = generateIdempotencyKey()
    const conflictResult = { value: 'from-on-conflict' }
    let onConflictCalled = false

    const result = await withIdempotency(
      key,
      async () => {
        const error: any = new Error('Unique constraint')
        error.code = 'P2002'
        throw error
      },
      async () => null,
      {
        onConflict: async () => {
          onConflictCalled = true
          return conflictResult
        },
      }
    )

    expect(onConflictCalled).toBe(true)
    expect(result.isNew).toBe(false)
    expect(result.result).toBe(conflictResult)
  })

  test('should rethrow non-unique-constraint errors', async () => {
    const key = generateIdempotencyKey()
    const testError = new Error('Some other error')

    await expect(
      withIdempotency(
        key,
        async () => {
          throw testError
        },
        async () => null
      )
    ).rejects.toThrow(testError)
  })
})

describe('isUniqueConstraintViolation', () => {
  test('should detect Prisma unique constraint errors', () => {
    const prismaError: any = {
      code: 'P2002',
      message: 'Unique constraint failed',
    }

    expect(isUniqueConstraintViolation(prismaError)).toBe(true)
  })

  test('should detect errors with idempotency in target', () => {
    const error: any = {
      code: 'P2002',
      meta: { target: ['idempotencyKey'] },
    }

    expect(isUniqueConstraintViolation(error)).toBe(true)
  })

  test('should detect errors with unique constraint message', () => {
    const error1: any = { message: 'unique constraint violation' }
    const error2: any = { message: 'duplicate key value violates unique constraint' }

    expect(isUniqueConstraintViolation(error1)).toBe(true)
    expect(isUniqueConstraintViolation(error2)).toBe(true)
  })

  test('should return false for non-unique-constraint errors', () => {
    expect(isUniqueConstraintViolation(null)).toBe(false)
    expect(isUniqueConstraintViolation(undefined)).toBe(false)
    expect(isUniqueConstraintViolation('error')).toBe(false)
    expect(isUniqueConstraintViolation(new Error('general error'))).toBe(false)
    expect(isUniqueConstraintViolation({ code: 'P2003' })).toBe(false)
  })
})

describe('InMemoryIdempotencyStore', () => {
  let store: InMemoryIdempotencyStore

  beforeEach(() => {
    store = new InMemoryIdempotencyStore()
  })

  test('should save and retrieve data', async () => {
    const key = generateIdempotencyKey()
    const data = { orderId: 'order123', status: 'confirmed' }

    await store.save(key, data)

    const retrieved = await store.get(key)
    expect(retrieved).toEqual(data)
  })

  test('should return null for non-existent keys', async () => {
    const retrieved = await store.get('non-existent-key')
    expect(retrieved).toBeNull()
  })

  test('should check existence', async () => {
    const key = generateIdempotencyKey()

    expect(await store.exists(key)).toBe(false)

    await store.save(key, { value: 'test' })

    expect(await store.exists(key)).toBe(true)
  })

  test('should delete keys', async () => {
    const key = generateIdempotencyKey()
    await store.save(key, { value: 'test' })

    expect(await store.exists(key)).toBe(true)

    await store.delete(key)

    expect(await store.exists(key)).toBe(false)
  })

  test('should handle expiration', async () => {
    const key = generateIdempotencyKey()
    const pastDate = new Date(Date.now() - 1000)

    await store.save(key, { value: 'expired' }, pastDate)

    expect(await store.exists(key)).toBe(false)
    expect(await store.get(key)).toBeNull()
  })

  test('should not retrieve expired data', async () => {
    const key = generateIdempotencyKey()
    const futureDate = new Date(Date.now() + 1000)

    await store.save(key, { value: 'valid' }, futureDate)

    expect(await store.exists(key)).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 1100))

    expect(await store.exists(key)).toBe(false)
  })

  test('should clear all data', () => {
    store.save('key1', { v: 1 })
    store.save('key2', { v: 2 })

    expect(store.size()).toBe(2)

    store.clear()

    expect(store.size()).toBe(0)
  })

  test('should report size correctly', async () => {
    expect(store.size()).toBe(0)

    await store.save('key1', { v: 1 })
    await store.save('key2', { v: 2 })

    expect(store.size()).toBe(2)

    await store.delete('key1')

    expect(store.size()).toBe(1)
  })
})

describe('Configuration', () => {
  test('should allow custom configuration', () => {
    configureIdempotency({
      keyPrefix: 'custom',
      keyLength: 8,
      maxAgeMs: 60000,
    })

    const key = generateIdempotencyKey()
    
    expect(key).toMatch(/^custom_\d+_[a-f0-9]{16}$/)

    configureIdempotency({
      keyPrefix: 'idem',
      keyLength: 16,
      maxAgeMs: 24 * 60 * 60 * 1000,
    })
  })
})
