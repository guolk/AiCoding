import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allQuery, getQuery, runQuery } from '../db.js';
import { TraceabilityCode, TraceabilityData } from '../types.js';

const router = Router();

function generateTraceCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGRI-${timestamp}-${random}`;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { plot_id, harvest_record_id } = req.query;
    let query = `
      SELECT tc.*, hr.harvest_date, hr.yield, hr.quality_grade, 
             pl.plot_number, pr.crop_variety
      FROM traceability_codes tc
      LEFT JOIN harvest_records hr ON tc.harvest_record_id = hr.id
      LEFT JOIN plots pl ON tc.plot_id = pl.id
      LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (plot_id) {
      query += ' AND tc.plot_id = ?';
      params.push(plot_id);
    }
    if (harvest_record_id) {
      query += ' AND tc.harvest_record_id = ?';
      params.push(harvest_record_id);
    }
    
    query += ' ORDER BY tc.generated_at DESC';
    const codes = await allQuery(query, params);
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: '获取追溯码列表失败', details: (error as Error).message });
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const traceCode = await getQuery(`
      SELECT tc.*, hr.harvest_date, hr.yield, hr.quality_grade, hr.unit_price, hr.total_revenue, hr.notes as harvest_notes,
             pl.id as plot_id, pl.plot_number, pl.area, pl.soil_type, pl.previous_crop, pl.irrigation_method, pl.location,
             pr.crop_variety, pr.sowing_date, pr.harvest_date as planting_harvest_date, pr.notes as planting_notes
      FROM traceability_codes tc
      LEFT JOIN harvest_records hr ON tc.harvest_record_id = hr.id
      LEFT JOIN plots pl ON tc.plot_id = pl.id
      LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
      WHERE tc.code = ?
    `, [req.params.code]) as any;
    
    if (!traceCode) {
      return res.status(404).json({ error: '追溯码不存在' });
    }
    
    const soilTests = await allQuery(`
      SELECT * FROM soil_tests 
      WHERE plot_id = ? 
      AND test_date <= ?
      ORDER BY test_date DESC
      LIMIT 5
    `, [traceCode.plot_id, traceCode.harvest_date]);
    
    const farmingOperations = await allQuery(`
      SELECT fo.*, p.name as pesticide_name, p.brand as pesticide_brand, p.active_ingredient as pesticide_ingredient,
             f.name as fertilizer_name, f.brand as fertilizer_brand, f.active_ingredient as fertilizer_ingredient,
             m.name as machinery_name, m.model as machinery_model
      FROM farming_operations fo
      LEFT JOIN pesticides p ON fo.pesticide_id = p.id
      LEFT JOIN pesticides f ON fo.fertilizer_id = f.id
      LEFT JOIN machinery m ON fo.machinery_id = m.id
      WHERE fo.plot_id = ? 
      AND fo.operation_date BETWEEN ? AND ?
      ORDER BY fo.operation_date ASC
    `, [traceCode.plot_id, traceCode.sowing_date, traceCode.harvest_date]);
    
    const pestRecords = await allQuery(`
      SELECT pdr.*, pd.name as pest_name, pd.type as pest_type
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      WHERE pdr.plot_id = ? 
      AND pdr.discovery_date BETWEEN ? AND ?
      ORDER BY pdr.discovery_date ASC
    `, [traceCode.plot_id, traceCode.sowing_date, traceCode.harvest_date]);
    
    for (const record of pestRecords) {
      record.control_measures = await allQuery(`
        SELECT cm.*, p.name as pesticide_name
        FROM control_measures cm
        LEFT JOIN pesticides p ON cm.pesticide_id = p.id
        WHERE cm.pest_record_id = ?
        ORDER BY cm.measure_date ASC
      `, [record.id]);
    }
    
    const result: TraceabilityData = {
      traceability_code: {
        id: traceCode.id,
        code: traceCode.code,
        harvest_record_id: traceCode.harvest_record_id,
        plot_id: traceCode.plot_id,
        generated_at: traceCode.generated_at,
        batch_number: traceCode.batch_number,
        product_info: traceCode.product_info,
        qr_code_path: traceCode.qr_code_path
      },
      harvest_record: {
        id: traceCode.harvest_record_id,
        plot_id: traceCode.plot_id,
        planting_record_id: traceCode.planting_record_id,
        harvest_date: traceCode.harvest_date,
        yield: traceCode.yield,
        quality_grade: traceCode.quality_grade,
        unit_price: traceCode.unit_price,
        total_revenue: traceCode.total_revenue,
        notes: traceCode.harvest_notes,
        created_at: traceCode.generated_at,
        plot: {
          id: traceCode.plot_id,
          plot_number: traceCode.plot_number,
          area: traceCode.area,
          soil_type: traceCode.soil_type,
          previous_crop: traceCode.previous_crop,
          irrigation_method: traceCode.irrigation_method,
          location: traceCode.location,
          created_at: '',
          updated_at: ''
        },
        planting_record: traceCode.crop_variety ? {
          id: traceCode.planting_record_id,
          plot_id: traceCode.plot_id,
          crop_variety: traceCode.crop_variety,
          sowing_date: traceCode.sowing_date,
          harvest_date: traceCode.planting_harvest_date,
          year: new Date(traceCode.harvest_date).getFullYear(),
          notes: traceCode.planting_notes,
          created_at: ''
        } : undefined
      },
      soil_tests: soilTests,
      farming_operations: farmingOperations,
      pest_records: pestRecords
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取追溯详情失败', details: (error as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { harvest_record_id, batch_number, product_info } = req.body;
    
    if (!harvest_record_id) {
      return res.status(400).json({ error: '收获记录ID为必填项' });
    }
    
    const harvest = await getQuery('SELECT * FROM harvest_records WHERE id = ?', [harvest_record_id]) as any;
    if (!harvest) {
      return res.status(404).json({ error: '收获记录不存在' });
    }
    
    const existingCode = await getQuery('SELECT * FROM traceability_codes WHERE harvest_record_id = ?', [harvest_record_id]);
    if (existingCode) {
      return res.status(400).json({ error: '该收获记录已生成追溯码', code: (existingCode as any).code });
    }
    
    const id = uuidv4();
    const code = generateTraceCode();
    
    await runQuery(`
      INSERT INTO traceability_codes (id, code, harvest_record_id, plot_id, batch_number, product_info)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, code, harvest_record_id, harvest.plot_id, batch_number, product_info]);
    
    const traceCode = await getQuery(`
      SELECT tc.*, hr.harvest_date, hr.yield, hr.quality_grade, 
             pl.plot_number, pr.crop_variety
      FROM traceability_codes tc
      LEFT JOIN harvest_records hr ON tc.harvest_record_id = hr.id
      LEFT JOIN plots pl ON tc.plot_id = pl.id
      LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
      WHERE tc.id = ?
    `, [id]);
    
    res.status(201).json(traceCode);
  } catch (error) {
    res.status(500).json({ error: '生成追溯码失败', details: (error as Error).message });
  }
});

router.put('/:code', async (req: Request, res: Response) => {
  try {
    const existing = await getQuery('SELECT * FROM traceability_codes WHERE code = ?', [req.params.code]);
    if (!existing) {
      return res.status(404).json({ error: '追溯码不存在' });
    }
    
    const { batch_number, product_info, qr_code_path } = req.body;
    
    await runQuery(`
      UPDATE traceability_codes SET
        batch_number = COALESCE(?, batch_number),
        product_info = COALESCE(?, product_info),
        qr_code_path = COALESCE(?, qr_code_path)
      WHERE code = ?
    `, [batch_number, product_info, qr_code_path, req.params.code]);
    
    const traceCode = await getQuery(`
      SELECT tc.*, hr.harvest_date, hr.yield, hr.quality_grade, 
             pl.plot_number, pr.crop_variety
      FROM traceability_codes tc
      LEFT JOIN harvest_records hr ON tc.harvest_record_id = hr.id
      LEFT JOIN plots pl ON tc.plot_id = pl.id
      LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
      WHERE tc.code = ?
    `, [req.params.code]);
    
    res.json(traceCode);
  } catch (error) {
    res.status(500).json({ error: '更新追溯码失败', details: (error as Error).message });
  }
});

router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM traceability_codes WHERE code = ?', [req.params.code]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '追溯码不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除追溯码失败', details: (error as Error).message });
  }
});

export default router;
