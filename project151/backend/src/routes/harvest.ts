import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../db.js';
import { HarvestRecord, YieldAnalysis, VarietyYieldCompare } from '../types.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { plot_id, start_date, end_date, quality_grade } = req.query;
    let query = `
    SELECT hr.*, pl.plot_number, pr.crop_variety
    FROM harvest_records hr
    LEFT JOIN plots pl ON hr.plot_id = pl.id
    LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
    WHERE 1=1
  `;
    const params: any[] = [];
  
    if (plot_id) {
      query += ' AND hr.plot_id = ?';
      params.push(plot_id);
    }
    if (start_date) {
      query += ' AND hr.harvest_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND hr.harvest_date <= ?';
      params.push(end_date);
    }
    if (quality_grade) {
      query += ' AND hr.quality_grade = ?';
      params.push(quality_grade);
    }
  
    query += ' ORDER BY hr.harvest_date DESC, hr.created_at DESC';
    const records = await allQuery(query, params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '查询收获记录失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await getQuery(`
    SELECT hr.*, pl.plot_number, pl.area, pl.location, pr.crop_variety, pr.sowing_date
    FROM harvest_records hr
    LEFT JOIN plots pl ON hr.plot_id = pl.id
    LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
    WHERE hr.id = ?
  `, [req.params.id]);
  
    if (!record) {
      return res.status(404).json({ error: '收获记录不存在' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '查询收获记录失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { plot_id, planting_record_id, harvest_date, yield: yieldVal, quality_grade, unit_price, total_revenue, notes } = req.body;
  
    if (!plot_id || !harvest_date || yieldVal === undefined || yieldVal === null) {
      return res.status(400).json({ error: '地块、收获日期和产量为必填项' });
    }
  
    const id = uuidv4();
    const calculatedRevenue = total_revenue !== undefined ? total_revenue : 
      (unit_price !== undefined && yieldVal !== undefined ? yieldVal * unit_price : null);
  
    await runQuery(`
    INSERT INTO harvest_records (id, plot_id, planting_record_id, harvest_date, yield, quality_grade, unit_price, total_revenue, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, plot_id, planting_record_id, harvest_date, yieldVal, quality_grade, unit_price, calculatedRevenue, notes]);
  
    const record = await getQuery(`
    SELECT hr.*, pl.plot_number, pr.crop_variety
    FROM harvest_records hr
    LEFT JOIN plots pl ON hr.plot_id = pl.id
    LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
    WHERE hr.id = ?
  `, [id]);
  
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: '创建收获记录失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getQuery('SELECT * FROM harvest_records WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: '收获记录不存在' });
    }
  
    const { plot_id, planting_record_id, harvest_date, yield: yieldVal, quality_grade, unit_price, total_revenue, notes } = req.body;
  
    let calculatedRevenue = total_revenue;
    if (calculatedRevenue === undefined) {
      const currentYield = yieldVal !== undefined ? yieldVal : existing.yield;
      const currentPrice = unit_price !== undefined ? unit_price : existing.unit_price;
      if (currentPrice !== undefined && currentYield !== undefined) {
        calculatedRevenue = currentYield * currentPrice;
      }
    }
  
    await runQuery(`
    UPDATE harvest_records SET
      plot_id = COALESCE(?, plot_id),
      planting_record_id = COALESCE(?, planting_record_id),
      harvest_date = COALESCE(?, harvest_date),
      yield = COALESCE(?, yield),
      quality_grade = COALESCE(?, quality_grade),
      unit_price = COALESCE(?, unit_price),
      total_revenue = COALESCE(?, total_revenue),
      notes = COALESCE(?, notes)
    WHERE id = ?
  `, [plot_id, planting_record_id, harvest_date, yieldVal, quality_grade, unit_price, calculatedRevenue, notes, req.params.id]);
  
    const record = await getQuery(`
    SELECT hr.*, pl.plot_number, pr.crop_variety
    FROM harvest_records hr
    LEFT JOIN plots pl ON hr.plot_id = pl.id
    LEFT JOIN planting_records pr ON hr.planting_record_id = pr.id
    WHERE hr.id = ?
  `, [req.params.id]);
  
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '更新收获记录失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM harvest_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '收获记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除收获记录失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/analysis/yield-input', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const params: any[] = [];
  
    let harvestWhere = '';
    let operationsWhere = '';
  
    if (year) {
      harvestWhere = 'AND strftime("%Y", hr.harvest_date) = ?';
      operationsWhere = 'AND strftime("%Y", fo.operation_date) = ?';
      params.push(String(year), String(year));
    }
  
    const analysis = await allQuery(`
    SELECT 
      pl.id as plot_id,
      pl.plot_number,
      pl.area,
      COALESCE(SUM(fo.cost), 0) as total_input_cost,
      COALESCE(SUM(hr.yield), 0) as total_yield,
      COALESCE(SUM(hr.total_revenue), 0) as total_revenue
    FROM plots pl
    LEFT JOIN harvest_records hr ON pl.id = hr.plot_id ${harvestWhere}
    LEFT JOIN farming_operations fo ON pl.id = fo.plot_id ${operationsWhere}
    GROUP BY pl.id, pl.plot_number, pl.area
    HAVING total_yield > 0 OR total_input_cost > 0
    ORDER BY pl.plot_number
  `, params) as any[];
  
    const result: YieldAnalysis[] = analysis.map(item => {
      const area = item.area || 1;
      return {
        plot_id: item.plot_id,
        plot_number: item.plot_number,
        total_input_cost: item.total_input_cost,
        total_yield: item.total_yield,
        area: item.area,
        cost_per_mu: Number((item.total_input_cost / area).toFixed(2)),
        yield_per_mu: Number((item.total_yield / area).toFixed(2)),
        revenue_per_mu: Number((item.total_revenue / area).toFixed(2)),
        profit_per_mu: Number(((item.total_revenue - item.total_input_cost) / area).toFixed(2))
      };
    });
  
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '产量投入分析失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/analysis/variety-compare', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    let query = `
    SELECT 
      pr.crop_variety,
      COUNT(DISTINCT hr.id) as count,
      AVG(hr.yield) as average_yield,
      SUM(hr.yield) as total_yield,
      AVG(pl.area) as average_area
    FROM harvest_records hr
    JOIN planting_records pr ON hr.planting_record_id = pr.id
    JOIN plots pl ON hr.plot_id = pl.id
    WHERE 1=1
  `;
    const params: any[] = [];
  
    if (year) {
      query += ' AND strftime("%Y", hr.harvest_date) = ?';
      params.push(String(year));
    }
  
    query += ' GROUP BY pr.crop_variety HAVING count > 0 ORDER BY average_yield DESC';
  
    const data = await allQuery(query, params) as any[];
  
    const result: VarietyYieldCompare[] = data.map(item => ({
      crop_variety: item.crop_variety,
      average_yield: Number(item.average_yield.toFixed(2)),
      total_yield: Number(item.total_yield.toFixed(2)),
      count: item.count,
      average_area: Number(item.average_area.toFixed(2)),
      yield_per_mu: Number((item.total_yield / (item.average_area * item.count)).toFixed(2))
    }));
  
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '品种对比分析失败', detail: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
