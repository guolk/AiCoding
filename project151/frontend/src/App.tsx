import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Plots from './pages/Plots';
import PlotDetail from './pages/PlotDetail';
import Farming from './pages/Farming';
import Pests from './pages/Pests';
import Harvest from './pages/Harvest';
import Traceability from './pages/Traceability';
import TraceabilityDetail from './pages/TraceabilityDetail';

const App: React.FC = () => {
  const navItems = [
    { path: '/', label: '仪表盘', icon: '📊' },
    { path: '/plots', label: '地块管理', icon: '🌱' },
    { path: '/farming', label: '农事操作', icon: '🚜' },
    { path: '/pests', label: '病虫害管理', icon: '🐛' },
    { path: '/harvest', label: '收获与产量', icon: '🌾' },
    { path: '/traceability', label: '农业追溯', icon: '🔍' },
  ];

  const getPageTitle = (path: string) => {
    const item = navItems.find(n => path.startsWith(n.path) && n.path !== '/') || navItems[0];
    return item.label;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>
            <span className="logo-icon">🌾</span>
            智慧农业管理
          </h2>
        </div>
        <ul className="sidebar-nav">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                end={item.path === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <h1>{getPageTitle(window.location.pathname)}</h1>
          <span style={{ color: '#888', fontSize: '14px' }}>
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plots" element={<Plots />} />
            <Route path="/plots/:id" element={<PlotDetail />} />
            <Route path="/farming" element={<Farming />} />
            <Route path="/pests" element={<Pests />} />
            <Route path="/harvest" element={<Harvest />} />
            <Route path="/traceability" element={<Traceability />} />
            <Route path="/traceability/:code" element={<TraceabilityDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
