import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../db.js';
import { PestDisease, PestDiseaseRecord, ControlMeasure, PestSeasonPattern } from '../types.js';

const router = Router();

router.get('/catalog', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM pest_diseases';
    const params: any[] = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    const pests = await allQuery<PestDisease>(query, params);
    res.json(pests);
  } catch (error) {
    res.status(500).json({ error: '获取病虫害目录失败', details: (error as Error).message });
  }
});

router.post('/catalog', async (req: Request, res: Response) => {
  try {
    const { name, type, symptoms, common_season, prevention_methods } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: '名称和类型为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO pest_diseases (id, name, type, symptoms, common_season, prevention_methods)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, name, type, symptoms, common_season, prevention_methods]);
    
    const pest = await getQuery<PestDisease>('SELECT * FROM pest_diseases WHERE id = ?', [id]);
    res.status(201).json(pest);
  } catch (error) {
    res.status(500).json({ error: '创建病虫害记录失败', details: (error as Error).message });
  }
});

router.put('/catalog/:id', async (req: Request, res: Response) => {
  try {
    const { name, type, symptoms, common_season, prevention_methods } = req.body;
    const existing = await getQuery('SELECT * FROM pest_diseases WHERE id = ?', [req.params.id]);
    
    if (!existing) {
      return res.status(404).json({ error: '病虫害记录不存在' });
    }
    
    await runQuery(`
      UPDATE pest_diseases SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        symptoms = COALESCE(?, symptoms),
        common_season = COALESCE(?, common_season),
        prevention_methods = COALESCE(?, prevention_methods)
      WHERE id = ?
    `, [name, type, symptoms, common_season, prevention_methods, req.params.id]);
    
    const pest = await getQuery<PestDisease>('SELECT * FROM pest_diseases WHERE id = ?', [req.params.id]);
    res.json(pest);
  } catch (error) {
    res.status(500).json({ error: '更新病虫害记录失败', details: (error as Error).message });
  }
});

router.delete('/catalog/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM pest_diseases WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '病虫害记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除病虫害记录失败', details: (error as Error).message });
  }
});

router.get('/records', async (req: Request, res: Response) => {
  try {
    const { plot_id, status, start_date, end_date } = req.query;
    let query = `
      SELECT pdr.*, pd.name as pest_name, pd.type as pest_type, pl.plot_number
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      LEFT JOIN plots pl ON pdr.plot_id = pl.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (plot_id) {
      query += ' AND pdr.plot_id = ?';
      params.push(plot_id);
    }
    if (status) {
      query += ' AND pdr.status = ?';
      params.push(status);
    }
    if (start_date) {
      query += ' AND pdr.discovery_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND pdr.discovery_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY pdr.discovery_date DESC, pdr.created_at DESC';
    const records = await allQuery(query, params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '获取病虫害发现记录失败', details: (error as Error).message });
  }
});

router.get('/records/:id', async (req: Request, res: Response) => {
  try {
    const record = await getQuery(`
      SELECT pdr.*, pd.name as pest_name, pd.type as pest_type, pd.symptoms as pest_symptoms,
             pd.common_season, pd.prevention_methods, pl.plot_number, pl.location
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      LEFT JOIN plots pl ON pdr.plot_id = pl.id
      WHERE pdr.id = ?
    `, [req.params.id]);
    
    if (!record) {
      return res.status(404).json({ error: '病虫害发现记录不存在' });
    }
    
    const controlMeasures = await allQuery<ControlMeasure>(`
      SELECT cm.*, p.name as pesticide_name
      FROM control_measures cm
      LEFT JOIN pesticides p ON cm.pesticide_id = p.id
      WHERE cm.pest_record_id = ?
      ORDER BY cm.measure_date DESC
    `, [req.params.id]);
    
    res.json({ ...record, control_measures: controlMeasures });
  } catch (error) {
    res.status(500).json({ error: '获取病虫害发现记录详情失败', details: (error as Error).message });
  }
});

router.post('/records', async (req: Request, res: Response) => {
  try {
    const { plot_id, pest_disease_id, discovery_date, symptoms, severity, photos, status, notes } = req.body;
    
    if (!plot_id || !discovery_date || !symptoms) {
      return res.status(400).json({ error: '地块、发现时间和症状描述为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO pest_disease_records (id, plot_id, pest_disease_id, discovery_date, symptoms, severity, photos, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, plot_id, pest_disease_id, discovery_date, symptoms, severity, photos, status || 'reported', notes]);
    
    const record = await getQuery(`
      SELECT pdr.*, pd.name as pest_name, pd.type as pest_type, pl.plot_number
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      LEFT JOIN plots pl ON pdr.plot_id = pl.id
      WHERE pdr.id = ?
    `, [id]);
    
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: '创建病虫害发现记录失败', details: (error as Error).message });
  }
});

router.put('/records/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getQuery('SELECT * FROM pest_disease_records WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: '病虫害发现记录不存在' });
    }
    
    const { plot_id, pest_disease_id, discovery_date, symptoms, severity, photos, status, notes } = req.body;
    
    await runQuery(`
      UPDATE pest_disease_records SET
        plot_id = COALESCE(?, plot_id),
        pest_disease_id = COALESCE(?, pest_disease_id),
        discovery_date = COALESCE(?, discovery_date),
        symptoms = COALESCE(?, symptoms),
        severity = COALESCE(?, severity),
        photos = COALESCE(?, photos),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [plot_id, pest_disease_id, discovery_date, symptoms, severity, photos, status, notes, req.params.id]);
    
    const record = await getQuery(`
      SELECT pdr.*, pd.name as pest_name, pd.type as pest_type, pl.plot_number
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      LEFT JOIN plots pl ON pdr.plot_id = pl.id
      WHERE pdr.id = ?
    `, [req.params.id]);
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '更新病虫害发现记录失败', details: (error as Error).message });
  }
});

router.delete('/records/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM pest_disease_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '病虫害发现记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除病虫害发现记录失败', details: (error as Error).message });
  }
});

router.post('/records/:recordId/control-measures', async (req: Request, res: Response) => {
  try {
    const recordExists = await getQuery('SELECT * FROM pest_disease_records WHERE id = ?', [req.params.recordId]);
    if (!recordExists) {
      return res.status(404).json({ error: '病虫害发现记录不存在' });
    }
    
    const { measure_type, measure_date, pesticide_id, pesticide_quantity, description, operator, effectiveness, follow_up_date } = req.body;
    
    if (!measure_type || !measure_date) {
      return res.status(400).json({ error: '措施类型和实施日期为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO control_measures (id, pest_record_id, measure_type, measure_date, pesticide_id, pesticide_quantity, description, operator, effectiveness, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, req.params.recordId, measure_type, measure_date, pesticide_id, pesticide_quantity, description, operator, effectiveness, follow_up_date]);
    
    const measure = await getQuery(`
      SELECT cm.*, p.name as pesticide_name
      FROM control_measures cm
      LEFT JOIN pesticides p ON cm.pesticide_id = p.id
      WHERE cm.id = ?
    `, [id]);
    
    res.status(201).json(measure);
  } catch (error) {
    res.status(500).json({ error: '创建防治措施记录失败', details: (error as Error).message });
  }
});

router.put('/control-measures/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getQuery('SELECT * FROM control_measures WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: '防治措施记录不存在' });
    }
    
    const { measure_type, measure_date, pesticide_id, pesticide_quantity, description, operator, effectiveness, follow_up_date } = req.body;
    
    await runQuery(`
      UPDATE control_measures SET
        measure_type = COALESCE(?, measure_type),
        measure_date = COALESCE(?, measure_date),
        pesticide_id = COALESCE(?, pesticide_id),
        pesticide_quantity = COALESCE(?, pesticide_quantity),
        description = COALESCE(?, description),
        operator = COALESCE(?, operator),
        effectiveness = COALESCE(?, effectiveness),
        follow_up_date = COALESCE(?, follow_up_date)
      WHERE id = ?
    `, [measure_type, measure_date, pesticide_id, pesticide_quantity, description, operator, effectiveness, follow_up_date, req.params.id]);
    
    const measure = await getQuery(`
      SELECT cm.*, p.name as pesticide_name
      FROM control_measures cm
      LEFT JOIN pesticides p ON cm.pesticide_id = p.id
      WHERE cm.id = ?
    `, [req.params.id]);
    
    res.json(measure);
  } catch (error) {
    res.status(500).json({ error: '更新防治措施记录失败', details: (error as Error).message });
  }
});

router.delete('/control-measures/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM control_measures WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '防治措施记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除防治措施记录失败', details: (error as Error).message });
  }
});

router.get('/season-patterns', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        CAST(strftime('%m', pdr.discovery_date) AS INTEGER) as month,
        COALESCE(pd.name, '未分类') as pest_name,
        COUNT(*) as count
      FROM pest_disease_records pdr
      LEFT JOIN pest_diseases pd ON pdr.pest_disease_id = pd.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (year) {
      query += ' AND strftime("%Y", pdr.discovery_date) = ?';
      params.push(String(year));
    }
    
    query += ' GROUP BY month, pest_name ORDER BY month, count DESC';
    const patterns = await allQuery<PestSeasonPattern>(query, params);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: '获取季节模式数据失败', details: (error as Error).message });
  }
});

export default router;
