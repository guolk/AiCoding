import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService.js';
import type { StudentReport, ReportStatus } from '../../shared/types.js';

export const ReportController = {
  getAll(req: Request, res: Response) {
    const { className, templateId, status } = req.query;
    const filters: {
      className?: string;
      templateId?: number;
      status?: ReportStatus;
    } = {};
    
    if (className && typeof className === 'string') {
      filters.className = className;
    }
    if (templateId) {
      filters.templateId = parseInt(templateId as string);
    }
    if (status && typeof status === 'string') {
      filters.status = status as ReportStatus;
    }
    
    const reports = ReportService.getAll(filters);
    res.json(reports);
  },

  getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const report = ReportService.getById(id);
    
    if (!report) {
      return res.status(404).json({ error: '报告不存在' });
    }
    
    res.json(report);
  },

  create(req: Request, res: Response) {
    const reportData = req.body as Omit<StudentReport, 'id'>;
    
    if (!reportData.studentId || !reportData.templateId) {
      return res.status(400).json({ error: '学生ID和模板ID不能为空' });
    }
    
    const report = ReportService.create(reportData);
    res.status(201).json(report);
  },

  update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<StudentReport>;
    
    const report = ReportService.update(id, updates);
    
    if (!report) {
      return res.status(404).json({ error: '报告不存在' });
    }
    
    res.json(report);
  },

  delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const success = ReportService.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '报告不存在' });
    }
    
    res.json({ message: '删除成功' });
  },

  getDashboard(req: Request, res: Response) {
    const stats = ReportService.getDashboardStats();
    res.json(stats);
  },

  getAnalytics(req: Request, res: Response) {
    const { templateId } = req.query;
    const data = ReportService.getAnalytics(
      templateId ? parseInt(templateId as string) : undefined
    );
    res.json(data);
  },

  getClasses(req: Request, res: Response) {
    const classes = ReportService.getClasses();
    res.json(classes);
  }
};
