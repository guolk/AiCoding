const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { paper_id, color, search } = req.query;
  let query = `
    SELECT a.*, p.title as paper_title 
    FROM annotations a 
    LEFT JOIN papers p ON a.paper_id = p.id
    WHERE 1=1
  `;
  let params = [];

  if (paper_id) {
    query += ' AND a.paper_id = ?';
    params.push(paper_id);
  }
  if (color) {
    query += ' AND a.color = ?';
    params.push(color);
  }
  if (search) {
    query += ' AND (a.content LIKE ? OR a.selected_text LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY a.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { paper_id, type, content, page, color, x, y, width, height, selected_text, context_before, context_after } = req.body;
  const query = `
    INSERT INTO annotations (paper_id, type, content, page, color, x, y, width, height, selected_text, context_before, context_after)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [paper_id, type, content, page, color, x, y, width, height, selected_text, context_before, context_after], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '批注创建成功' });
  });
});

router.put('/:id', (req, res) => {
  const { content, color } = req.body;
  const query = 'UPDATE annotations SET content = ?, color = ? WHERE id = ?';
  db.run(query, [content, color, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '批注更新成功' });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM annotations WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '批注删除成功' });
  });
});

router.get('/export/:paper_id', (req, res) => {
  const { paper_id } = req.params;
  const query = `
    SELECT a.*, p.title as paper_title, p.authors, p.year
    FROM annotations a
    LEFT JOIN papers p ON a.paper_id = p.id
    WHERE a.paper_id = ?
    ORDER BY a.page, a.y
  `;
  db.all(query, [paper_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
