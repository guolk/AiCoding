import { useEffect, useState } from 'react';
import { Heart, Clock, Building2, Users, ChevronDown, Calendar, Gift, Globe, HandHeart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/ui';


const CHART_COLORS = ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#D46347', '#7C7E92', '#C7BE94'];

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AnnualReport() {
  const {
    donations,
    volunteerRecords,
    itemDonations,
    onlineActions,
    institutions,
    statistics,
    impactEstimates,
    loading,
    loadAllData,
  } = useAppStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadAllData(selectedYear);
  }, [loadAllData, selectedYear]);

  const filteredDonations = donations.filter(d => new Date(d.donation_date).getFullYear() === selectedYear);
  const filteredVolunteers = volunteerRecords.filter(v => new Date(v.service_date).getFullYear() === selectedYear);
  const filteredItems = itemDonations.filter(i => new Date(i.donation_date).getFullYear() === selectedYear);
  const filteredOnline = onlineActions.filter(o => new Date(o.action_date).getFullYear() === selectedYear);

  const totalDonationsAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalVolunteerHours = filteredVolunteers.reduce((sum, v) => sum + v.hours, 0);
  const totalPeopleHelped = impactEstimates.reduce((sum, i) => sum + i.people_helped, 0);

  const monthlyDonations = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthDonations = filteredDonations.filter(d => {
      const dMonth = new Date(d.donation_date).getMonth() + 1;
      return dMonth === month;
    });
    const total = monthDonations.reduce((sum, d) => sum + d.amount, 0);
    return { month: `${month}月`, amount: total, count: monthDonations.length };
  });

  const monthlyVolunteers = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthVolunteers = filteredVolunteers.filter(v => {
      const vMonth = new Date(v.service_date).getMonth() + 1;
      return vMonth === month;
    });
    const total = monthVolunteers.reduce((sum, v) => sum + v.hours, 0);
    return { month: `${month}月`, hours: total };
  });

  const pieData = statistics.map(s => ({
    name: s.institution_name,
    value: s.total_amount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-forest-500">年度公益报告</h2>
          <div className="relative">
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-forest-100 rounded-xl hover:border-terracotta-400 transition-colors"
            >
              <Calendar size={18} className="text-terracotta-500" />
              <span className="font-semibold text-forest-500">{selectedYear} 年</span>
              <ChevronDown size={18} className="text-forest-400" />
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-card border border-forest-100 overflow-hidden z-20">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => { setSelectedYear(year); setYearDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-terracotta-50 transition-colors ${
                      year === selectedYear ? 'bg-terracotta-50 text-terracotta-500 font-semibold' : 'text-forest-500'
                    }`}
                  >
                    {year} 年
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="年度捐款总额"
            value={formatAmount(totalDonationsAmount)}
            icon={Heart}
            color="terracotta"
            trend={{ value: 12, isUp: true, label: '较去年' }}
          />
          <StatCard
            title="志愿服务时长"
            value={`${totalVolunteerHours} 小时`}
            icon={Clock}
            color="forest"
            trend={{ value: 8, isUp: true, label: '较去年' }}
          />
          <StatCard
            title="关注机构数"
            value={institutions.length}
            icon={Building2}
            color="ocean"
          />
          <StatCard
            title="帮助人数"
            value={totalPeopleHelped}
            icon={Users}
            color="amber"
            trend={{ value: 15, isUp: true, label: '较去年' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display text-xl font-bold text-forest-500 mb-4">月度捐款统计</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDonations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" />
                  <XAxis dataKey="month" stroke="#7C7E92" />
                  <YAxis stroke="#7C7E92" tickFormatter={(v) => `¥${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatAmount(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#E07A5F" name="捐款金额" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-xl font-bold text-forest-500 mb-4">机构捐款分布</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatAmount(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-xl font-bold text-forest-500 mb-4">志愿服务时长统计</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolunteers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" />
                <XAxis dataKey="month" stroke="#7C7E92" />
                <YAxis stroke="#7C7E92" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3D405B"
                  fill="#3D405B"
                  fillOpacity={0.2}
                  name="服务时长(小时)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center">
                <Gift className="text-white" size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-forest-500 font-display">{filteredItems.length}</p>
                <p className="text-sm text-forest-400">捐物记录</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-forest-100">
              <p className="text-sm text-forest-400">
                共捐赠 {filteredItems.reduce((sum, i) => sum + i.quantity, 0)} 件物品
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center">
                <HandHeart className="text-white" size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-forest-500 font-display">{filteredVolunteers.length}</p>
                <p className="text-sm text-forest-400">志愿服务次数</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-forest-100">
              <p className="text-sm text-forest-400">
                平均每次服务 {totalVolunteerHours / Math.max(filteredVolunteers.length, 1)} 小时
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Globe className="text-white" size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-forest-500 font-display">{filteredOnline.length}</p>
                <p className="text-sm text-forest-400">线上行动次数</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-forest-100">
              <p className="text-sm text-forest-400">
                参与 {new Set(filteredOnline.map(o => o.initiative_name)).size} 个活动
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
