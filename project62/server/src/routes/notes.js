const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { paper_id } = req.query;
  let query = 'SELECT * FROM notes';
  let params = [];

  if (paper_id) {
    query += ' WHERE paper_id = ?';
    params.push(paper_id);
  }
  query += ' ORDER BY updated_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { paper_id, annotation_id, title, content } = req.body;
  const query = `
    INSERT INTO notes (paper_id, annotation_id, title, content)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [paper_id, annotation_id, title, content], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '笔记创建成功' });
  });
});

router.put('/:id', (req, res) => {
  const { title, content } = req.body;
  const query = 'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [title, content, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '笔记更新成功' });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '笔记删除成功' });
  });
});

module.exports = router;
