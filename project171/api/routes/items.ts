import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { ItemDonation, ApiResponse } from '../../shared/types';

const router = Router();

function rowToItem(row: any[]): ItemDonation {
  return {
    id: row[0] as number,
    donation_date: row[1] as string,
    item_name: row[2] as string,
    quantity: row[3] as number,
    condition: row[4] as string,
    institution_id: row[5] as number,
    institution_name: row[8] as string,
    notes: row[6] as string,
    created_at: row[7] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT it.*, i.name as institution_name
      FROM item_donations it
      LEFT JOIN institutions i ON it.institution_id = i.id
      ORDER BY it.donation_date DESC
    `);
    const items: ItemDonation[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        items.push(rowToItem(row));
      }
    }
    res.json({ success: true, data: items } as ApiResponse<ItemDonation[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { donation_date, item_name, quantity, condition, institution_id, notes } = req.body;

    const stmt = db.prepare(`
      INSERT INTO item_donations (donation_date, item_name, quantity, condition, institution_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([donation_date, item_name, quantity || 1, condition || '', institution_id, notes || '']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec(`
      SELECT it.*, i.name as institution_name
      FROM item_donations it
      LEFT JOIN institutions i ON it.institution_id = i.id
      WHERE it.id = ?
    `, [id]);
    const item = rowToItem(result[0].values[0]);

    res.status(201).json({ success: true, data: item } as ApiResponse<ItemDonation>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { donation_date, item_name, quantity, condition, institution_id, notes } = req.body;

    const checkResult = db.exec('SELECT id FROM item_donations WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Item donation not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare(`
      UPDATE item_donations 
      SET donation_date = ?, item_name = ?, quantity = ?, condition = ?, institution_id = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run([donation_date, item_name, quantity || 1, condition || '', institution_id, notes || '', id]);
    stmt.free();

    saveDatabase();

    const result = db.exec(`
      SELECT it.*, i.name as institution_name
      FROM item_donations it
      LEFT JOIN institutions i ON it.institution_id = i.id
      WHERE it.id = ?
    `, [id]);
    const item = rowToItem(result[0].values[0]);

    res.json({ success: true, data: item } as ApiResponse<ItemDonation>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM item_donations WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Item donation not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM item_donations WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Item donation deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
