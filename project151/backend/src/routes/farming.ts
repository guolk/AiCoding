import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../db.js';
import { FarmingOperation, Pesticide, Machinery } from '../types.js';

const router = Router();

router.get('/pesticides', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM pesticides';
    const params: any[] = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    const pesticides = await allQuery<Pesticide>(query, params);
    res.json(pesticides);
  } catch (error) {
    res.status(500).json({ error: '获取农药化肥列表失败' });
  }
});

router.post('/pesticides', async (req: Request, res: Response) => {
  try {
    const { name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: '名称和类型为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO pesticides (id, name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes]);
    
    const pesticide = await getQuery<Pesticide>('SELECT * FROM pesticides WHERE id = ?', [id]);
    res.status(201).json(pesticide);
  } catch (error) {
    res.status(500).json({ error: '创建农药化肥记录失败' });
  }
});

router.put('/pesticides/:id', async (req: Request, res: Response) => {
  try {
    const { name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes } = req.body;
    const existing = await getQuery('SELECT * FROM pesticides WHERE id = ?', [req.params.id]);
    
    if (!existing) {
      return res.status(404).json({ error: '农药化肥记录不存在' });
    }
    
    await runQuery(`
      UPDATE pesticides SET
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        active_ingredient = COALESCE(?, active_ingredient),
        purchase_date = COALESCE(?, purchase_date),
        batch_number = COALESCE(?, batch_number),
        type = COALESCE(?, type),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [name, brand, active_ingredient, purchase_date, batch_number, type, quantity, unit, notes, req.params.id]);
    
    const pesticide = await getQuery<Pesticide>('SELECT * FROM pesticides WHERE id = ?', [req.params.id]);
    res.json(pesticide);
  } catch (error) {
    res.status(500).json({ error: '更新农药化肥记录失败' });
  }
});

router.delete('/pesticides/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM pesticides WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '农药化肥记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除农药化肥记录失败' });
  }
});

router.get('/machinery', async (req: Request, res: Response) => {
  try {
    const machinery = await allQuery<Machinery>('SELECT * FROM machinery ORDER BY created_at DESC', []);
    res.json(machinery);
  } catch (error) {
    res.status(500).json({ error: '获取农机列表失败' });
  }
});

router.post('/machinery', async (req: Request, res: Response) => {
  try {
    const { name, model, serial_number, purchase_date, status, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '机械名称为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO machinery (id, name, model, serial_number, purchase_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name, model, serial_number, purchase_date, status || 'available', notes]);
    
    const machinery = await getQuery<Machinery>('SELECT * FROM machinery WHERE id = ?', [id]);
    res.status(201).json(machinery);
  } catch (error) {
    res.status(500).json({ error: '创建农机记录失败' });
  }
});

router.put('/machinery/:id', async (req: Request, res: Response) => {
  try {
    const { name, model, serial_number, purchase_date, status, notes } = req.body;
    const existing = await getQuery('SELECT * FROM machinery WHERE id = ?', [req.params.id]);
    
    if (!existing) {
      return res.status(404).json({ error: '农机记录不存在' });
    }
    
    await runQuery(`
      UPDATE machinery SET
        name = COALESCE(?, name),
        model = COALESCE(?, model),
        serial_number = COALESCE(?, serial_number),
        purchase_date = COALESCE(?, purchase_date),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [name, model, serial_number, purchase_date, status, notes, req.params.id]);
    
    const machinery = await getQuery<Machinery>('SELECT * FROM machinery WHERE id = ?', [req.params.id]);
    res.json(machinery);
  } catch (error) {
    res.status(500).json({ error: '更新农机记录失败' });
  }
});

router.delete('/machinery/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM machinery WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '农机记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除农机记录失败' });
  }
});

router.get('/operations', async (req: Request, res: Response) => {
  try {
    const { plot_id, start_date, end_date, operation_type } = req.query;
    let query = `
      SELECT fo.*, p.name as pesticide_name, f.name as fertilizer_name, m.name as machinery_name
      FROM farming_operations fo
      LEFT JOIN pesticides p ON fo.pesticide_id = p.id
      LEFT JOIN pesticides f ON fo.fertilizer_id = f.id
      LEFT JOIN machinery m ON fo.machinery_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (plot_id) {
      query += ' AND fo.plot_id = ?';
      params.push(plot_id);
    }
    if (start_date) {
      query += ' AND fo.operation_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND fo.operation_date <= ?';
      params.push(end_date);
    }
    if (operation_type) {
      query += ' AND fo.operation_type = ?';
      params.push(operation_type);
    }
    
    query += ' ORDER BY fo.operation_date DESC, fo.created_at DESC';
    const operations = await allQuery<FarmingOperation>(query, params);
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: '获取农事操作列表失败' });
  }
});

router.get('/operations/:id', async (req: Request, res: Response) => {
  try {
    const operation = await getQuery(`
      SELECT fo.*, p.name as pesticide_name, f.name as fertilizer_name, m.name as machinery_name,
             pl.plot_number
      FROM farming_operations fo
      LEFT JOIN pesticides p ON fo.pesticide_id = p.id
      LEFT JOIN pesticides f ON fo.fertilizer_id = f.id
      LEFT JOIN machinery m ON fo.machinery_id = m.id
      LEFT JOIN plots pl ON fo.plot_id = pl.id
      WHERE fo.id = ?
    `, [req.params.id]);
    
    if (!operation) {
      return res.status(404).json({ error: '农事操作记录不存在' });
    }
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: '获取农事操作记录失败' });
  }
});

router.post('/operations', async (req: Request, res: Response) => {
  try {
    const {
      plot_id, operation_type, operation_date, operation_area,
      pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity,
      machinery_id, operation_hours, fuel_consumption, operator, cost, notes
    } = req.body;
    
    if (!plot_id || !operation_type || !operation_date) {
      return res.status(400).json({ error: '地块、操作类型和作业日期为必填项' });
    }
    
    const id = uuidv4();
    await runQuery(`
      INSERT INTO farming_operations (
        id, plot_id, operation_type, operation_date, operation_area,
        pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity,
        machinery_id, operation_hours, fuel_consumption, operator, cost, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, plot_id, operation_type, operation_date, operation_area,
      pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity,
      machinery_id, operation_hours, fuel_consumption, operator, cost, notes
    ]);
    
    const operation = await getQuery(`
      SELECT fo.*, p.name as pesticide_name, f.name as fertilizer_name, m.name as machinery_name
      FROM farming_operations fo
      LEFT JOIN pesticides p ON fo.pesticide_id = p.id
      LEFT JOIN pesticides f ON fo.fertilizer_id = f.id
      LEFT JOIN machinery m ON fo.machinery_id = m.id
      WHERE fo.id = ?
    `, [id]);
    
    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ error: '创建农事操作记录失败' });
  }
});

router.put('/operations/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getQuery('SELECT * FROM farming_operations WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: '农事操作记录不存在' });
    }
    
    const {
      plot_id, operation_type, operation_date, operation_area,
      pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity,
      machinery_id, operation_hours, fuel_consumption, operator, cost, notes
    } = req.body;
    
    await runQuery(`
      UPDATE farming_operations SET
        plot_id = COALESCE(?, plot_id),
        operation_type = COALESCE(?, operation_type),
        operation_date = COALESCE(?, operation_date),
        operation_area = COALESCE(?, operation_area),
        pesticide_id = COALESCE(?, pesticide_id),
        pesticide_quantity = COALESCE(?, pesticide_quantity),
        fertilizer_id = COALESCE(?, fertilizer_id),
        fertilizer_quantity = COALESCE(?, fertilizer_quantity),
        machinery_id = COALESCE(?, machinery_id),
        operation_hours = COALESCE(?, operation_hours),
        fuel_consumption = COALESCE(?, fuel_consumption),
        operator = COALESCE(?, operator),
        cost = COALESCE(?, cost),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [
      plot_id, operation_type, operation_date, operation_area,
      pesticide_id, pesticide_quantity, fertilizer_id, fertilizer_quantity,
      machinery_id, operation_hours, fuel_consumption, operator, cost, notes,
      req.params.id
    ]);
    
    const operation = await getQuery(`
      SELECT fo.*, p.name as pesticide_name, f.name as fertilizer_name, m.name as machinery_name
      FROM farming_operations fo
      LEFT JOIN pesticides p ON fo.pesticide_id = p.id
      LEFT JOIN pesticides f ON fo.fertilizer_id = f.id
      LEFT JOIN machinery m ON fo.machinery_id = m.id
      WHERE fo.id = ?
    `, [req.params.id]);
    
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: '更新农事操作记录失败' });
  }
});

router.delete('/operations/:id', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('DELETE FROM farming_operations WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '农事操作记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除农事操作记录失败' });
  }
});

export default router;
