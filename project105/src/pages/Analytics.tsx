import { Package, Boxes, Clock, TrendingUp, Wallet } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import ThemePieChart from '../components/analytics/ThemePieChart';
import { STATUS_LABELS, CHART_COLORS } from '../utils/constants';
import { formatCurrency, formatHours } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export default function Analytics() {
  const { sets, inventory, projects, getAnalytics } = useAppStore();
  const analytics = getAnalytics();

  const themeData = Object.entries(analytics.setsByTheme).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(analytics.setsByStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key,
    value,
  }));

  const sourceData = Object.entries(analytics.inventoryBySource).map(([name, value]) => ({ name, value }));

  const partsBySet = sets
    .sort((a, b) => b.num_parts - a.num_parts)
    .slice(0, 5)
    .map((s) => ({
      name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
      零件数: s.num_parts,
    }));

  const yearData = sets.reduce((acc, set) => {
    acc[set.year] = (acc[set.year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const yearChartData = Object.entries(yearData)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({ name: year, value: count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">收藏套装</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {analytics.totalSets}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {sets.filter((s) => s.status === 'wishlist').length} 个愿望清单
              </p>
            </div>
            <div className="p-3 rounded-brick bg-lego-red/10 text-lego-red">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总零件数</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {analytics.totalParts.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                含 {inventory.length} 种零件类型
              </p>
            </div>
            <div className="p-3 rounded-brick bg-lego-yellow/20 text-amber-700">
              <Boxes size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">购入总价值</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {formatCurrency(analytics.totalValue)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                平均 {formatCurrency(analytics.totalValue / analytics.totalSets)} / 套
              </p>
            </div>
            <div className="p-3 rounded-brick bg-emerald-100 text-emerald-700">
              <Wallet size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总搭建时长</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {formatHours(analytics.totalHours)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {analytics.completedProjects} 个项目已完成
              </p>
            </div>
            <div className="p-3 rounded-brick bg-lego-blue/10 text-lego-blue">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThemePieChart data={themeData} title="收藏主题分布" />
        <ThemePieChart data={statusData} title="收藏状态分布" />
        <ThemePieChart data={sourceData} title="零件来源分布" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brick-card p-6">
          <h3 className="font-display font-semibold text-lg text-lego-dark mb-4">
            零件数最多的套装 TOP 5
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partsBySet} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="零件数" radius={[0, 4, 4, 0]}>
                  {partsBySet.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brick-card p-6">
          <h3 className="font-display font-semibold text-lg text-lego-dark mb-4">
            套装年份分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" name="套装数" fill="#E3000B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="brick-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-lego-blue" size={20} />
            <h3 className="font-display font-semibold text-lego-dark">价值统计</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-brick">
              <span className="text-gray-600">已记录套装价值</span>
              <span className="font-semibold text-lego-dark">
                {formatCurrency(analytics.totalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-brick">
              <span className="text-gray-600">平均套装价值</span>
              <span className="font-semibold text-lego-dark">
                {formatCurrency(analytics.totalValue / analytics.totalSets)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-brick">
              <span className="text-gray-600">已完成项目</span>
              <span className="font-semibold text-lego-dark">
                {analytics.completedProjects} 个
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-brick">
              <span className="text-gray-600">平均每小时完成</span>
              <span className="font-semibold text-lego-dark">
                {analytics.totalHours > 0 
                  ? (analytics.totalParts / analytics.totalHours).toFixed(1) + ' 零件'
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="brick-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg text-lego-dark mb-4">
            套装状态详情
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = analytics.setsByStatus[key] || 0;
              const percentage = ((count / analytics.totalSets) * 100).toFixed(0);
              return (
                <div
                  key={key}
                  className="p-4 bg-gray-50 rounded-brick text-center"
                >
                  <p className="text-3xl font-display font-bold text-lego-dark mb-1">
                    {count}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{label}</p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-lego rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
