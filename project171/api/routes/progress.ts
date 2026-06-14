import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { ProjectProgress, ApiResponse } from '../../shared/types';

const router = Router();

function rowToProgress(row: any[]): ProjectProgress {
  return {
    id: row[0] as number,
    donation_id: row[1] as number,
    update_date: row[2] as string,
    progress_description: row[3] as string,
    status: row[4] as string,
    created_at: row[5] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { donation_id } = req.query;

    let query = 'SELECT * FROM project_progress';
    const params: any[] = [];

    if (donation_id) {
      query += ' WHERE donation_id = ?';
      params.push(donation_id);
    }
    query += ' ORDER BY update_date DESC';

    const result = db.exec(query, params);
    const progress: ProjectProgress[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        progress.push(rowToProgress(row));
      }
    }
    res.json({ success: true, data: progress } as ApiResponse<ProjectProgress[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { donation_id, update_date, progress_description, status } = req.body;

    const stmt = db.prepare(`
      INSERT INTO project_progress (donation_id, update_date, progress_description, status)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run([donation_id, update_date, progress_description, status || '进行中']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec('SELECT * FROM project_progress WHERE id = ?', [id]);
    const progress = rowToProgress(result[0].values[0]);

    res.status(201).json({ success: true, data: progress } as ApiResponse<ProjectProgress>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM project_progress WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Project progress not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM project_progress WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Project progress deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
