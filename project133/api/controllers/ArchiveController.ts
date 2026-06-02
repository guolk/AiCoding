import { Request, Response } from 'express';
import { ArchiveService } from '../services/ArchiveService.js';
import type { Archive } from '../../shared/types.js';

export const ArchiveController = {
  getAll(req: Request, res: Response) {
    const archives = ArchiveService.getAll();
    res.json(archives);
  },

  getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const archive = ArchiveService.getById(id);
    
    if (!archive) {
      return res.status(404).json({ error: '档案不存在' });
    }
    
    res.json(archive);
  },

  create(req: Request, res: Response) {
    const archiveData = req.body as Omit<Archive, 'id'>;
    
    if (!archiveData.courseName || !archiveData.semester || !archiveData.year) {
      return res.status(400).json({ error: '课程名称、学期和年份不能为空' });
    }
    
    const archive = ArchiveService.create(archiveData);
    res.status(201).json(archive);
  },

  update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<Archive>;
    
    const archive = ArchiveService.update(id, updates);
    
    if (!archive) {
      return res.status(404).json({ error: '档案不存在' });
    }
    
    res.json(archive);
  },

  delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const success = ArchiveService.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '档案不存在' });
    }
    
    res.json({ message: '删除成功' });
  },

  getSchedule(req: Request, res: Response) {
    const { date } = req.query;
    const schedule = ArchiveService.getSchedule(
      date && typeof date === 'string' ? date : undefined
    );
    res.json(schedule);
  }
};
