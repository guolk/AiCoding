import React, { useState, useCallback } from 'react';
import { ObservationSession, ObjectObservation, UserLocation } from '../types';
import { formatDate } from '../utils/astronomy';
import Toast from './Toast';

interface ObservationRecordProps {
  location: UserLocation;
}

const ObservationRecord: React.FC<ObservationRecordProps> = ({ location }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'objects'>('sessions');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showObjectForm, setShowObjectForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const [sessions, setSessions] = useState<ObservationSession[]>([
    {
      id: '1',
      date: '2024-08-15',
      location: {
        name: '北京天文台',
        latitude: 40.0,
        longitude: 116.0,
        altitude: 50,
      },
      weather: {
        condition: '晴朗',
        temperature: 22,
        humidity: 45,
        windSpeed: 5,
        visibility: 10,
        seeing: 7,
        transparency: 8,
      },
      equipment: ['8寸牛顿反射望远镜', '20mm目镜', '10mm目镜'],
      notes: '今晚视宁度很好，成功观测了M31仙女座大星系，细节清晰。',
      startTime: '20:00',
      endTime: '23:30',
    },
    {
      id: '2',
      date: '2024-07-20',
      location: {
        name: '密云观测站',
        latitude: 40.5,
        longitude: 117.0,
        altitude: 200,
      },
      weather: {
        condition: '少云',
        temperature: 25,
        humidity: 50,
        windSpeed: 8,
        visibility: 8,
        seeing: 6,
        transparency: 7,
      },
      equipment: ['8寸牛顿反射望远镜', '15mm目镜'],
      notes: '观测了木星和土星，木星云带清晰可见。',
      startTime: '21:00',
      endTime: '00:00',
    },
  ]);

  const [objectObservations, setObjectObservations] = useState<ObjectObservation[]>([
    {
      id: '1',
      sessionId: '1',
      objectId: 'M31',
      objectName: 'M31 仙女座大星系',
      date: '2024-08-15',
      success: true,
      quality: 4,
      difficulty: 'medium',
      description: '星系核非常明亮，旋臂隐约可见，在低倍镜下视野极佳。使用了余光法可以看到更多的细节。',
      magnification: 100,
      filter: '无',
      notes: '观测条件很好，没有光污染。',
    },
    {
      id: '2',
      sessionId: '1',
      objectId: 'M42',
      objectName: 'M42 猎户座大星云',
      date: '2024-08-15',
      success: true,
      quality: 5,
      difficulty: 'easy',
      description: '星云非常明亮，梯形聚星清晰可见，周围的星云有明显的纹理。使用UHC滤镜后对比度提升明显。',
      magnification: 80,
      filter: 'UHC',
      notes: '最佳观测目标之一！',
    },
    {
      id: '3',
      sessionId: '2',
      objectId: 'JUPITER',
      objectName: '木星',
      date: '2024-07-20',
      success: true,
      quality: 5,
      difficulty: 'easy',
      description: '木星视面很大，至少可以看到4条云带，大红斑清晰可见。四颗伽利略卫星排列整齐。',
      magnification: 200,
      filter: '无',
      notes: '视宁度极佳，难得的观测机会！',
    },
  ]);

  const [newSession, setNewSession] = useState<Partial<ObservationSession>>({
    date: new Date().toISOString().split('T')[0],
    location: location,
    weather: {
      condition: '晴朗',
      temperature: 20,
      humidity: 50,
      windSpeed: 5,
      visibility: 10,
      seeing: 7,
      transparency: 7,
    },
    equipment: [],
    notes: '',
    startTime: '20:00',
    endTime: '23:00',
  });

  const [newObjectObservation, setNewObjectObservation] = useState<Partial<ObjectObservation>>({
    sessionId: '',
    objectId: '',
    objectName: '',
    date: new Date().toISOString().split('T')[0],
    success: true,
    quality: 3,
    difficulty: 'medium',
    description: '',
    magnification: 100,
    filter: '无',
    notes: '',
  });

  const handleAddSession = () => {
    if (newSession.date && newSession.weather) {
      const session: ObservationSession = {
        id: Date.now().toString(),
        date: newSession.date,
        location: newSession.location || location,
        weather: newSession.weather,
        equipment: newSession.equipment || [],
        notes: newSession.notes || '',
        startTime: newSession.startTime || '20:00',
        endTime: newSession.endTime || '23:00',
      };
      setSessions([session, ...sessions]);
      setShowSessionForm(false);
      setNewSession({
        date: new Date().toISOString().split('T')[0],
        location: location,
        weather: {
          condition: '晴朗',
          temperature: 20,
          humidity: 50,
          windSpeed: 5,
          visibility: 10,
          seeing: 7,
          transparency: 7,
        },
        equipment: [],
        notes: '',
        startTime: '20:00',
        endTime: '23:00',
      });
      showToast('观测会话添加成功！', 'success');
    } else {
      showToast('请填写完整信息！', 'error');
    }
  };

  const handleAddObjectObservation = () => {
    if (newObjectObservation.objectName) {
      const observation: ObjectObservation = {
        id: Date.now().toString(),
        sessionId: newObjectObservation.sessionId || '',
        objectId: newObjectObservation.objectId || Date.now().toString(),
        objectName: newObjectObservation.objectName,
        date: newObjectObservation.date || new Date().toISOString().split('T')[0],
        success: newObjectObservation.success || true,
        quality: newObjectObservation.quality || 3,
        difficulty: newObjectObservation.difficulty || 'medium',
        description: newObjectObservation.description || '',
        magnification: newObjectObservation.magnification,
        filter: newObjectObservation.filter,
        notes: newObjectObservation.notes || '',
      };
      setObjectObservations([observation, ...objectObservations]);
      setShowObjectForm(false);
      setNewObjectObservation({
        sessionId: '',
        objectId: '',
        objectName: '',
        date: new Date().toISOString().split('T')[0],
        success: true,
        quality: 3,
        difficulty: 'medium',
        description: '',
        magnification: 100,
        filter: '无',
        notes: '',
      });
      showToast('天体观测记录添加成功！', 'success');
    } else {
      showToast('请填写天体名称！', 'error');
    }
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    setObjectObservations(objectObservations.filter(o => o.sessionId !== id));
  };

  const deleteObjectObservation = (id: string) => {
    setObjectObservations(objectObservations.filter(o => o.id !== id));
  };

  const getQualityStars = (quality: number) => {
    return '⭐'.repeat(quality) + '☆'.repeat(5 - quality);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      case 'extreme': return '极难';
      default: return '未知';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-star-yellow mb-6">📝 观测记录</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'sessions' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          📅 观测会话
        </button>
        <button
          onClick={() => setActiveTab('objects')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'objects' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          🌟 天体观测
        </button>
      </div>

      <div className="bg-space-800/50 rounded-xl p-6 backdrop-blur-sm border border-space-700">
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">观测会话记录</h3>
              <button
                onClick={() => setShowSessionForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all font-semibold"
              >
                + 新建会话
              </button>
            </div>

            {showSessionForm && (
              <div className="bg-space-700/50 rounded-xl p-6 mb-6 border border-space-600">
                <h4 className="text-lg font-semibold mb-4">新建观测会话</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">日期</label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">开始时间</label>
                    <input
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">结束时间</label>
                    <input
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">天气状况</label>
                    <select
                      value={newSession.weather?.condition}
                      onChange={(e) => setNewSession({ ...newSession, weather: { ...newSession.weather!, condition: e.target.value } })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value="晴朗">晴朗</option>
                      <option value="少云">少云</option>
                      <option value="多云">多云</option>
                      <option value="阴">阴</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">温度 (°C)</label>
                    <input
                      type="number"
                      value={newSession.weather?.temperature}
                      onChange={(e) => setNewSession({ ...newSession, weather: { ...newSession.weather!, temperature: Number(e.target.value) } })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">视宁度 (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSession.weather?.seeing}
                      onChange={(e) => setNewSession({ ...newSession, weather: { ...newSession.weather!, seeing: Number(e.target.value) } })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">透明度 (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSession.weather?.transparency}
                      onChange={(e) => setNewSession({ ...newSession, weather: { ...newSession.weather!, transparency: Number(e.target.value) } })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">使用设备 (逗号分隔)</label>
                    <input
                      type="text"
                      placeholder="如: 8寸望远镜, 20mm目镜"
                      onChange={(e) => setNewSession({ ...newSession, equipment: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">备注</label>
                  <textarea
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddSession}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowSessionForm(false)}
                    className="px-4 py-2 bg-space-600 hover:bg-space-500 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-space-700/30 rounded-lg p-4 border border-space-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold">{formatDate(new Date(session.date))}</h4>
                      <p className="text-sm text-space-400">📍 {session.location.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">⏰ {session.startTime} - {session.endTime}</span>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">天气</p>
                      <p className="font-semibold">{session.weather.condition} {session.weather.temperature}°C</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">湿度</p>
                      <p className="font-semibold">{session.weather.humidity}%</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">视宁度</p>
                      <p className="font-semibold">{'★'.repeat(session.weather.seeing)}{'☆'.repeat(10 - session.weather.seeing)}</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">透明度</p>
                      <p className="font-semibold">{'★'.repeat(session.weather.transparency)}{'☆'.repeat(10 - session.weather.transparency)}</p>
                    </div>
                  </div>
                  {session.equipment.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-space-400">设备: </span>
                      {session.equipment.map((eq, i) => (
                        <span key={i} className="inline-block bg-space-600 px-2 py-1 rounded text-xs mr-2 mb-1">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                  {session.notes && (
                    <p className="text-sm text-space-300 italic">📝 {session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'objects' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">天体观测记录</h3>
              <button
                onClick={() => setShowObjectForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all font-semibold"
              >
                + 添加观测
              </button>
            </div>

            {showObjectForm && (
              <div className="bg-space-700/50 rounded-xl p-6 mb-6 border border-space-600">
                <h4 className="text-lg font-semibold mb-4">新建天体观测记录</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">天体名称</label>
                    <input
                      type="text"
                      placeholder="如: M42 猎户座大星云"
                      value={newObjectObservation.objectName}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, objectName: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">日期</label>
                    <input
                      type="date"
                      value={newObjectObservation.date}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, date: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">观测难度</label>
                    <select
                      value={newObjectObservation.difficulty}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, difficulty: e.target.value as any })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value="easy">简单</option>
                      <option value="medium">中等</option>
                      <option value="hard">困难</option>
                      <option value="extreme">极难</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">观测质量 (1-5)</label>
                    <select
                      value={newObjectObservation.quality}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, quality: Number(e.target.value) as any })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value={1}>1 - 很差</option>
                      <option value={2}>2 - 较差</option>
                      <option value={3}>3 - 一般</option>
                      <option value={4}>4 - 较好</option>
                      <option value={5}>5 - 极好</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">放大倍率</label>
                    <input
                      type="number"
                      value={newObjectObservation.magnification}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, magnification: Number(e.target.value) })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">滤镜</label>
                    <input
                      type="text"
                      placeholder="如: UHC, OIII"
                      value={newObjectObservation.filter}
                      onChange={(e) => setNewObjectObservation({ ...newObjectObservation, filter: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">观测描述</label>
                  <textarea
                    placeholder="描述你看到的细节、形状、亮度等..."
                    value={newObjectObservation.description}
                    onChange={(e) => setNewObjectObservation({ ...newObjectObservation, description: e.target.value })}
                    rows={4}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">备注</label>
                  <textarea
                    value={newObjectObservation.notes}
                    onChange={(e) => setNewObjectObservation({ ...newObjectObservation, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddObjectObservation}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowObjectForm(false)}
                    className="px-4 py-2 bg-space-600 hover:bg-space-500 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {objectObservations.map((obs) => (
                <div key={obs.id} className={`bg-space-700/30 rounded-lg p-4 border ${obs.success ? 'border-green-600' : 'border-red-600'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold">{obs.objectName}</h4>
                      <p className="text-sm text-space-400">📅 {formatDate(new Date(obs.date))}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${obs.success ? 'text-green-400' : 'text-red-400'}`}>
                        {obs.success ? '✓ 成功观测' : '✗ 未找到'}
                      </span>
                      <button
                        onClick={() => deleteObjectObservation(obs.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">观测质量</p>
                      <p className="font-semibold">{getQualityStars(obs.quality)}</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">观测难度</p>
                      <p className={`font-semibold ${getDifficultyColor(obs.difficulty)}`}>
                        {getDifficultyText(obs.difficulty)}
                      </p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">放大倍率</p>
                      <p className="font-semibold">{obs.magnification}x</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded">
                      <p className="text-space-400">滤镜</p>
                      <p className="font-semibold">{obs.filter || '无'}</p>
                    </div>
                  </div>
                  {obs.description && (
                    <div className="mb-2">
                      <p className="text-sm text-space-400 mb-1">🔭 观测描述:</p>
                      <p className="text-sm text-space-200 bg-space-800/30 p-3 rounded">{obs.description}</p>
                    </div>
                  )}
                  {obs.notes && (
                    <p className="text-sm text-space-300 italic">📝 {obs.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
};

export default ObservationRecord;
