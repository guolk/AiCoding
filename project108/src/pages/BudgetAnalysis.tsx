

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  Gift,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart2,
  Heart,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#34D399', '#FB923C', '#60A5FA'];

export default function BudgetAnalysis() {
  const { giftHistory, contacts, giftIdeas } = useAppStore();

  const currentYear = new Date().getFullYear();

  const yearlyData = giftHistory.filter(
    (gh) => new Date(gh.date).getFullYear() === currentYear
  );

  const totalSpent = yearlyData.reduce((sum, gh) => sum + gh.price, 0);

  const monthlyData = [
    { name: '1月', amount: 0 },
    { name: '2月', amount: 0 },
    { name: '3月', amount: 0 },
    { name: '4月', amount: 0 },
    { name: '5月', amount: 0 },
    { name: '6月', amount: 0 },
    { name: '7月', amount: 0 },
    { name: '8月', amount: 0 },
    { name: '9月', amount: 0 },
    { name: '10月', amount: 0 },
    { name: '11月', amount: 0 },
    { name: '12月', amount: 0 },
  ];

  yearlyData.forEach((gh) => {
    const month = new Date(gh.date).getMonth();
    monthlyData[month].amount += gh.price;
  });

  const holidayData = [
    { name: '春节', amount: 1266, color: '#FF6B6B' },
    { name: '情人节', amount: 980, color: '#4ECDC4' },
    { name: '母亲节', amount: 1280, color: '#FFE66D' },
    { name: '父亲节', amount: 388, color: '#A78BFA' },
    { name: '中秋节', amount: 0, color: '#34D399' },
    { name: '圣诞节', amount: 0, color: '#FB923C' },
  ];

  const contactSpending = contacts.map((contact) => {
    const gifts = yearlyData.filter((gh) => gh.contactId === contact.id);
    const total = gifts.reduce((sum, gh) => sum + gh.price, 0);
    return {
      name: contact.name,
      amount: total,
      count: gifts.length,
    };
  }).sort((a, b) => b.amount - a.amount);

  const tagFrequency: { [key: string]: number } = {};
  giftIdeas.forEach((idea) => {
    idea.tags.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const averageSpending = yearlyData.length > 0 
    ? Math.round(totalSpent / yearlyData.length) 
    : 0;

  const maxSpending = yearlyData.length > 0 
    ? Math.max(...yearlyData.map((gh) => gh.price)) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            预算分析
          </h1>
          <p className="text-ink-500 mt-1">
            {currentYear}年送礼支出统计与分析
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="stat-card bg-gradient-to-br from-primary-500 to-primary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-sm">年度总支出</p>
              <p className="text-3xl font-bold mt-2">¥{totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-primary-100 text-xs mt-3">
            {yearlyData.length} 份礼物
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-secondary-500 to-secondary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-secondary-100 text-sm">平均每份</p>
              <p className="text-3xl font-bold mt-2">¥{averageSpending.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-secondary-100 text-xs mt-3">
            平均花费
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-accent-500 to-accent-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-accent-800 text-sm">最高单笔</p>
              <p className="text-3xl font-bold mt-2 text-accent-900">¥{maxSpending.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center">
              <Gift size={20} className="text-accent-800" />
            </div>
          </div>
          <p className="text-accent-700 text-xs mt-3">
            最贵的礼物
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-ink-700 to-ink-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-ink-300 text-sm">收礼人数</p>
              <p className="text-3xl font-bold mt-2">{contactSpending.filter(c => c.amount > 0).length}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-ink-400 text-xs mt-3">
            共 {contacts.length} 位联系人
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <BarChart2 className="text-primary-500" size={20} />
              月度支出趋势
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EC" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`¥${value}`, '支出']}
                />
                <Bar dataKey="amount" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <PieChartIcon className="text-secondary-500" size={20} />
              节日花费对比
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holidayData.filter((d) => d.amount > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {holidayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`¥${value}`, '花费']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <Users className="text-primary-500" size={20} />
              按联系人支出
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contactSpending.filter((c) => c.amount > 0)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EC" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`¥${value}`, '支出']}
                />
                <Bar dataKey="amount" fill="#4ECDC4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <Heart className="text-accent-600" size={20} />
              热门礼物类型
            </h2>
          </div>
          {topTags.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topTags}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `#${name} (${value})`}
                    labelLine={false}
                  >
                    {topTags.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [value, '出现次数']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-ink-400">暂无足够数据</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
            <Calendar className="text-primary-500" size={20} />
            送礼记录明细
          </h2>
          <span className="text-sm text-ink-500">
            共 {yearlyData.length} 条记录
          </span>
        </div>

        {yearlyData.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500">今年还没有送礼记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-ink-600">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-ink-600">礼物</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-ink-600">收礼人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-ink-600">场合</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-ink-600">金额</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((gh) => {
                    const contact = contacts.find((c) => c.id === gh.contactId);
                    return (
                      <tr
                        key={gh.id}
                        className="border-b border-ink-50 hover:bg-ink-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-ink-600">
                          {gh.date}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-ink-800">
                          {gh.giftName}
                        </td>
                        <td className="py-3 px-4 text-sm text-ink-600">
                          {contact?.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="tag text-xs">{gh.occasion}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-primary-600 text-right">
                          ¥{gh.price.toLocaleString()}
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
  );
}
