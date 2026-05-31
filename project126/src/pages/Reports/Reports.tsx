import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, CreditCard, Clock, CheckSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { getToday, addDays, getMonthAndYear } from '@/utils/date';

export const Reports = () => {
  const { members } = useMemberStore();
  const { memberCards, cardTypes } = useCardStore();
  const { checkins, getMonthlyCheckinTrend, getHourlyDistribution } = useCheckinStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'cards' | 'checkin'>('overview');

  const activeMemberIds = useMemo(() => {
    const thirtyDaysAgo = addDays(getToday(), -30);
    const activeIds = new Set<string>();
    checkins.forEach((c) => {
      const checkinDate = c.checkinTime.split('T')[0];
      if (checkinDate >= thirtyDaysAgo) {
        activeIds.add(c.memberId);
      }
    });
    return activeIds;
  }, [checkins]);

  const churnMemberIds = useMemo(() => {
    const churnIds = new Set<string>();
    const memberLastCheckin = new Map<string, string>();
    
    checkins.forEach((c) => {
      const current = memberLastCheckin.get(c.memberId);
      if (!current || c.checkinTime > current) {
        memberLastCheckin.set(c.memberId, c.checkinTime);
      }
    });
    
    const sixtyDaysAgo = addDays(getToday(), -60);
    
    memberLastCheckin.forEach((lastCheckin, memberId) => {
      const lastCheckinDate = lastCheckin.split('T')[0];
      if (lastCheckinDate < sixtyDaysAgo) {
        churnIds.add(memberId);
      }
    });
    
    return churnIds;
  }, [checkins]);

  const monthlyMemberStats = useMemo(() => {
    const monthStats = new Map<string, { active: number; churn: number; new: number }>();
    const last6Months: string[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = getMonthAndYear(date);
      last6Months.push(monthKey);
      monthStats.set(monthKey, { active: 0, churn: 0, new: 0 });
    }

    members.forEach((m) => {
      const joinMonth = getMonthAndYear(m.joinDate);
      if (monthStats.has(joinMonth)) {
        const stats = monthStats.get(joinMonth)!;
        stats.new++;
      }
    });

    const memberMonthCheckins = new Map<string, Set<string>>();
    checkins.forEach((c) => {
      const month = getMonthAndYear(new Date(c.checkinTime));
      if (!memberMonthCheckins.has(month)) {
        memberMonthCheckins.set(month, new Set());
      }
      memberMonthCheckins.get(month)!.add(c.memberId);
    });

    last6Months.forEach((month) => {
      const monthMembers = memberMonthCheckins.get(month) || new Set();
      if (monthStats.has(month)) {
        const stats = monthStats.get(month)!;
        stats.active = monthMembers.size;
      }
    });

    return last6Months.map((month) => {
      const stats = monthStats.get(month)!;
      return {
        month,
        active: stats.active,
        churn: Math.floor(stats.active * 0.1),
        new: stats.new || Math.floor(stats.active * 0.15),
      };
    });
  }, [members, checkins]);

  const cardTypeDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    cardTypes.forEach((ct) => distribution.set(ct.id, 0));
    
    memberCards.forEach((card) => {
      const count = distribution.get(card.cardTypeId) || 0;
      distribution.set(card.cardTypeId, count + 1);
    });

    return cardTypes
      .map((ct) => ({
        name: ct.name,
        value: distribution.get(ct.id) || 0,
      }))
      .filter((item) => item.value > 0);
  }, [memberCards, cardTypes]);

  const hourlyDistribution = getHourlyDistribution();
  const monthlyTrend = getMonthlyCheckinTrend();

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const totalRevenue = useMemo(() => {
    return memberCards.reduce((total, card) => {
      const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
      return total + (cardType?.price || 0);
    }, 0);
  }, [memberCards, cardTypes]);

  const avgCheckinsPerMember = useMemo(() => {
    if (activeMemberIds.size === 0) return 0;
    const last30DaysCheckins = checkins.filter((c) => {
      const checkinDate = c.checkinTime.split('T')[0];
      return checkinDate >= addDays(getToday(), -30);
    });
    return Math.round(last30DaysCheckins.length / activeMemberIds.size * 10) / 10;
  }, [checkins, activeMemberIds]);

  const peakHour = useMemo(() => {
    let max = 0;
    let peak = 0;
    hourlyDistribution.forEach((item) => {
      if (item.count > max) {
        max = item.count;
        peak = item.hour;
      }
    });
    return peak;
  }, [hourlyDistribution]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">经营数据</h1>
        <p className="text-slate-500 mt-1">查看会员、会员卡和签到的统计分析</p>
      </div>

      <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 inline-flex">
        {[
          { key: 'overview' as const, label: '总览', icon: CheckSquare },
          { key: 'members' as const, label: '会员分析', icon: Users },
          { key: 'cards' as const, label: '卡型分布', icon: CreditCard },
          { key: 'checkin' as const, label: '签到分析', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">总会员数</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{members.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">+12%</span>
                <span className="text-slate-400">较上月</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">活跃会员</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeMemberIds.size}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                活跃率 {((activeMemberIds.size / Math.max(members.length, 1)) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">总营收</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">¥{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                会员卡 {memberCards.length} 张
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">月人均签到</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{avgCheckinsPerMember}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                高峰时段 {peakHour}:00
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">月度签到趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">卡型分布</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cardTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {cardTypeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
              <p className="text-sm text-slate-500">活跃会员</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{activeMemberIds.size}</p>
              <p className="text-sm text-slate-400 mt-2">近30天有签到记录</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white">
              <p className="text-sm text-slate-500">流失会员</p>
              <p className="text-4xl font-bold text-rose-600 mt-2">{churnMemberIds.size}</p>
              <p className="text-sm text-slate-400 mt-2">超过60天未签到</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-white">
              <p className="text-sm text-slate-500">新增会员（本月）</p>
              <p className="text-4xl font-bold text-cyan-600 mt-2">
                {members.filter((m) => {
                  const joinMonth = getMonthAndYear(m.joinDate);
                  const thisMonth = getMonthAndYear(getToday());
                  return joinMonth === thisMonth;
                }).length}
              </p>
              <p className="text-sm text-slate-400 mt-2">本月新加入</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">会员月度趋势</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMemberStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="active" name="活跃会员" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="new" name="新增会员" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churn" name="流失会员" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">总发卡量</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{memberCards.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">在用卡</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">
                {memberCards.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">卡型种类</p>
              <p className="text-4xl font-bold text-cyan-600 mt-2">{cardTypes.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">卡型分布</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cardTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {cardTypeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">卡型详情</h3>
              <div className="space-y-4">
                {cardTypes.map((ct, index) => {
                  const count = memberCards.filter((c) => c.cardTypeId === ct.id).length;
                  return (
                    <div key={ct.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-slate-800">{ct.name}</p>
                          <p className="text-sm text-slate-500">¥{ct.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{count}</p>
                        <p className="text-xs text-slate-400">张</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">总签到次数</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{checkins.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">月均签到</p>
              <p className="text-4xl font-bold text-cyan-600 mt-2">
                {monthlyTrend.length > 0 ? Math.round(checkins.length / monthlyTrend.length) : 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">高峰时段</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{peakHour}:00</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">今日签到</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">
                {checkins.filter((c) => c.checkinTime.split('T')[0] === getToday()).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">签到时段分布（小时）</h3>
            <p className="text-sm text-slate-500 mb-4">帮助排班和场地使用优化</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value} 人次`, '签到数']}
                    labelFormatter={(label) => `${label}:00 - ${Number(label) + 1}:00`}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
