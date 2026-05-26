import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import MoodRecorder from './components/MoodRecorder';
import Journal from './components/Journal';
import PatternAnalysis from './components/PatternAnalysis';
import SelfCareTools from './components/SelfCareTools';
import './styles.css';

type Tab = 'mood' | 'journal' | 'analysis' | 'tools';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('mood');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'mood', label: '情绪记录', icon: '📝' },
    { id: 'journal', label: '日记', icon: '📔' },
    { id: 'analysis', label: '模式分析', icon: '📊' },
    { id: 'tools', label: '自我改善', icon: '🛠️' }
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>🌈 情绪日记</h1>
        <p className="subtitle">心理健康自我监测工具</p>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'mood' && <MoodRecorder />}
        {activeTab === 'journal' && <Journal />}
        {activeTab === 'analysis' && <PatternAnalysis />}
        {activeTab === 'tools' && <SelfCareTools />}
      </main>

      <footer className="footer">
        <p>💚 关注你的情绪健康，每一天都很重要</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
