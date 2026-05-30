import express from 'express';
import { store } from '../data/store';

const router = express.Router();

router.get('/', (req, res) => {
  const papers = store.getPapers();
  res.json(papers);
});

router.get('/:id', (req, res) => {
  const paper = store.getPaperById(req.params.id);
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  res.json(paper);
});

router.post('/', (req, res) => {
  const { title, journal, publicationDate, doi, authors, field, currentCitations } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const paper = store.addPaper({
    title,
    journal: journal || '',
    publicationDate: publicationDate || '',
    doi: doi || '',
    authors: authors || '',
    field: field || '',
    currentCitations: currentCitations || 0
  });
  
  res.status(201).json(paper);
});

router.put('/:id', (req, res) => {
  const paper = store.updatePaper(req.params.id, req.body);
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  res.json(paper);
});

router.delete('/:id', (req, res) => {
  const success = store.deletePaper(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  res.json({ success: true });
});

router.post('/:id/sync', (req, res) => {
  const result = store.syncCitationData(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  res.json(result);
});

router.get('/:id/citations', (req, res) => {
  const citations = store.getCitationRecordsByPaper(req.params.id);
  res.json(citations);
});

router.get('/:id/citation-history', (req, res) => {
  const history = store.getCitationHistoryByPaper(req.params.id);
  res.json(history);
});

router.get('/social-mentions/all', (req, res) => {
  const mentions = store.getAllSocialMentions();
  res.json(mentions);
});

router.get('/:id/social-mentions', (req, res) => {
  const mentions = store.getSocialMentionsByPaper(req.params.id);
  res.json(mentions);
});

router.get('/downloads/all', (req, res) => {
  const downloads = store.getAllDownloadData();
  res.json(downloads);
});

router.get('/:id/downloads', (req, res) => {
  const downloads = store.getDownloadDataByPaper(req.params.id);
  res.json(downloads);
});

router.get('/:id/altmetric', (req, res) => {
  const paper = store.getPaperById(req.params.id);
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  
  const mentions = store.getSocialMentionsByPaper(req.params.id);
  const twitter = mentions.filter(m => m.platform === 'twitter').length;
  const facebook = mentions.filter(m => m.platform === 'facebook').length;
  const blog = mentions.filter(m => m.platform === 'blog').length;
  const news = mentions.filter(m => m.platform === 'news').length;
  const totalEngagement = mentions.reduce((sum, m) => sum + m.engagement, 0);
  
  res.json({
    altmetricScore: Math.floor(totalEngagement / 10 + Math.random() * 50),
    readersCount: Math.floor(totalEngagement * 0.5),
    mentions: {
      twitter,
      facebook,
      blog,
      news
    }
  });
});

export default router;
