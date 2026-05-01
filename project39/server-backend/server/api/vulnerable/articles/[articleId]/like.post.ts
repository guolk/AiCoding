import prisma from '../../plugins/prisma';
import { redis } from '../../plugins/redis';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const userId = user.userId;
  const articleId = parseInt(getRouterParam(event, 'articleId') || '0', 10);
  
  if (!articleId) {
    throw createError({
      statusCode: 400,
      message: '文章ID无效',
    });
  }
  
  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });
  
  if (!article) {
    throw createError({
      statusCode: 404,
      message: '文章不存在',
    });
  }
  
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
  
  if (existingLike) {
    throw createError({
      statusCode: 400,
      message: '已经点赞过了',
    });
  }
  
  await prisma.like.create({
    data: {
      userId,
      articleId,
    },
  });
  
  const currentArticle = await prisma.article.findUnique({
    where: { id: articleId },
  });
  
  if (currentArticle) {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        likeCount: currentArticle.likeCount + 1,
      },
    });
  }
  
  const redisKey = `article:${articleId}:likes`;
  await redis.incr(redisKey);
  await redis.expire(redisKey, 3600);
  
  return {
    success: true,
    message: '点赞成功',
    likeCount: currentArticle ? currentArticle.likeCount + 1 : 0,
  };
});
