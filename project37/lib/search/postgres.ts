import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  processingTimeMs: number
}

export interface ProductSearchHit {
  id: string
  name: string
  description: string | null
  price: Prisma.Decimal
  stock: number
  imageUrl: string | null
  rank: number
  highlights?: {
    name?: string
    description?: string
  }
}

export interface SearchOptions {
  query: string
  page?: number
  pageSize?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'oldest'
  inStock?: boolean
  includeHighlights?: boolean
}

export type SearchFilter = {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: unknown
}

function parseSearchQuery(rawQuery: string): string {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return ''
  }

  const trimmed = rawQuery.trim()
  if (trimmed.length === 0) {
    return ''
  }

  const terms = trimmed.split(/\s+/).filter((term) => term.length > 0)

  if (terms.length === 0) {
    return ''
  }

  const processedTerms = terms.map((term) => {
    if (term.includes('&') || term.includes('|') || term.includes(':')) {
      return term
    }

    if (term.length > 2) {
      return `${term}:*`
    }

    return term
  })

  return processedTerms.join(' & ')
}

function buildWhereClause(
  parsedQuery: string,
  options: {
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
  }
): Prisma.ProductWhereInput {
  const { minPrice, maxPrice, inStock } = options

  const conditions: Prisma.ProductWhereInput[] = []

  if (parsedQuery) {
    conditions.push({
      searchVector: {
        search: parsedQuery,
      },
    })
  }

  if (inStock) {
    conditions.push({
      stock: {
        gt: 0,
      },
    })
  }

  if (minPrice !== undefined) {
    conditions.push({
      price: {
        gte: new Prisma.Decimal(minPrice),
      },
    })
  }

  if (maxPrice !== undefined) {
    conditions.push({
      price: {
        lte: new Prisma.Decimal(maxPrice),
      },
    })
  }

  if (conditions.length === 0) {
    return {}
  }

  if (conditions.length === 1) {
    return conditions[0]
  }

  return {
    AND: conditions,
  }
}

function getSortOrder(
  sortBy: string,
  parsedQuery: string
): Prisma.ProductOrderByWithRelationInput[] {
  const orders: Prisma.ProductOrderByWithRelationInput[] = []

  switch (sortBy) {
    case 'price-asc':
      orders.push({ price: 'asc' })
      if (parsedQuery) {
        orders.push({ searchVector: 'desc' as any })
      }
      break

    case 'price-desc':
      orders.push({ price: 'desc' })
      if (parsedQuery) {
        orders.push({ searchVector: 'desc' as any })
      }
      break

    case 'newest':
      orders.push({ createdAt: 'desc' })
      if (parsedQuery) {
        orders.push({ searchVector: 'desc' as any })
      }
      break

    case 'oldest':
      orders.push({ createdAt: 'asc' })
      if (parsedQuery) {
        orders.push({ searchVector: 'desc' as any })
      }
      break

    case 'relevance':
    default:
      if (parsedQuery) {
        orders.push({ searchVector: 'desc' as any })
      }
      orders.push({ createdAt: 'desc' })
      break
  }

  return orders
}

export async function searchProducts(
  options: SearchOptions
): Promise<SearchResult<ProductSearchHit>> {
  const startTime = performance.now()

  const {
    query,
    page = 1,
    pageSize = 20,
    minPrice,
    maxPrice,
    sortBy = 'relevance',
    inStock = false,
    includeHighlights = false,
  } = options

  const skip = Math.max(0, (page - 1) * pageSize)
  const take = Math.min(100, pageSize)

  const parsedQuery = parseSearchQuery(query)
  const whereClause = buildWhereClause(parsedQuery, { minPrice, maxPrice, inStock })

  const countQuery = prisma.product.count({
    where: whereClause,
  })

  let products: ProductSearchHit[]

  if (parsedQuery) {
    const rawResults = await prisma.$queryRaw<
      Array<{
        id: string
        name: string
        description: string | null
        price: string
        stock: number
        image_url: string | null
        rank: number
        headline_name: string | null
        headline_description: string | null
      }>
    >`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price::text,
        p.stock,
        p."imageUrl" as image_url,
        ts_rank(p."searchVector", to_tsquery('english', ${parsedQuery})) as rank,
        ${includeHighlights ? Prisma.sql`ts_headline('english', p.name, to_tsquery('english', ${parsedQuery})) as headline_name,` : Prisma.empty}
        ${includeHighlights ? Prisma.sql`ts_headline('english', COALESCE(p.description, ''), to_tsquery('english', ${parsedQuery})) as headline_description` : Prisma.empty}
      FROM "Product" p
      WHERE p."searchVector" @@ to_tsquery('english', ${parsedQuery})
      ${inStock ? Prisma.sql`AND p.stock > 0` : Prisma.empty}
      ${minPrice !== undefined ? Prisma.sql`AND p.price >= ${minPrice}` : Prisma.empty}
      ${maxPrice !== undefined ? Prisma.sql`AND p.price <= ${maxPrice}` : Prisma.empty}
      ORDER BY ${
        sortBy === 'relevance'
          ? Prisma.sql`rank DESC, p."createdAt" DESC`
          : sortBy === 'price-asc'
          ? Prisma.sql`p.price ASC, rank DESC`
          : sortBy === 'price-desc'
          ? Prisma.sql`p.price DESC, rank DESC`
          : sortBy === 'newest'
          ? Prisma.sql`p."createdAt" DESC, rank DESC`
          : Prisma.sql`p."createdAt" ASC, rank DESC`
      }
      LIMIT ${take} OFFSET ${skip}
    `

    products = rawResults.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: new Prisma.Decimal(row.price),
      stock: row.stock,
      imageUrl: row.image_url,
      rank: Number(row.rank),
      highlights: includeHighlights
        ? {
            name: row.headline_name || undefined,
            description: row.headline_description || undefined,
          }
        : undefined,
    }))
  } else {
    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      orderBy: getSortOrder(sortBy, parsedQuery),
      skip,
      take,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
      },
    })

    products = dbProducts.map((p) => ({
      ...p,
      rank: 1.0,
    }))
  }

  const total = await countQuery

  const processingTimeMs = Math.round(performance.now() - startTime)

  return {
    items: products,
    total,
    page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
    processingTimeMs,
  }
}

export interface SearchSuggestion {
  text: string
  type: 'product' | 'term'
  score?: number
}

export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return []
  }

  const parsedQuery = parseSearchQuery(query)

  if (!parsedQuery) {
    return []
  }

  const suggestions = await prisma.$queryRaw<
    Array<{
      text: string
      type: string
      score: number
    }>
  >`
    SELECT DISTINCT
      p.name as text,
      'product'::text as type,
      ts_rank(p."searchVector", to_tsquery('english', ${parsedQuery})) as score
    FROM "Product" p
    WHERE p."searchVector" @@ to_tsquery('english', ${parsedQuery})
    ORDER BY score DESC
    LIMIT ${limit}
  `

  return suggestions.map((s) => ({
    text: s.text,
    type: s.type as 'product' | 'term',
    score: Number(s.score),
  }))
}

export async function updateProductSearchVector(productId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Product"
    SET "searchVector" = 
      to_tsvector('english', COALESCE("name", '')) ||
      to_tsvector('english', COALESCE("description", ''))
    WHERE id = ${productId}::uuid
  `
}

export async function batchUpdateSearchVectors(batchSize: number = 1000): Promise<number> {
  let updatedCount = 0
  let hasMore = true
  let cursor: string | undefined

  while (hasMore) {
    const products = await prisma.product.findMany({
      where: {
        searchVector: null,
      },
      select: {
        id: true,
      },
      take: batchSize,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    })

    if (products.length === 0) {
      hasMore = false
      break
    }

    const productIds = products.map((p) => p.id)

    await prisma.$executeRaw`
      UPDATE "Product"
      SET "searchVector" = 
        to_tsvector('english', COALESCE("name", '')) ||
        to_tsvector('english', COALESCE("description", ''))
      WHERE id = ANY(${Prisma.sql`${productIds}`}::uuid[])
    `

    updatedCount += products.length
    cursor = products[products.length - 1].id
  }

  return updatedCount
}

export function getSearchPerformanceMetrics(query: string, processingTimeMs: number): {
  isFast: boolean
  category: 'excellent' | 'good' | 'acceptable' | 'slow'
  recommendation: string
} {
  if (processingTimeMs < 100) {
    return {
      isFast: true,
      category: 'excellent',
      recommendation: 'Search performance is excellent',
    }
  }

  if (processingTimeMs < 500) {
    return {
      isFast: true,
      category: 'good',
      recommendation: 'Search performance is good',
    }
  }

  if (processingTimeMs < 2000) {
    return {
      isFast: true,
      category: 'acceptable',
      recommendation: 'Consider optimizing search queries',
    }
  }

  return {
    isFast: false,
    category: 'slow',
    recommendation: 'Search is slow. Consider: 1) Verify GIN index exists, 2) Optimize query, 3) Consider Meilisearch for large datasets',
  }
}
