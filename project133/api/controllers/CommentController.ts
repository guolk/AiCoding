import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService.js';
import type { CommentTemplate } from '../../shared/types.js';

export const CommentController = {
  getAll(req: Request, res: Response) {
    const { category } = req.query;
    let comments;
    
    if (category && typeof category === 'string') {
      comments = CommentService.getByCategory(category);
    } else {
      comments = CommentService.getAll();
    }
    
    res.json(comments);
  },

  create(req: Request, res: Response) {
    const commentData = req.body as Omit<CommentTemplate, 'id'>;
    
    if (!commentData.category || !commentData.content) {
      return res.status(400).json({ error: '分类和内容不能为空' });
    }
    
    const comment = CommentService.create(commentData);
    res.status(201).json(comment);
  },

  delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const success = CommentService.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '批语不存在' });
    }
    
    res.json({ message: '删除成功' });
  },

  getCategories(req: Request, res: Response) {
    const categories = CommentService.getCategories();
    res.json(categories);
  }
};
