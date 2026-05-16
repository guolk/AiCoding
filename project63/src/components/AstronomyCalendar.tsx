import React, { useState, useCallback } from 'react';
import { AstronomicalEvent, PersonalAnniversary, WeatherForecast } from '../types';
import { getAstronomicalEvents, formatDate } from '../utils/astronomy';
import Toast from './Toast';

const AstronomyCalendar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'anniversaries' | 'weather'>('events');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAnniversaryForm, setShowAnniversaryForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const [events] = useState<AstronomicalEvent[]>(getAstronomicalEvents(selectedYear));

  const [anniversaries, setAnniversaries] = useState<PersonalAnniversary[]>([
    {
      id: '1',
      date: '2023-08-15',
      title: '第一次看到仙女座大星系',
      description: '在密云观测站，用8寸望远镜第一次清晰看到M31',
      icon: '🌟',
    },
    {
      id: '2',
      date: '2023-12-14',
      title: '双子座流星雨峰值',
      description: '每小时150颗流星，壮观！',
      icon: '☄️',
    },
  ]);

  const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([
    { date: '2024-08-20', condition: '晴朗', cloudCover: 10, precipitation: 0, temperature: 22, windSpeed: 5, visibility: 10, seeingQuality: 8, observingScore: 95 },
    { date: '2024-08-21', condition: '少云', cloudCover: 25, precipitation: 0, temperature: 21, windSpeed: 8, visibility: 9, seeingQuality: 7, observingScore: 85 },
    { date: '2024-08-22', condition: '多云', cloudCover: 60, precipitation: 10, temperature: 20, windSpeed: 10, visibility: 7, seeingQuality: 5, observingScore: 55 },
    { date: '2024-08-23', condition: '晴朗', cloudCover: 5, precipitation: 0, temperature: 19, windSpeed: 3, visibility: 10, seeingQuality: 9, observingScore: 98 },
    { date: '2024-08-24', condition: '少云', cloudCover: 20, precipitation: 0, temperature: 20, windSpeed: 6, visibility: 9, seeingQuality: 7, observingScore: 88 },
    { date: '2024-08-25', condition: '阴', cloudCover: 90, precipitation: 40, temperature: 18, windSpeed: 12, visibility: 5, seeingQuality: 3, observingScore: 25 },
    { date: '2024-08-26', condition: '晴朗', cloudCover: 8, precipitation: 0, temperature: 19, windSpeed: 4, visibility: 10, seeingQuality: 8, observingScore: 96 },
  ]);

  const [newAnniversary, setNewAnniversary] = useState<Partial<PersonalAnniversary>>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    icon: '🌟',
  });

  const handleAddAnniversary = () => {
    if (newAnniversary.title && newAnniversary.date) {
      setAnniversaries([
        ...anniversaries,
        {
          id: Date.now().toString(),
          date: newAnniversary.date,
          title: newAnniversary.title,
          description: newAnniversary.description || '',
          icon: newAnniversary.icon || '🌟',
        },
      ]);
      setShowAnniversaryForm(false);
      setNewAnniversary({ date: new Date().toISOString().split('T')[0], title: '', description: '', icon: '🌟' });
      showToast('纪念日添加成功！', 'success');
    } else {
      showToast('请填写日期和标题！', 'error');
    }
  };

  const deleteAnniversary = (id: string) => {
    setAnniversaries(anniversaries.filter(a => a.id !== id));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meteor_shower': return 'bg-orange-600';
      case 'eclipse': return 'bg-purple-600';
      case 'planetary_opposition': return 'bg-blue-600';
      case 'aurora': return 'bg-green-600';
      case 'conjunction': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'meteor_shower': return '流星雨';
      case 'eclipse': return '日月食';
      case 'planetary_opposition': return '行星冲日';
      case 'aurora': return '极光';
      case 'conjunction': return '行星合';
      default: return '其他';
    }
  };

  const getObservingScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case '晴朗': return '☀️';
      case '少云': return '⛅';
      case '多云': return '☁️';
      case '阴': return '🌥️';
      default: return '🌤️';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-star-yellow mb-6">📅 天象日历</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'events' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          🌌 重要天象
        </button>
        <button
          onClick={() => setActiveTab('anniversaries')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'anniversaries' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          📝 个人纪念
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'weather' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          🌤️ 观测天气
        </button>
      </div>

      <div className="bg-space-800/50 rounded-xl p-6 backdrop-blur-sm border border-space-700">
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">{selectedYear}年重要天象</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="px-3 py-1 bg-space-600 hover:bg-space-500 rounded transition-all"
                >
                  ◀ {selectedYear - 1}
                </button>
                <span className="px-4 py-1 bg-space-700 rounded font-bold">{selectedYear}</span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="px-3 py-1 bg-space-600 hover:bg-space-500 rounded transition-all"
                >
                  {selectedYear + 1} ▶
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-space-700/30 rounded-lg p-4 border border-space-600 hover:border-star-yellow/50 transition-all">
                  <div className="flex items-start gap-4">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getEventTypeColor(event.type)}`}>
                      {getEventTypeText(event.type)}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-1">{event.name}</h4>
                      <p className="text-sm text-space-400 mb-2">
                        📅 {formatDate(event.date)}
                        {event.peakTime && ` | 🕐 ${event.peakTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 峰值`}
                      </p>
                      <p className="text-sm text-space-300">{event.description}</p>
                      {event.zenithHourlyRate && (
                        <p className="text-sm text-orange-400 mt-2">☄️ 天顶每小时流量: ~{event.zenithHourlyRate}颗</p>
                      )}
                      {event.visibility && (
                        <p className="text-sm text-green-400 mt-1">🌍 可见区域: {event.visibility}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'anniversaries' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">我的观测纪念日</h3>
              <button
                onClick={() => setShowAnniversaryForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all font-semibold"
              >
                + 添加纪念
              </button>
            </div>

            {showAnniversaryForm && (
              <div className="bg-space-700/50 rounded-xl p-6 mb-6 border border-space-600">
                <h4 className="text-lg font-semibold mb-4">添加新的纪念日</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">日期</label>
                    <input
                      type="date"
                      value={newAnniversary.date}
                      onChange={(e) => setNewAnniversary({ ...newAnniversary, date: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">图标</label>
                    <select
                      value={newAnniversary.icon}
                      onChange={(e) => setNewAnniversary({ ...newAnniversary, icon: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value="🌟">🌟 星星</option>
                      <option value="☄️">☄️ 流星</option>
                      <option value="🌙">🌙 月亮</option>
                      <option value="🪐">🪐 行星</option>
                      <option value="🌌">🌌 星系</option>
                      <option value="🔭">🔭 望远镜</option>
                      <option value="📷">📷 摄影</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">标题</label>
                  <input
                    type="text"
                    placeholder="如: 第一次拍到木星"
                    value={newAnniversary.title}
                    onChange={(e) => setNewAnniversary({ ...newAnniversary, title: e.target.value })}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">描述</label>
                  <textarea
                    placeholder="描述这个值得纪念的时刻..."
                    value={newAnniversary.description}
                    onChange={(e) => setNewAnniversary({ ...newAnniversary, description: e.target.value })}
                    rows={3}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddAnniversary}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowAnniversaryForm(false)}
                    className="px-4 py-2 bg-space-600 hover:bg-space-500 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anniversaries.map((anniversary) => (
                <div key={anniversary.id} className="bg-space-700/30 rounded-lg p-4 border border-space-600">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{anniversary.icon}</span>
                      <div>
                        <h4 className="font-bold">{anniversary.title}</h4>
                        <p className="text-sm text-space-400 mb-2">📅 {formatDate(new Date(anniversary.date))}</p>
                        <p className="text-sm text-space-300">{anniversary.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAnniversary(anniversary.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div>
            <h3 className="text-xl font-semibold text-star-blue mb-6">未来一周观测天气预报</h3>
            <p className="text-space-400 mb-4">综合云量、视宁度、透明度等因素，为您推荐最佳观测夜晚</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weatherForecasts.map((forecast) => (
                <div
                  key={forecast.date}
                  className={`bg-space-700/30 rounded-lg p-4 border ${
                    forecast.observingScore >= 80 ? 'border-green-600 bg-green-900/10' :
                    forecast.observingScore >= 60 ? 'border-yellow-600 bg-yellow-900/10' :
                    'border-space-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getWeatherIcon(forecast.condition)}</span>
                      <div>
                        <h4 className="font-bold">{formatDate(new Date(forecast.date))}</h4>
                        <p className="text-sm text-space-400">{forecast.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getObservingScoreColor(forecast.observingScore)}`}>
                        {forecast.observingScore}
                      </p>
                      <p className="text-xs text-space-400">观测指数</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">☁️ 云量</p>
                      <p className="font-semibold">{forecast.cloudCover}%</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">🌧️ 降水</p>
                      <p className="font-semibold">{forecast.precipitation}%</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">🌡️ 温度</p>
                      <p className="font-semibold">{forecast.temperature}°C</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">💨 风速</p>
                      <p className="font-semibold">{forecast.windSpeed}km/h</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">👁️ 能见度</p>
                      <p className="font-semibold">{forecast.visibility}/10</p>
                    </div>
                    <div className="bg-space-800/50 p-2 rounded text-center">
                      <p className="text-space-400 text-xs">🔭 视宁度</p>
                      <p className="font-semibold">{'★'.repeat(forecast.seeingQuality)}{'☆'.repeat(10 - forecast.seeingQuality)}</p>
                    </div>
                  </div>
                  {forecast.observingScore >= 80 && (
                    <div className="mt-3 p-2 bg-green-900/30 rounded text-sm text-green-400 text-center">
                      ✨ 极佳观测夜晚！不要错过！
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-space-700/30 rounded-lg border border-space-600">
              <h4 className="font-semibold mb-2">📊 观测指数说明</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-green-600"></span>
                  <span>90-100: 完美</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-green-500"></span>
                  <span>80-89: 极佳</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-yellow-500"></span>
                  <span>60-79: 良好</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-red-500"></span>
                  <span>0-59: 较差</span>
                </div>
              </div>
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

export default AstronomyCalendar;
