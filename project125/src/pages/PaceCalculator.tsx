import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  MapPin
} from 'lucide-react';
import {
  calculatePaceFromFinishTime,
  calculateGradientAdjustment,
  calculateEnvironmentAdjustment,
  DISTANCE_CONFIG
} from '@/utils/paceCalculations';
import { RaceDistance, PaceResult } from '@/types';

type DistanceOption = '10km' | 'half' | 'full';

export default function PaceCalculator() {
  const [activeTab, setActiveTab] = useState<'finish' | 'gradient' | 'environment'>('finish');
  
  const [finishHours, setFinishHours] = useState(3);
  const [finishMinutes, setFinishMinutes] = useState(30);
  const [finishSeconds, setFinishSeconds] = useState(0);
  const [selectedDistance, setSelectedDistance] = useState<RaceDistance>('full');
  
  const [basePaceMin, setBasePaceMin] = useState(5);
  const [basePaceSec, setBasePaceSec] = useState(30);
  const [gradient, setGradient] = useState(2);
  
  const [envBasePaceMin, setEnvBasePaceMin] = useState(5);
  const [envBasePaceSec, setEnvBasePaceSec] = useState(30);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(70);

  const paceResult: PaceResult = useMemo(() => {
    return calculatePaceFromFinishTime(
      selectedDistance,
      finishHours,
      finishMinutes,
      finishSeconds
    );
  }, [selectedDistance, finishHours, finishMinutes, finishSeconds]);

  const gradientResult = useMemo(() => {
    const basePaceSeconds = basePaceMin * 60 + basePaceSec;
    return calculateGradientAdjustment(basePaceSeconds, gradient);
  }, [basePaceMin, basePaceSec, gradient]);

  const environmentResult = useMemo(() => {
    const basePaceSeconds = envBasePaceMin * 60 + envBasePaceSec;
    return calculateEnvironmentAdjustment(basePaceSeconds, temperature, humidity);
  }, [envBasePaceMin, envBasePaceSec, temperature, humidity]);

  const tabs = [
    { id: 'finish' as const, label: '目标时间配速', icon: Calculator },
    { id: 'gradient' as const, label: '坡度调整', icon: TrendingUp },
    { id: 'environment' as const, label: '环境影响', icon: Thermometer }
  ];

  const distanceOptions: { value: DistanceOption | RaceDistance; label: string }[] = [
    { value: '10km', label: '10公里' },
    { value: 'half', label: '半程马拉松 (21.0975km)' },
    { value: 'full', label: '全程马拉松 (42.195km)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">配速计算</h1>
        <p className="text-secondary-500">专业的配速计算工具，帮助你规划比赛节奏</p>
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

      {activeTab === 'finish' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="section-title">目标完赛时间</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="label">比赛距离</label>
                  <select
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(e.target.value as RaceDistance)}
                    className="select-field"
                  >
                    {distanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">目标完赛时间</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={finishHours}
                        onChange={(e) => setFinishHours(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">小时</div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={finishMinutes}
                        onChange={(e) => setFinishMinutes(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">分钟</div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={finishSeconds}
                        onChange={(e) => setFinishSeconds(Number(e.target.value))}
                        className="input-field text-center"
                      />
                      <div className="text-center text-xs text-secondary-400 mt-1">秒</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-sm text-secondary-500 mb-1">平均配速</div>
                <div className="text-3xl font-bold text-primary-600">{paceResult.pacePerKm}</div>
                <div className="text-xs text-secondary-400">分钟/公里</div>
              </div>
              <div className="card text-center">
                <div className="text-sm text-secondary-500 mb-1">平均速度</div>
                <div className="text-3xl font-bold text-secondary-800">{paceResult.speedKmh.toFixed(2)}</div>
                <div className="text-xs text-secondary-400">公里/小时</div>
              </div>
              <div className="card text-center">
                <div className="text-sm text-secondary-500 mb-1">比赛距离</div>
                <div className="text-3xl font-bold text-secondary-800">{DISTANCE_CONFIG[selectedDistance].km}</div>
                <div className="text-xs text-secondary-400">公里</div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">分段配速表</h3>
              <div className="overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">公里</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">每公里用时</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">累计用时</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">配速</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paceResult.splits.map((split, index) => (
                      <tr
                        key={split.kilometer}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium text-secondary-800">{split.kilometer}km</td>
                        <td className="py-3 px-4 text-secondary-600">{split.time}</td>
                        <td className="py-3 px-4 text-secondary-600">{split.cumulativeTime}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-primary-600">{split.pace}</span>
                          <span className="text-xs text-secondary-400 ml-1">/km</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="section-title">坡度调整计算</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">基础配速</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={basePaceMin}
                    onChange={(e) => setBasePaceMin(Number(e.target.value))}
                    className="input-field w-24 text-center"
                  />
                  <span className="text-secondary-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={basePaceSec}
                    onChange={(e) => setBasePaceSec(Number(e.target.value))}
                    className="input-field w-24 text-center"
                  />
                  <span className="text-secondary-500">分钟/公里</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">坡度</label>
                  <span className={`font-bold text-lg ${gradient > 0 ? 'text-red-500' : gradient < 0 ? 'text-emerald-500' : 'text-secondary-500'}`}>
                    {gradient > 0 ? '+' : ''}{gradient}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="15"
                  step="0.5"
                  value={gradient}
                  onChange={(e) => setGradient(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-secondary-400 mt-1">
                  <span>-10% 下坡</span>
                  <span>0% 平路</span>
                  <span>+15% 上坡</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-secondary-600">
                  {gradient > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : gradient < 0 ? (
                    <TrendingDown className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <MapPin className="w-5 h-5 text-secondary-500" />
                  )}
                  <span className="text-sm">{gradientResult.explanation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <h2 className="section-title">调整后配速</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">原始配速</div>
                  <div className="text-3xl font-bold text-secondary-800">
                    {basePaceMin}:{basePaceSec.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">调整后配速</div>
                  <div className={`text-3xl font-bold ${gradientResult.isSlower ? 'text-red-500' : 'text-emerald-500'}`}>
                    {gradientResult.adjustedPace}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary-500">每公里时间变化</div>
                    <div className={`text-2xl font-bold ${gradientResult.isSlower ? 'text-red-500' : 'text-emerald-500'}`}>
                      {gradientResult.isSlower ? '+' : '-'}{gradientResult.timeDiff}
                    </div>
                  </div>
                  {gradientResult.isSlower ? (
                    <div className="flex items-center space-x-2 text-red-500">
                      <AlertTriangle size={24} />
                      <span className="text-sm">上坡，配速变慢</span>
                    </div>
                  ) : gradient < 0 ? (
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <CheckCircle size={24} />
                      <span className="text-sm">下坡，配速加快</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-secondary-500">
                      <CheckCircle size={24} />
                      <span className="text-sm">平路，无需调整</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-secondary-800 text-white rounded-xl p-5">
                <div className="text-sm text-secondary-300 mb-2">计算依据</div>
                <div className="text-sm leading-relaxed">
                  每1%上坡坡度，配速约慢15%；每1%下坡坡度，配速约快8%。
                  这是基于跑步能量消耗的经验值，实际效果因人而异。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'environment' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="section-title">环境参数</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">基础配速</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={envBasePaceMin}
                    onChange={(e) => setEnvBasePaceMin(Number(e.target.value))}
                    className="input-field w-24 text-center"
                  />
                  <span className="text-secondary-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={envBasePaceSec}
                    onChange={(e) => setEnvBasePaceSec(Number(e.target.value))}
                    className="input-field w-24 text-center"
                  />
                  <span className="text-secondary-500">分钟/公里</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0 flex items-center">
                    <Thermometer className="w-4 h-4 mr-2" />
                    温度
                  </label>
                  <span className="font-bold text-lg text-primary-600">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="45"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-secondary-400 mt-1">
                  <span>-10°C</span>
                  <span>20°C</span>
                  <span>45°C</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0 flex items-center">
                    <Droplets className="w-4 h-4 mr-2" />
                    湿度
                  </label>
                  <span className="font-bold text-lg text-blue-500">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-secondary-400 mt-1">
                  <span>干燥 10%</span>
                  <span>适中 55%</span>
                  <span>潮湿 100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <h2 className="section-title">环境影响分析</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">体感温度</div>
                  <div className="text-3xl font-bold text-secondary-800">
                    {environmentResult.heatIndex}°C
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">配速调整</div>
                  <div className={`text-3xl font-bold ${environmentResult.adjustmentPercent > 5 ? 'text-red-500' : environmentResult.adjustmentPercent > 0 ? 'text-warning-500' : 'text-emerald-500'}`}>
                    {environmentResult.adjustmentPercent > 0 ? '+' : ''}{environmentResult.adjustmentPercent}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">原始配速</div>
                  <div className="text-2xl font-bold text-secondary-800">
                    {envBasePaceMin}:{envBasePaceSec.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-sm text-secondary-500 mb-2">建议配速</div>
                  <div className={`text-2xl font-bold ${environmentResult.adjustmentPercent > 5 ? 'text-red-500' : 'text-primary-600'}`}>
                    {environmentResult.adjustedPace}
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-5 ${
                environmentResult.riskLevel === 'extreme' ? 'bg-red-50 border-2 border-red-200' :
                environmentResult.riskLevel === 'high' ? 'bg-orange-50 border-2 border-orange-200' :
                environmentResult.riskLevel === 'moderate' ? 'bg-yellow-50 border-2 border-yellow-200' :
                'bg-emerald-50 border-2 border-emerald-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {environmentResult.riskLevel === 'extreme' || environmentResult.riskLevel === 'high' ? (
                    <AlertTriangle className={`w-6 h-6 ${
                      environmentResult.riskLevel === 'extreme' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                  ) : (
                    <CheckCircle className={`w-6 h-6 ${
                      environmentResult.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-emerald-500'
                    }`} />
                  )}
                  <div>
                    <div className={`font-bold ${
                      environmentResult.riskLevel === 'extreme' ? 'text-red-700' :
                      environmentResult.riskLevel === 'high' ? 'text-orange-700' :
                      environmentResult.riskLevel === 'moderate' ? 'text-yellow-700' :
                      'text-emerald-700'
                    }`}>
                      {environmentResult.riskLevel === 'extreme' ? '极端风险' :
                       environmentResult.riskLevel === 'high' ? '高风险' :
                       environmentResult.riskLevel === 'moderate' ? '中等风险' : '低风险'}
                    </div>
                    <div className="text-sm text-secondary-600 mt-1">
                      {environmentResult.explanation}
                    </div>
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
