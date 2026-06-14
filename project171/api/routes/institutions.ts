import { Router, type Request, type Response } from 'express';
import { getDb, saveDatabase } from '../db/index.js';
import type { Institution, AnnualReport, CredibilityAssessment, ApiResponse } from '../../shared/types';

const router = Router();

function rowToInstitution(row: any[]): Institution {
  return {
    id: row[0] as number,
    name: row[1] as string,
    mission: row[2] as string,
    operation_mode: row[3] as string,
    transparency_rating: row[4] as number,
    created_at: row[5] as string,
  };
}

function rowToAnnualReport(row: any[]): AnnualReport {
  return {
    id: row[0] as number,
    institution_id: row[1] as number,
    year: row[2] as number,
    financial_summary: row[3] as string,
    project_outcomes: row[4] as string,
    created_at: row[5] as string,
  };
}

function rowToCredibilityAssessment(row: any[]): CredibilityAssessment {
  return {
    id: row[0] as number,
    institution_id: row[1] as number,
    has_public_finance: row[2] === 1,
    has_third_party_audit: row[3] === 1,
    assessment_notes: row[4] as string,
    assessment_date: row[5] as string,
    created_at: row[6] as string,
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM institutions ORDER BY created_at DESC');
    const institutions: Institution[] = [];
    if (result.length > 0) {
      for (const row of result[0].values) {
        institutions.push(rowToInstitution(row));
      }
    }
    res.json({ success: true, data: institutions } as ApiResponse<Institution[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const instResult = db.exec('SELECT * FROM institutions WHERE id = ?', [id]);
    if (instResult.length === 0) {
      res.status(404).json({ success: false, error: 'Institution not found' } as ApiResponse<null>);
      return;
    }
    const institution = rowToInstitution(instResult[0].values[0]);

    const reportResult = db.exec('SELECT * FROM annual_reports WHERE institution_id = ? ORDER BY year DESC', [id]);
    const annual_reports: AnnualReport[] = [];
    if (reportResult.length > 0) {
      for (const row of reportResult[0].values) {
        annual_reports.push(rowToAnnualReport(row));
      }
    }

    const assessResult = db.exec('SELECT * FROM credibility_assessments WHERE institution_id = ? ORDER BY assessment_date DESC LIMIT 1', [id]);
    let credibility_assessment: CredibilityAssessment | null = null;
    if (assessResult.length > 0 && assessResult[0].values.length > 0) {
      credibility_assessment = rowToCredibilityAssessment(assessResult[0].values[0]);
    }

    res.json({
      success: true,
      data: { ...institution, annual_reports, credibility_assessment },
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { name, mission, operation_mode, transparency_rating } = req.body;

    const stmt = db.prepare('INSERT INTO institutions (name, mission, operation_mode, transparency_rating) VALUES (?, ?, ?, ?)');
    stmt.run([name, mission || '', operation_mode || '', transparency_rating || 3]);
    stmt.free();

    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0] as number;

    const result = db.exec('SELECT * FROM institutions WHERE id = ?', [id]);
    const institution = rowToInstitution(result[0].values[0]);

    res.status(201).json({ success: true, data: institution } as ApiResponse<Institution>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name, mission, operation_mode, transparency_rating } = req.body;

    const checkResult = db.exec('SELECT id FROM institutions WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Institution not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('UPDATE institutions SET name = ?, mission = ?, operation_mode = ?, transparency_rating = ? WHERE id = ?');
    stmt.run([name, mission || '', operation_mode || '', transparency_rating || 3, id]);
    stmt.free();

    saveDatabase();

    const result = db.exec('SELECT * FROM institutions WHERE id = ?', [id]);
    const institution = rowToInstitution(result[0].values[0]);

    res.json({ success: true, data: institution } as ApiResponse<Institution>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { id } = req.params;

    const checkResult = db.exec('SELECT id FROM institutions WHERE id = ?', [id]);
    if (checkResult.length === 0) {
      res.status(404).json({ success: false, error: 'Institution not found' } as ApiResponse<null>);
      return;
    }

    const stmt = db.prepare('DELETE FROM institutions WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.json({ success: true, data: { message: 'Institution deleted successfully' } } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
