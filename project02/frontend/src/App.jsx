import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [code, setCode] = useState(`// 示例代码
console.log("Hello, World!");

// 计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("斐波那契(10) =", result);
result;`);
  
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const consoleRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, result]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const runCode = async () => {
    if (!code.trim() || isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setExecutionStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        code
      });

      const data = response.data;

      setExecutionStatus({
        success: data.success,
        status: data.status,
        message: data.message,
        errorType: data.errorType,
        detail: data.detail,
        executionTime: data.executionTime,
        totalExecutionTime: data.totalExecutionTime
      });

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.success && data.result) {
        setResult(data.result);
      } else if (!data.success && data.errors) {
        const errorLogs = data.errors.map(err => ({
          type: 'error',
          content: err.message || err.content,
          timestamp: err.timestamp
        }));
        setLogs(prev => [...prev, ...errorLogs]);
      }

      if (data.historyId) {
        await loadHistory();
        setSelectedHistoryId(data.historyId);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || '未知错误';
      const detail = error.response?.data?.detail;
      
      setExecutionStatus({
        success: false,
        status: error.response?.data?.status || 'network_error',
        message: errorMessage,
        errorType: error.response?.data?.errorType || 'NetworkError',
        detail: detail,
        executionTime: null
      });

      setLogs([{
        type: 'error',
        content: `${errorMessage}${detail ? `: ${detail}` : ''}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearConsole = () => {
    setLogs([]);
    setResult(null);
    setExecutionStatus(null);
  };

  const clearAll = () => {
    setCode('');
    setLogs([]);
    setResult(null);
    setSelectedHistoryId(null);
    setExecutionStatus(null);
  };

  const loadHistoryItem = (item) => {
    setCode(item.code);
    setLogs(item.logs || []);
    setResult(item.result);
    setSelectedHistoryId(item.id);
    setExecutionStatus(null);
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const clearAllHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/history`);
      setHistory([]);
      setSelectedHistoryId(null);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const formatLogContent = (log) => {
    const typeMap = {
      log: 'console-log',
      info: 'console-info',
      warn: 'console-warn',
      error: 'console-error'
    };

    const typeLabel = {
      log: 'log',
      info: 'info',
      warn: 'warn',
      error: 'error'
    };

    return (
      <div key={log.timestamp + Math.random()} className={`console-item ${typeMap[log.type] || 'console-log'}`}>
        <span style={{ opacity: 0.6, marginRight: 8 }}>[{typeLabel[log.type]}]</span>
        <span>{log.content}</span>
      </div>
    );
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    if (status.success) return '✅';
    if (status.status === 'validation_error') return '⚠️';
    if (status.status === 'security_error') return '🔒';
    if (status.status === 'server_error') return '💥';
    return '❌';
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">🚀 在线代码运行面板</h1>
        <div className="header-controls">
          <div className="status-indicator">
            <span className={`status-dot ${isRunning ? 'running' : 'ready'}`}></span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRunning ? '运行中...' : '就绪'}
            </span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 深色主题' : '☀️ 浅色主题'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">📝 JavaScript 编辑器</span>
          </div>
          
          <div className="code-editor">
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// 在此输入 JavaScript 代码..."
              spellCheck={false}
              disabled={isRunning}
            />
          </div>

          <div className="editor-footer">
            <button 
              className="run-button" 
              onClick={runCode}
              disabled={isRunning || !code.trim()}
            >
              {isRunning ? (
                <>
                  <span className="loading-spinner"></span>
                  运行中...
                </>
              ) : (
                <>
                  ▶ 运行代码
                </>
              )}
            </button>
            <button className="clear-button" onClick={clearAll}>
              🗑 清空
            </button>
          </div>
        </div>

        <div className="console-panel">
          <div className="panel-header">
            <span className="panel-title">🖥 控制台输出</span>
            <button 
              className="history-button"
              onClick={clearConsole}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              清空控制台
            </button>
          </div>

          {executionStatus && (
            <div className={`execution-status ${executionStatus.success ? 'status-success' : 'status-error'}`}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon(executionStatus)}</span>
                <span className="status-main-text">
                  {executionStatus.message}
                </span>
              </div>
              {executionStatus.errorType && (
                <div className="status-detail">
                  <span className="status-label">错误类型:</span>
                  <span className="status-value">{executionStatus.errorType}</span>
                </div>
              )}
              {executionStatus.detail && (
                <div className="status-detail">
                  <span className="status-label">详情:</span>
                  <span className="status-value">{executionStatus.detail}</span>
                </div>
              )}
              {executionStatus.executionTime !== null && (
                <div className="status-time">
                  执行时间: {executionStatus.executionTime}ms
                  {executionStatus.totalExecutionTime && ` (总耗时: ${executionStatus.totalExecutionTime}ms)`}
                </div>
              )}
            </div>
          )}

          <div className="console-output" ref={consoleRef}>
            {logs.length === 0 && !result ? (
              <div className="console-empty">
                运行代码以查看输出结果...
              </div>
            ) : (
              <>
                {logs.map((log, index) => (
                  <React.Fragment key={index}>
                    {formatLogContent(log)}
                  </React.Fragment>
                ))}
                
                {result && (
                  <div className="console-result">
                    <strong>返回值:</strong> {result}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="history-panel">
          <div className="history-header">
            <span className="panel-title">📚 历史记录</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              {history.length} 条
            </span>
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <div className="console-empty" style={{ padding: '20px' }}>
                暂无历史记录
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={`history-item ${selectedHistoryId === item.id ? 'active' : ''}`}
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="history-code">
                    {item.code.substring(0, 100)}{item.code.length > 100 ? '...' : ''}
                  </div>
                  <div className="history-time">
                    {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="history-actions">
            <button 
              className="history-button delete"
              onClick={clearAllHistory}
            >
              清空历史
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
