import { useState, useMemo } from 'react';
import {
  Dumbbell,
  Clock,
  Sun,
  CloudRain,
  Leaf,
  Snowflake,
  Heart,
  Zap,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { calculateTrainingZones } from '@/utils/danielsFormula';
import { getSeasonalAdjustment } from '@/utils/paceCalculations';
import { secondsToPace, generateId, calculatePaceDifference } from '@/utils/formatters';
import { TrainingRecord, TrainingType } from '@/types';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const trainingTypeOptions = [
  { value: 'easy' as TrainingType, label: '轻松跑', color: 'bg-emerald-500' },
  { value: 'marathon' as TrainingType, label: '马拉松配速', color: 'bg-primary-500' },
  { value: 'threshold' as TrainingType, label: '乳酸阈值', color: 'bg-amber-500' },
  { value: 'interval' as TrainingType, label: '间歇跑', color: 'bg-orange-500' },
  { value: 'repetition' as TrainingType, label: '重复跑', color: 'bg-red-500' },
  { value: 'long' as TrainingType, label: '长距离', color: 'bg-blue-500' }
];

const seasonOptions = [
  { value: 'spring' as Season, label: '春季', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { value: 'summer' as Season, label: '夏季', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'autumn' as Season, label: '秋季', icon: CloudRain, color: 'text-amber-500', bg: 'bg-amber-50' },
  { value: 'winter' as Season, label: '冬季', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50' }
];

export default function Training() {
  const { userProfile, trainingRecords, addTrainingRecord, deleteTrainingRecord, updateUserProfile } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'zones' | 'records' | 'seasonal'>('zones');
  
  const [vdot, setVdot] = useState(userProfile.vdot);
  const [maxHR, setMaxHR] = useState(userProfile.maxHeartRate);
  
  const [season, setSeason] = useState<Season>('summer');
  const [currentPace, setCurrentPace] = useState('5:30');
  
  const [newTraining, setNewTraining] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'easy' as TrainingType,
    distance: 8,
    targetPace: '6:00',
    actualPace: '6:00',
    targetHR: 140,
    actualHR: 140,
    notes: ''
  });

  const trainingZones = useMemo(() => {
    return calculateTrainingZones(vdot, maxHR);
  }, [vdot, maxHR]);

  const currentPaceSeconds = useMemo(() => {
    const [min, sec] = currentPace.split(':').map(Number);
    return (min || 0) * 60 + (sec || 0);
  }, [currentPace]);

  const seasonalAdjustment = useMemo(() => {
    return getSeasonalAdjustment(season, currentPaceSeconds);
  }, [season, currentPaceSeconds]);

  const handleSaveVDOT = () => {
    updateUserProfile({ vdot, maxHeartRate: maxHR });
  };

  const handleAddTraining = () => {
    const typeOption = trainingTypeOptions.find(t => t.value === newTraining.type);
    const record: TrainingRecord = {
      id: generateId(),
      date: newTraining.date,
      type: newTraining.type,
      typeName: typeOption?.label || '',
      distance: newTraining.distance,
      targetPace: newTraining.targetPace,
      targetPaceSeconds: parsePaceToSeconds(newTraining.targetPace),
      actualPace: newTraining.actualPace,
      actualPaceSeconds: parsePaceToSeconds(newTraining.actualPace),
      targetHeartRate: newTraining.targetHR,
      actualHeartRate: newTraining.actualHR,
      notes: newTraining.notes
    };
    addTrainingRecord(record);
    setNewTraining({
      date: new Date().toISOString().split('T')[0],
      type: 'easy',
      distance: 8,
      targetPace: '6:00',
      actualPace: '6:00',
      targetHR: 140,
      actualHR: 140,
      notes: ''
    });
  };

  function parsePaceToSeconds(pace: string): number {
    const [min, sec] = pace.split(':').map(Number);
    return (min || 0) * 60 + (sec || 0);
  }

  const tabs = [
    { id: 'zones' as const, label: '训练配速区间', icon: Heart },
    { id: 'records' as const, label: '训练记录对比', icon: Clock },
    { id: 'seasonal' as const, label: '季节性调整', icon: Sun }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">训练配速管理</h1>
        <p className="text-secondary-500">科学管理你的训练配速区间和训练记录</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card">
              <h2 className="section-title">个人设置</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="label">VDOT值</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="30"
                      max="85"
                      step="0.5"
                      value={vdot}
                      onChange={(e) => setVdot(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">
                    可通过成绩预测模块计算你的VDOT
                  </p>
                </div>
                
                <div>
                  <label className="label">最高心率 (bpm)</label>
                  <input
                    type="number"
                    min="120"
                    max="220"
                    value={maxHR}
                    onChange={(e) => setMaxHR(Number(e.target.value))}
                    className="input-field"
                  />
                  <p className="text-xs text-secondary-400 mt-1">
                    一般为 220 - 年龄
                  </p>
                </div>
                
                <button
                  onClick={handleSaveVDOT}
                  className="w-full btn-primary"
                >
                  保存设置
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {trainingZones.map((zone, index) => (
                <div
                  key={zone.type}
                  className="card overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${zone.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-secondary-800">{zone.name}</h3>
                      <p className="text-sm text-secondary-500">{zone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-secondary-400">配速范围</div>
                      <div className="font-bold text-primary-600">
                        {zone.paceRange.min} ~ {zone.paceRange.max}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-secondary-400">心率范围</div>
                      <div className="font-bold text-secondary-800">
                        {zone.heartRateRange.min} ~ {zone.heartRateRange.max} bpm
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-secondary-400">主观强度</div>
                      <div className="font-bold text-secondary-800">{zone.perceivedEffort}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-secondary-400">训练类型</div>
                      <div className="font-bold text-secondary-800">{zone.type === 'easy' ? '恢复/基础耐力' : zone.type === 'marathon' ? '长距离配速' : zone.type === 'threshold' ? '乳酸阈值' : zone.type === 'interval' ? 'VO2max间歇' : '速度训练'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title">添加训练记录</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">训练日期</label>
                <input
                  type="date"
                  value={newTraining.date}
                  onChange={(e) => setNewTraining({...newTraining, date: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">训练类型</label>
                <select
                  value={newTraining.type}
                  onChange={(e) => setNewTraining({...newTraining, type: e.target.value as TrainingType})}
                  className="select-field"
                >
                  {trainingTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">距离 (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newTraining.distance}
                  onChange={(e) => setNewTraining({...newTraining, distance: Number(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">目标心率</label>
                <input
                  type="number"
                  value={newTraining.targetHR}
                  onChange={(e) => setNewTraining({...newTraining, targetHR: Number(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">目标配速</label>
                <input
                  type="text"
                  value={newTraining.targetPace}
                  onChange={(e) => setNewTraining({...newTraining, targetPace: e.target.value})}
                  placeholder="例如: 5:30"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">实际配速</label>
                <input
                  type="text"
                  value={newTraining.actualPace}
                  onChange={(e) => setNewTraining({...newTraining, actualPace: e.target.value})}
                  placeholder="例如: 5:30"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">实际心率</label>
                <input
                  type="number"
                  value={newTraining.actualHR}
                  onChange={(e) => setNewTraining({...newTraining, actualHR: Number(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddTraining}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>添加记录</span>
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">训练记录 ({trainingRecords.length})</h2>
            
            {trainingRecords.length === 0 ? (
              <div className="text-center py-12 text-secondary-400">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>暂无训练记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">日期</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">距离</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">目标配速</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">实际配速</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">偏差</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">心率</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingRecords.map((record) => {
                      const diff = calculatePaceDifference(record.targetPaceSeconds, record.actualPaceSeconds);
                      const typeOption = trainingTypeOptions.find(t => t.value === record.type);
                      return (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-secondary-700">{record.date}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white ${typeOption?.color || 'bg-gray-500'}`}>
                              {record.typeName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-secondary-700">{record.distance}km</td>
                          <td className="py-3 px-4 text-secondary-700 font-medium">{record.targetPace}</td>
                          <td className="py-3 px-4 font-bold text-primary-600">{record.actualPace}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                              diff.status === 'on' ? 'bg-emerald-100 text-emerald-700' :
                              diff.status === 'fast' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {diff.status === 'on' ? '达标' : diff.isFaster ? '快' : '慢'} {diff.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-secondary-700">{record.targetHeartRate} → {record.actualHeartRate}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这条记录吗？')) {
                                  deleteTrainingRecord(record.id);
                                }
                              }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title">季节选择</h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {seasonOptions.map((s) => {
                    const Icon = s.icon;
                    const isActive = season === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setSeason(s.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? `${s.bg} border-primary-500`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={28} className={`mx-auto mb-2 ${isActive ? s.color : 'text-secondary-400'}`} />
                        <div className={`font-medium ${isActive ? 'text-secondary-800' : 'text-secondary-500'}`}>
                          {s.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div>
                  <label className="label">当前配速 (分钟/公里)</label>
                  <input
                    type="text"
                    value={currentPace}
                    onChange={(e) => setCurrentPace(e.target.value)}
                    placeholder="例如: 5:30"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <h2 className="section-title">季节性调整建议</h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-sm text-secondary-500 mb-1">原始配速</div>
                    <div className="text-2xl font-bold text-secondary-800">{currentPace}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-sm text-secondary-500 mb-1">调整幅度</div>
                    <div className={`text-2xl font-bold ${seasonalAdjustment.adjustmentPercent > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {seasonalAdjustment.adjustmentPercent > 0 ? '+' : ''}{seasonalAdjustment.adjustmentPercent}%
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-sm text-secondary-500 mb-1">建议配速</div>
                    <div className="text-2xl font-bold text-primary-600">{seasonalAdjustment.adjustedPace}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-secondary-800 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary-500" />
                    训练建议
                  </h4>
                  <ul className="space-y-2">
                    {seasonalAdjustment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-secondary-600">
                        <CheckIcon />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-amber-700 mb-2">
                      <TrendingUp size={20} />
                      <span className="font-medium">夏季高温影响</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      每升高5°C，配速可能慢2-3%。建议选择早晚训练，增加补水频率。
                    </p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-blue-700 mb-2">
                      <TrendingDown size={20} />
                      <span className="font-medium">冬季低温影响</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      肌肉粘滞性增加，需更长热身时间。注意保暖和肌肉激活。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
