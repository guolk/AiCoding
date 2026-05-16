const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { paper_id } = req.query;
  let query = `
    SELECT pr.*, 
           p1.title as paper1_title, 
           p2.title as paper2_title
    FROM paper_relations pr
    LEFT JOIN papers p1 ON pr.paper_id1 = p1.id
    LEFT JOIN papers p2 ON pr.paper_id2 = p2.id
  `;
  let params = [];

  if (paper_id) {
    query += ' WHERE paper_id1 = ? OR paper_id2 = ?';
    params.push(paper_id, paper_id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { paper_id1, paper_id2, relation_type, description } = req.body;
  const query = `
    INSERT INTO paper_relations (paper_id1, paper_id2, relation_type, description)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [paper_id1, paper_id2, relation_type, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '关联创建成功' });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM paper_relations WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '关联删除成功' });
  });
});

module.exports = router;
