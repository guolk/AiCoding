import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.js';
import type { AnnualReportData, ApiResponse } from '../../shared/types';

const router = Router();

router.get('/annual', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const totalDonationsResult = db.exec(`
      SELECT COALESCE(SUM(amount), 0) as total FROM donations 
      WHERE donation_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const total_donations = (totalDonationsResult[0]?.values[0]?.[0] as number) || 0;

    const totalHoursResult = db.exec(`
      SELECT COALESCE(SUM(hours), 0) as total FROM volunteer_records 
      WHERE service_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const total_volunteer_hours = (totalHoursResult[0]?.values[0]?.[0] as number) || 0;

    const donationCountResult = db.exec(`
      SELECT COUNT(*) as count FROM donations 
      WHERE donation_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const donation_count = (donationCountResult[0]?.values[0]?.[0] as number) || 0;

    const volunteerCountResult = db.exec(`
      SELECT COUNT(*) as count FROM volunteer_records 
      WHERE service_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const volunteer_count = (volunteerCountResult[0]?.values[0]?.[0] as number) || 0;

    const institutionsCountResult = db.exec(`
      SELECT COUNT(DISTINCT institution_id) as count FROM donations 
      WHERE donation_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const institutions_count = (institutionsCountResult[0]?.values[0]?.[0] as number) || 0;

    const donationsByMonthResult = db.exec(`
      SELECT CAST(strftime('%m', donation_date) as INTEGER) as month, 
             COALESCE(SUM(amount), 0) as amount 
      FROM donations 
      WHERE donation_date BETWEEN ? AND ?
      GROUP BY month 
      ORDER BY month
    `, [startDate, endDate]);
    const donations_by_month: { month: number; amount: number }[] = [];
    if (donationsByMonthResult.length > 0) {
      for (const row of donationsByMonthResult[0].values) {
        donations_by_month.push({ month: row[0] as number, amount: row[1] as number });
      }
    }

    const donationsByInstitutionResult = db.exec(`
      SELECT i.name, COALESCE(SUM(d.amount), 0) as amount 
      FROM donations d
      LEFT JOIN institutions i ON d.institution_id = i.id
      WHERE d.donation_date BETWEEN ? AND ?
      GROUP BY d.institution_id, i.name 
      ORDER BY amount DESC
    `, [startDate, endDate]);
    const donations_by_institution: { name: string; amount: number }[] = [];
    if (donationsByInstitutionResult.length > 0) {
      for (const row of donationsByInstitutionResult[0].values) {
        donations_by_institution.push({ name: row[0] as string, amount: row[1] as number });
      }
    }

    const volunteerByMonthResult = db.exec(`
      SELECT CAST(strftime('%m', service_date) as INTEGER) as month, 
             COALESCE(SUM(hours), 0) as hours 
      FROM volunteer_records 
      WHERE service_date BETWEEN ? AND ?
      GROUP BY month 
      ORDER BY month
    `, [startDate, endDate]);
    const volunteer_by_month: { month: number; hours: number }[] = [];
    if (volunteerByMonthResult.length > 0) {
      for (const row of volunteerByMonthResult[0].values) {
        volunteer_by_month.push({ month: row[0] as number, hours: row[1] as number });
      }
    }

    const totalPeopleHelpedResult = db.exec(`
      SELECT COALESCE(SUM(ie.people_helped), 0) as total 
      FROM impact_estimates ie
      LEFT JOIN donations d ON ie.donation_id = d.id
      WHERE d.donation_date BETWEEN ? AND ?
    `, [startDate, endDate]);
    const total_people_helped = (totalPeopleHelpedResult[0]?.values[0]?.[0] as number) || 0;

    const reportData: AnnualReportData = {
      year,
      total_donations,
      total_volunteer_hours,
      donation_count,
      volunteer_count,
      institutions_count,
      donations_by_month,
      donations_by_institution,
      volunteer_by_month,
      total_people_helped,
    };

    res.json({ success: true, data: reportData } as ApiResponse<AnnualReportData>);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message } as ApiResponse<null>);
  }
});

export default router;
