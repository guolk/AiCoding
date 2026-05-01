import { getArticleWithLikeCount } from '../../utils/like-service';
import { z } from 'zod';

const getArticleSchema = z.object({
  articleId: z.coerce.number().int().positive('文章ID必须是正整数'),
});

export default defineEventHandler(async (event) => {
  const articleIdParam = getRouterParam(event, 'articleId');
  const validated = getArticleSchema.safeParse({ articleId: articleIdParam });
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '文章ID无效',
    });
  }
  
  const articleId = validated.data.articleId;
  
  const article = await getArticleWithLikeCount(articleId);
  
  if (!article) {
    throw createError({
      statusCode: 404,
      message: '文章不存在',
    });
  }
  
  return {
    success: true,
    data: {
      ...article,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt?.toISOString(),
    },
  };
});
