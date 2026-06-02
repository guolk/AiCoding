import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  FileText,
  Trophy,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Play,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAppStore } from '@/store/useAppStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const { matches, scripts, teams, players, reviews, prepChecklists, commentators } = useAppStore();

  const upcomingMatches = useMemo(() => {
    return matches
      .filter(m => m.status === 'upcoming' || m.status === 'live')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  }, [matches]);

  const stats = useMemo(() => [
    { label: '本月解说场次', value: matches.filter(m => m.status === 'completed').length + 2, icon: <Mic size={24} />, color: 'from-orange-500 to-orange-600' },
    { label: '待处理稿件', value: scripts.filter(s => new Date(s.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: <FileText size={24} />, color: 'from-blue-500 to-blue-600' },
    { label: '球队资料', value: teams.length, icon: <Trophy size={24} />, color: 'from-emerald-500 to-emerald-600' },
    { label: '球员资料', value: players.length, icon: <Users size={24} />, color: 'from-purple-500 to-purple-600' }
  ], [matches, scripts, teams, players]);

  const chartData = [
    { name: '周一', 场次: 2, 评分: 4.5 },
    { name: '周二', 场次: 1, 评分: 4.7 },
    { name: '周三', 场次: 3, 评分: 4.3 },
    { name: '周四', 场次: 2, 评分: 4.6 },
    { name: '周五', 场次: 1, 评分: 4.8 },
    { name: '周六', 场次: 3, 评分: 4.5 },
    { name: '周日', 场次: 2, 评分: 4.7 }
  ];

  const checklist = prepChecklists[0];

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="danger" className="animate-pulse">直播中</Badge>;
      case 'upcoming':
        return <Badge variant="info">即将开始</Badge>;
      default:
        return <Badge variant="success">已结束</Badge>;
    }
  };

  const formatMatchTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return '进行中';
    if (hours < 24) return `${hours}小时${minutes}分钟后`;
    return `${Math.floor(hours / 24)}天后`;
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || '未知球队';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">欢迎回来，张指导</h1>
          <p className="text-slate-500 mt-1">今天有 {upcomingMatches.length} 场比赛等待您的解说</p>
        </div>
        <Link to="/scripts/new">
          <Button size="lg">
            <FileText size={20} />
            新建解说稿
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6 animate-stagger">
        {stats.map((stat, index) => (
          <Card key={index} hover className="relative overflow-hidden">
            <Card.Content className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card.Content>
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <Card.Title>今日赛事</Card.Title>
                <p className="text-sm text-slate-500 mt-1">即将开始的比赛</p>
              </div>
              <Link to="/schedule">
                <Button variant="ghost" size="sm">
                  查看全部
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </Card.Header>
            <Card.Content className="space-y-4">
              {upcomingMatches.map((match, index) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${match.status === 'live' ? 'bg-red-100' : 'bg-orange-100'}`}>
                      {match.status === 'live' ? (
                        <Play size={24} className="text-red-600" />
                      ) : (
                        <Clock size={24} className="text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">
                          {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                        </p>
                        {getMatchStatusBadge(match.status)}
                      </div>
                      <p className="text-sm text-slate-500">{match.league}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{formatMatchTime(match.startTime)}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(match.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Link to={`/scripts/new?matchId=${match.id}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      准备稿件
                    </Button>
                  </Link>
                </div>
              ))}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>解说趋势</Card.Title>
              <p className="text-sm text-slate-500 mt-1">近7天解说场次和评分趋势</p>
            </Card.Header>
            <Card.Content>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[4, 5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="场次" stroke="#f97316" strokeWidth={2} fill="url(#colorGames)" />
                    <Line yAxisId="right" type="monotone" dataKey="评分" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>赛前准备</Card.Title>
              <p className="text-sm text-slate-500 mt-1">欧冠半决赛准备进度</p>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">完成进度</span>
                <span className="text-sm font-bold text-orange-600">{checklist?.completedCount || 0}/{checklist?.totalCount || 0}</span>
              </div>
              <Progress value={(checklist?.completedCount || 0) / (checklist?.totalCount || 1) * 100} />

              <div className="space-y-2 mt-6">
                {checklist?.items.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <CheckCircle2
                      size={20}
                      className={item.completed ? 'text-emerald-500' : 'text-slate-300'}
                    />
                    <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              <Link to="/schedule/checklist/checklist-1">
                <Button variant="outline" className="w-full mt-2">
                  查看完整清单
                </Button>
              </Link>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>最近复盘</Card.Title>
              <p className="text-sm text-slate-500 mt-1">持续改进解说技巧</p>
            </Card.Header>
            <Card.Content className="space-y-4">
              {reviews.slice(0, 2).map((review, index) => (
                <div key={review.id} className="space-y-3">
                  {index > 0 && <div className="border-t border-slate-100" />}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Mic size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">
                        {matches.find(m => m.id === review.matchId)?.league || '比赛'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {review.highlights}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/reviews">
                <Button variant="ghost" className="w-full">
                  <TrendingUp size={16} />
                  查看所有复盘
                </Button>
              </Link>
            </Card.Content>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <Card.Content>
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">待改进提醒</p>
                  <p className="text-sm text-amber-700 mt-1">
                    您的语速控制练习进度已达75%，继续保持！
                  </p>
                  <Link to="/reviews/skills">
                    <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
