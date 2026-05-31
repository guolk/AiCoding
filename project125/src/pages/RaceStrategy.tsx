import { useState, useMemo } from 'react';
import {
  Target,
  Clock,
  Droplets,
  AlertTriangle,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import {
  calculateSegmentStrategy,
  getEmergencyPlan,
  DISTANCE_CONFIG
} from '@/utils/paceCalculations';
import { secondsToPace, generateId } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';
import { RacePlan, RaceSegment, AidStation, RaceDistance } from '@/types';

type StrategyType = 'negative' | 'positive' | 'even';

const strategyOptions = [
  { value: 'negative' as StrategyType, label: '负配速', description: '前慢后快，后半程加速' },
  { value: 'even' as StrategyType, label: '匀速', description: '全程保持稳定配速' },
  { value: 'positive' as StrategyType, label: '正配速', description: '前快后慢，适合短距离' }
];

const defaultEmergencyPlans = {
  mild: '轻度不适：放慢配速，深呼吸，检查补水',
  moderate: '中度不适：降速25%或步行，补充能量',
  severe: '严重不适：立即停止，寻求医疗帮助'
};

export default function RaceStrategy() {
  const racePlans = useAppStore((s) => s.racePlans) || [];
  const addRacePlan = useAppStore((s) => s.addRacePlan);
  const deleteRacePlan = useAppStore((s) => s.deleteRacePlan);

  const [activeTab, setActiveTab] = useState<'plan' | 'existing'>('plan');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [raceName, setRaceName] = useState('');
  const [raceDate, setRaceDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [selectedDistance, setSelectedDistance] = useState<RaceDistance>('full');

  const [targetHours, setTargetHours] = useState(3);
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [targetSeconds, setTargetSeconds] = useState(0);

  const [strategy, setStrategy] = useState<StrategyType>('negative');
  const [currentPace, setCurrentPace] = useState('5:30');
  const [distressLevel, setDistressLevel] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [customEmergency, setCustomEmergency] = useState(defaultEmergencyPlans.mild);

  const [segments, setSegments] = useState<RaceSegment[]>([
    { name: '热身段', startKm: 0, endKm: 5, targetPace: '5:30', targetPaceSeconds: 330, notes: '保持轻松节奏' },
    { name: '稳定段', startKm: 5, endKm: 20, targetPace: '5:20', targetPaceSeconds: 320, notes: '找到舒适节奏' },
    { name: '关键段', startKm: 20, endKm: 35, targetPace: '5:20', targetPaceSeconds: 320, notes: '心理临界点' },
    { name: '冲刺段', startKm: 35, endKm: 42.195, targetPace: '5:15', targetPaceSeconds: 315, notes: '保持专注' }
  ]);

  const [aidStations, setAidStations] = useState<AidStation[]>([
    { km: 5, water: true, gel: false, electrolytes: false, notes: '补水' },
    { km: 10, water: true, gel: true, electrolytes: true, notes: '能量胶' },
    { km: 15, water: true, gel: false, electrolytes: false, notes: '补水' },
    { km: 20, water: true, gel: true, electrolytes: true, notes: '能量胶' },
    { km: 25, water: true, gel: false, electrolytes: false, notes: '补水' },
    { km: 30, water: true, gel: true, electrolytes: true, notes: '能量胶' },
    { km: 35, water: true, gel: false, electrolytes: false, notes: '补水' },
    { km: 40, water: true, gel: true, electrolytes: true, notes: '最后能量' }
  ]);

  const basePaceSeconds = useMemo(() => {
    const totalSeconds = targetHours * 3600 + targetMinutes * 60 + targetSeconds;
    const distKm = DISTANCE_CONFIG[selectedDistance]?.km || 0;
    return distKm > 0 ? totalSeconds / distKm : 0;
  }, [targetHours, targetMinutes, targetSeconds, selectedDistance]);

  const segmentStrategy = useMemo(() => {
    if (basePaceSeconds <= 0) {
      return { firstHalfPace: '--:--', firstHalfPaceSeconds: 0, secondHalfPace: '--:--', secondHalfPaceSeconds: 0, explanation: '请输入目标完赛时间' };
    }
    return calculateSegmentStrategy(basePaceSeconds, selectedDistance, strategy);
  }, [basePaceSeconds, selectedDistance, strategy]);

  const currentPaceSeconds = useMemo(() => {
    const parts = currentPace.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }, [currentPace]);

  const emergencyPlan = useMemo(() => {
    return getEmergencyPlan(currentPaceSeconds, distressLevel);
  }, [currentPaceSeconds, distressLevel]);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSegment = () => {
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return;
    const newEnd = Math.min(lastSegment.endKm + 5, DISTANCE_CONFIG[selectedDistance]?.km || 50);
    setSegments([...segments, {
      name: `分段 ${segments.length + 1}`,
      startKm: lastSegment.endKm,
      endKm: newEnd,
      targetPace: secondsToPace(basePaceSeconds),
      targetPaceSeconds: basePaceSeconds,
      notes: ''
    }]);
  };

  const handleRemoveSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const handleAddAidStation = () => {
    const lastStation = aidStations[aidStations.length - 1];
    setAidStations([...aidStations, {
      km: lastStation ? lastStation.km + 5 : 5,
      water: true,
      gel: false,
      electrolytes: false,
      notes: ''
    }]);
  };

  const handleRemoveAidStation = (index: number) => {
    setAidStations(aidStations.filter((_, i) => i !== index));
  };

  const handleSavePlan = () => {
    const totalTargetSeconds = targetHours * 3600 + targetMinutes * 60 + targetSeconds;
    if (totalTargetSeconds <= 0) {
      showToast('请输入有效的目标完赛时间', 'error');
      return;
    }

    const newPlan: RacePlan = {
      id: generateId(),
      raceName: raceName || `${DISTANCE_CONFIG[selectedDistance]?.name || '比赛'}计划`,
      date: raceDate,
      distance: selectedDistance,
      distanceName: DISTANCE_CONFIG[selectedDistance]?.name || '未知距离',
      targetFinishTime: `${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}:${targetSeconds.toString().padStart(2, '0')}`,
      targetFinishTimeSeconds: totalTargetSeconds,
      averagePace: secondsToPace(basePaceSeconds),
      strategy,
      strategyName: strategyOptions.find(s => s.value === strategy)?.label || '',
      segments,
      aidStations,
      emergencyPlan: customEmergency,
      createdAt: new Date().toISOString()
    };

    try {
      addRacePlan(newPlan);
      showToast('比赛计划创建成功！', 'success');
      setRaceName('');

      setTimeout(() => {
        setActiveTab('existing');
      }, 800);
    } catch (err) {
      showToast('创建失败，请重试', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toastMessage && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl"
          style={{
            backgroundColor: toastMessage.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white',
            transition: 'all 0.3s ease',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <span className="font-medium text-lg">{toastMessage.text}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">比赛策略规划</h1>
        <p className="text-secondary-500">制定专业的比赛策略，科学规划分段配速和补给</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'plan'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
          }`}
        >
          <Target size={20} />
          <span>创建计划</span>
        </button>
        <button
          onClick={() => setActiveTab('existing')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'existing'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
          }`}
        >
          <Clock size={20} />
          <span>已有计划 ({racePlans.length})</span>
        </button>
      </div>

      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title">基本信息</h2>

              <div className="space-y-5">
                <div>
                  <label className="label">比赛名称</label>
                  <input
                    type="text"
                    value={raceName}
                    onChange={(e) => setRaceName(e.target.value)}
                    placeholder="例如：上海国际马拉松"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">比赛日期</label>
                    <input
                      type="date"
                      value={raceDate}
                      onChange={(e) => setRaceDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">比赛距离</label>
                    <select
                      value={selectedDistance}
                      onChange={(e) => setSelectedDistance(e.target.value as RaceDistance)}
                      className="select-field"
                    >
                      <option value="10km">10公里</option>
                      <option value="half">半程马拉松</option>
                      <option value="full">全程马拉松</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">目标完赛时间</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={targetHours}
                        onChange={(e) => setTargetHours(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">小时</div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={targetMinutes}
                        onChange={(e) => setTargetMinutes(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">分钟</div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={targetSeconds}
                        onChange={(e) => setTargetSeconds(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">秒</div>
                    </div>
                  </div>
                </div>

                {basePaceSeconds > 0 && (
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="text-sm text-secondary-500">平均配速</div>
                    <div className="text-3xl font-bold text-primary-600">
                      {secondsToPace(basePaceSeconds)}
                      <span className="text-sm font-normal text-secondary-400 ml-2">分钟/公里</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">配速策略</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {strategyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStrategy(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        strategy === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className={`font-bold ${
                        strategy === option.value ? 'text-primary-600' : 'text-secondary-700'
                      }`}>{option.label}</div>
                      <div className="text-xs text-secondary-500 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary-100">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-secondary-500">前半程配速</div>
                      <div className="text-xl font-bold text-primary-600">{segmentStrategy.firstHalfPace}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-secondary-500">后半程配速</div>
                      <div className="text-xl font-bold text-secondary-800">{segmentStrategy.secondHalfPace}</div>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    {segmentStrategy.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">分段配速计划</h2>
              <button
                onClick={handleAddSegment}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus size={18} />
                <span>添加分段</span>
              </button>
            </div>

            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-6 gap-3">
                    <input
                      type="text"
                      value={segment.name}
                      onChange={(e) => {
                        const updated = [...segments];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setSegments(updated);
                      }}
                      placeholder="分段名称"
                      className="input-field col-span-2 text-sm py-2"
                    />
                    <div className="flex items-center space-x-2 col-span-2">
                      <input
                        type="number"
                        step="0.1"
                        value={segment.startKm}
                        onChange={(e) => {
                          const updated = [...segments];
                          updated[index] = { ...updated[index], startKm: Number(e.target.value) };
                          setSegments(updated);
                        }}
                        className="input-field text-center text-sm py-2"
                      />
                      <ChevronRight size={16} className="text-secondary-400" />
                      <input
                        type="number"
                        step="0.1"
                        value={segment.endKm}
                        onChange={(e) => {
                          const updated = [...segments];
                          updated[index] = { ...updated[index], endKm: Number(e.target.value) };
                          setSegments(updated);
                        }}
                        className="input-field text-center text-sm py-2"
                      />
                    </div>
                    <input
                      type="text"
                      value={segment.targetPace}
                      onChange={(e) => {
                        const updated = [...segments];
                        updated[index] = { ...updated[index], targetPace: e.target.value };
                        setSegments(updated);
                      }}
                      placeholder="配速"
                      className="input-field text-center text-sm py-2"
                    />
                    <input
                      type="text"
                      value={segment.notes}
                      onChange={(e) => {
                        const updated = [...segments];
                        updated[index] = { ...updated[index], notes: e.target.value };
                        setSegments(updated);
                      }}
                      placeholder="备注"
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveSegment(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">补给站计划</h2>
              <button
                onClick={handleAddAidStation}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus size={18} />
                <span>添加补给站</span>
              </button>
            </div>

            <div className="space-y-3">
              {aidStations.map((station, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Droplets size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-6 gap-3 items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-secondary-500">公里</span>
                      <input
                        type="number"
                        step="0.5"
                        value={station.km}
                        onChange={(e) => {
                          const updated = [...aidStations];
                          updated[index] = { ...updated[index], km: Number(e.target.value) };
                          setAidStations(updated);
                        }}
                        className="input-field text-center text-sm py-2 w-20"
                      />
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={station.water}
                        onChange={(e) => {
                          const updated = [...aidStations];
                          updated[index] = { ...updated[index], water: e.target.checked };
                          setAidStations(updated);
                        }}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="text-sm text-secondary-600">水</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={station.gel}
                        onChange={(e) => {
                          const updated = [...aidStations];
                          updated[index] = { ...updated[index], gel: e.target.checked };
                          setAidStations(updated);
                        }}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="text-sm text-secondary-600">能量胶</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={station.electrolytes}
                        onChange={(e) => {
                          const updated = [...aidStations];
                          updated[index] = { ...updated[index], electrolytes: e.target.checked };
                          setAidStations(updated);
                        }}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="text-sm text-secondary-600">电解质</span>
                    </label>
                    <input
                      type="text"
                      value={station.notes}
                      onChange={(e) => {
                        const updated = [...aidStations];
                        updated[index] = { ...updated[index], notes: e.target.value };
                        setAidStations(updated);
                      }}
                      placeholder="备注"
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveAidStation(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-secondary-800 text-white rounded-xl">
              <h4 className="font-bold mb-2">补给建议</h4>
              <ul className="text-sm text-secondary-300 space-y-1 list-disc list-inside">
                <li>每5公里建议补水</li>
                <li>每45-60分钟补充能量胶（约7-10公里）</li>
                <li>高温天气增加电解质补充</li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title">应急预案</h2>

              <div className="space-y-5">
                <div>
                  <label className="label">当前目标配速</label>
                  <input
                    type="text"
                    value={currentPace}
                    onChange={(e) => setCurrentPace(e.target.value)}
                    placeholder="例如: 5:30"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">不适程度</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'mild' as const, label: '轻度', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                      { value: 'moderate' as const, label: '中度', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                      { value: 'severe' as const, label: '严重', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => {
                          setDistressLevel(level.value);
                          setCustomEmergency(defaultEmergencyPlans[level.value]);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          distressLevel === level.value
                            ? `${level.bg} ${level.border}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <AlertTriangle size={20} className={`mx-auto mb-1 ${level.color}`} />
                        <div className={`font-medium ${distressLevel === level.value ? level.color : 'text-secondary-600'}`}>
                          {level.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${
                  distressLevel === 'severe' ? 'bg-red-50 border-2 border-red-200' :
                  distressLevel === 'moderate' ? 'bg-orange-50 border-2 border-orange-200' :
                  'bg-amber-50 border-2 border-amber-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle size={24} className={`mt-0.5 ${
                      distressLevel === 'severe' ? 'text-red-500' :
                      distressLevel === 'moderate' ? 'text-orange-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <div className={`font-bold ${
                        distressLevel === 'severe' ? 'text-red-700' :
                        distressLevel === 'moderate' ? 'text-orange-700' : 'text-amber-700'
                      }`}>
                        {emergencyPlan.warning}
                      </div>
                      <div className="text-sm text-secondary-600 mt-1">
                        建议配速：<span className="font-bold">{emergencyPlan.recommendedPace}</span>
                      </div>
                      <ul className="text-sm text-secondary-600 mt-2 space-y-1 list-disc list-inside">
                        {emergencyPlan.actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <h2 className="section-title">保存计划</h2>

              <div className="space-y-4">
                <div>
                  <label className="label">应急预案备注</label>
                  <textarea
                    value={customEmergency}
                    onChange={(e) => setCustomEmergency(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="记录你的个人应急预案..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Save size={22} />
                  <span>创建比赛计划</span>
                </button>

                <p className="text-center text-sm text-secondary-400">
                  点击后将保存计划并跳转到"已有计划"列表
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'existing' && (
        <div className="space-y-4">
          {racePlans.length === 0 ? (
            <div className="card text-center py-12">
              <Target className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-bold text-secondary-700 mb-2">暂无比赛计划</h3>
              <p className="text-secondary-500 mb-6">创建你的第一个比赛计划吧</p>
              <button
                onClick={() => setActiveTab('plan')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>创建计划</span>
              </button>
            </div>
          ) : (
            racePlans.map((plan) => (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-secondary-800">{plan.raceName}</h3>
                      <span className="badge bg-primary-100 text-primary-600">{plan.distanceName}</span>
                      <span className="badge bg-emerald-100 text-emerald-600">{plan.strategyName}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-secondary-500">
                      <span>{plan.date}</span>
                      <span>目标 {plan.targetFinishTime}</span>
                      <span>平均配速 {plan.averagePace}/km</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-secondary-700 mb-2">分段计划 ({(plan.segments || []).length}段)</h4>
                        <div className="space-y-2">
                          {(plan.segments || []).slice(0, 3).map((seg, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-secondary-600">{seg.name}</span>
                              <span className="font-medium text-primary-600">{seg.targetPace}/km</span>
                            </div>
                          ))}
                          {(plan.segments || []).length > 3 && (
                            <div className="text-xs text-secondary-400">还有 {(plan.segments || []).length - 3} 段...</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-medium text-secondary-700 mb-2">补给站 ({(plan.aidStations || []).length}个)</h4>
                        <div className="flex flex-wrap gap-2">
                          {(plan.aidStations || []).slice(0, 5).map((station, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs">
                              {station.km}km
                            </span>
                          ))}
                          {(plan.aidStations || []).length > 5 && (
                            <span className="text-xs text-secondary-400">+{(plan.aidStations || []).length - 5}个</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <button className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('确定要删除这个比赛计划吗？')) {
                          deleteRacePlan(plan.id);
                        }
                      }}
                      className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
