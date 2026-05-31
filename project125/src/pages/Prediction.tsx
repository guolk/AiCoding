import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Dumbbell,
  Award,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { AVAILABLE_DISTANCES, calculateDanielsVDOT, calculateTrainingZones } from '@/utils/danielsFormula';
import { getPerformanceLevel } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

export default function Prediction() {
  const [selectedDistance, setSelectedDistance] = useState('10km');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);
  const [seconds, setSeconds] = useState(0);

  const { userProfile, updateUserProfile } = useAppStore();

  const result = useMemo(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return calculateDanielsVDOT(selectedDistance, totalSeconds);
  }, [selectedDistance, hours, minutes, seconds]);

  const trainingZones = useMemo(() => {
    return calculateTrainingZones(result.vdot, userProfile.maxHeartRate);
  }, [result.vdot, userProfile.maxHeartRate]);

  const performanceInfo = getPerformanceLevel(result.vdot);

  const handleSaveVDOT = () => {
    if (result.vdot > 0) {
      updateUserProfile({ vdot: result.vdot });
    }
  };

  const distanceNames: { key: string; name: string }[] = [
    { key: '5km', name: '5公里' },
    { key: '10km', name: '10公里' },
    { key: 'half', name: '半程马拉松' },
    { key: 'full', name: '全程马拉松' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">成绩预测</h1>
        <p className="text-secondary-500">基于Jack Daniels VDOT公式，根据训练成绩预测比赛目标成绩</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="section-title">输入训练成绩</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">比赛距离</label>
                <select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                  className="select-field"
                >
                  {AVAILABLE_DISTANCES.map((dist) => (
                    <option key={dist.key} value={dist.key}>{dist.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">完成时间</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="input-field text-center"
                    />
                    <div className="text-center text-xs text-secondary-400 mt-1">小时</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="input-field text-center"
                    />
                    <div className="text-center text-xs text-secondary-400 mt-1">分钟</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(Number(e.target.value))}
                      className="input-field text-center"
                    />
                    <div className="text-center text-xs text-secondary-400 mt-1">秒</div>
                  </div>
                </div>
              </div>

              {result.vdot > 0 && (
                <button
                  onClick={handleSaveVDOT}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  保存VDOT到个人资料
                </button>
              )}
            </div>
          </div>

          {result.vdot > 0 && (
            <div className="mt-6">
              <div className="card-gradient">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-4 shadow-lg">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-secondary-500 mb-1">您的VDOT值</div>
                  <div className="text-5xl font-bold text-primary-600 mb-2">{result.vdot}</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium`}>
                    <Award className="w-4 h-4 mr-2" />
                    {performanceInfo.level}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result.vdot > 0 ? (
            <>
              <div className="card">
                <h2 className="section-title flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary-500" />
                  各距离预测成绩
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {distanceNames.map((dist) => (
                    <div
                      key={dist.key}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-secondary-800">{dist.name}</div>
                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="text-3xl font-bold text-primary-600">
                        {result.predictedTimes[dist.key as keyof typeof result.predictedTimes]}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-secondary-500">
                        预计完赛时间
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="section-title flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-primary-500" />
                  训练配速区间
                </h2>
                <div className="space-y-3">
                  {trainingZones.map((zone) => (
                    <div
                      key={zone.type}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${zone.color}`} />
                        <div>
                          <div className="font-medium text-secondary-800">{zone.name}</div>
                          <div className="text-xs text-secondary-500">{zone.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">
                          {zone.type === 'marathon' || zone.type === 'threshold'
                            ? zone.paceRange.min
                            : `${zone.paceRange.min} - ${zone.paceRange.max}`
                          }
                        </div>
                        <div className="text-xs text-secondary-400">配速/公里</div>
                        <div className="text-xs text-secondary-400">
                          心率 {zone.heartRateRange.min}-{zone.heartRateRange.max} bpm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="section-title flex items-center">
                  <Info className="w-5 h-5 mr-2 text-primary-500" />
                  什么是VDOT？
                </h2>
                <div className="space-y-4 text-secondary-600 text-sm leading-relaxed">
                  <p>
                    VDOT是Jack Daniels博士发明的跑步能力评估系统，它根据您最近的比赛成绩计算出一个代表您当前跑步能力的数值。
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="font-medium text-secondary-800 mb-2">VDOT等级说明</div>
                      <ul className="space-y-1">
                        <li><span className="text-purple-600">精英（≥70）</span> - 职业选手水平</li>
                        <li><span className="text-primary-600">优秀（60-69）</span> - 业余高手</li>
                        <li><span className="text-emerald-600">良好（50-59）</span> - 进阶跑者</li>
                        <li><span className="text-warning-600">中等（40-49）</span> - 中级跑者</li>
                        <li><span className="text-secondary-500">入门（小于40）</span> - 初级跑者</li>
                      </ul>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="font-medium text-secondary-800 mb-2">使用建议</div>
                      <ul className="space-y-1">
                        <li className="text-sm text-secondary-500">输入最近3个月的正式比赛成绩</li>
                        <li className="text-sm text-secondary-500">距离越长，VDOT计算越准确</li>
                        <li className="text-sm text-secondary-500">可作为训练配速的参考依据</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-gray-100 text-gray-400 mb-4">
                <TrendingUp className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-secondary-800 mb-2">输入您的训练成绩</h3>
              <p className="text-secondary-500 max-w-md mx-auto">
                请在左侧输入您最近完成的比赛或训练成绩，系统将根据Jack Daniels公式计算您的VDOT值，
                并预测您在其他距离上的潜在成绩。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
