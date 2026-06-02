import { getAll, getById, create, update, remove } from '../db/jsonDb.js';
import type { ExperimentTemplate } from '../../shared/types.js';

export const TemplateService = {
  getAll(): ExperimentTemplate[] {
    return getAll<ExperimentTemplate>('templates');
  },

  getById(id: number): ExperimentTemplate | undefined {
    return getById<ExperimentTemplate>('templates', id);
  },

  create(template: Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'>): ExperimentTemplate {
    const now = new Date().toISOString();
    return create<ExperimentTemplate>('templates', {
      ...template,
      createdAt: now,
      updatedAt: now
    });
  },

  update(id: number, updates: Partial<ExperimentTemplate>): ExperimentTemplate | undefined {
    const now = new Date().toISOString();
    return update<ExperimentTemplate>('templates', id, {
      ...updates,
      updatedAt: now
    });
  },

  delete(id: number): boolean {
    return remove('templates', id);
  },

  search(keyword: string): ExperimentTemplate[] {
    const templates = getAll<ExperimentTemplate>('templates');
    const lowerKeyword = keyword.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(lowerKeyword) ||
      t.courseName.toLowerCase().includes(lowerKeyword) ||
      t.purpose.toLowerCase().includes(lowerKeyword)
    );
  }
};
