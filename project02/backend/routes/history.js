const express = require('express');
const router = express.Router();
const historyManager = require('../utils/HistoryManager');

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = historyManager.getHistory(limit);
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Failed to get history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const record = historyManager.getRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'History record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Failed to get history record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history record'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = historyManager.deleteRecord(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'History record not found'
      });
    }

    res.json({
      success: true,
      message: 'History record deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete history record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete history record'
    });
  }
});

router.delete('/', (req, res) => {
  try {
    historyManager.clearAll();
    res.json({
      success: true,
      message: 'All history records cleared successfully'
    });
  } catch (error) {
    console.error('Failed to clear history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history'
    });
  }
});

module.exports = router;
