import { Request, Response } from 'express';
import { ResourceService } from '../services/ResourceService.js';
import type { Resource, ResourceType } from '../../shared/types.js';

export const ResourceController = {
  getAll(req: Request, res: Response) {
    const { type } = req.query;
    let resources;
    
    if (type && typeof type === 'string') {
      resources = ResourceService.getAll(type as ResourceType);
    } else {
      resources = ResourceService.getAll();
    }
    
    res.json(resources);
  },

  getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const resource = ResourceService.getById(id);
    
    if (!resource) {
      return res.status(404).json({ error: '资源不存在' });
    }
    
    res.json(resource);
  },

  create(req: Request, res: Response) {
    const resourceData = req.body as Omit<Resource, 'id'>;
    
    if (!resourceData.title || !resourceData.type) {
      return res.status(400).json({ error: '标题和类型不能为空' });
    }
    
    const resource = ResourceService.create(resourceData);
    res.status(201).json(resource);
  },

  update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<Resource>;
    
    const resource = ResourceService.update(id, updates);
    
    if (!resource) {
      return res.status(404).json({ error: '资源不存在' });
    }
    
    res.json(resource);
  },

  delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const success = ResourceService.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '资源不存在' });
    }
    
    res.json({ message: '删除成功' });
  },

  getEquipmentStatus(req: Request, res: Response) {
    const status = ResourceService.getEquipmentStatus();
    res.json(status);
  }
};
