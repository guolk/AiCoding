const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:paper_id', (req, res) => {
  db.get('SELECT * FROM key_insights WHERE paper_id = ?', [req.params.paper_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

router.post('/', (req, res) => {
  const { paper_id, research_question, methods, conclusions, limitations } = req.body;
  const query = `
    INSERT INTO key_insights (paper_id, research_question, methods, conclusions, limitations)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [paper_id, research_question, methods, conclusions, limitations], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '关键发现创建成功' });
  });
});

router.put('/:paper_id', (req, res) => {
  const { research_question, methods, conclusions, limitations } = req.body;
  const query = `
    UPDATE key_insights 
    SET research_question = ?, methods = ?, conclusions = ?, limitations = ?, updated_at = CURRENT_TIMESTAMP
    WHERE paper_id = ?
  `;
  db.run(query, [research_question, methods, conclusions, limitations, req.params.paper_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      const insertQuery = `
        INSERT INTO key_insights (paper_id, research_question, methods, conclusions, limitations)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(insertQuery, [req.params.paper_id, research_question, methods, conclusions, limitations], function(insertErr) {
        if (insertErr) {
          res.status(500).json({ error: insertErr.message });
          return;
        }
        res.json({ id: this.lastID, message: '关键发现创建成功' });
      });
      return;
    }
    res.json({ message: '关键发现更新成功' });
  });
});

module.exports = router;
