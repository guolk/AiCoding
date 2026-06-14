import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { VolunteerRecord, ApiResponse } from '../../shared/types';

const router = Router();

function rowToVolunteer(row: any[]): VolunteerRecord {
  return {
    id: row[0] as number,
    service_date: row[1] as string,
    hours: row[2] as number,
    service_type: row[3] as string,
    beneficiary_group: row[4] as string,
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
      SELECT v.*, i.name as institution_name
      FROM volunteer_records v
      LEFT JOIN institutions i ON v.institution_id = i.id
      ORDER BY v.service_date DESC
    `);
    const records: VolunteerRecord[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        records.push(rowToVolunteer(row));
      }
    }
    res.json({ success: true, data: records } as ApiResponse<VolunteerRecord[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { service_date, hours, service_type, beneficiary_group, institution_id, notes } = req.body;

    const stmt = db.prepare(`
      INSERT INTO volunteer_records (service_date, hours, service_type, beneficiary_group, institution_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([service_date, hours, service_type || '', beneficiary_group || '', institution_id, notes || '']);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec(`
      SELECT v.*, i.name as institution_name
      FROM volunteer_records v
      LEFT JOIN institutions i ON v.institution_id = i.id
      WHERE v.id = ?
    `, [id]);
    const record = rowToVolunteer(result[0].values[0]);

    res.status(201).json({ success: true, data: record } as ApiResponse<VolunteerRecord>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { service_date, hours, service_type, beneficiary_group, institution_id, notes } = req.body;

    const checkResult = db.exec('SELECT id FROM volunteer_records WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Volunteer record not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare(`
      UPDATE volunteer_records 
      SET service_date = ?, hours = ?, service_type = ?, beneficiary_group = ?, institution_id = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run([service_date, hours, service_type || '', beneficiary_group || '', institution_id, notes || '', id]);
    stmt.free();

    saveDatabase();

    const result = db.exec(`
      SELECT v.*, i.name as institution_name
      FROM volunteer_records v
      LEFT JOIN institutions i ON v.institution_id = i.id
      WHERE v.id = ?
    `, [id]);
    const record = rowToVolunteer(result[0].values[0]);

    res.json({ success: true, data: record } as ApiResponse<VolunteerRecord>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM volunteer_records WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Volunteer record not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM volunteer_records WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Volunteer record deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
