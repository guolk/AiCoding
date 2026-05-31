import { useState, useMemo } from 'react';
import {
  BarChart2,
  Upload,
  Plus,
  Trash2,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Thermometer,
  Droplets
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { generateId, secondsToPace, paceToSeconds } from '@/utils/formatters';
import { RaceReview, RaceSplit, RaceDistance } from '@/types';
import { DISTANCE_CONFIG } from '@/utils/paceCalculations';

type TabType = 'list' | 'import' | 'detail';

export default function RaceReviewPage() {
  const { raceReviews, addRaceReview, deleteRaceReview } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedReview, setSelectedReview] = useState<RaceReview | null>(null);
  
  const [newReview, setNewReview] = useState({
    date: new Date().toISOString().split('T')[0],
    raceName: '',
    distance: 'half' as RaceDistance,
    totalTime: '01:30:00',
    temperature: 20,
    humidity: 60,
    strategyNotes: '',
    lessonsLearned: ''
  });
  
  const [splitsInput, setSplitsInput] = useState('');

  const parseSplits = (input: string): RaceSplit[] => {
    const lines = input.trim().split('\n').filter(l => l.trim());
    const splits: RaceSplit[] = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(/[,\s]+/).filter(p => p.trim());
      const km = index + 1;
      
      let paceStr = parts.find(p => p.includes(':')) || '0:00';
      if (paceStr.split(':').length === 2) {
        const [min, sec] = paceStr.split(':').map(Number);
        const paceSeconds = (min || 0) * 60 + (sec || 0);
        
        splits.push({
          km,
          time: paceStr,
          timeInSeconds: paceSeconds,
          pace: paceStr,
          paceInSeconds: paceSeconds,
          elevation: 0,
          heartRate: 0
        });
      }
    });
    
    return splits;
  };

  const handleSaveReview = () => {
    const splits = parseSplits(splitsInput);
    
    if (splits.length === 0) {
      alert('请输入至少一段配速数据');
      return;
    }
    
    const paceSecondsList = splits.map(s => s.paceInSeconds).filter(s => s > 0);
    const avgPace = paceSecondsList.length > 0 
      ? paceSecondsList.reduce((a, b) => a + b, 0) / paceSecondsList.length 
      : 0;
    
    const fastestIndex = paceSecondsList.indexOf(Math.min(...paceSecondsList));
    const slowestIndex = paceSecondsList.indexOf(Math.max(...paceSecondsList));
    
    const review: RaceReview = {
      id: generateId(),
      date: newReview.date,
      raceName: newReview.raceName || DISTANCE_CONFIG[newReview.distance].name,
      distance: newReview.distance,
      distanceName: DISTANCE_CONFIG[newReview.distance].name,
      totalTime: newReview.totalTime,
      totalTimeSeconds: parseTimeToSeconds(newReview.totalTime),
      splits,
      weather: {
        temperature: newReview.temperature,
        humidity: newReview.humidity
      },
      strategyNotes: newReview.strategyNotes,
      lessonsLearned: newReview.lessonsLearned,
      averagePace: secondsToPace(avgPace),
      fastestKm: {
        km: splits[fastestIndex]?.km || 0,
        pace: splits[fastestIndex]?.pace || '--:--'
      },
      slowestKm: {
        km: splits[slowestIndex]?.km || 0,
        pace: splits[slowestIndex]?.pace || '--:--'
      }
    };
    
    addRaceReview(review);
    setActiveTab('list');
    setNewReview({
      date: new Date().toISOString().split('T')[0],
      raceName: '',
      distance: 'half',
      totalTime: '01:30:00',
      temperature: 20,
      humidity: 60,
      strategyNotes: '',
      lessonsLearned: ''
    });
    setSplitsInput('');
  };

  function parseTimeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  const chartData = useMemo(() => {
    if (!selectedReview) return [];
    return selectedReview.splits.map(split => ({
      name: `${split.km}K`,
      km: split.km,
      pace: split.paceInSeconds / 60,
      paceDisplay: split.pace,
      heartRate: split.heartRate
    }));
  }, [selectedReview]);

  const avgPaceMinutes = useMemo(() => {
    if (!selectedReview || selectedReview.splits.length === 0) return 0;
    const total = selectedReview.splits.reduce((sum, s) => sum + s.paceInSeconds, 0);
    return (total / selectedReview.splits.length) / 60;
  }, [selectedReview]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-secondary-800">{label}</p>
          <p className="text-primary-600">配速: {payload[0]?.payload?.paceDisplay}</p>
          {payload[0]?.payload?.heartRate > 0 && (
            <p className="text-red-500">心率: {payload[0]?.payload?.heartRate} bpm</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">比赛复盘</h1>
        <p className="text-secondary-500">分析你的比赛配速，总结经验提升表现</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setActiveTab('list'); setSelectedReview(null); }}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
          }`}
        >
          <BarChart2 size={20} />
          <span>比赛列表 ({raceReviews.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('import'); setSelectedReview(null); }}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'import'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
          }`}
        >
          <Upload size={20} />
          <span>添加复盘</span>
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4">
          {raceReviews.length === 0 ? (
            <div className="card text-center py-12">
              <BarChart2 className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-bold text-secondary-700 mb-2">暂无比赛复盘</h3>
              <p className="text-secondary-500 mb-4">记录你的比赛，分析配速策略</p>
              <button
                onClick={() => setActiveTab('import')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>添加第一个比赛</span>
              </button>
            </div>
          ) : (
            raceReviews.map((review) => (
              <div
                key={review.id}
                className="card cursor-pointer hover:border-primary-300 transition-all"
                onClick={() => { setSelectedReview(review); setActiveTab('detail'); }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-secondary-800">{review.raceName}</h3>
                      <span className="badge bg-primary-100 text-primary-600">{review.distanceName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {review.date}
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        总用时 {review.totalTime}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        平均配速 {review.averagePace}/km
                      </span>
                      <span className="flex items-center">
                        <Thermometer className="w-4 h-4 mr-1" />
                        {review.weather.temperature}°C
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="text-xs text-emerald-600">最快公里</div>
                        <div className="font-bold text-emerald-700">
                          K{review.fastestKm.km} - {review.fastestKm.pace}
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="text-xs text-amber-600">最慢公里</div>
                        <div className="font-bold text-amber-700">
                          K{review.slowestKm.km} - {review.slowestKm.pace}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600">分段数据</div>
                        <div className="font-bold text-blue-700">{review.splits.length} 公里</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-xs text-purple-600">湿度</div>
                        <div className="font-bold text-purple-700">{review.weather.humidity}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个比赛复盘吗？')) {
                        deleteRaceReview(review.id);
                      }
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'import' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="section-title">比赛信息</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">比赛日期</label>
                  <input
                    type="date"
                    value={newReview.date}
                    onChange={(e) => setNewReview({...newReview, date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">比赛距离</label>
                  <select
                    value={newReview.distance}
                    onChange={(e) => setNewReview({...newReview, distance: e.target.value as RaceDistance})}
                    className="select-field"
                  >
                    <option value="10km">10公里</option>
                    <option value="half">半程马拉松</option>
                    <option value="full">全程马拉松</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="label">比赛名称</label>
                <input
                  type="text"
                  value={newReview.raceName}
                  onChange={(e) => setNewReview({...newReview, raceName: e.target.value})}
                  placeholder="例如：北京马拉松"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="label">总完赛时间 (HH:MM:SS)</label>
                <input
                  type="text"
                  value={newReview.totalTime}
                  onChange={(e) => setNewReview({...newReview, totalTime: e.target.value})}
                  placeholder="例如: 03:30:00"
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center">
                    <Thermometer className="w-4 h-4 mr-1" />
                    气温 (°C)
                  </label>
                  <input
                    type="number"
                    value={newReview.temperature}
                    onChange={(e) => setNewReview({...newReview, temperature: Number(e.target.value)})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label flex items-center">
                    <Droplets className="w-4 h-4 mr-1" />
                    湿度 (%)
                  </label>
                  <input
                    type="number"
                    value={newReview.humidity}
                    onChange={(e) => setNewReview({...newReview, humidity: Number(e.target.value)})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">比赛策略</label>
                <textarea
                  value={newReview.strategyNotes}
                  onChange={(e) => setNewReview({...newReview, strategyNotes: e.target.value})}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="描述你的比赛策略..."
                />
              </div>
              
              <div>
                <label className="label">经验教训</label>
                <textarea
                  value={newReview.lessonsLearned}
                  onChange={(e) => setNewReview({...newReview, lessonsLearned: e.target.value})}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="这次比赛学到了什么..."
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">分段配速数据</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">每公里配速</label>
                <textarea
                  value={splitsInput}
                  onChange={(e) => setSplitsInput(e.target.value)}
                  rows={10}
                  className="input-field resize-none font-mono text-sm"
                  placeholder={`每行输入一个公里配速，例如：\n5:30\n5:25\n5:28\n5:32\n...\n\n或使用逗号分隔：\n1,5:30\n2,5:25\n3,5:28`}
                />
              </div>
              
              <div className="bg-secondary-800 text-white rounded-xl p-4">
                <h4 className="font-bold mb-2">数据格式说明</h4>
                <ul className="text-sm text-secondary-300 space-y-1">
                  <li>• 每行一个配速，格式为 M:SS 或 MM:SS</li>
                  <li>• 按比赛顺序输入，从第1公里开始</li>
                  <li>• 示例：5:30 表示每公里5分30秒</li>
                </ul>
              </div>
              
              <button
                onClick={handleSaveReview}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <SaveIcon />
                <span>保存比赛复盘</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detail' && selectedReview && (
        <div className="space-y-6">
          <button
            onClick={() => { setActiveTab('list'); setSelectedReview(null); }}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
          >
            <span>← 返回列表</span>
          </button>
          
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-secondary-800">{selectedReview.raceName}</h2>
                  <span className="badge bg-primary-100 text-primary-600">{selectedReview.distanceName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-secondary-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedReview.date}
                  </span>
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    总用时 {selectedReview.totalTime}
                  </span>
                  <span className="flex items-center">
                    <Thermometer className="w-4 h-4 mr-1" />
                    {selectedReview.weather.temperature}°C / {selectedReview.weather.humidity}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
                <div className="text-sm text-secondary-500">平均配速</div>
                <div className="text-3xl font-bold text-primary-600">{selectedReview.averagePace}</div>
                <div className="text-xs text-secondary-400">分钟/公里</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 border border-emerald-100">
                <div className="text-sm text-secondary-500">最快公里</div>
                <div className="text-2xl font-bold text-emerald-600">K{selectedReview.fastestKm.km}</div>
                <div className="text-lg font-bold text-emerald-700">{selectedReview.fastestKm.pace}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 border border-amber-100">
                <div className="text-sm text-secondary-500">最慢公里</div>
                <div className="text-2xl font-bold text-amber-600">K{selectedReview.slowestKm.km}</div>
                <div className="text-lg font-bold text-amber-700">{selectedReview.slowestKm.pace}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-secondary-500">分段数</div>
                <div className="text-3xl font-bold text-blue-600">{selectedReview.splits.length}</div>
                <div className="text-xs text-secondary-400">公里数据</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-secondary-800 mb-4">配速变化图</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    label={{ value: '配速 (分钟/km)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    y={avgPaceMinutes} 
                    stroke="#FF6B35" 
                    strokeDasharray="5 5"
                    label={{ value: '平均', fill: '#FF6B35', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#FF6B35" 
                    strokeWidth={3}
                    dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FF6B35' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">配速分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="pace" 
                      fill="#FF6B35" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">策略评估</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-secondary-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>配速稳定性</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">配速较为稳定，后半程略有掉速</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-700 mb-2">比赛策略</h4>
                  <p className="text-sm text-secondary-600">{selectedReview.strategyNotes || '无记录'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-700 mb-2">经验教训</h4>
                  <p className="text-sm text-secondary-600">{selectedReview.lessonsLearned || '无记录'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-secondary-800 mb-4">详细分段数据</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">公里</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">用时</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">配速</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">与平均差异</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReview.splits.map((split, index) => {
                    const diff = split.paceInSeconds - (avgPaceMinutes * 60);
                    const isFaster = diff < 0;
                    return (
                      <tr
                        key={split.km}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium text-secondary-800">{split.km}km</td>
                        <td className="py-3 px-4 text-secondary-600">{split.time}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-primary-600">{split.pace}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                            Math.abs(diff) < 10 ? 'bg-emerald-100 text-emerald-700' :
                            isFaster ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isFaster ? '-' : '+'}{Math.abs(diff).toFixed(0)}秒
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}
