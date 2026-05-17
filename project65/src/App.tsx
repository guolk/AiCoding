import React, { useState } from 'react';
import TrainingPlanModule from './components/TrainingPlan';
import RunRecordsModule from './components/RunRecords';
import AnalysisModule from './components/Analysis';
import RacePrepModule from './components/RacePrep';
import InjuryManagementModule from './components/InjuryManagement';
import { generateTestData } from './utils/testDataGenerator';
import { useApp } from './context/AppContext';

type ModuleType = 'training' | 'records' | 'analysis' | 'raceprep' | 'injury';

const navItems = [
  { id: 'training' as ModuleType, label: '训练计划', icon: '📋' },
  { id: 'records' as ModuleType, label: '跑步记录', icon: '🏃' },
  { id: 'analysis' as ModuleType, label: '数据分析', icon: '📊' },
  { id: 'raceprep' as ModuleType, label: '比赛准备', icon: '🎯' },
  { id: 'injury' as ModuleType, label: '伤病管理', icon: '🩹' }
];

const App: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeModule, setActiveModule] = useState<ModuleType>('training');
  
  const loadTestData = () => {
    if (confirm('确定要加载测试数据吗？这将覆盖现有数据。')) {
      const testData = generateTestData();
      dispatch({ type: 'SET_USER_PROFILE', payload: testData.userProfile });
      dispatch({ type: 'SET_RACE_GOAL', payload: testData.raceGoal });
      dispatch({ type: 'SET_TRAINING_PLAN', payload: testData.trainingPlan });
      dispatch({ type: 'LOAD_STATE', payload: { ...state, ...testData, checkList: state.checkList } });
      alert('测试数据已加载！');
    }
  };
  
  const clearAllData = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem('marathon-tracker-data');
      window.location.reload();
    }
  };
  
  const hasData = state.runRecords.length > 0 || state.trainingPlan !== null;
  
  const renderModule = () => {
    switch (activeModule) {
      case 'training':
        return <TrainingPlanModule />;
      case 'records':
        return <RunRecordsModule />;
      case 'analysis':
        return <AnalysisModule />;
      case 'raceprep':
        return <RacePrepModule />;
      case 'injury':
        return <InjuryManagementModule />;
      default:
        return <TrainingPlanModule />;
    }
  };
  
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">🏃 马拉松训练助手</div>
          <div className="sidebar-subtitle">科学训练 · 健康完赛</div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div style={{ padding: '24px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {!hasData && (
            <button
              className="btn btn-success btn-sm btn-block mb-md"
              onClick={loadTestData}
              style={{ width: '100%', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              🎯 加载测试数据
            </button>
          )}
          {hasData && (
            <button
              className="btn btn-danger btn-sm btn-block mb-md"
              onClick={clearAllData}
              style={{ width: '100%', background: 'rgba(244, 67, 54, 0.2)', color: 'white', border: '1px solid rgba(244, 67, 54, 0.3)' }}
            >
              🗑️ 清空所有数据
            </button>
          )}
          <div className="text-sm opacity-80">💡 数据安全</div>
          <div className="text-xs opacity-60 mt-sm">
            所有数据保存在您的浏览器本地存储中，不会上传到服务器
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
};

export default App;
