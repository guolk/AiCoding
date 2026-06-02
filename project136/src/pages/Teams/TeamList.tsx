import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Search, Filter, Users, ChevronRight, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';

export default function TeamList() {
  const { teams, players } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeague, setFilterLeague] = useState('all');

  const leagues = useMemo(() => {
    const leagueSet = new Set(teams.map(t => t.league));
    return Array.from(leagueSet);
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.coach.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLeague = filterLeague === 'all' || team.league === filterLeague;
      return matchesSearch && matchesLeague;
    });
  }, [teams, searchTerm, filterLeague]);

  const getCorePlayerNames = (playerIds: string[]) => {
    return playerIds
      .map(id => players.find(p => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 font-serif">球队资料库</h1>
        <p className="text-slate-500 mt-1">共 {teams.length} 支球队档案</p>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索球队名称或主教练..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filterLeague}
                onChange={e => setFilterLeague(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-10"
              >
                <option value="all">全部联赛</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {filteredTeams.map((team, index) => {
          const corePlayers = getCorePlayerNames(team.corePlayers);
          return (
            <Link key={team.id} to={`/teams/${team.id}`}>
              <Card hover className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <Card.Content className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Trophy size={28} className="text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="info">{team.league}</Badge>
                          <span className="text-sm text-slate-500">主教练：{team.coach}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-slate-300" />
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">{team.history}</p>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">核心球员</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {corePlayers.map((playerName, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-sm text-slate-600"
                        >
                          <Star size={12} className="text-amber-500" />
                          {playerName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm text-slate-500">{team.recentResults}</p>
                  </div>
                </Card.Content>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
