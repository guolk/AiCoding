import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../db.js';
import { Plot, PlantingRecord, SoilTest } from '../types.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM plots';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE plot_number LIKE ? OR location LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    const plots = await allQuery<Plot>(query, params);
    res.json(plots);
  } catch (error) {
    res.status(500).json({ error: '获取地块列表失败' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const plot = await getQuery<Plot>('SELECT * FROM plots WHERE id = ?', [req.params.id]);
    if (!plot) {
      return res.status(404).json({ error: '地块不存在' });
    }
    
    const plantingRecords = await allQuery<PlantingRecord>(
      'SELECT * FROM planting_records WHERE plot_id = ? ORDER BY year DESC, sowing_date DESC',
      [req.params.id]
    );
    
    const soilTests = await allQuery<SoilTest>(
      'SELECT * FROM soil_tests WHERE plot_id = ? ORDER BY test_date DESC',
      [req.params.id]
    );
    
    res.json({ ...plot, planting_records: plantingRecords, soil_tests: soilTests });
  } catch (error) {
    res.status(500).json({ error: '获取地块详情失败' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { plot_number, area, soil_type, previous_crop, irrigation_method, location } = req.body;
    
    if (!plot_number || !area) {
      return res.status(400).json({ error: '地块编号和面积为必填项' });
    }
    
    const existing = await getQuery('SELECT id FROM plots WHERE plot_number = ?', [plot_number]);
    if (existing) {
      return res.status(400).json({ error: '地块编号已存在' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await runQuery(`
      INSERT INTO plots (id, plot_number, area, soil_type, previous_crop, irrigation_method, location, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, plot_number, area, soil_type, previous_crop, irrigation_method, location, now, now]);
    
    const plot = await getQuery<Plot>('SELECT * FROM plots WHERE id = ?', [id]);
    res.status(201).json(plot);
  } catch (error) {
    res.status(500).json({ error: '创建地块失败' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { plot_number, area, soil_type, previous_crop, irrigation_method, location } = req.body;
    const existing = await getQuery<Plot>('SELECT * FROM plots WHERE id = ?', [req.params.id]);
    
    if (!existing) {
      return res.status(404).json({ error: '地块不存在' });
    }
    
    if (plot_number && plot_number !== existing.plot_number) {
      const duplicate = await getQuery('SELECT id FROM plots WHERE plot_number = ? AND id != ?', [plot_number, req.params.id]);
      if (duplicate) {
        return res.status(400).json({ error: '地块编号已存在' });
      }
    }
    
    const now = new Date().toISOString();
    await runQuery(`
      UPDATE plots SET 
        plot_number = COALESCE(?, plot_number),
        area = COALESCE(?, area),
        soil_type = COALESCE(?, soil_type),
        previous_crop = COALESCE(?, previous_crop),
        irrigation_method = COALESCE(?, irrigation_method),
        location = COALESCE(?, location),
        updated_at = ?
      WHERE id = ?
    `, [plot_number, area, soil_type, previous_crop, irrigation_method, location, now, req.params.id]);
    
    const plot = await getQuery<Plot>('SELECT * FROM plots WHERE id = ?', [req.params.id]);
    res.json(plot);
  } catch (error) {
    res.status(500).json({ error: '更新地块失败' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM plots WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '地块不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除地块失败' });
  }
});

router.get('/:id/planting-records', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    let query = 'SELECT * FROM planting_records WHERE plot_id = ?';
    const params: any[] = [req.params.id];
    
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    
    query += ' ORDER BY year DESC, sowing_date DESC';
    const records = await allQuery<PlantingRecord>(query, params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '获取种植记录失败' });
  }
});

router.post('/:id/planting-records', async (req: Request, res: Response) => {
  try {
    const { crop_variety, sowing_date, harvest_date, yield: yieldVal, year, notes } = req.body;
    
    if (!crop_variety || !sowing_date || !year) {
      return res.status(400).json({ error: '作物品种、播种时间和年份为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO planting_records (id, plot_id, crop_variety, sowing_date, harvest_date, yield, year, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, req.params.id, crop_variety, sowing_date, harvest_date, yieldVal, year, notes]);
    
    const record = await getQuery<PlantingRecord>('SELECT * FROM planting_records WHERE id = ?', [id]);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: '创建种植记录失败' });
  }
});

router.put('/planting-records/:recordId', async (req: Request, res: Response) => {
  try {
    const { crop_variety, sowing_date, harvest_date, yield: yieldVal, year, notes } = req.body;
    const existing = await getQuery('SELECT * FROM planting_records WHERE id = ?', [req.params.recordId]);
    
    if (!existing) {
      return res.status(404).json({ error: '种植记录不存在' });
    }
    
    await runQuery(`
      UPDATE planting_records SET
        crop_variety = COALESCE(?, crop_variety),
        sowing_date = COALESCE(?, sowing_date),
        harvest_date = COALESCE(?, harvest_date),
        yield = COALESCE(?, yield),
        year = COALESCE(?, year),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [crop_variety, sowing_date, harvest_date, yieldVal, year, notes, req.params.recordId]);
    
    const record = await getQuery<PlantingRecord>('SELECT * FROM planting_records WHERE id = ?', [req.params.recordId]);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '更新种植记录失败' });
  }
});

router.delete('/planting-records/:recordId', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM planting_records WHERE id = ?', [req.params.recordId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '种植记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除种植记录失败' });
  }
});

router.get('/:id/soil-tests', async (req: Request, res: Response) => {
  try {
    const tests = await allQuery<SoilTest>(
      'SELECT * FROM soil_tests WHERE plot_id = ? ORDER BY test_date DESC',
      [req.params.id]
    );
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: '获取土壤检测记录失败' });
  }
});

router.post('/:id/soil-tests', async (req: Request, res: Response) => {
  try {
    const { test_date, ph, organic_matter, nitrogen, phosphorus, potassium, notes } = req.body;
    
    if (!test_date) {
      return res.status(400).json({ error: '检测日期为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO soil_tests (id, plot_id, test_date, ph, organic_matter, nitrogen, phosphorus, potassium, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, req.params.id, test_date, ph, organic_matter, nitrogen, phosphorus, potassium, notes]);
    
    const test = await getQuery<SoilTest>('SELECT * FROM soil_tests WHERE id = ?', [id]);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: '创建土壤检测记录失败' });
  }
});

router.put('/soil-tests/:testId', async (req: Request, res: Response) => {
  try {
    const { test_date, ph, organic_matter, nitrogen, phosphorus, potassium, notes } = req.body;
    const existing = await getQuery('SELECT * FROM soil_tests WHERE id = ?', [req.params.testId]);
    
    if (!existing) {
      return res.status(404).json({ error: '土壤检测记录不存在' });
    }
    
    await runQuery(`
      UPDATE soil_tests SET
        test_date = COALESCE(?, test_date),
        ph = COALESCE(?, ph),
        organic_matter = COALESCE(?, organic_matter),
        nitrogen = COALESCE(?, nitrogen),
        phosphorus = COALESCE(?, phosphorus),
        potassium = COALESCE(?, potassium),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [test_date, ph, organic_matter, nitrogen, phosphorus, potassium, notes, req.params.testId]);
    
    const test = await getQuery<SoilTest>('SELECT * FROM soil_tests WHERE id = ?', [req.params.testId]);
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: '更新土壤检测记录失败' });
  }
});

router.delete('/soil-tests/:testId', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM soil_tests WHERE id = ?', [req.params.testId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '土壤检测记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除土壤检测记录失败' });
  }
});

export default router;
