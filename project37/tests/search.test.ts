import {
  searchProducts,
  getSearchSuggestions,
  parseSearchQuery,
  buildWhereClause,
  getSortOrder,
  updateProductSearchVector,
  batchUpdateSearchVectors,
  getSearchPerformanceMetrics,
} from '@/lib/search/postgres'
import { Prisma } from '@prisma/client'

describe('Search Query Parsing', () => {
  describe('parseSearchQuery', () => {
    test('should return empty string for empty query', () => {
      expect(parseSearchQuery('')).toBe('')
      expect(parseSearchQuery('   ')).toBe('')
    })

    test('should handle null/undefined', () => {
      expect(parseSearchQuery(null as any)).toBe('')
      expect(parseSearchQuery(undefined as any)).toBe('')
    })

    test('should parse single word query', () => {
      expect(parseSearchQuery('headphones')).toBe('headphones:*')
    })

    test('should parse multi-word query with AND', () => {
      expect(parseSearchQuery('wireless headphones')).toBe('wireless:* & headphones:*')
    })

    test('should preserve existing operators', () => {
      expect(parseSearchQuery('wireless & bluetooth')).toBe('wireless & bluetooth')
      expect(parseSearchQuery('wireless | bluetooth')).toBe('wireless | bluetooth')
    })

    test('should not add wildcard to short words', () => {
      expect(parseSearchQuery('a')).toBe('')
      expect(parseSearchQuery('ab')).toBe('ab')
      expect(parseSearchQuery('abc')).toBe('abc:*')
    })

    test('should trim and normalize whitespace', () => {
      expect(parseSearchQuery('  wireless   headphones  ')).toBe('wireless:* & headphones:*')
    })
  })

  describe('buildWhereClause', () => {
    test('should build empty where clause for no conditions', () => {
      const where = buildWhereClause('', {})
      expect(where).toEqual({})
    })

    test('should include search vector condition', () => {
      const where = buildWhereClause('headphones:*', {})
      
      expect(where).toHaveProperty('AND')
      expect(Array.isArray(where.AND)).toBe(true)
    })

    test('should include in-stock filter', () => {
      const where = buildWhereClause('headphones', { inStock: true })
      
      expect(where.AND).toBeDefined()
    })

    test('should include price range filters', () => {
      const where = buildWhereClause('headphones', {
        minPrice: 50,
        maxPrice: 500,
      })
      
      expect(where.AND).toBeDefined()
    })

    test('should combine multiple conditions', () => {
      const where = buildWhereClause('headphones', {
        minPrice: 50,
        maxPrice: 500,
        inStock: true,
      })
      
      expect(where.AND).toBeDefined()
      expect(Array.isArray(where.AND)).toBe(true)
    })
  })

  describe('getSortOrder', () => {
    test('should return relevance sort by default', () => {
      const order = getSortOrder('relevance', 'headphones')
      expect(Array.isArray(order)).toBe(true)
    })

    test('should return price ascending sort', () => {
      const order = getSortOrder('price-asc', 'headphones')
      expect(order[0]).toHaveProperty('price', 'asc')
    })

    test('should return price descending sort', () => {
      const order = getSortOrder('price-desc', 'headphones')
      expect(order[0]).toHaveProperty('price', 'desc')
    })

    test('should return newest sort', () => {
      const order = getSortOrder('newest', 'headphones')
      expect(order[0]).toHaveProperty('createdAt', 'desc')
    })

    test('should return oldest sort', () => {
      const order = getSortOrder('oldest', 'headphones')
      expect(order[0]).toHaveProperty('createdAt', 'asc')
    })
  })
})

describe('Search Performance Metrics', () => {
  describe('getSearchPerformanceMetrics', () => {
    test('should categorize excellent performance', () => {
      const metrics = getSearchPerformanceMetrics('headphones', 50)
      
      expect(metrics.isFast).toBe(true)
      expect(metrics.category).toBe('excellent')
    })

    test('should categorize good performance', () => {
      const metrics = getSearchPerformanceMetrics('headphones', 250)
      
      expect(metrics.isFast).toBe(true)
      expect(metrics.category).toBe('good')
    })

    test('should categorize acceptable performance', () => {
      const metrics = getSearchPerformanceMetrics('headphones', 1000)
      
      expect(metrics.isFast).toBe(true)
      expect(metrics.category).toBe('acceptable')
    })

    test('should categorize slow performance', () => {
      const metrics = getSearchPerformanceMetrics('headphones', 3000)
      
      expect(metrics.isFast).toBe(false)
      expect(metrics.category).toBe('slow')
      expect(metrics.recommendation).toContain('GIN')
    })

    test('should include query in recommendation context', () => {
      const metrics = getSearchPerformanceMetrics('test query', 100)
      
      expect(metrics).toHaveProperty('recommendation')
    })
  })
})

describe('Search Functionality', () => {
  describe('searchProducts', () => {
    test('should return search result structure', async () => {
      const result = await searchProducts({
        query: '',
        page: 1,
        pageSize: 20,
      })

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('pageSize')
      expect(result).toHaveProperty('totalPages')
      expect(result).toHaveProperty('processingTimeMs')

      expect(Array.isArray(result.items)).toBe(true)
      expect(typeof result.total).toBe('number')
      expect(typeof result.page).toBe('number')
      expect(typeof result.pageSize).toBe('number')
      expect(typeof result.totalPages).toBe('number')
      expect(typeof result.processingTimeMs).toBe('number')
    })

    test('should handle pagination', async () => {
      const result1 = await searchProducts({
        query: '',
        page: 1,
        pageSize: 5,
      })

      const result2 = await searchProducts({
        query: '',
        page: 2,
        pageSize: 5,
      })

      expect(result1.page).toBe(1)
      expect(result2.page).toBe(2)
      expect(result1.pageSize).toBe(5)
    })

    test('should validate page and pageSize bounds', async () => {
      const result = await searchProducts({
        query: '',
        page: -1,
        pageSize: 200,
      })

      expect(result.page).toBe(1)
      expect(result.pageSize).toBeLessThanOrEqual(100)
    })

    test('should handle price filters', async () => {
      const result = await searchProducts({
        query: '',
        minPrice: 10,
        maxPrice: 1000,
      })

      expect(result).toBeDefined()
    })

    test('should handle in-stock filter', async () => {
      const result = await searchProducts({
        query: '',
        inStock: true,
      })

      expect(result).toBeDefined()
    })

    test('should handle different sort orders', async () => {
      const sortOrders = ['relevance', 'price-asc', 'price-desc', 'newest', 'oldest'] as const

      for (const sortBy of sortOrders) {
        const result = await searchProducts({
          query: '',
          sortBy,
        })

        expect(result).toBeDefined()
      }
    })

    test('should process search query with terms', async () => {
      const result = await searchProducts({
        query: 'headphones wireless bluetooth',
      })

      expect(result).toBeDefined()
    })

    test('should include highlights when requested', async () => {
      const result = await searchProducts({
        query: 'test',
        includeHighlights: true,
      })

      expect(result).toBeDefined()
    })
  })

  describe('getSearchSuggestions', () => {
    test('should return empty array for short query', async () => {
      const suggestions = await getSearchSuggestions('a', 5)
      
      expect(suggestions).toEqual([])
    })

    test('should return empty array for empty query', async () => {
      const suggestions = await getSearchSuggestions('', 5)
      
      expect(suggestions).toEqual([])
    })

    test('should return suggestions structure', async () => {
      const suggestions = await getSearchSuggestions('headphones', 5)
      
      expect(Array.isArray(suggestions)).toBe(true)
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('type')
        expect(suggestion).toHaveProperty('score')
        expect(typeof suggestion.text).toBe('string')
        expect(['product', 'term']).toContain(suggestion.type)
        expect(typeof suggestion.score).toBe('number')
      })
    })

    test('should respect limit parameter', async () => {
      const suggestions = await getSearchSuggestions('test', 3)
      
      expect(suggestions.length).toBeLessThanOrEqual(3)
    })
  })
})

describe('Search Vector Management', () => {
  describe('updateProductSearchVector', () => {
    test('should be defined as a function', () => {
      expect(typeof updateProductSearchVector).toBe('function')
    })
  })

  describe('batchUpdateSearchVectors', () => {
    test('should be defined as a function', () => {
      expect(typeof batchUpdateSearchVectors).toBe('function')
    })

    test('should accept batch size parameter', async () => {
      const result = await batchUpdateSearchVectors(500)
      
      expect(typeof result).toBe('number')
    })
  })
})

describe('Search Integration Tests', () => {
  test('should complete search within acceptable time', async () => {
    const startTime = performance.now()
    
    const result = await searchProducts({
      query: 'headphones wireless bluetooth speaker',
      page: 1,
      pageSize: 20,
    })
    
    const duration = performance.now() - startTime
    
    expect(duration).toBeLessThan(500)
    expect(result.processingTimeMs).toBeLessThan(500)
  }, 10000)

  test('should handle concurrent search requests', async () => {
    const queries = ['headphones', 'wireless', 'bluetooth', 'speaker', 'charger']
    
    const startTime = performance.now()
    
    const results = await Promise.all(
      queries.map(query => searchProducts({ query, page: 1, pageSize: 10 }))
    )
    
    const duration = performance.now() - startTime
    
    expect(results.length).toBe(5)
    results.forEach(result => {
      expect(result).toBeDefined()
      expect(result.items).toBeDefined()
    })
    
    console.log(`Concurrent searches completed in ${duration}ms`)
  }, 30000)

  test('search performance metrics should be accurate', async () => {
    const result = await searchProducts({
      query: 'test performance',
    })

    const metrics = getSearchPerformanceMetrics('test performance', result.processingTimeMs)

    expect(metrics).toHaveProperty('isFast')
    expect(metrics).toHaveProperty('category')
    expect(metrics).toHaveProperty('recommendation')
    
    console.log(`Search performance: ${result.processingTimeMs}ms, category: ${metrics.category}`)
  })
})
