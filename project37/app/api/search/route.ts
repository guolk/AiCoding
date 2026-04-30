import { NextRequest, NextResponse } from 'next/server'
import {
  searchProducts,
  getSearchSuggestions,
  SearchOptions,
  getSearchPerformanceMetrics,
} from '@/lib/search/postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined
    const sortBy =
      (searchParams.get('sortBy') as SearchOptions['sortBy']) || 'relevance'
    const inStock = searchParams.get('inStock') === 'true'
    const includeHighlights = searchParams.get('includeHighlights') === 'true'
    const suggestions = searchParams.get('suggestions') === 'true'

    if (suggestions && query.length >= 2) {
      const result = await getSearchSuggestions(query, 10)
      return NextResponse.json({
        success: true,
        data: result,
      })
    }

    const options: SearchOptions = {
      query,
      page: Math.max(1, page),
      pageSize: Math.min(100, Math.max(1, pageSize)),
      minPrice,
      maxPrice,
      sortBy,
      inStock,
      includeHighlights,
    }

    const result = await searchProducts(options)

    const performanceMetrics = getSearchPerformanceMetrics(query, result.processingTimeMs)

    const response = {
      success: true,
      data: result,
      performance: {
        ...performanceMetrics,
        processingTimeMs: result.processingTimeMs,
      },
    }

    if (!performanceMetrics.isFast) {
      console.warn(`Slow search detected: "${query}" took ${result.processingTimeMs}ms`)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    )
  }
}
