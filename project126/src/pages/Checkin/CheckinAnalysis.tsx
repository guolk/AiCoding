import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { addDays, getToday } from '@/utils/date';

export const CheckinAnalysis = () => {
  const { checkins, getMemberActivityRank, getHourlyDistribution, getMonthlyCheckinTrend } = useCheckinStore();
  const { members } = useMemberStore();
  const { memberCards, cardTypes } = useCardStore();

  const activityRank = getMemberActivityRank(10);
  const hourlyDistribution = getHourlyDistribution();
  const monthlyTrend = getMonthlyCheckinTrend();

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

  const visitFrequencyData = useMemo(() => {
    const memberVisitCount = new Map<string, number>();
    checkins.forEach((c) => {
      memberVisitCount.set(c.memberId, (memberVisitCount.get(c.memberId) || 0) + 1);
    });
    
    const ranges = [
      { name: '1-5次', min: 1, max: 5, count: 0 },
      { name: '6-10次', min: 6, max: 10, count: 0 },
      { name: '11-20次', min: 11, max: 20, count: 0 },
      { name: '20次以上', min: 21, max: 9999, count: 0 },
    ];
    
    memberVisitCount.forEach((count) => {
      for (const range of ranges) {
        if (count >= range.min && count <= range.max) {
          range.count++;
          break;
        }
      }
    });
    
    return ranges;
  }, [checkins]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/checkin"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">活跃度分析</h1>
          <p className="text-slate-500 mt-1">分析会员活跃度和到访情况</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-500">活跃会员</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{activeMemberIds.size}</p>
          <p className="text-sm text-slate-400 mt-1">近30天有签到</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-red-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-500">流失会员</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{churnMemberIds.size}</p>
          <p className="text-sm text-slate-400 mt-1">超过60天未签到</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-500">总签到次数</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{checkins.length}</p>
          <p className="text-sm text-slate-400 mt-1">历史累计</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-500">月均签到</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {monthlyTrend.length > 0 ? Math.round(checkins.length / monthlyTrend.length) : 0}
          </p>
          <p className="text-sm text-slate-400 mt-1">人次/月</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">签到时段分布</h3>
          <div className="h-72">
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
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">到访频率分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visitFrequencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {visitFrequencyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">活跃度排行榜 TOP 10</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">排名</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">会员</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">签到次数</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">活跃等级</th>
              </tr>
            </thead>
            <tbody>
              {activityRank.map((item, index) => {
                const member = members.find((m) => m.id === item.memberId);
                const level = item.checkinCount >= 30 ? '狂热' : item.checkinCount >= 15 ? '活跃' : item.checkinCount >= 5 ? '一般' : '偶尔';
                const levelColor = item.checkinCount >= 30 ? 'text-amber-600 bg-amber-100' :
                                   item.checkinCount >= 15 ? 'text-emerald-600 bg-emerald-100' :
                                   item.checkinCount >= 5 ? 'text-cyan-600 bg-cyan-100' : 'text-slate-600 bg-slate-100';
                return (
                  <tr key={item.memberId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-400 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member?.photo}
                          alt={member?.name}
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                          }}
                        />
                        <div>
                          <p className="font-medium text-slate-800">{member?.name || '未知'}</p>
                          <p className="text-sm text-slate-500">{member?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800">{item.checkinCount}</span>
                      <span className="text-slate-400 ml-1">次</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${levelColor}`}>
                        {level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activityRank.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无活跃度数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
