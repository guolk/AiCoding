import prisma from '../../plugins/prisma';
import { Prisma } from '@prisma/client';
import {
  searchSchema,
  buildSearchPattern,
  detectSqlInjectionAttempt,
  logSecurityEvent,
} from '../../utils/search-utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  const validated = searchSchema.safeParse(query);
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: validated.error.issues,
    });
  }
  
  const { keyword, page, pageSize, status, sortBy, sortOrder } = validated.data;
  const clientIp = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip');
  
  if (keyword && detectSqlInjectionAttempt(keyword)) {
    logSecurityEvent(
      'SQL_INJECTION_ATTEMPT',
      {
        endpoint: '/api/fixed/search/articles',
        keyword,
        queryParams: query,
      },
      clientIp
    );
    
    throw createError({
      statusCode: 400,
      message: '搜索参数无效',
    });
  }
  
  const where: Prisma.ArticleWhereInput = {
    status: status || 'published',
  };
  
  if (keyword) {
    const searchPattern = buildSearchPattern(keyword);
    
    if (searchPattern) {
      where.OR = [
        {
          title: {
            contains: searchPattern,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchPattern,
            mode: 'insensitive',
          },
        },
      ];
    }
  }
  
  const orderBy: Prisma.ArticleOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
    prisma.article.count({
      where,
    }),
  ]);
  
  const articlesWithIsoDates = articles.map((article) => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
  }));
  
  return {
    success: true,
    data: {
      items: articlesWithIsoDates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    searchParams: {
      keyword: keyword || '',
      status: status || 'published',
      sortBy,
      sortOrder,
    },
  };
});
