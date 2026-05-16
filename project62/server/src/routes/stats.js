const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/monthly-reading', (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', date(last_read_at)) as month,
      COUNT(DISTINCT id) as papers_read,
      COUNT(*) as total_sessions
    FROM papers
    WHERE last_read_at IS NOT NULL
    GROUP BY strftime('%Y-%m', date(last_read_at))
    ORDER BY month DESC
    LIMIT 12
  `;
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.reverse());
  });
});

router.get('/status-distribution', (req, res) => {
  const query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM papers
    GROUP BY status
  `;
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/year-distribution', (req, res) => {
  const query = `
    SELECT 
      year,
      COUNT(*) as count
    FROM papers
    WHERE year IS NOT NULL
    GROUP BY year
    ORDER BY year DESC
    LIMIT 20
  `;
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.reverse());
  });
});

router.get('/summary', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_papers FROM papers',
    'SELECT COUNT(*) as total_annotations FROM annotations',
    'SELECT COUNT(*) as total_notes FROM notes',
    'SELECT COUNT(*) as unread_papers FROM papers WHERE status = "unread"',
    'SELECT COUNT(*) as reading_papers FROM papers WHERE status = "reading"',
    'SELECT COUNT(*) as completed_papers FROM papers WHERE status IN ("completed", "mastered")'
  ];

  Promise.all(queries.map(q => {
    return new Promise((resolve, reject) => {
      db.get(q, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  })).then(results => {
    res.json({
      total_papers: results[0].total_papers,
      total_annotations: results[1].total_annotations,
      total_notes: results[2].total_notes,
      unread_papers: results[3].unread_papers,
      reading_papers: results[4].reading_papers,
      completed_papers: results[5].completed_papers
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

module.exports = router;
