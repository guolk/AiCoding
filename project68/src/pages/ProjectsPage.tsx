import { useState } from 'react';
import { useAppStore } from '@/store';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, FolderKanban, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { PROJECT_STATUSES, type ProjectStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ProjectsPage() {
  const projects = useAppStore(state => state.projects);
  const addProject = useAppStore(state => state.addProject);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || project.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: '全部项目', value: projects.length, icon: FolderKanban, color: 'text-purple-600' },
    { label: '进行中', value: projects.filter(p => p.status === 'in_progress').length, icon: Clock, color: 'text-blue-600' },
    { label: '已完成', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600' },
    { label: '已放弃', value: projects.filter(p => p.status === 'abandoned').length, icon: AlertTriangle, color: 'text-red-600' },
  ];

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;
    addProject({
      title: newTitle.trim(),
      description: newDescription.trim(),
      goal: newGoal.trim(),
      status: 'concept',
      tags: []
    });
    setNewTitle('');
    setNewDescription('');
    setNewGoal('');
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            项目管理
          </h1>
          <p className="text-muted-foreground mt-1">追踪你的创意项目从概念到落地</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient gap-2">
          <Plus className="w-4 h-4" />
          新项目
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
            placeholder="搜索项目..."
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
          {PROJECT_STATUSES.map((status) => (
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

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchQuery || activeFilter !== 'all' ? '没有找到匹配的项目' : '还没有创建任何项目'}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gradient">
            <Plus className="w-4 h-4 mr-2" />
            创建第一个项目
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新项目</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">项目名称 *</label>
              <Input
                placeholder="输入项目名称"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">项目描述</label>
              <Textarea
                placeholder="简要描述这个项目"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">项目目标</label>
              <Textarea
                placeholder="这个项目想要达成什么目标？"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleCreateProject} disabled={!newTitle.trim()} className="gradient">
              创建项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
