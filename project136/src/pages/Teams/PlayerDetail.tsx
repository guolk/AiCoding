import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ArrowLeft, Trophy, Calendar, Target, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useAppStore } from '@/store/useAppStore';
import { mockPlayerStats } from '@/data/mockPlayers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { players, teams } = useAppStore();

  const player = useMemo(() => players.find(p => p.id === id), [players, id]);
  const playerStats = useMemo(() => mockPlayerStats.filter(s => s.playerId === id), [id]);
  const team = useMemo(() => player ? teams.find(t => t.id === player.teamId) : null, [player, teams]);

  if (!player) {
    return (
      <div className="text-center py-16">
        <User size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">球员不存在</p>
        <Link to="/players">
          <Button className="mt-4">返回球员列表</Button>
        </Link>
      </div>
    );
  }

  const chartData = playerStats.map(stat => ({
    name: stat.season,
    进球: stat.goals,
    助攻: stat.assists,
    出场: stat.games
  }));

  const colors = ['#f97316', '#6366f1', '#22c55e'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/players">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
            返回
          </Button>
        </Link>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <Card.Content className="py-8">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center">
              <User size={64} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold font-serif">{player.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-0">{player.position}</Badge>
                <span className="text-white/80 flex items-center gap-1">
                  <Trophy size={16} />
                  {team?.name}
                </span>
                <span className="text-white/80 flex items-center gap-1">
                  <Calendar size={16} />
                  {player.age}岁
                </span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        <Card hover>
          <Card.Content className="text-center">
            <p className="text-sm text-slate-500">赛季出场</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {playerStats[0]?.games || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">场</p>
          </Card.Content>
        </Card>
        <Card hover>
          <Card.Content className="text-center">
            <p className="text-sm text-slate-500">进球数</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {playerStats[0]?.goals || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">球</p>
          </Card.Content>
        </Card>
        <Card hover>
          <Card.Content className="text-center">
            <p className="text-sm text-slate-500">助攻数</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {playerStats[0]?.assists || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">次</p>
          </Card.Content>
        </Card>
        <Card hover>
          <Card.Content className="text-center">
            <p className="text-sm text-slate-500">出场时间</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {Math.floor((playerStats[0]?.minutes || 0) / 60)}
            </p>
            <p className="text-xs text-slate-400 mt-1">小时</p>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>技术特点</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              {player.characteristics.map((char, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{char}</span>
                    <span className="text-sm text-slate-500">{75 + index * 5}%</span>
                  </div>
                  <Progress value={75 + index * 5} />
                </div>
              ))}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>赛季数据趋势</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                    {['进球', '助攻', '出场'].map((key, index) => (
                      <Bar key={key} dataKey={key} radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={colors[index]} />
                        ))}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>个人故事</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-slate-600 leading-relaxed">{player.story}</p>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>基本信息</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">年龄</span>
                <span className="font-medium text-slate-800">{player.age}岁</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">位置</span>
                <span className="font-medium text-slate-800">{player.position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">所属球队</span>
                <span className="font-medium text-slate-800">{team?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">联赛</span>
                <span className="font-medium text-slate-800">{team?.league}</span>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>能力标签</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {player.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700"
                  >
                    <Star size={12} className="text-amber-500" />
                    {char}
                  </span>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>数据摘要</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              {playerStats.map(stat => (
                <div key={stat.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">{stat.season}赛季</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="text-slate-500">出场</p>
                      <p className="font-semibold text-slate-800">{stat.games}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">进球</p>
                      <p className="font-semibold text-orange-600">{stat.goals}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">助攻</p>
                      <p className="font-semibold text-blue-600">{stat.assists}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">分钟</p>
                      <p className="font-semibold text-slate-800">{stat.minutes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
