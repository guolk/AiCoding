import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { Donation, InstitutionStatistics, ApiResponse } from '../../shared/types';

const router = Router();

function rowToDonation(row: any[]): Donation {
  return {
    id: row[0] as number,
    donation_date: row[1] as string,
    institution_id: row[2] as number,
    institution_name: row[8] as string,
    amount: row[3] as number,
    payment_method: row[4] as string,
    purpose: row[5] as string,
    notes: row[6] as string,
    created_at: row[7] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT d.*, i.name as institution_name
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      ORDER BY d.donation_date DESC
    `);
    const donations: Donation[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        donations.push(rowToDonation(row));
      }
    }
    res.json({ success: true, data: donations } as ApiResponse<Donation[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.get('/statistics', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT 
        d.institution_id,
        i.name as institution_name,
        SUM(d.amount) as total_amount,
        COUNT(d.id) as donation_count
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      GROUP BY d.institution_id, i.name
      ORDER BY total_amount DESC
    `);
    const statistics: InstitutionStatistics[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        statistics.push({
          institution_id: row[0] as number,
          institution_name: row[1] as string,
          total_amount: row[2] as number,
          donation_count: row[3] as number,
        });
      }
    }
    res.json({ success: true, data: statistics } as ApiResponse<InstitutionStatistics[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = db.exec(`
      SELECT d.*, i.name as institution_name
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      WHERE d.id = ?
    `, [id]);

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Donation not found' } as ApiResponse<null>);
      return;
    }

    const donation = rowToDonation(result[0].values[0]);
    res.json({ success: true, data: donation } as ApiResponse<Donation>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { donation_date, institution_id, amount, payment_method, purpose, notes } = req.body;

    const stmt = db.prepare(`
      INSERT INTO donations (donation_date, institution_id, amount, payment_method, purpose, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([donation_date, institution_id, amount, payment_method || '', purpose || '', notes || '']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec(`
      SELECT d.*, i.name as institution_name
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      WHERE d.id = ?
    `, [id]);
    const donation = rowToDonation(result[0].values[0]);

    res.status(201).json({ success: true, data: donation } as ApiResponse<Donation>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { donation_date, institution_id, amount, payment_method, purpose, notes } = req.body;

    const checkResult = db.exec('SELECT id FROM donations WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Donation not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare(`
      UPDATE donations 
      SET donation_date = ?, institution_id = ?, amount = ?, payment_method = ?, purpose = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run([donation_date, institution_id, amount, payment_method || '', purpose || '', notes || '', id]);
    stmt.free();

    saveDatabase();

    const result = db.exec(`
      SELECT d.*, i.name as institution_name
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      WHERE d.id = ?
    `, [id]);
    const donation = rowToDonation(result[0].values[0]);

    res.json({ success: true, data: donation } as ApiResponse<Donation>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM donations WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Donation not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM donations WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Donation deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
