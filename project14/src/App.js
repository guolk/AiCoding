import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import map from 'lodash/map';
import dayjs from 'dayjs';
import axios from 'axios';

import { usefulFunction } from './utils/usefulUtils';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const DataAnalysisPage = lazy(() => import('./pages/DataAnalysisPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  const data = map([1, 2, 3, 4, 5], (num) => num * 2);
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const today = dayjs().format('YYYY-MM-DD');

  React.useEffect(() => {
    console.log('有用的函数结果:', usefulFunction());
    
    axios.get('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => {
        console.log('API响应:', response.data);
      })
      .catch(error => {
        console.error('API错误:', error);
      });
  }, []);

  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <Link to="/">首页</Link>
          <Link to="/dashboard">仪表盘</Link>
          <Link to="/users">用户管理</Link>
          <Link to="/analysis">数据分析</Link>
          <Link to="/settings">设置</Link>
        </nav>
        
        <div className="content">
          <Suspense fallback={<div className="loading-indicator">加载中...</div>}>
            <Routes>
              <Route path="/" element={<HomePage data={data} now={now} today={today} />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/analysis" element={<DataAnalysisPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
