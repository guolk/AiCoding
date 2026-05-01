import prisma from '../../plugins/prisma';
import { invalidateLikeCountCache, getLikeCountFromCache, setLikeCountToCache, withLock } from '../../utils/cache-utils';
import { Prisma } from '@prisma/client';

export const getArticleWithLikeCount = async (articleId: number) => {
  const cachedCount = await getLikeCountFromCache(articleId);
  
  if (cachedCount !== null) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
      },
    });
    
    if (article) {
      return { ...article, likeCount: cachedCount };
    }
  }
  
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: {
        select: { id: true, username: true, email: true },
      },
    },
  });
  
  if (article) {
    const likeCount = await prisma.like.count({
      where: { articleId },
    });
    
    await setLikeCountToCache(articleId, likeCount);
    
    return { ...article, likeCount };
  }
  
  return null;
};

export const likeArticle = async (userId: number, articleId: number) => {
  const lockKey = `like:article:${articleId}:user:${userId}`;
  
  return withLock(lockKey, async () => {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    
    if (existingLike) {
      throw new Error('已经点赞过了');
    }
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: { userId, articleId },
        });
        
        const updatedArticle = await tx.article.update({
          where: { id: articleId },
          data: {
            likeCount: { increment: 1 },
          },
        });
        
        return updatedArticle;
      });
      
      await invalidateLikeCountCache(articleId);
      
      return {
        success: true,
        likeCount: result.likeCount,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('已经点赞过了');
      }
      throw error;
    }
  });
};

export const unlikeArticle = async (userId: number, articleId: number) => {
  const lockKey = `like:article:${articleId}:user:${userId}`;
  
  return withLock(lockKey, async () => {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    
    if (!existingLike) {
      throw new Error('还没有点赞');
    }
    
    const result = await prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: { userId_articleId: { userId, articleId } },
      });
      
      const updatedArticle = await tx.article.update({
        where: { id: articleId },
        data: {
          likeCount: { decrement: 1 },
        },
      });
      
      return updatedArticle;
    });
    
    await invalidateLikeCountCache(articleId);
    
    return {
      success: true,
      likeCount: result.likeCount,
    };
  });
};

export const syncLikeCounts = async (articleId?: number) => {
  const articles = articleId
    ? await prisma.article.findMany({ where: { id: articleId } })
    : await prisma.article.findMany();
  
  const results = [];
  
  for (const article of articles) {
    const actualLikeCount = await prisma.like.count({
      where: { articleId: article.id },
    });
    
    if (article.likeCount !== actualLikeCount) {
      await prisma.article.update({
        where: { id: article.id },
        data: { likeCount: actualLikeCount },
      });
      
      await invalidateLikeCountCache(article.id);
      
      results.push({
        articleId: article.id,
        oldCount: article.likeCount,
        newCount: actualLikeCount,
        fixed: true,
      });
    } else {
      results.push({
        articleId: article.id,
        count: actualLikeCount,
        fixed: false,
      });
    }
  }
  
  return results;
};
