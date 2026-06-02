import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Search, Filter, Trophy, User, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';

export default function PlayerList() {
  const location = useLocation();
  const state = location.state as { teamId?: string };
  const { teams, players } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState(state?.teamId || 'all');
  const [filterPosition, setFilterPosition] = useState('all');

  const positions = useMemo(() => {
    const positionSet = new Set(players.map(p => p.position));
    return Array.from(positionSet);
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = filterTeam === 'all' || player.teamId === filterTeam;
      const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [players, searchTerm, filterTeam, filterPosition]);

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || '未知球队';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">球员资料库</h1>
          <p className="text-slate-500 mt-1">共 {players.length} 名球员档案</p>
        </div>
        {(searchTerm || filterTeam !== 'all' || filterPosition !== 'all') && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-orange-50 px-4 py-2 rounded-lg">
            <Search size={16} className="text-orange-500" />
            <span>搜索结果: {filteredPlayers.length} 名球员</span>
          </div>
        )}
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索球员姓名..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearchTerm(e.currentTarget.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button onClick={() => setSearchTerm(searchTerm)}>
                搜索
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filterTeam}
                onChange={e => setFilterTeam(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-10"
              >
                <option value="all">全部球队</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={filterPosition}
                onChange={e => setFilterPosition(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-10"
              >
                <option value="all">全部位置</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {filteredPlayers.map((player, index) => (
          <Link key={player.id} to={`/players/${player.id}`}>
            <Card hover className="animate-slide-up" style={{ animationDelay: `${index * 0.03}s` }}>
              <Card.Content className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{player.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info">{player.position}</Badge>
                      <span className="text-sm text-slate-500">{player.age}岁</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Trophy size={14} />
                  {getTeamName(player.teamId)}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {player.characteristics.slice(0, 3).map((char, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
                      {char}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">{player.story}</p>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">没有找到匹配的球员</p>
        </div>
      )}
    </div>
  );
}
