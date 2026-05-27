const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { status, type } = req.query;
  let sql = 'SELECT * FROM filaments WHERE 1=1';
  let params = [];
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  req.db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM filaments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Filament not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { brand, model, type, color, color_hex, diameter, initial_weight, current_weight,
          price, purchase_date, purchase_link, adhesion_rating, strength_rating,
          warping_rating, quality_rating, review, status } = req.body;
  
  const sql = `INSERT INTO filaments 
    (brand, model, type, color, color_hex, diameter, initial_weight, current_weight,
     price, purchase_date, purchase_link, adhesion_rating, strength_rating,
     warping_rating, quality_rating, review, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [brand, model, type, color, color_hex, diameter || 1.75, initial_weight || 1000, 
                  current_weight || initial_weight || 1000, price, purchase_date, purchase_link,
                  adhesion_rating || 3, strength_rating || 3, warping_rating || 3, 
                  quality_rating || 3, review, status || 'active'];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

router.put('/:id', (req, res) => {
  const { brand, model, type, color, color_hex, diameter, initial_weight, current_weight,
          price, purchase_date, purchase_link, adhesion_rating, strength_rating,
          warping_rating, quality_rating, review, status } = req.body;
  
  const sql = `UPDATE filaments SET 
    brand = ?, model = ?, type = ?, color = ?, color_hex = ?, diameter = ?, 
    initial_weight = ?, current_weight = ?, price = ?, purchase_date = ?, 
    purchase_link = ?, adhesion_rating = ?, strength_rating = ?, warping_rating = ?, 
    quality_rating = ?, review = ?, status = ? WHERE id = ?`;
  
  const params = [brand, model, type, color, color_hex, diameter, initial_weight, current_weight,
                  price, purchase_date, purchase_link, adhesion_rating, strength_rating,
                  warping_rating, quality_rating, review, status, req.params.id];
  
  req.db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, ...req.body });
  });
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM filaments WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Filament deleted successfully' });
  });
});

router.get('/:id/usage-history', (req, res) => {
  const sql = `SELECT p.id, p.name, p.filament_used, p.print_duration, p.print_date, p.created_at
               FROM print_projects p
               WHERE p.filament_id = ?
               ORDER BY p.print_date DESC`;
  
  req.db.all(sql, [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;