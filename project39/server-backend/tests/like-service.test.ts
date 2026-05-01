import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getArticleWithLikeCount,
  likeArticle,
  unlikeArticle,
  syncLikeCounts,
} from '../server/utils/like-service';
import { Prisma } from '@prisma/client';

vi.mock('../server/utils/cache-utils', () => ({
  getLikeCountFromCache: vi.fn(),
  setLikeCountToCache: vi.fn(),
  invalidateLikeCountCache: vi.fn(),
  withLock: vi.fn(),
}));

vi.mock('../../plugins/prisma', () => {
  const mockPrisma = {
    article: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { default: mockPrisma };
});

import { getLikeCountFromCache, setLikeCountToCache, invalidateLikeCountCache, withLock } from '../server/utils/cache-utils';
import prisma from '../../plugins/prisma';

describe('点赞服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getArticleWithLikeCount', () => {
    it('应该优先从缓存获取点赞数', async () => {
      vi.mocked(getLikeCountFromCache).mockResolvedValue(42);
      vi.mocked(prisma.article.findUnique).mockResolvedValue({
        id: 1,
        title: 'Test Article',
        content: 'Content',
        authorId: 1,
        status: 'published',
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 1, username: 'testuser', email: 'test@example.com' },
      });
      
      const result = await getArticleWithLikeCount(1);
      
      expect(getLikeCountFromCache).toHaveBeenCalledWith(1);
      expect(prisma.like.count).not.toHaveBeenCalled();
      expect(result?.likeCount).toBe(42);
    });

    it('缓存不存在时应该从数据库获取', async () => {
      vi.mocked(getLikeCountFromCache).mockResolvedValue(null);
      vi.mocked(prisma.article.findUnique).mockResolvedValue({
        id: 1,
        title: 'Test Article',
        content: 'Content',
        authorId: 1,
        status: 'published',
        likeCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.like.count).mockResolvedValue(15);
      
      await getArticleWithLikeCount(1);
      
      expect(prisma.like.count).toHaveBeenCalledWith({ where: { articleId: 1 } });
      expect(setLikeCountToCache).toHaveBeenCalledWith(1, 15);
    });

    it('文章不存在时应该返回null', async () => {
      vi.mocked(getLikeCountFromCache).mockResolvedValue(null);
      vi.mocked(prisma.article.findUnique).mockResolvedValue(null);
      
      const result = await getArticleWithLikeCount(999);
      
      expect(result).toBeNull();
    });
  });

  describe('likeArticle', () => {
    it('应该在锁保护下执行点赞操作', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        title: 'Test',
        likeCount: 11,
      } as any);
      
      const result = await likeArticle(1, 1);
      
      expect(withLock).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('应该使用事务原子操作增加点赞数', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      
      let transactionCalled = false;
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        transactionCalled = true;
        const mockTx = {
          like: { create: vi.fn() },
          article: { 
            update: vi.fn().mockResolvedValue({ 
              id: 1, 
              likeCount: 11 
            }) 
          },
        };
        return callback(mockTx);
      });
      
      await likeArticle(1, 1);
      
      expect(transactionCalled).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('重复点赞应该抛出错误', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      
      await expect(likeArticle(1, 1)).rejects.toThrow('已经点赞过了');
    });

    it('Prisma唯一约束错误应该被捕获', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '1.0.0',
        })
      );
      
      await expect(likeArticle(1, 1)).rejects.toThrow('已经点赞过了');
    });

    it('点赞成功后应该失效缓存', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 11,
      } as any);
      
      await likeArticle(1, 1);
      
      expect(invalidateLikeCountCache).toHaveBeenCalledWith(1);
    });

    it('应该返回正确的结果', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 11,
      } as any);
      
      const result = await likeArticle(1, 1);
      
      expect(result.success).toBe(true);
      expect(result.likeCount).toBe(11);
    });
  });

  describe('unlikeArticle', () => {
    it('应该在锁保护下执行取消点赞操作', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 9,
      } as any);
      
      await unlikeArticle(1, 1);
      
      expect(withLock).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it应该使用事务原子操作减少点赞数', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      
      let transactionCalled = false;
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        transactionCalled = true;
        const mockTx = {
          like: { delete: vi.fn() },
          article: { 
            update: vi.fn().mockResolvedValue({ 
              id: 1, 
              likeCount: 9 
            }) 
          },
        };
        return callback(mockTx);
      });
      
      await unlikeArticle(1, 1);
      
      expect(transactionCalled).toBe(true);
    });

    it('未点赞时取消点赞应该抛出错误', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      
      await expect(unlikeArticle(1, 1)).rejects.toThrow('还没有点赞');
    });

    it('取消点赞成功后应该失效缓存', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 9,
      } as any);
      
      await unlikeArticle(1, 1);
      
      expect(invalidateLikeCountCache).toHaveBeenCalledWith(1);
    });
  });

  describe('syncLikeCounts', () => {
    it('应该同步所有文章的点赞数', async () => {
      vi.mocked(prisma.article.findMany).mockResolvedValue([
        { id: 1, likeCount: 5 },
        { id: 2, likeCount: 3 },
      ] as any);
      vi.mocked(prisma.like.count)
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(3);
      
      const results = await syncLikeCounts();
      
      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { likeCount: 7 },
      });
      expect(results).toHaveLength(2);
      expect(results[0].fixed).toBe(true);
      expect(results[1].fixed).toBe(false);
    });

    it('应该只同步指定的文章', async () => {
      vi.mocked(prisma.article.findMany).mockResolvedValue([
        { id: 1, likeCount: 5 },
      ] as any);
      vi.mocked(prisma.like.count).mockResolvedValue(5);
      
      await syncLikeCounts(1);
      
      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('不一致时应该失效缓存', async () => {
      vi.mocked(prisma.article.findMany).mockResolvedValue([
        { id: 1, likeCount: 5 },
      ] as any);
      vi.mocked(prisma.like.count).mockResolvedValue(10);
      
      await syncLikeCounts(1);
      
      expect(invalidateLikeCountCache).toHaveBeenCalledWith(1);
    });

    it('一致时不应该更新数据库', async () => {
      vi.mocked(prisma.article.findMany).mockResolvedValue([
        { id: 1, likeCount: 5 },
      ] as any);
      vi.mocked(prisma.like.count).mockResolvedValue(5);
      
      await syncLikeCounts(1);
      
      expect(prisma.article.update).not.toHaveBeenCalled();
      expect(invalidateLikeCountCache).not.toHaveBeenCalled();
    });
  });

  describe('并发控制测试', () => {
    it('点赞操作应该使用用户级别的锁', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 1,
      } as any);
      
      await likeArticle(1, 1);
      
      expect(mockWithLock.mock.calls[0][0]).toBe('like:article:1:user:1');
    });

    it('取消点赞操作应该使用相同的锁键', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 1,
        likeCount: 0,
      } as any);
      
      await unlikeArticle(1, 1);
      
      expect(mockWithLock.mock.calls[0][0]).toBe('like:article:1:user:1');
    });
  });

  describe('原子操作测试', () => {
    it('点赞应该使用increment原子操作', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
      
      const mockUpdate = vi.fn().mockResolvedValue({ id: 1, likeCount: 11 });
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const mockTx = {
          like: { create: vi.fn() },
          article: { update: mockUpdate },
        };
        return callback(mockTx);
      });
      
      await likeArticle(1, 1);
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likeCount: { increment: 1 } },
        })
      );
    });

    it('取消点赞应该使用decrement原子操作', async () => {
      const mockWithLock = vi.mocked(withLock);
      mockWithLock.mockImplementation(async (key, fn) => {
        return fn();
      });
      
      vi.mocked(prisma.like.findUnique).mockResolvedValue({
        id: 1,
        userId: 1,
        articleId: 1,
        createdAt: new Date(),
      });
      
      const mockUpdate = vi.fn().mockResolvedValue({ id: 1, likeCount: 9 });
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const mockTx = {
          like: { delete: vi.fn() },
          article: { update: mockUpdate },
        };
        return callback(mockTx);
      });
      
      await unlikeArticle(1, 1);
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likeCount: { decrement: 1 } },
        })
      );
    });
  });
});
