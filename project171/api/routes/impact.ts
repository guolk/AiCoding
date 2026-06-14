import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { ImpactEstimate, ApiResponse } from '../../shared/types';

const router = Router();

function rowToImpact(row: any[]): ImpactEstimate {
  return {
    id: row[0] as number,
    donation_id: row[1] as number,
    people_helped: row[2] as number,
    description: row[3] as string,
    created_at: row[4] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM impact_estimates ORDER BY created_at DESC');
    const impacts: ImpactEstimate[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        impacts.push(rowToImpact(row));
      }
    }
    res.json({ success: true, data: impacts } as ApiResponse<ImpactEstimate[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { donation_id, people_helped, description } = req.body;

    const stmt = db.prepare(`
      INSERT INTO impact_estimates (donation_id, people_helped, description)
      VALUES (?, ?, ?)
    `);
    stmt.run([donation_id, people_helped || 0, description || '']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec('SELECT * FROM impact_estimates WHERE id = ?', [id]);
    const impact = rowToImpact(result[0].values[0]);

    res.status(201).json({ success: true, data: impact } as ApiResponse<ImpactEstimate>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM impact_estimates WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Impact estimate not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM impact_estimates WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Impact estimate deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
