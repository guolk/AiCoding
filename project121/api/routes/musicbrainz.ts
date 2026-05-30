import { Router } from 'express';
import { searchWorks, searchArtists, getWorkDetails } from '../services/musicbrainz.js';

const router = Router();

router.get('/works', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  try {
    const results = await searchWorks(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search works' });
  }
});

router.get('/artists', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  try {
    const results = await searchArtists(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

router.get('/works/:mbid', async (req, res) => {
  try {
    const result = await getWorkDetails(req.params.mbid);
    if (!result) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get work details' });
  }
});

export default router;
