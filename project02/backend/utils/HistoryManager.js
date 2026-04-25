const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HistoryManager {
  constructor() {
    this.historyDir = path.join(__dirname, '../../data');
    this.historyFile = path.join(this.historyDir, 'history.json');
    this.maxHistoryItems = 100;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([]));
    }
  }

  loadHistory() {
    try {
      const data = fs.readFileSync(this.historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  saveHistory(history) {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  addRecord(code, result, logs) {
    const history = this.loadHistory();
    const record = {
      id: uuidv4(),
      code,
      result,
      logs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    history.unshift(record);

    if (history.length > this.maxHistoryItems) {
      history.pop();
    }

    this.saveHistory(history);
    return record;
  }

  getHistory(limit = 50) {
    const history = this.loadHistory();
    return history.slice(0, limit);
  }

  getRecordById(id) {
    const history = this.loadHistory();
    return history.find(record => record.id === id);
  }

  deleteRecord(id) {
    const history = this.loadHistory();
    const index = history.findIndex(record => record.id === id);
    if (index !== -1) {
      history.splice(index, 1);
      this.saveHistory(history);
      return true;
    }
    return false;
  }

  clearAll() {
    this.saveHistory([]);
  }
}

module.exports = new HistoryManager();
