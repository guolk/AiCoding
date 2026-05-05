const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const scoresDir = path.join(__dirname, 'scores');
fs.ensureDirSync(scoresDir);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

app.post('/api/save', (req, res) => {
  try {
    const { title, musicxml, data } = req.body;
    const id = uuidv4();
    const scoreData = {
      id,
      title: title || 'Untitled Score',
      musicxml: musicxml || '',
      data: data || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(scoresDir, `${id}.json`);
    fs.writeJsonSync(filePath, scoreData);
    
    res.json({ success: true, id, message: 'Score saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/save/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, musicxml, data } = req.body;
    const filePath = path.join(scoresDir, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Score not found' });
    }
    
    const scoreData = fs.readJsonSync(filePath);
    scoreData.title = title || scoreData.title;
    scoreData.musicxml = musicxml || scoreData.musicxml;
    scoreData.data = data || scoreData.data;
    scoreData.updatedAt = new Date().toISOString();
    
    fs.writeJsonSync(filePath, scoreData);
    
    res.json({ success: true, id, message: 'Score updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/load/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(scoresDir, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Score not found' });
    }
    
    const scoreData = fs.readJsonSync(filePath);
    res.json({ success: true, data: scoreData });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/list', (req, res) => {
  try {
    const files = fs.readdirSync(scoresDir);
    const scores = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(scoresDir, file);
        const data = fs.readJsonSync(filePath);
        return {
          id: data.id,
          title: data.title,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({ success: true, scores });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/delete/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(scoresDir, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Score not found' });
    }
    
    fs.removeSync(filePath);
    res.json({ success: true, message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/export/png', (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'PNG export is handled by frontend canvas export',
      note: 'Please use the frontend canvas toDataURL() method for direct PNG export'
    });
  } catch (error) {
    console.error('Export PNG error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Music Score Editor server running on http://localhost:${PORT}`);
});
