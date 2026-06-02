import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';

export default function ScriptList() {
  const { scripts, matches, teams, deleteScript } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeague, setFilterLeague] = useState('all');

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      const match = matches.find(m => m.id === script.matchId);
      const homeTeam = teams.find(t => t.id === match?.homeTeamId);
      const awayTeam = teams.find(t => t.id === match?.awayTeamId);
      const matchTitle = `${homeTeam?.name || ''} vs ${awayTeam?.name || ''}`;

      const matchesSearch = matchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.background.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLeague = filterLeague === 'all' || match?.league === filterLeague;

      return matchesSearch && matchesLeague;
    });
  }, [scripts, matches, teams, searchTerm, filterLeague]);

  const leagues = useMemo(() => {
    const leagueSet = new Set(matches.map(m => m.league));
    return Array.from(leagueSet);
  }, [matches]);

  const getMatchInfo = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { title: '未知比赛', league: '', date: '' };

    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    return {
      title: `${homeTeam?.name || '未知'} vs ${awayTeam?.name || '未知'}`,
      league: match.league,
      date: new Date(match.startTime).toLocaleDateString('zh-CN')
    };
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇解说稿吗？')) {
      deleteScript(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">解说稿管理</h1>
          <p className="text-slate-500 mt-1">共 {scripts.length} 篇解说稿</p>
        </div>
        <Link to="/scripts/new">
          <Button size="lg">
            <Plus size={20} />
            新建解说稿
          </Button>
        </Link>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索比赛名称或内容..."
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
                <option value="all">全部赛事</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {filteredScripts.map((script, index) => {
          const matchInfo = getMatchInfo(script.matchId);
          return (
            <Card
              key={script.id}
              hover
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Card.Content className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="info">{matchInfo.league}</Badge>
                      <Badge variant="default">结构化</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{matchInfo.title}</h3>
                  </div>
                  <FileText size={24} className="text-orange-500 flex-shrink-0" />
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">
                  {script.background}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {matchInfo.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    更新于 {new Date(script.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link to={`/scripts/${script.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit size={16} />
                      编辑稿件
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(script.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card.Content>
            </Card>
          );
        })}

        {filteredScripts.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">没有找到匹配的解说稿</p>
          </div>
        )}
      </div>
    </div>
  );
}
