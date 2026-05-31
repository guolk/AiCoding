import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, CheckSquare, Bell, ChevronRight, Gift, AlertTriangle, UserPlus, ScanLine } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { StatCard } from '@/components/Card/StatCard';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { useMarketingStore } from '@/stores/useMarketingStore';
import { formatDateTime, getToday } from '@/utils/date';
import type { Member } from '@/types/member';

export const Dashboard = () => {
  const { members, initMockData: initMembers } = useMemberStore();
  const { cardTypes, memberCards, initMockData: initCards } = useCardStore();
  const { checkins, getCheckinStatistics, getMonthlyCheckinTrend, getHourlyDistribution, initMockData: initCheckins } = useCheckinStore();
  const { getPendingMarketings, initMockData: initMarketing } = useMarketingStore();

  useEffect(() => {
    if (members.length === 0) {
      initMembers();
    }
  }, []);

  useEffect(() => {
    if (members.length > 0 && memberCards.length === 0) {
      initCards(members.map((m) => m.id));
    }
  }, [members]);

  useEffect(() => {
    if (memberCards.length > 0 && checkins.length === 0) {
      initCheckins(memberCards);
    }
  }, [memberCards]);

  useEffect(() => {
    if (members.length > 0) {
      initMarketing(members);
    }
  }, [members]);

  const stats = getCheckinStatistics();
  const monthlyTrend = getMonthlyCheckinTrend();
  const hourlyDistribution = getHourlyDistribution();
  const pendingMarketings = getPendingMarketings();

  const activeMemberIds = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeIds = new Set<string>();
    checkins.forEach((c) => {
      const checkinDate = new Date(c.checkinTime);
      if (checkinDate >= thirtyDaysAgo) {
        activeIds.add(c.memberId);
      }
    });
    return activeIds;
  }, [checkins]);

  const warningMembers = useMemo(() => {
    const warnings: { memberId: string; memberName: string; memberCardId: string; warningType: 'expiring' | 'expired'; daysLeft: number; cardName: string }[] = [];
    const today = getToday();
    
    memberCards.forEach((card) => {
      if (card.status === 'refunded') return;
      
      const endDate = new Date(card.endDate);
      const todayDate = new Date(today);
      const daysLeft = Math.ceil((endDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const member = members.find((m) => m.id === card.memberId);
      const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
      
      if (daysLeft < 0) {
        warnings.push({
          memberId: card.memberId,
          memberName: member?.name || '未知',
          memberCardId: card.id,
          warningType: 'expired',
          daysLeft,
          cardName: cardType?.name || '会员卡',
        });
      } else if (daysLeft <= 7) {
        warnings.push({
          memberId: card.memberId,
          memberName: member?.name || '未知',
          memberCardId: card.id,
          warningType: 'expiring',
          daysLeft,
          cardName: cardType?.name || '会员卡',
        });
      }
    });
    
    return warnings.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [memberCards, members, cardTypes]);

  const todayBirthdays = useMemo(() => {
    const today = getToday();
    const todayMonthDay = today.slice(5);
    return members.filter((m: Member) => {
      if (!m.birthday) return false;
      return m.birthday.slice(5) === todayMonthDay;
    });
  }, [members]);

  const recentCheckins = useMemo(() => {
    return checkins.slice(0, 5).map((checkin) => {
      const member = members.find((m) => m.id === checkin.memberId);
      return { ...checkin, memberName: member?.name || '未知', memberPhoto: member?.photo };
    });
  }, [checkins, members]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-slate-500 mt-1">欢迎回来，查看今日运营数据</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/members/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            新增会员
          </Link>
          <Link
            to="/checkin"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            快速签到
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总会员数"
          value={members.length}
          icon={<Users className="w-6 h-6" />}
          trend="较上月 +12%"
          trendUp
          color="blue"
        />
        <StatCard
          title="活跃会员"
          value={activeMemberIds.size}
          icon={<CreditCard className="w-6 h-6" />}
          trend={`活跃率 ${((activeMemberIds.size / Math.max(members.length, 1)) * 100).toFixed(0)}%`}
          trendUp
          color="green"
        />
        <StatCard
          title="今日签到"
          value={stats.totalToday}
          icon={<CheckSquare className="w-6 h-6" />}
          trend={`本周 ${stats.totalThisWeek} 人次`}
          trendUp
          color="orange"
        />
        <StatCard
          title="待处理提醒"
          value={warningMembers.length + todayBirthdays.length}
          icon={<Bell className="w-6 h-6" />}
          trend={`${pendingMarketings.length} 条未发送`}
          trendUp={false}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">签到趋势</h3>
            <span className="text-sm text-slate-500">近6个月</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorCheckin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCheckin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">今日提醒</h3>
            <Link to="/marketing" className="text-sm text-cyan-600 hover:text-cyan-700">
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {todayBirthdays.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">生日祝福</p>
                    <p className="text-sm text-amber-600">{todayBirthdays.length} 位会员今天生日</p>
                  </div>
                </div>
              </div>
            )}
            {warningMembers.slice(0, 3).map((warning, index) => (
              <div key={index} className={`p-4 rounded-xl border ${
                warning.warningType === 'expired'
                  ? 'bg-rose-50 border-rose-100'
                  : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    warning.warningType === 'expired' ? 'bg-rose-100' : 'bg-orange-100'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      warning.warningType === 'expired' ? 'text-rose-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      warning.warningType === 'expired' ? 'text-rose-800' : 'text-orange-800'
                    }`}>{warning.memberName}</p>
                    <p className={`text-sm ${
                      warning.warningType === 'expired' ? 'text-rose-600' : 'text-orange-600'
                    }`}>
                      {warning.warningType === 'expired' ? `已过期 ${Math.abs(warning.daysLeft)} 天` : `剩余 ${warning.daysLeft} 天到期`}
                      <span className="ml-2 text-xs opacity-75">({warning.cardName})</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {warningMembers.length === 0 && todayBirthdays.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无提醒</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">签到时段分布</h3>
          </div>
          <div className="h-64">
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
                  labelFormatter={(label) => `${label}:00 - ${label + 1}:00`}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">最近签到</h3>
            <Link to="/checkin" className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentCheckins.map((checkin) => (
              <div key={checkin.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={checkin.memberPhoto}
                    alt={checkin.memberName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                    }}
                  />
                  <div>
                    <p className="font-medium text-slate-800">{checkin.memberName}</p>
                    <p className="text-sm text-slate-500">
                      {checkin.checkinMethod === 'manual' ? '手动签到' : checkin.checkinMethod === 'qr' ? '扫码签到' : '人脸识别'}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-slate-400">{formatDateTime(checkin.checkinTime)}</span>
              </div>
            ))}
            {recentCheckins.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无签到记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
