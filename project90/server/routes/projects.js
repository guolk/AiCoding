const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = `SELECT p.*, pr.name as printer_name, f.brand as filament_brand, f.model as filament_model, f.color as filament_color
             FROM print_projects p
             LEFT JOIN printers pr ON p.printer_id = pr.id
             LEFT JOIN filaments f ON p.filament_id = f.id`;
  let params = [];
  
  if (status) {
    sql += ' WHERE p.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY p.created_at DESC';
  
  req.db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = `SELECT p.*, pr.name as printer_name, f.brand as filament_brand, f.model as filament_model, f.color as filament_color, f.price as filament_price
               FROM print_projects p
               LEFT JOIN printers pr ON p.printer_id = pr.id
               LEFT JOIN filaments f ON p.filament_id = f.id
               WHERE p.id = ?`;
  
  req.db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name, stl_source, printer_id, filament_id, filament_used, print_duration,
          layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed,
          retraction_distance, support_enabled, status, success_rate,
          satisfaction_rating, photo_paths, notes, print_date } = req.body;
  
  const sql = `INSERT INTO print_projects 
    (name, stl_source, printer_id, filament_id, filament_used, print_duration,
     layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed,
     retraction_distance, support_enabled, status, success_rate,
     satisfaction_rating, photo_paths, notes, print_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [name, stl_source, printer_id, filament_id, filament_used, print_duration,
                  layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed,
                  retraction_distance, support_enabled ? 1 : 0, status, success_rate,
                  satisfaction_rating, photo_paths, notes, print_date];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (filament_id && filament_used) {
      req.db.run('UPDATE filaments SET current_weight = current_weight - ? WHERE id = ?', 
        [filament_used, filament_id]);
    }
    
    res.json({ id: this.lastID, ...req.body });
  });
});

router.put('/:id', (req, res) => {
  const { name, stl_source, printer_id, filament_id, filament_used, print_duration,
          layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed,
          retraction_distance, support_enabled, status, success_rate,
          satisfaction_rating, photo_paths, notes, print_date } = req.body;
  
  const sql = `UPDATE print_projects SET 
    name = ?, stl_source = ?, printer_id = ?, filament_id = ?, filament_used = ?, 
    print_duration = ?, layer_height = ?, infill_percentage = ?, nozzle_temp = ?, 
    bed_temp = ?, print_speed = ?, retraction_distance = ?, support_enabled = ?, 
    status = ?, success_rate = ?, satisfaction_rating = ?, photo_paths = ?, 
    notes = ?, print_date = ? WHERE id = ?`;
  
  const params = [name, stl_source, printer_id, filament_id, filament_used, print_duration,
                  layer_height, infill_percentage, nozzle_temp, bed_temp, print_speed,
                  retraction_distance, support_enabled ? 1 : 0, status, success_rate,
                  satisfaction_rating, photo_paths, notes, print_date, req.params.id];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, ...req.body });
  });
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM print_projects WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

router.get('/:id/failures', (req, res) => {
  req.db.all('SELECT * FROM failure_records WHERE project_id = ? ORDER BY created_at DESC', 
    [req.params.id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
});

router.post('/:id/failures', (req, res) => {
  const { failure_type, description, root_cause, solution, resolved } = req.body;
  
  const sql = `INSERT INTO failure_records (project_id, failure_type, description, root_cause, solution, resolved)
    VALUES (?, ?, ?, ?, ?, ?)`;
  
  req.db.run(sql, [req.params.id, failure_type, description, root_cause, solution, resolved ? 1 : 0], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, project_id: req.params.id, ...req.body });
    });
});

router.put('/failures/:id', (req, res) => {
  const { failure_type, description, root_cause, solution, resolved } = req.body;
  
  const sql = `UPDATE failure_records SET 
    failure_type = ?, description = ?, root_cause = ?, solution = ?, resolved = ? 
    WHERE id = ?`;
  
  req.db.run(sql, [failure_type, description, root_cause, solution, resolved ? 1 : 0, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, ...req.body });
    });
});

router.delete('/failures/:id', (req, res) => {
  req.db.run('DELETE FROM failure_records WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Failure record deleted successfully' });
  });
});

module.exports = router;