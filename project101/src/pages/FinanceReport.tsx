import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { PLATFORM_LABELS } from '@/types';
import { ArrowLeft, Download, FileText, Calendar, Building2, DollarSign, TrendingUp, Percent, Users, BarChart3, PieChart, Table } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

const COLORS = ['#F59E0B', '#065F46', '#3B82F6', '#EF4444', '#8B5CF6', '#10B981'];

export default function FinanceReport() {
  const navigate = useNavigate();
  const { getAnnualReport, properties } = useAppStore();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const annualReport = useMemo(() => {
    return getAnnualReport(selectedYear);
  }, [selectedYear, getAnnualReport]);

  const monthlyTrendData = useMemo(() => {
    return annualReport.monthlyData.map(d => ({
      month: `${d.month.split('-')[1]}月`,
      revenue: d.revenue,
      bookings: d.bookings,
      nights: d.nights,
    }));
  }, [annualReport.monthlyData]);

  const propertyRevenueData = useMemo(() => {
    return annualReport.propertyData.sort((a, b) => b.revenue - a.revenue);
  }, [annualReport.propertyData]);

  const platformRevenueData = useMemo(() => {
    return annualReport.platformData.map(item => ({
      name: PLATFORM_LABELS[item.platform],
      value: item.revenue,
      bookings: item.bookings,
      commission: item.commission,
    }));
  }, [annualReport.platformData]);

  const availableYears = [2024, 2025, 2026];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/finance')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">年度财务报告</h1>
            <p className="text-gray-500 mt-1">{selectedYear}年度业务数据分析</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
              {availableYears.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-medium rounded-lg shadow-lg hover:shadow-md hover:from-emerald-800 hover:to-emerald-900 transition-all duration-200">
            <Download className="w-5 h-5" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">年度总收入</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(annualReport.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">年度净收入</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(annualReport.netRevenue)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">平均入住率</p>
              <p className="text-3xl font-bold mt-2">{formatPercent(annualReport.occupancyRate)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">总预订数</p>
              <p className="text-3xl font-bold mt-2">{annualReport.totalBookings} 单</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">月度收入与预订趋势</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => value >= 1000 ? `¥${(value / 1000).toFixed(0)}k` : `¥${value}`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value: number, name: string) => [name === 'revenue' ? formatCurrency(value) : `${value} 单`, name === 'revenue' ? '收入' : '预订数']} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} name="收入" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#065F46" strokeWidth={2} dot={{ fill: '#065F46', strokeWidth: 2 }} name="预订数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">平台收入分布</h2>
          </div>
          {platformRevenueData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400">
              <PieChart className="w-12 h-12 mb-3" />
              <p className="text-sm">暂无平台收入数据</p>
            </div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={platformRevenueData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {platformRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value: number) => [formatCurrency(value), '收入']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {platformRevenueData.map((item, index) => {
                  const total = platformRevenueData.reduce((sum, i) => sum + i.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                        <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">房源年度收入排行</h2>
          </div>
        </div>
        {propertyRevenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mb-3" />
            <p className="text-sm">暂无房源收入数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">房源名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预订数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入住晚数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总收入</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">占比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {propertyRevenueData.map((item, index) => {
                  const totalRevenue = propertyRevenueData.reduce((sum, i) => sum + i.revenue, 0);
                  const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                  return (
                    <tr key={item.propertyId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500')}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.propertyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.bookings} 单</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.nights} 晚</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600">{formatCurrency(item.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-32 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                          <span className="text-sm text-gray-600 w-14 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-500">平台佣金总额</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualReport.totalCommission)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-medium text-gray-500">年度入住晚数</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{annualReport.totalNights} <span className="text-sm font-normal text-gray-500">晚</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500">平均客单价</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualReport.avgDailyRate)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500">管理房源数</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{properties.length} <span className="text-sm font-normal text-gray-500">套</span></p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl p-6 border border-amber-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">年度总结</h3>
            <p className="text-gray-600 mt-2">
              {selectedYear}年度，您共管理 <span className="font-semibold text-amber-600">{properties.length}</span> 套房源，完成 <span className="font-semibold text-emerald-600">{annualReport.totalBookings}</span> 单预订，总入住 <span className="font-semibold text-blue-600">{annualReport.totalNights}</span> 晚，实现总收入 <span className="font-semibold text-amber-600">{formatCurrency(annualReport.totalRevenue)}</span>，净收入 <span className="font-semibold text-emerald-600">{formatCurrency(annualReport.netRevenue)}</span>，平均入住率达到 <span className="font-semibold text-purple-600">{formatPercent(annualReport.occupancyRate)}</span>。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
