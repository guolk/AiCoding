import express from 'express';
import { store } from '../data/store';

const router = express.Router();

router.get('/', (req, res) => {
  const { paperId } = req.query;
  if (paperId) {
    const citations = store.getCitationRecordsByPaper(paperId as string);
    return res.json(citations);
  }
  const citations = store.getAllCitationRecords();
  res.json(citations);
});

router.put('/:id/category', (req, res) => {
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  const updated = store.updateCitationCategory(req.params.id, category);
  if (!updated) {
    return res.status(404).json({ error: 'Citation record not found' });
  }
  res.json(updated);
});

router.get('/hotspots', (req, res) => {
  const citations = store.getAllCitationRecords();
  const papers = store.getPapers();
  
  const paperCitationCounts: { [key: string]: number } = {};
  citations.forEach(c => {
    paperCitationCounts[c.paperId] = (paperCitationCounts[c.paperId] || 0) + 1;
  });
  
  const mostCited = Object.entries(paperCitationCounts)
    .map(([paperId, count]) => {
      const paper = papers.find(p => p.id === paperId);
      return {
        paperId,
        title: paper?.title || 'Unknown',
        citations: paper?.currentCitations || 0,
        recentCitations: count
      };
    })
    .sort((a, b) => b.recentCitations - a.recentCitations);
  
  const allHistory = store.getAllCitationHistory();
  const monthlyData: { [key: string]: number } = {};
  
  allHistory.forEach(h => {
    const key = `${h.year}-${String(h.month).padStart(2, '0')}`;
    monthlyData[key] = (monthlyData[key] || 0) + h.citations;
  });
  
  const hotspotPeriods = Object.entries(monthlyData)
    .map(([period, citations]) => ({ period, citations }))
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 6);
  
  res.json({
    mostCitedPapers: mostCited,
    hotspotPeriods
  });
});

router.get('/overview', (req, res) => {
  const citations = store.getAllCitationRecords();
  const papers = store.getPapers();
  
  const categories: { [key: string]: number } = {
    positive: 0,
    critical: 0,
    method: 0,
    background: 0,
    other: 0
  };
  
  citations.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  
  const papersWithCitations = papers.map(p => {
    const paperCitations = citations.filter(c => c.paperId === p.id);
    return {
      ...p,
      citationCount: paperCitations.length,
      categories: paperCategories(paperCitations)
    };
  });
  
  function paperCategories(paperCitations: typeof citations) {
    const cats: { [key: string]: number } = {
      positive: 0, critical: 0, method: 0, background: 0, other: 0
    };
    paperCitations.forEach(c => cats[c.category]++);
    return cats;
  }
  
  res.json({
    totalCitations: citations.length,
    byCategory: categories,
    papers: papersWithCitations
  });
});

export default router;
