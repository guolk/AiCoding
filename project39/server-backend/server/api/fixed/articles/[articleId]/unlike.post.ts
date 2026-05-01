import prisma from '../../plugins/prisma';
import { unlikeArticle } from '../../utils/like-service';
import { z } from 'zod';

const unlikeArticleSchema = z.object({
  articleId: z.coerce.number().int().positive('文章ID必须是正整数'),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const articleIdParam = getRouterParam(event, 'articleId');
  const validated = unlikeArticleSchema.safeParse({ articleId: articleIdParam });
  
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      message: '文章ID无效',
    });
  }
  
  const articleId = validated.data.articleId;
  
  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });
  
  if (!article) {
    throw createError({
      statusCode: 404,
      message: '文章不存在',
    });
  }
  
  try {
    const result = await unlikeArticle(userId, articleId);
    
    return {
      success: true,
      message: '取消点赞成功',
      likeCount: result.likeCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '取消点赞失败';
    
    if (message === '还没有点赞') {
      throw createError({
        statusCode: 400,
        message,
      });
    }
    
    throw createError({
      statusCode: 500,
      message,
    });
  }
});
