import { useEffect } from 'react';
import { Heart, Clock, Building2, Users } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { StatCard, DataTable } from '@/components/ui';
import type { Donation } from '../../shared/types';

const CHART_COLORS = ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#D46347', '#7C7E92', '#C7BE94'];

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

export default function Home() {
  const {
    donations,
    institutions,
    statistics,
    loading,
    loadAllData,
    getTotalDonations,
    getTotalVolunteerHours,
    getTotalPeopleHelped,
    getInstitutionName,
  } = useAppStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())
    .slice(0, 5)
    .map(d => ({
      ...d,
      institution_name: d.institution_name || getInstitutionName(d.institution_id),
    }));

  const pieData = statistics.map(s => ({
    name: s.institution_name,
    value: s.total_amount,
  }));

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthDonations = donations.filter(d => {
      const dMonth = new Date(d.donation_date).getMonth() + 1;
      return dMonth === month;
    });
    const total = monthDonations.reduce((sum, d) => sum + d.amount, 0);
    return { month: `${month}月`, amount: total };
  });

  const donationColumns = [
    { key: 'donation_date' as keyof Donation, title: '日期', sortable: true, render: (v: Donation[keyof Donation]) => formatDate(v as string) },
    { key: 'institution_name' as keyof Donation, title: '机构' },
    { key: 'amount' as keyof Donation, title: '金额', sortable: true, render: (v: Donation[keyof Donation]) => formatAmount(v as number) },
    { key: 'purpose' as keyof Donation, title: '用途' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="年度捐款总额"
            value={formatAmount(getTotalDonations())}
            icon={Heart}
            color="terracotta"
            trend={{ value: 12, isUp: true, label: '较去年' }}
          />
          <StatCard
            title="志愿服务时长"
            value={`${getTotalVolunteerHours()} 小时`}
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
            value={getTotalPeopleHelped()}
            icon={Users}
            color="amber"
            trend={{ value: 15, isUp: true, label: '较上月' }}
          />
        </div>

        <div className="card">
          <h2 className="font-display text-xl font-bold text-forest-500 mb-4">最近捐款记录</h2>
          <DataTable<Donation>
            columns={donationColumns}
            data={recentDonations}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display text-xl font-bold text-forest-500 mb-4">机构捐款统计</h2>
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

          <div className="card">
            <h2 className="font-display text-xl font-bold text-forest-500 mb-4">月度捐款趋势</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" />
                  <XAxis dataKey="month" stroke="#7C7E92" />
                  <YAxis stroke="#7C7E92" tickFormatter={(v) => `¥${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatAmount(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#E07A5F"
                    strokeWidth={3}
                    dot={{ fill: '#E07A5F', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                    name="捐款金额"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
  );
}
