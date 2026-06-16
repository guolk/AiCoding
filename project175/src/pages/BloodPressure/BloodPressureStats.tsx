import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Target, Settings, Sunrise, Moon, Gauge } from 'lucide-react';
import { useHealthStore } from '@/store';
import type { BloodPressureTarget } from '@/utils';
import {
  cn,
  daysBetween,
  getAverageByPeriod,
  calculateBloodPressureControlRate,
  isBloodPressureNormal,
} from '@/utils';

const dayRanges = [
  { value: 7, label: '近7天' },
  { value: 14, label: '近14天' },
  { value: 30, label: '近30天' },
];

const DEFAULT_TARGET: BloodPressureTarget = {
  systolicMin: 90,
  systolicMax: 139,
  diastolicMin: 60,
  diastolicMax: 89,
};

export default function BloodPressureStats() {
  const records = useHealthStore((s) => s.bloodPressureRecords);
  const [days, setDays] = useState(14);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [target, setTarget] = useState<BloodPressureTarget>(DEFAULT_TARGET);
  const [tempTarget, setTempTarget] = useState<BloodPressureTarget>(DEFAULT_TARGET);

  const filteredRecords = useMemo(() => {
    const today = new Date();
    return records
      .filter((r) => daysBetween(r.date, today) <= days - 1)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [records, days]);

  const chartData = useMemo(() => {
    const dateMap = new Map<string, { systolic: number; diastolic: number; count: number }>();

    filteredRecords.forEach((r) => {
      const existing = dateMap.get(r.date);
      if (existing) {
        existing.systolic += r.systolic;
        existing.diastolic += r.diastolic;
        existing.count += 1;
      } else {
        dateMap.set(r.date, { systolic: r.systolic, diastolic: r.diastolic, count: 1 });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: date.slice(5),
        systolic: Number((data.systolic / data.count).toFixed(1)),
        diastolic: Number((data.diastolic / data.count).toFixed(1)),
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [filteredRecords]);

  const morningStats = useMemo(
    () => getAverageByPeriod(filteredRecords, 'morning'),
    [filteredRecords]
  );

  const eveningStats = useMemo(
    () => getAverageByPeriod(filteredRecords, 'evening'),
    [filteredRecords]
  );

  const controlRate = useMemo(
    () => calculateBloodPressureControlRate(filteredRecords, target),
    [filteredRecords, target]
  );

  const overallAvg = useMemo(() => {
    if (filteredRecords.length === 0) return { systolic: 0, diastolic: 0, pulse: 0 };
    const sum = filteredRecords.reduce(
      (acc, r) => ({
        systolic: acc.systolic + r.systolic,
        diastolic: acc.diastolic + r.diastolic,
        pulse: acc.pulse + r.pulse,
      }),
      { systolic: 0, diastolic: 0, pulse: 0 }
    );
    const n = filteredRecords.length;
    return {
      systolic: Number((sum.systolic / n).toFixed(1)),
      diastolic: Number((sum.diastolic / n).toFixed(1)),
      pulse: Number((sum.pulse / n).toFixed(1)),
    };
  }, [filteredRecords]);

  const progressRadius = 58;
  const circumference = 2 * Math.PI * progressRadius;
  const progressOffset = circumference - (controlRate.rate / 100) * circumference;

  const handleSaveTarget = () => {
    setTarget(tempTarget);
    setShowTargetModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {dayRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                days === r.value
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setTempTarget(target);
            setShowTargetModal(true);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          目标设置
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white">
          <div className="text-xs text-red-100">平均收缩压</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{overallAvg.systolic || '--'}</div>
          <div className="text-xs text-red-100 mt-1">mmHg</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="text-xs text-blue-100">平均舒张压</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{overallAvg.diastolic || '--'}</div>
          <div className="text-xs text-blue-100 mt-1">mmHg</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white">
          <div className="text-xs text-purple-100">平均心率</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{overallAvg.pulse || '--'}</div>
          <div className="text-xs text-purple-100 mt-1">次/分</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-800">血压趋势</h3>
        </div>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#e2e8f0" />
                <YAxis domain={[50, 160]} tick={{ fontSize: 12, fill: '#64748b' }} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="systolic"
                  name="收缩压"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#systolicGrad)"
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  name="舒张压"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#diastolicGrad)"
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">控制达标率</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={progressRadius}
                  stroke="#f1f5f9"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={progressRadius}
                  stroke="url(#progressGrad)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800 tabular-nums">
                  {controlRate.rate}%
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {controlRate.inRange}/{controlRate.total} 次
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            目标: {target.systolicMin}~{target.systolicMax} / {target.diastolicMin}~{target.diastolicMax} mmHg
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-800">时段对比</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Sunrise className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">清晨</span>
                  <span className="text-xs text-gray-400">{morningStats.count} 次</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-gray-800 tabular-nums">
                    {morningStats.avgSystolic || '--'}
                  </span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-xl font-bold text-gray-800 tabular-nums">
                    {morningStats.avgDiastolic || '--'}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">mmHg</span>
                  {morningStats.avgSystolic > 0 && (
                    <span
                      className={cn(
                        'ml-auto text-xs px-2 py-0.5 rounded-full',
                        isBloodPressureNormal(
                          morningStats.avgSystolic,
                          morningStats.avgDiastolic,
                          target
                        )
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      )}
                    >
                      {isBloodPressureNormal(
                        morningStats.avgSystolic,
                        morningStats.avgDiastolic,
                        target
                      )
                        ? '正常'
                        : '偏高'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">睡前</span>
                  <span className="text-xs text-gray-400">{eveningStats.count} 次</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-gray-800 tabular-nums">
                    {eveningStats.avgSystolic || '--'}
                  </span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-xl font-bold text-gray-800 tabular-nums">
                    {eveningStats.avgDiastolic || '--'}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">mmHg</span>
                  {eveningStats.avgSystolic > 0 && (
                    <span
                      className={cn(
                        'ml-auto text-xs px-2 py-0.5 rounded-full',
                        isBloodPressureNormal(
                          eveningStats.avgSystolic,
                          eveningStats.avgDiastolic,
                          target
                        )
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      )}
                    >
                      {isBloodPressureNormal(
                        eveningStats.avgSystolic,
                        eveningStats.avgDiastolic,
                        target
                      )
                        ? '正常'
                        : '偏高'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTargetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">设置目标范围</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">收缩压 (mmHg)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={tempTarget.systolicMin}
                    onChange={(e) =>
                      setTempTarget({ ...tempTarget, systolicMin: Number(e.target.value) })
                    }
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="number"
                    value={tempTarget.systolicMax}
                    onChange={(e) =>
                      setTempTarget({ ...tempTarget, systolicMax: Number(e.target.value) })
                    }
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">舒张压 (mmHg)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={tempTarget.diastolicMin}
                    onChange={(e) =>
                      setTempTarget({ ...tempTarget, diastolicMin: Number(e.target.value) })
                    }
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="number"
                    value={tempTarget.diastolicMax}
                    onChange={(e) =>
                      setTempTarget({ ...tempTarget, diastolicMax: Number(e.target.value) })
                    }
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTarget}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
