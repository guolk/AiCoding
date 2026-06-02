import { Request, Response } from 'express';
import { TemplateService } from '../services/TemplateService.js';
import type { ExperimentTemplate } from '../../shared/types.js';

export const TemplateController = {
  getAll(req: Request, res: Response) {
    const { keyword } = req.query;
    let templates;
    
    if (keyword && typeof keyword === 'string') {
      templates = TemplateService.search(keyword);
    } else {
      templates = TemplateService.getAll();
    }
    
    res.json(templates);
  },

  getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const template = TemplateService.getById(id);
    
    if (!template) {
      return res.status(404).json({ error: '实验模板不存在' });
    }
    
    res.json(template);
  },

  create(req: Request, res: Response) {
    const templateData = req.body as Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'>;
    
    if (!templateData.name || !templateData.courseName) {
      return res.status(400).json({ error: '实验名称和课程名称不能为空' });
    }
    
    const template = TemplateService.create(templateData);
    res.status(201).json(template);
  },

  update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<ExperimentTemplate>;
    
    const template = TemplateService.update(id, updates);
    
    if (!template) {
      return res.status(404).json({ error: '实验模板不存在' });
    }
    
    res.json(template);
  },

  delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const success = TemplateService.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '实验模板不存在' });
    }
    
    res.json({ message: '删除成功' });
  }
};
