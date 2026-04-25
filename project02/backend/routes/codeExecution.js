const express = require('express');
const router = express.Router();
const SafeCodeExecutor = require('../utils/SafeCodeExecutor');
const historyManager = require('../utils/HistoryManager');

const executor = new SafeCodeExecutor({
  timeout: 5000,
  memoryLimitMB: 100
});

router.post('/', async (req, res) => {
  const requestStartTime = Date.now();
  
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        status: 'validation_error',
        message: '代码不能为空',
        errorType: 'ValidationError',
        detail: 'Code is required and must be a string',
        executionTime: Date.now() - requestStartTime
      });
    }

    if (code.length > 10000) {
      return res.status(400).json({
        success: false,
        status: 'validation_error',
        message: '代码过长',
        errorType: 'ValidationError',
        detail: `Code is too long. Maximum 10,000 characters allowed. Current: ${code.length}`,
        executionTime: Date.now() - requestStartTime
      });
    }

    try {
      executor.sanitizeCode(code);
    } catch (sanitizeError) {
      return res.status(403).json({
        success: false,
        status: 'security_error',
        message: '代码包含危险操作',
        errorType: 'SecurityError',
        detail: sanitizeError.message,
        executionTime: Date.now() - requestStartTime
      });
    }

    const result = executor.execute(code);

    const historyRecord = historyManager.addRecord(
      code,
      result.result,
      result.logs
    );

    res.json({
      ...result,
      historyId: historyRecord.id,
      totalExecutionTime: Date.now() - requestStartTime
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      status: 'server_error',
      message: '服务器内部错误',
      errorType: 'ServerError',
      detail: error.message,
      executionTime: Date.now() - requestStartTime
    });
  }
});

module.exports = router;
