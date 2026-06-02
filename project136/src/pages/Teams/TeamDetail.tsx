import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Users, Target, Clock, ArrowLeft, Star, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { teams, players, getPlayersByTeamId } = useAppStore();

  const team = useMemo(() => teams.find(t => t.id === id), [teams, id]);
  const teamPlayers = useMemo(() => team ? getPlayersByTeamId(team.id) : [], [team, getPlayersByTeamId]);

  if (!team) {
    return (
      <div className="text-center py-16">
        <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">球队不存在</p>
        <Link to="/teams">
          <Button className="mt-4">返回球队列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/teams">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
            返回
          </Button>
        </Link>
      </div>

      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <Card.Content className="py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center">
              <Trophy size={48} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif">{team.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="info" className="bg-white/20 text-white border-0">{team.league}</Badge>
                <span className="text-slate-300">主教练：{team.coach}</span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>球队历史</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-slate-600 leading-relaxed">{team.history}</p>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>球队阵容</Card.Title>
                <Link to="/players" state={{ teamId: team.id }}>
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ArrowLeft size={14} className="rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-3 gap-4">
                {teamPlayers.map(player => (
                  <Link key={player.id} to={`/players/${player.id}`}>
                    <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {player.name}
                          </p>
                          <p className="text-sm text-slate-500">{player.position}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>核心球员</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              {team.corePlayers.map((playerId, index) => {
                const player = players.find(p => p.id === playerId);
                if (!player) return null;
                return (
                  <div key={playerId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      <Star size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.position}</p>
                    </div>
                    <span className="text-xs text-slate-400">#{index + 1}</span>
                  </div>
                );
              })}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>近期战绩</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-sm text-slate-600">{team.recentResults}</p>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>快速数据</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users size={16} />
                  阵容人数
                </span>
                <span className="font-semibold text-slate-800">{teamPlayers.length}人</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Target size={16} />
                  主力框架
                </span>
                <span className="font-semibold text-slate-800">稳定</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock size={16} />
                  平均年龄
                </span>
                <span className="font-semibold text-slate-800">27.5岁</span>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
