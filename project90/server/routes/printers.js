const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.db.all('SELECT * FROM printers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM printers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Printer not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name, model, bed_size, nozzle_diameter, max_nozzle_temp, max_bed_temp,
          total_print_hours, purchase_date, notes } = req.body;
  
  const sql = `INSERT INTO printers 
    (name, model, bed_size, nozzle_diameter, max_nozzle_temp, max_bed_temp,
     total_print_hours, purchase_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [name, model, bed_size, nozzle_diameter || 0.4, max_nozzle_temp || 260,
                  max_bed_temp || 120, total_print_hours || 0, purchase_date, notes];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

router.put('/:id', (req, res) => {
  const { name, model, bed_size, nozzle_diameter, max_nozzle_temp, max_bed_temp,
          total_print_hours, purchase_date, notes } = req.body;
  
  const sql = `UPDATE printers SET 
    name = ?, model = ?, bed_size = ?, nozzle_diameter = ?, max_nozzle_temp = ?, 
    max_bed_temp = ?, total_print_hours = ?, purchase_date = ?, notes = ? 
    WHERE id = ?`;
  
  const params = [name, model, bed_size, nozzle_diameter, max_nozzle_temp, max_bed_temp,
                  total_print_hours, purchase_date, notes, req.params.id];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, ...req.body });
  });
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM printers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Printer deleted successfully' });
  });
});

router.get('/:id/maintenance', (req, res) => {
  req.db.all('SELECT * FROM maintenance_records WHERE printer_id = ? ORDER BY performed_at DESC', 
    [req.params.id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
});

router.post('/:id/maintenance', (req, res) => {
  const { maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes } = req.body;
  
  const sql = `INSERT INTO maintenance_records 
    (printer_id, maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  req.db.run(sql, [req.params.id, maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, printer_id: req.params.id, ...req.body });
    });
});

router.put('/maintenance/:id', (req, res) => {
  const { maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes } = req.body;
  
  const sql = `UPDATE maintenance_records SET 
    maintenance_type = ?, description = ?, parts_replaced = ?, cost = ?, 
    performed_at = ?, print_hours_at_time = ?, notes = ? WHERE id = ?`;
  
  req.db.run(sql, [maintenance_type, description, parts_replaced, cost, performed_at, print_hours_at_time, notes, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, ...req.body });
    });
});

router.delete('/maintenance/:id', (req, res) => {
  req.db.run('DELETE FROM maintenance_records WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Maintenance record deleted successfully' });
  });
});

router.get('/:id/milestones', (req, res) => {
  req.db.all('SELECT * FROM maintenance_milestones WHERE printer_id = ? ORDER BY interval_hours', 
    [req.params.id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
});

router.post('/:id/milestones', (req, res) => {
  const { milestone_name, interval_hours, last_completed_hours } = req.body;
  
  const sql = `INSERT INTO maintenance_milestones 
    (printer_id, milestone_name, interval_hours, last_completed_hours, next_due_hours)
    VALUES (?, ?, ?, ?, ?)`;
  
  const next_due = (last_completed_hours || 0) + interval_hours;
  
  req.db.run(sql, [req.params.id, milestone_name, interval_hours, last_completed_hours || 0, next_due], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, printer_id: req.params.id, ...req.body, next_due_hours: next_due });
    });
});

router.put('/milestones/:id', (req, res) => {
  const { milestone_name, interval_hours, last_completed_hours } = req.body;
  
  const next_due = (last_completed_hours || 0) + interval_hours;
  
  const sql = `UPDATE maintenance_milestones SET 
    milestone_name = ?, interval_hours = ?, last_completed_hours = ?, next_due_hours = ? 
    WHERE id = ?`;
  
  req.db.run(sql, [milestone_name, interval_hours, last_completed_hours, next_due, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, ...req.body, next_due_hours: next_due });
    });
});

router.delete('/milestones/:id', (req, res) => {
  req.db.run('DELETE FROM maintenance_milestones WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Milestone deleted successfully' });
  });
});

router.get('/:id/troubleshooting', (req, res) => {
  req.db.all('SELECT * FROM troubleshooting_logs WHERE printer_id = ? OR printer_id IS NULL ORDER BY created_at DESC', 
    [req.params.id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
});

router.post('/:id/troubleshooting', (req, res) => {
  const { title, problem_description, troubleshooting_steps, solution, status, occurred_at } = req.body;
  
  const sql = `INSERT INTO troubleshooting_logs 
    (printer_id, title, problem_description, troubleshooting_steps, solution, status, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  req.db.run(sql, [req.params.id, title, problem_description, troubleshooting_steps, solution, status || 'open', occurred_at], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, printer_id: req.params.id, ...req.body });
    });
});

router.put('/troubleshooting/:id', (req, res) => {
  const { title, problem_description, troubleshooting_steps, solution, status, occurred_at, resolved_at } = req.body;
  
  const sql = `UPDATE troubleshooting_logs SET 
    title = ?, problem_description = ?, troubleshooting_steps = ?, solution = ?, 
    status = ?, occurred_at = ?, resolved_at = ? WHERE id = ?`;
  
  req.db.run(sql, [title, problem_description, troubleshooting_steps, solution, status, occurred_at, resolved_at, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, ...req.body });
    });
});

router.delete('/troubleshooting/:id', (req, res) => {
  req.db.run('DELETE FROM troubleshooting_logs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Troubleshooting log deleted successfully' });
  });
});

module.exports = router;