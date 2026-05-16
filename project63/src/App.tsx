import React, { useState } from 'react';
import ObservationPlan from './components/ObservationPlan';
import ObservationRecord from './components/ObservationRecord';
import AstronomyCalendar from './components/AstronomyCalendar';
import EquipmentManager from './components/EquipmentManager';
import { UserLocation } from './types';

function App() {
  const [activeModule, setActiveModule] = useState<'plan' | 'record' | 'calendar' | 'equipment'>('plan');
  const [userLocation, setUserLocation] = useState<UserLocation>({
    name: '北京',
    latitude: 39.9,
    longitude: 116.4,
    altitude: 50,
    timezone: 'Asia/Shanghai',
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState(userLocation);

  const navItems = [
    { id: 'plan', label: '🔭 观测计划', description: '天体位置、最佳观测时间推荐' },
    { id: 'record', label: '📝 观测记录', description: '观测会话、天体观测笔记' },
    { id: 'calendar', label: '📅 天象日历', description: '重要天象、纪念日、天气预报' },
    { id: 'equipment', label: '🧰 装备管理', description: '设备档案、倍率计算、借用记录' },
  ];

  const handleSaveLocation = () => {
    setUserLocation(tempLocation);
    setShowLocationModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 text-white">
      {/* Header */}
      <header className="bg-space-800/80 backdrop-blur-sm border-b border-space-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌌</span>
              <div>
                <h1 className="text-2xl font-bold text-star-yellow">StarLog</h1>
                <p className="text-sm text-space-400">天文观测计划与记录工具</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-space-600 rounded-lg transition-all"
            >
              <span>📍</span>
              <span>{userLocation.name}</span>
              <span className="text-xs text-space-400">
                ({userLocation.latitude.toFixed(1)}°, {userLocation.longitude.toFixed(1)}°)
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-space-800/50 border-b border-space-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as any)}
                className={`px-4 py-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                  activeModule === item.id
                    ? 'bg-star-yellow text-space-900 font-bold shadow-lg shadow-star-yellow/20'
                    : 'hover:bg-space-700 text-space-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {activeModule === 'plan' && <ObservationPlan location={userLocation} />}
        {activeModule === 'record' && <ObservationRecord location={userLocation} />}
        {activeModule === 'calendar' && <AstronomyCalendar />}
        {activeModule === 'equipment' && <EquipmentManager />}
      </main>

      {/* Footer */}
      <footer className="bg-space-800/80 border-t border-space-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              <span className="font-bold text-star-yellow">StarLog</span>
              <span className="text-space-400">天文观测计划与记录工具</span>
            </div>
            <div className="text-sm text-space-400">
              🌟 观星快乐，探索无限 🌟
            </div>
          </div>
        </div>
      </footer>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-space-800 rounded-xl p-6 max-w-md w-full border border-space-700">
            <h3 className="text-xl font-bold mb-4 text-star-yellow">📍 设置观测位置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-space-400 mb-1">地点名称</label>
                <input
                  type="text"
                  value={tempLocation.name}
                  onChange={(e) => setTempLocation({ ...tempLocation, name: e.target.value })}
                  className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  placeholder="如：北京天文台"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-space-400 mb-1">纬度 (°)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempLocation.latitude}
                    onChange={(e) => setTempLocation({ ...tempLocation, latitude: Number(e.target.value) })}
                    className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div>
                  <label className="block text-sm text-space-400 mb-1">经度 (°)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempLocation.longitude}
                    onChange={(e) => setTempLocation({ ...tempLocation, longitude: Number(e.target.value) })}
                    className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-space-400 mb-1">海拔高度 (米)</label>
                <input
                  type="number"
                  value={tempLocation.altitude}
                  onChange={(e) => setTempLocation({ ...tempLocation, altitude: Number(e.target.value) })}
                  className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLocation}
                className="flex-1 px-4 py-2 bg-star-yellow text-space-900 font-bold rounded-lg hover:bg-yellow-400 transition-all"
              >
                保存
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2 bg-space-700 rounded-lg hover:bg-space-600 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
