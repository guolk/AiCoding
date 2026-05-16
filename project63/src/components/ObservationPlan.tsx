import React, { useState, useEffect } from 'react';
import { CelestialObject, PlanetPosition, MoonPhase, ObservationTarget, UserLocation } from '../types';
import { calculatePlanetPositions, calculateMoonPhase, getMessierObjects, getNGCObjects, calculateBestObservationTime, formatTime } from '../utils/astronomy';

interface ObservationPlanProps {
  location: UserLocation;
}

const ObservationPlan: React.FC<ObservationPlanProps> = ({ location }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [planetPositions, setPlanetPositions] = useState<PlanetPosition[]>([]);
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [messierObjects, setMessierObjects] = useState<CelestialObject[]>([]);
  const [ngcObjects, setNGCObjects] = useState<CelestialObject[]>([]);
  const [bestTargets, setBestTargets] = useState<ObservationTarget[]>([]);
  const [activeTab, setActiveTab] = useState<'planets' | 'moon' | 'messier' | 'ngc' | 'targets'>('planets');
  const [filterObserved, setFilterObserved] = useState<'all' | 'observed' | 'unobserved'>('all');

  useEffect(() => {
    const planets = calculatePlanetPositions(selectedDate, location);
    setPlanetPositions(planets);
    
    const moon = calculateMoonPhase(selectedDate);
    setMoonPhase(moon);
    
    const messier = getMessierObjects();
    setMessierObjects(messier);
    
    const ngc = getNGCObjects();
    setNGCObjects(ngc);
    
    const allObjects = [...messier, ...ngc];
    const targets: ObservationTarget[] = [];
    allObjects.forEach(obj => {
      const target = calculateBestObservationTime(obj, selectedDate, location);
      if (target) {
        targets.push(target);
      }
    });
    targets.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    setBestTargets(targets);
  }, [selectedDate, location]);

  const filteredMessierObjects = messierObjects.filter(obj => {
    if (filterObserved === 'observed') return obj.observed;
    if (filterObserved === 'unobserved') return !obj.observed;
    return true;
  });

  const filteredNGCObjects = ngcObjects.filter(obj => {
    if (filterObserved === 'observed') return obj.observed;
    if (filterObserved === 'unobserved') return !obj.observed;
    return true;
  });

  const toggleObserved = (id: string, catalog: 'messier' | 'ngc') => {
    if (catalog === 'messier') {
      setMessierObjects(prev =>
        prev.map(obj =>
          obj.id === id
            ? {
                ...obj,
                observed: !obj.observed,
                observedDates: !obj.observed
                  ? [...(obj.observedDates || []), new Date().toISOString().split('T')[0]]
                  : obj.observedDates?.slice(0, -1),
              }
            : obj
        )
      );
    } else {
      setNGCObjects(prev =>
        prev.map(obj =>
          obj.id === id
            ? {
                ...obj,
                observed: !obj.observed,
                observedDates: !obj.observed
                  ? [...(obj.observedDates || []), new Date().toISOString().split('T')[0]]
                  : obj.observedDates?.slice(0, -1),
              }
            : obj
        )
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-star-yellow mb-6">🔭 观测计划</h2>
      
      <div className="mb-6 flex items-center gap-4">
        <label className="text-lg">选择日期:</label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="bg-space-800 border border-space-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-star-yellow"
        />
        <span className="text-space-400">当前位置: {location.name}</span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'planets', label: '🪐 行星位置' },
          { id: 'moon', label: '🌙 月相信息' },
          { id: 'messier', label: '⭐ Messier目录' },
          { id: 'ngc', label: '🌌 NGC目录' },
          { id: 'targets', label: '🎯 最佳观测目标' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-space-800/50 rounded-xl p-6 backdrop-blur-sm border border-space-700">
        {activeTab === 'planets' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-star-blue">今晚可见的行星</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planetPositions.map((planet) => (
                <div
                  key={planet.planet}
                  className={`p-4 rounded-lg border ${planet.visible ? 'border-green-500 bg-green-900/20' : 'border-space-600 bg-space-700/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold">{planet.planet}</h4>
                    <span className={`px-2 py-1 rounded text-sm ${planet.visible ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {planet.visible ? '可见' : '不可见'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>🌟 星等: <span className="text-star-yellow">{planet.magnitude}</span></p>
                    <p>📐 地平高度: <span>{planet.altitude}°</span></p>
                    <p>🧭 方位角: <span>{planet.azimuth}°</span></p>
                    <p>🌅 升起: <span>{formatTime(planet.riseTime)}</span></p>
                    <p>🌇 落下: <span>{formatTime(planet.setTime)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'moon' && moonPhase && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-star-blue">月相信息</h3>
            <div className="bg-space-700/50 rounded-xl p-8 text-center">
              <div className="text-8xl mb-6">
                {moonPhase.phaseName === '满月' ? '🌕' :
                 moonPhase.phaseName === '新月' ? '🌑' :
                 moonPhase.phaseName === '上弦月' ? '🌓' :
                 moonPhase.phaseName === '下弦月' ? '🌗' :
                 moonPhase.phaseName === '娥眉月' ? '🌒' :
                 moonPhase.phaseName === '盈凸月' ? '🌔' :
                 moonPhase.phaseName === '亏凸月' ? '🌖' : '🌘'}
              </div>
              <h4 className="text-2xl font-bold mb-4">{moonPhase.phaseName}</h4>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-space-800 p-4 rounded-lg">
                  <p className="text-space-400 text-sm">照亮比例</p>
                  <p className="text-2xl font-bold text-star-yellow">{moonPhase.illumination.toFixed(1)}%</p>
                </div>
                <div className="bg-space-800 p-4 rounded-lg">
                  <p className="text-space-400 text-sm">月龄</p>
                  <p className="text-2xl font-bold text-star-blue">{moonPhase.age.toFixed(1)} 天</p>
                </div>
                <div className="bg-space-800 p-4 rounded-lg">
                  <p className="text-space-400 text-sm">月出时间</p>
                  <p className="text-2xl font-bold">{formatTime(moonPhase.riseTime)}</p>
                </div>
                <div className="bg-space-800 p-4 rounded-lg">
                  <p className="text-space-400 text-sm">月落时间</p>
                  <p className="text-2xl font-bold">{formatTime(moonPhase.setTime)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messier' && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">Messier目录 ({messierObjects.length}个)</h3>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'observed', label: '已观测' },
                  { id: 'unobserved', label: '未观测' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterObserved(filter.id as typeof filterObserved)}
                    className={`px-3 py-1 rounded text-sm transition-all ${filterObserved === filter.id ? 'bg-star-yellow text-space-900' : 'bg-space-700 hover:bg-space-600'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMessierObjects.map((obj) => (
                <div
                  key={obj.id}
                  className={`p-4 rounded-lg border ${obj.observed ? 'border-green-500 bg-green-900/20' : 'border-space-600 bg-space-700/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{obj.name}</h4>
                    <button
                      onClick={() => toggleObserved(obj.id, 'messier')}
                      className={`px-2 py-1 rounded text-sm transition-all ${obj.observed ? 'bg-green-600 hover:bg-green-700' : 'bg-space-600 hover:bg-space-500'}`}
                    >
                      {obj.observed ? '✓ 已观测' : '标记观测'}
                    </button>
                  </div>
                  <p className="text-sm text-space-400 mb-2">{obj.description}</p>
                  <div className="flex gap-4 text-xs text-space-300">
                    <span>星座: {obj.constellation}</span>
                    <span>星等: {obj.magnitude}</span>
                    <span>类型: {obj.type === 'nebula' ? '星云' : obj.type === 'galaxy' ? '星系' : '星团'}</span>
                  </div>
                  {obj.observedDates && obj.observedDates.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">观测次数: {obj.observedDates.length}次</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ngc' && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">NGC目录 ({ngcObjects.length}个)</h3>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'observed', label: '已观测' },
                  { id: 'unobserved', label: '未观测' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterObserved(filter.id as typeof filterObserved)}
                    className={`px-3 py-1 rounded text-sm transition-all ${filterObserved === filter.id ? 'bg-star-yellow text-space-900' : 'bg-space-700 hover:bg-space-600'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNGCObjects.map((obj) => (
                <div
                  key={obj.id}
                  className={`p-4 rounded-lg border ${obj.observed ? 'border-green-500 bg-green-900/20' : 'border-space-600 bg-space-700/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{obj.name}</h4>
                    <button
                      onClick={() => toggleObserved(obj.id, 'ngc')}
                      className={`px-2 py-1 rounded text-sm transition-all ${obj.observed ? 'bg-green-600 hover:bg-green-700' : 'bg-space-600 hover:bg-space-500'}`}
                    >
                      {obj.observed ? '✓ 已观测' : '标记观测'}
                    </button>
                  </div>
                  <p className="text-sm text-space-400 mb-2">{obj.description}</p>
                  <div className="flex gap-4 text-xs text-space-300">
                    <span>星座: {obj.constellation}</span>
                    <span>星等: {obj.magnitude}</span>
                    <span>类型: {obj.type === 'nebula' ? '星云' : obj.type === 'galaxy' ? '星系' : '星团'}</span>
                  </div>
                  {obj.observedDates && obj.observedDates.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">观测次数: {obj.observedDates.length}次</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'targets' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-star-blue">今晚最佳观测目标推荐</h3>
            <p className="text-space-400 mb-4">综合考虑天体高度、亮度、可观测时间等因素</p>
            <div className="space-y-3">
              {bestTargets.map((target) => (
                <div
                  key={target.objectId}
                  className="flex items-center justify-between p-4 bg-space-700/50 rounded-lg border border-space-600"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full ${getPriorityColor(target.priority)}`}></span>
                    <div>
                      <h4 className="font-bold">{target.objectName}</h4>
                      <p className="text-sm text-space-400">{target.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-space-400">开始</p>
                      <p className="font-mono">{formatTime(target.bestStartTime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-space-400">结束</p>
                      <p className="font-mono">{formatTime(target.bestEndTime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-space-400">优先级</p>
                      <p className={`font-bold ${target.priority === 'high' ? 'text-green-400' : target.priority === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {getPriorityText(target.priority)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObservationPlan;
