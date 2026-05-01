import prisma from '../../plugins/prisma';
import { likeArticle } from '../../utils/like-service';
import { z } from 'zod';

const likeArticleSchema = z.object({
  articleId: z.coerce.number().int().positive('文章ID必须是正整数'),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  
  const articleIdParam = getRouterParam(event, 'articleId');
  const validated = likeArticleSchema.safeParse({ articleId: articleIdParam });
  
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
    const result = await likeArticle(userId, articleId);
    
    return {
      success: true,
      message: '点赞成功',
      likeCount: result.likeCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '点赞失败';
    
    if (message === '已经点赞过了') {
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
