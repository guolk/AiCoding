const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { filament_type, model_type } = req.query;
  let sql = 'SELECT * FROM slice_profiles WHERE 1=1';
  let params = [];
  
  if (filament_type) {
    sql += ' AND filament_type = ?';
    params.push(filament_type);
  }
  if (model_type) {
    sql += ' AND model_type = ?';
    params.push(model_type);
  }
  
  sql += ' ORDER BY is_default DESC, created_at DESC';
  
  req.db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM slice_profiles WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name, filament_type, model_type, description, layer_height, nozzle_temp,
          bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness,
          wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density,
          retraction_enable, retraction_distance, retraction_speed, retraction_retract_speed,
          support_enable, support_type, support_density, cooling_enable, fan_speed,
          brim_enable, brim_width, is_default } = req.body;
  
  const sql = `INSERT INTO slice_profiles 
    (name, filament_type, model_type, description, layer_height, nozzle_temp,
     bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness,
     wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density,
     retraction_enable, retraction_distance, retraction_speed, retraction_retract_speed,
     support_enable, support_type, support_density, cooling_enable, fan_speed,
     brim_enable, brim_width, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [name, filament_type, model_type, description, layer_height, nozzle_temp,
                  bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness,
                  wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density,
                  retraction_enable ? 1 : 0, retraction_distance, retraction_speed, retraction_retract_speed,
                  support_enable ? 1 : 0, support_type, support_density, cooling_enable ? 1 : 0, fan_speed,
                  brim_enable ? 1 : 0, brim_width, is_default ? 1 : 0];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

router.put('/:id', (req, res) => {
  const { name, filament_type, model_type, description, layer_height, nozzle_temp,
          bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness,
          wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density,
          retraction_enable, retraction_distance, retraction_speed, retraction_retract_speed,
          support_enable, support_type, support_density, cooling_enable, fan_speed,
          brim_enable, brim_width, is_default } = req.body;
  
  const sql = `UPDATE slice_profiles SET 
    name = ?, filament_type = ?, model_type = ?, description = ?, layer_height = ?, 
    nozzle_temp = ?, bed_temp = ?, print_speed = ?, wall_speed = ?, infill_speed = ?, 
    travel_speed = ?, wall_thickness = ?, wall_line_count = ?, top_layers = ?, 
    bottom_layers = ?, infill_pattern = ?, infill_density = ?, retraction_enable = ?, 
    retraction_distance = ?, retraction_speed = ?, retraction_retract_speed = ?, 
    support_enable = ?, support_type = ?, support_density = ?, cooling_enable = ?, 
    fan_speed = ?, brim_enable = ?, brim_width = ?, is_default = ? WHERE id = ?`;
  
  const params = [name, filament_type, model_type, description, layer_height, nozzle_temp,
                  bed_temp, print_speed, wall_speed, infill_speed, travel_speed, wall_thickness,
                  wall_line_count, top_layers, bottom_layers, infill_pattern, infill_density,
                  retraction_enable ? 1 : 0, retraction_distance, retraction_speed, retraction_retract_speed,
                  support_enable ? 1 : 0, support_type, support_density, cooling_enable ? 1 : 0, fan_speed,
                  brim_enable ? 1 : 0, brim_width, is_default ? 1 : 0, req.params.id];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, ...req.body });
  });
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM slice_profiles WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Profile deleted successfully' });
  });
});

module.exports = router;