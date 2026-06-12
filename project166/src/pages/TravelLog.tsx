import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MapPin,
  Calendar,
  Star,
  Home,
  Users,
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  X,
  Clock,
  DollarSign,
  Briefcase,
  Timer,
} from 'lucide-react';
import { useTravelStore } from '@/store/travelStore';
import { useCityStore } from '@/store/cityStore';
import { getCityById } from '@/data/cities';
import { formatDate, daysBetween } from '@/utils/date';
import { cn } from '@/lib/utils';
import type { Migration } from '@/types';

type TabKey = 'timeline' | 'efficiency' | 'migration';

const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  bus: <Bus className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
};

const TRANSPORT_LABELS: Record<string, string> = {
  flight: '飞机',
  train: '火车',
  bus: '巴士',
  car: '汽车',
  other: '其他',
};

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative">
          <Star className="h-4 w-4 text-slate-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="h-4 w-4 text-slate-300" />);
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

function TimelineTab() {
  const records = useTravelStore((s) => s.records);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [records]);

  if (sortedRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <MapPin className="h-12 w-12 mb-4 opacity-30" />
        <p>暂无旅居记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-teal-300 to-transparent" />
      <div className="space-y-8">
        {sortedRecords.map((record, index) => {
          const city = getCityById(record.cityId);
          const days = daysBetween(record.startDate, record.endDate);
          return (
            <div key={record.id} className="relative pl-16">
              <div
                className={cn(
                  'absolute left-0 top-2 h-12 w-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white',
                  index % 2 === 0 ? 'bg-teal-500' : 'bg-amber-500'
                )}
              >
                {city?.flag ?? '🌍'}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <span className="text-2xl">{city?.flag}</span>
                      {city?.name ?? record.cityId}
                      <span className="text-sm font-normal text-slate-500">
                        {city?.country}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(record.startDate)} - {formatDate(record.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>居住 {days} 天</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">满意度</span>
                    {renderStars(record.satisfaction)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Home className="h-4 w-4" />
                      <span>住宿成本</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      ¥{record.accommodationCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span>最佳工作空间</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 truncate">
                      {record.bestWorkspace}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Users className="h-4 w-4" />
                      <span>社群活动</span>
                    </div>
                    <p className="text-sm text-slate-900">{record.communityActivities}</p>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 italic">"{record.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EfficiencyTab() {
  const efficiencies = useTravelStore((s) => s.efficiencies);

  const chartData = useMemo(() => {
    const grouped: Record<string, { tasks: number; hours: number; count: number }> = {};
    efficiencies.forEach((eff) => {
      const city = getCityById(eff.cityId);
      const key = city?.name ?? eff.cityId;
      if (!grouped[key]) {
        grouped[key] = { tasks: 0, hours: 0, count: 0 };
      }
      grouped[key].tasks += eff.tasksCompleted;
      grouped[key].hours += eff.focusHours;
      grouped[key].count += 1;
    });
    return Object.entries(grouped).map(([city, data]) => ({
      city,
      平均任务数: Math.round(data.tasks / data.count),
      平均专注小时: Math.round((data.hours / data.count) * 10) / 10,
    }));
  }, [efficiencies]);

  const stats = useMemo(() => {
    return chartData.map((d) => {
      const totalTasks =
        efficiencies
          .filter((e) => (getCityById(e.cityId)?.name ?? e.cityId) === d.city)
          .reduce((sum, e) => sum + e.tasksCompleted, 0);
      const totalHours = efficiencies
        .filter((e) => (getCityById(e.cityId)?.name ?? e.cityId) === d.city)
        .reduce((sum, e) => sum + e.focusHours, 0);
      const weeks = efficiencies.filter(
        (e) => (getCityById(e.cityId)?.name ?? e.cityId) === d.city
      ).length;
      return {
        city: d.city,
        weeks,
        totalTasks,
        totalHours,
        avgTasks: d.平均任务数,
        avgHours: d.平均专注小时,
      };
    });
  }, [chartData, efficiencies]);

  if (efficiencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Timer className="h-12 w-12 mb-4 opacity-30" />
        <p>暂无效率数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">各城市效率对比</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="city" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="平均任务数"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="平均专注小时"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">效率统计汇总</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  城市
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  统计周数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  总任务数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  总专注小时
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  周均任务数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  周均专注小时
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((s) => (
                <tr key={s.city} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {s.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                    {s.weeks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                    {s.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                    {s.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-teal-600">
                    {s.avgTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-amber-600">
                    {s.avgHours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MigrationTab() {
  const migrations = useTravelStore((s) => s.migrations);
  const addMigration = useTravelStore((s) => s.addMigration);
  const cities = useCityStore((s) => s.cities);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fromCityId: '',
    toCityId: '',
    date: '',
    transportType: 'flight' as Migration['transportType'],
    cost: 0,
    costCurrency: 'USD',
    durationHours: 0,
    notes: '',
  });

  const sortedMigrations = useMemo(() => {
    return [...migrations].sort((a, b) => b.date.localeCompare(a.date));
  }, [migrations]);

  const handleSubmit = () => {
    if (!form.fromCityId || !form.toCityId || !form.date) return;
    addMigration(form);
    setShowModal(false);
    setForm({
      fromCityId: '',
      toCityId: '',
      date: '',
      transportType: 'flight',
      cost: 0,
      costCurrency: 'USD',
      durationHours: 0,
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          添加迁移记录
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {sortedMigrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Plane className="h-12 w-12 mb-4 opacity-30" />
            <p>暂无迁移记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    路线
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    交通方式
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    花费
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    耗时
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    备注
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedMigrations.map((m) => {
                  const fromCity = getCityById(m.fromCityId);
                  const toCity = getCityById(m.toCityId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(m.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{fromCity?.flag}</span>
                          <span className="font-medium text-slate-900">
                            {fromCity?.name ?? m.fromCityId}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-lg">{toCity?.flag}</span>
                          <span className="font-medium text-slate-900">
                            {toCity?.name ?? m.toCityId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
                          {TRANSPORT_ICONS[m.transportType]}
                          <span>{TRANSPORT_LABELS[m.transportType] ?? m.transportType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {m.cost.toLocaleString()} {m.costCurrency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                        {m.durationHours}h
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {m.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">添加迁移记录</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    出发城市
                  </label>
                  <select
                    value={form.fromCityId}
                    onChange={(e) => setForm({ ...form, fromCityId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">选择城市</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    到达城市
                  </label>
                  <select
                    value={form.toCityId}
                    onChange={(e) => setForm({ ...form, toCityId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">选择城市</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">迁移日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">交通方式</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['flight', 'train', 'bus', 'car'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, transportType: t })}
                      className={cn(
                        'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm transition-colors',
                        form.transportType === t
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      {TRANSPORT_ICONS[t]}
                      <span>{TRANSPORT_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">花费</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">货币</label>
                  <input
                    type="text"
                    value={form.costCurrency}
                    onChange={(e) => setForm({ ...form, costCurrency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">耗时(小时)</label>
                <input
                  type="number"
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="可选"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.fromCityId || !form.toCityId || !form.date}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'timeline', label: '旅居时间线', icon: <MapPin className="h-4 w-4" /> },
  { key: 'efficiency', label: '效率对比', icon: <Timer className="h-4 w-4" /> },
  { key: 'migration', label: '迁移记录', icon: <Plane className="h-4 w-4" /> },
];

export default function TravelLog() {
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">旅居记录</h1>
          <p className="text-slate-600 mt-1">记录你在每个城市的旅居生活和工作状态</p>
        </div>

        <div className="mb-6 flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'efficiency' && <EfficiencyTab />}
        {activeTab === 'migration' && <MigrationTab />}
      </div>
    </div>
  );
}
