import { getAll, create, remove, query } from '../db/jsonDb.js';
import type { CommentTemplate } from '../../shared/types.js';

export const CommentService = {
  getAll(): CommentTemplate[] {
    return getAll<CommentTemplate>('comments');
  },

  getByCategory(category: string): CommentTemplate[] {
    return query<CommentTemplate>('comments', c => c.category === category);
  },

  create(comment: Omit<CommentTemplate, 'id'>): CommentTemplate {
    return create<CommentTemplate>('comments', comment);
  },

  delete(id: number): boolean {
    return remove('comments', id);
  },

  getCategories(): string[] {
    const comments = getAll<CommentTemplate>('comments');
    return [...new Set(comments.map(c => c.category))];
  }
};
