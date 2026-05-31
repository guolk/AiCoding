import { useState } from 'react';
import {
  TrendingUp,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import { useProgressStore } from '@/stores/useProgressStore';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { SportType } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const [activeSport, setActiveSport] = useState<SportType | 'all'>('all');
  const { getAnalytics, skills } = useProgressStore();
  const { records } = useTrainingStore();

  const analytics = activeSport === 'all' ? getAnalytics() : getAnalytics(activeSport);
  const sportSkills = activeSport === 'all' ? skills : skills.filter((s) => s.sportType === activeSport);
  const sportRecords = activeSport === 'all' ? records : records.filter((r) => r.sportType === activeSport);

  const sportTabs: { type: SportType | 'all'; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: '全部', icon: <Activity size={18} /> },
    { type: 'climbing', label: '攀岩', icon: <Mountain size={18} /> },
    { type: 'skateboarding', label: '滑板', icon: <Footprints size={18} /> },
    { type: 'surfing', label: '冲浪', icon: <Waves size={18} /> },
  ];

  const masteredSkills = sportSkills.filter((s) => s.progressPercent === 100);
  const progressTrendColors: Record<string, string> = {
    improving: 'text-success-400',
    stable: 'text-secondary-400',
    declining: 'text-danger-400',
  };

  const progressTrendLabels: Record<string, string> = {
    improving: '进步中',
    stable: '稳定',
    declining: '需加油',
  };

  const radarData = analytics.skillDistribution.map((item) => ({
    subject: item.category,
    progress: item.progress,
    fullMark: 100,
  }));

  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleDateString('zh-CN', { month: 'short' });
    const sessionCount = Math.floor(3 + Math.random() * 8);
    return { month, sessions: sessionCount, hours: sessionCount * 1.5 };
  });

  const skillMasteryData = sportSkills.slice(0, 6).map((skill) => ({
    name: skill.skillName,
    progress: skill.progressPercent,
    sessions: skill.trainingSessions,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-secondary-400">进阶追踪</span>
            <ChevronRight size={14} />
            <span className="text-white">进度分析</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-secondary-500" size={28} />
            进度分析
          </h1>
          <p className="text-dark-400 mt-1">分析你的训练和进步趋势</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sportTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveSport(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeSport === tab.type
                ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(analytics.totalTrainingHours)}</p>
          <p className="text-sm text-dark-400">总训练时长 (小时)</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Activity className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.totalSessions}</p>
          <p className="text-sm text-dark-400">总训练次数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Target className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{masteredSkills.length}</p>
          <p className="text-sm text-dark-400">已掌握技能</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Zap className="text-skate-400" size={20} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${progressTrendColors[analytics.progressTrend]}`}>
            {progressTrendLabels[analytics.progressTrend]}
          </p>
          <p className="text-sm text-dark-400">周均: {analytics.averageSessionsPerWeek} 次</p>
        </div>
      </div>

      {analytics.skillMasteryAverageDays > 0 && (
        <div className="card bg-gradient-to-r from-secondary-500/10 to-primary-500/10 border border-secondary-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary-500/20 rounded-2xl flex items-center justify-center">
              <TrendingUpIcon className="text-secondary-400" size={32} />
            </div>
            <div>
              <p className="text-dark-400 text-sm">平均学习周期</p>
              <p className="text-3xl font-bold text-white">
                {analytics.skillMasteryAverageDays} <span className="text-lg">天</span>
              </p>
              <p className="text-dark-400 text-sm">从学习到掌握一项技能的平均时间</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-primary-400" size={20} />
            <h2 className="text-lg font-semibold text-white">训练趋势</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lastSixMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="sessions"
                  name="训练次数"
                  fill="#FF6B35"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="hours"
                  name="训练时长(小时)"
                  fill="#17A2B8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="text-secondary-400" size={20} />
            <h2 className="text-lg font-semibold text-white">技能分布</h2>
          </div>
          {radarData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="技能进度"
                    dataKey="progress"
                    stroke="#FF6B35"
                    fill="#FF6B35"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-dark-500">
              暂无技能数据
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-success-400" size={20} />
            <h2 className="text-lg font-semibold text-white">近8周训练趋势</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="week"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="训练时长(小时)"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35' }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="训练次数"
                  stroke="#17A2B8"
                  strokeWidth={2}
                  dot={{ fill: '#17A2B8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Target className="text-primary-400" size={20} />
            <h2 className="text-lg font-semibold text-white">技能掌握进度</h2>
          </div>
          {skillMasteryData.length > 0 ? (
            <div className="space-y-4">
              {skillMasteryData.map((skill, idx) => (
                <div key={idx} className="bg-dark-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{skill.name}</span>
                      <span className="text-xs text-dark-500">
                        {skill.sessions} 次训练
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary-400">
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        skill.progress === 100
                          ? 'bg-gradient-to-r from-success-600 to-success-400'
                          : ''
                      }`}
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-500">
              暂无技能数据
            </div>
          )}
        </div>
      </div>

      {sportRecords.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">训练统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-700/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{sportRecords.length}</p>
              <p className="text-sm text-dark-400">总记录数</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary-400">
                {new Set(sportRecords.map((r) => r.date.split('T')[0])).size}
              </p>
              <p className="text-sm text-dark-400">训练天数</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-secondary-400">
                {Math.round(
                  sportRecords.reduce((sum, r) => sum + r.duration, 0) / 60
                )}
              </p>
              <p className="text-sm text-dark-400">总时长(小时)</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-success-400">
                {new Set(sportRecords.map((r) => r.location)).size}
              </p>
              <p className="text-sm text-dark-400">训练场地</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
