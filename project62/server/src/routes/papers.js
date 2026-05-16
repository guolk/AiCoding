const express = require('express');
const router = express.Router();
const db = require('../db');
const { fetchByDOI, fetchByArXivId } = require('../services/metadataService');

router.get('/', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM papers';
  let params = [];

  if (status || search) {
    query += ' WHERE 1=1';
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (title LIKE ? OR authors LIKE ? OR abstract LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
  }

  query += ' ORDER BY last_read_at DESC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM papers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '文献不存在' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { title, authors, abstract, year, doi, arxiv_id, journal, status, rating, notes, file_path } = req.body;
  const query = `
    INSERT INTO papers (title, authors, abstract, year, doi, arxiv_id, journal, status, rating, notes, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const yearValue = year === '' ? null : (year ? parseInt(year) : null);
  const doiValue = doi === '' ? null : doi;
  const arxivIdValue = arxiv_id === '' ? null : arxiv_id;
  db.run(query, [title, authors, abstract, yearValue, doiValue, arxivIdValue, journal, status || 'unread', rating || 0, notes || '', file_path || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '文献创建成功' });
  });
});

router.put('/:id', (req, res) => {
  const { title, authors, abstract, year, doi, arxiv_id, journal, status, rating, notes, reading_progress, last_read_page } = req.body;
  const query = `
    UPDATE papers 
    SET title = ?, authors = ?, abstract = ?, year = ?, doi = ?, arxiv_id = ?, journal = ?, 
        status = ?, rating = ?, notes = ?, reading_progress = ?, last_read_page = ?, last_read_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const yearValue = year === '' ? null : (year ? parseInt(year) : null);
  const doiValue = doi === '' ? null : doi;
  const arxivIdValue = arxiv_id === '' ? null : arxiv_id;
  db.run(query, [title, authors, abstract, yearValue, doiValue, arxivIdValue, journal, status, rating, notes, reading_progress, last_read_page, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '文献更新成功' });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM papers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '文献删除成功' });
  });
});

router.post('/fetch-metadata', async (req, res) => {
  try {
    const { doi, arxiv_id } = req.body;
    let metadata;

    if (doi) {
      metadata = await fetchByDOI(doi);
    } else if (arxiv_id) {
      metadata = await fetchByArXivId(arxiv_id);
    } else {
      res.status(400).json({ error: '请提供DOI或ArXiv ID' });
      return;
    }

    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/progress', (req, res) => {
  const { reading_progress, last_read_page } = req.body;
  const query = `
    UPDATE papers 
    SET reading_progress = ?, last_read_page = ?, last_read_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [reading_progress, last_read_page, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '阅读进度已更新' });
  });
});

module.exports = router;
