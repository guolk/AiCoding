import express from 'express';
import { store } from '../data/store';

const router = express.Router();

function calculateHIndex(papers: { currentCitations: number }[]): number {
  const citations = papers.map(p => p.currentCitations).sort((a, b) => b - a);
  let hIndex = 0;
  for (let i = 0; i < citations.length; i++) {
    if (citations[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }
  return hIndex;
}

router.get('/metrics', (req, res) => {
  const papers = store.getPapers();
  const totalCitations = papers.reduce((sum, p) => sum + p.currentCitations, 0);
  const hIndex = calculateHIndex(papers);
  const averageCitationsPerPaper = papers.length > 0 ? totalCitations / papers.length : 0;
  
  const mostCitedPaper = papers.reduce((max, p) => 
    !max || p.currentCitations > max.currentCitations ? p : max, 
    null as typeof papers[0] | null
  );
  
  const percentileRanking = Math.min(95, 50 + hIndex * 8);
  
  res.json({
    hIndex,
    totalCitations,
    averageCitationsPerPaper: Math.round(averageCitationsPerPaper * 100) / 100,
    mostCitedPaper,
    percentileRanking
  });
});

router.get('/comparison', (req, res) => {
  const papers = store.getPapers();
  const userHIndex = calculateHIndex(papers);
  
  const fieldMedian = 3;
  const field75Percentile = 6;
  const field90Percentile = 10;
  
  let userPercentile: number;
  if (userHIndex >= field90Percentile) {
    userPercentile = 90 + Math.min(10, (userHIndex - field90Percentile) * 3);
  } else if (userHIndex >= field75Percentile) {
    userPercentile = 75 + Math.min(15, (userHIndex - field75Percentile) * 3);
  } else if (userHIndex >= fieldMedian) {
    userPercentile = 50 + Math.min(25, (userHIndex - fieldMedian) * 8);
  } else {
    userPercentile = Math.max(10, 50 - (fieldMedian - userHIndex) * 10);
  }
  
  res.json({
    userHIndex,
    fieldMedian,
    field75Percentile,
    field90Percentile,
    userPercentile: Math.round(userPercentile)
  });
});

router.get('/citation-distribution', (req, res) => {
  const papers = store.getPapers();
  const sortedPapers = [...papers].sort((a, b) => b.currentCitations - a.currentCitations);
  
  res.json(sortedPapers.map(p => ({
    id: p.id,
    title: p.title,
    citations: p.currentCitations,
    shortTitle: p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title
  })));
});

router.get('/yearly-trend', (req, res) => {
  const allHistory = store.getAllCitationHistory();
  const yearlyData: { [key: number]: number } = {};
  
  allHistory.forEach(h => {
    yearlyData[h.year] = (yearlyData[h.year] || 0) + h.citations;
  });
  
  const result = Object.entries(yearlyData)
    .map(([year, citations]) => ({
      year: parseInt(year),
      citations
    }))
    .sort((a, b) => a.year - b.year);
  
  res.json(result);
});

router.get('/citation-categories', (req, res) => {
  const citations = store.getAllCitationRecords();
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
  
  const total = citations.length;
  const result = Object.entries(categories).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0
  }));
  
  res.json(result);
});

export default router;
