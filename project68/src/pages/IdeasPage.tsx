import { useState } from 'react';
import { useAppStore } from '@/store';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { IdeaCaptureDialog } from '@/components/ideas/IdeaCaptureDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Lightbulb, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { IDEA_STATUSES, type IdeaStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function IdeasPage() {
  const ideas = useAppStore(state => state.ideas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<IdeaStatus | 'all'>('all');

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || idea.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: '全部灵感', value: ideas.length, icon: Lightbulb, color: 'text-purple-600' },
    { label: '孵化中', value: ideas.filter(i => i.status === 'incubating').length, icon: TrendingUp, color: 'text-yellow-600' },
    { label: '已转化', value: ideas.filter(i => i.status === 'project').length, icon: CheckCircle, color: 'text-green-600' },
    { label: '本周新增', value: ideas.filter(i => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(i.createdAt) >= weekAgo;
    }).length, icon: Clock, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            灵感收集
          </h1>
          <p className="text-muted-foreground mt-1">捕捉每一个灵感火花，让创意不再流失</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient gap-2">
          <Plus className="w-4 h-4" />
          新灵感
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索灵感..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {IDEA_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setActiveFilter(status.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === status.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchQuery || activeFilter !== 'all' ? '没有找到匹配的灵感' : '还没有收集任何灵感'}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gradient">
            <Plus className="w-4 h-4 mr-2" />
            捕捉第一个灵感
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      <IdeaCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
