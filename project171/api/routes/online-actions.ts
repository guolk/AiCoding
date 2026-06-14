import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { OnlineAction, ApiResponse } from '../../shared/types';

const router = Router();

function rowToOnlineAction(row: any[]): OnlineAction {
  return {
    id: row[0] as number,
    action_date: row[1] as string,
    action_type: row[2] as string,
    initiative_name: row[3] as string,
    institution_id: row[4] as number,
    institution_name: row[7] as string,
    notes: row[5] as string,
    created_at: row[6] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT oa.*, i.name as institution_name
      FROM online_actions oa
      LEFT JOIN institutions i ON oa.institution_id = i.id
      ORDER BY oa.action_date DESC
    `);
    const actions: OnlineAction[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        actions.push(rowToOnlineAction(row));
      }
    }
    res.json({ success: true, data: actions } as ApiResponse<OnlineAction[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { action_date, action_type, initiative_name, institution_id, notes } = req.body;

    const stmt = db.prepare(`
      INSERT INTO online_actions (action_date, action_type, initiative_name, institution_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([action_date, action_type || '', initiative_name || '', institution_id, notes || '']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec(`
      SELECT oa.*, i.name as institution_name
      FROM online_actions oa
      LEFT JOIN institutions i ON oa.institution_id = i.id
      WHERE oa.id = ?
    `, [id]);
    const action = rowToOnlineAction(result[0].values[0]);

    res.status(201).json({ success: true, data: action } as ApiResponse<OnlineAction>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { action_date, action_type, initiative_name, institution_id, notes } = req.body;

    const checkResult = db.exec('SELECT id FROM online_actions WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Online action not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare(`
      UPDATE online_actions 
      SET action_date = ?, action_type = ?, initiative_name = ?, institution_id = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run([action_date, action_type || '', initiative_name || '', institution_id, notes || '', id]);
    stmt.free();

    saveDatabase();

    const result = db.exec(`
      SELECT oa.*, i.name as institution_name
      FROM online_actions oa
      LEFT JOIN institutions i ON oa.institution_id = i.id
      WHERE oa.id = ?
    `, [id]);
    const action = rowToOnlineAction(result[0].values[0]);

    res.json({ success: true, data: action } as ApiResponse<OnlineAction>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM online_actions WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Online action not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM online_actions WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Online action deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
