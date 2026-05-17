import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PROJECT_STATUSES, type ProjectStatus } from '@/types';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { ArrowLeft, Plus, CheckCircle2, Clock, Target, AlertTriangle, X, Trash2, Calendar, DollarSign, Wrench, BookOpen, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useAppStore(state => state.getProject(id || ''));
  const updateProject = useAppStore(state => state.updateProject);
  const toggleMilestone = useAppStore(state => state.toggleMilestone);
  const addMilestone = useAppStore(state => state.addMilestone);
  const addResource = useAppStore(state => state.addResource);
  const addPoqEntry = useAppStore(state => state.addPoqEntry);
  const abandonProject = useAppStore(state => state.abandonProject);
  const deleteProject = useAppStore(state => state.deleteProject);

  const [newMilestone, setNewMilestone] = useState('');
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<'time' | 'money' | 'skill' | 'tool' | 'other'>('time');
  const [newResourceQuantity, setNewResourceQuantity] = useState('');
  
  const [poqHypothesis, setPoqHypothesis] = useState('');
  const [poqMethod, setPoqMethod] = useState('');
  const [poqResult, setPoqResult] = useState('');
  const [poqLearned, setPoqLearned] = useState('');
  const [poqSuccess, setPoqSuccess] = useState(false);
  
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [restartPotential, setRestartPotential] = useState<'low' | 'medium' | 'high'>('medium');

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">项目不存在</p>
        <Button onClick={() => navigate('/projects')}>返回项目列表</Button>
      </div>
    );
  }

  const status = PROJECT_STATUSES.find(s => s.value === project.status);
  const statusColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    addMilestone(project.id, { title: newMilestone.trim() });
    setNewMilestone('');
  };

  const handleAddResource = () => {
    if (!newResourceName.trim() || !newResourceQuantity.trim()) return;
    addResource(project.id, {
      name: newResourceName.trim(),
      type: newResourceType,
      quantity: newResourceQuantity.trim()
    });
    setNewResourceName('');
    setNewResourceQuantity('');
  };

  const handleAddPoq = () => {
    if (!poqHypothesis.trim() || !poqMethod.trim() || !poqResult.trim()) return;
    addPoqEntry(project.id, {
      hypothesis: poqHypothesis.trim(),
      method: poqMethod.trim(),
      result: poqResult.trim(),
      learned: poqLearned.trim(),
      success: poqSuccess,
      date: new Date().toISOString()
    });
    setPoqHypothesis('');
    setPoqMethod('');
    setPoqResult('');
    setPoqLearned('');
    setPoqSuccess(false);
  };

  const handleAbandon = () => {
    if (!abandonReason.trim()) return;
    abandonProject(project.id, abandonReason.trim(), restartPotential);
    setAbandonDialogOpen(false);
    setAbandonReason('');
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(project.id, { status: newStatus });
  };

  const resourceTypeIcons: Record<string, any> = {
    time: Clock,
    money: DollarSign,
    skill: Sparkles,
    tool: Wrench,
    other: Target,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            {status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[status.color]}`}>
                {status.label}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            创建于 {formatDate(project.createdAt)}
          </p>
        </div>
      </div>

      {project.coverImage && (
        <div className="rounded-xl overflow-hidden h-48 md:h-64">
          <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>项目概述</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{project.description || '暂无描述'}</p>
              
              {project.goal && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                    <Target className="w-4 h-4" />
                    项目目标
                  </div>
                  <p className="text-purple-900">{project.goal}</p>
                </div>
              )}

              {totalMilestones > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">总体进度</span>
                    <span className="text-gray-500">{completedMilestones}/{totalMilestones} 里程碑</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                里程碑
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="添加新里程碑..."
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                />
                <Button onClick={handleAddMilestone}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {project.milestones.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">还没有里程碑</p>
                ) : (
                  project.milestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        milestone.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => toggleMilestone(project.id, milestone.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          milestone.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {milestone.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${milestone.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {milestone.title}
                        </p>
                        {milestone.deadline && (
                          <p className="text-xs text-gray-400">截止: {formatDate(milestone.deadline)}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                概念验证 (PoQ)
              </CardTitle>
              <CardDescription>记录最小可行测试的结果和学习</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Textarea
                  placeholder="假设：我们要验证什么？"
                  value={poqHypothesis}
                  onChange={e => setPoqHypothesis(e.target.value)}
                  rows={2}
                />
                <Textarea
                  placeholder="方法：我们如何验证？"
                  value={poqMethod}
                  onChange={e => setPoqMethod(e.target.value)}
                  rows={2}
                />
                <Textarea
                  placeholder="结果：验证结果如何？"
                  value={poqResult}
                  onChange={e => setPoqResult(e.target.value)}
                  rows={2}
                />
                <Textarea
                  placeholder="学到：我们从中学到了什么？"
                  value={poqLearned}
                  onChange={e => setPoqLearned(e.target.value)}
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={poqSuccess} onCheckedChange={setPoqSuccess} />
                    <span className="text-sm">验证成功</span>
                  </div>
                  <Button onClick={handleAddPoq} disabled={!poqHypothesis.trim() || !poqMethod.trim() || !poqResult.trim()}>
                    记录验证
                  </Button>
                </div>
              </div>

              {project.poqEntries.length > 0 && (
                <div className="space-y-3">
                  {project.poqEntries.slice().reverse().map(entry => (
                    <div key={entry.id} className={`p-4 rounded-lg border ${entry.success ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {entry.success ? (
                          <Badge variant="success">验证成功</Badge>
                        ) : (
                          <Badge variant="secondary">待改进</Badge>
                        )}
                        <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>假设:</strong> {entry.hypothesis}</p>
                        <p><strong>方法:</strong> {entry.method}</p>
                        <p><strong>结果:</strong> {entry.result}</p>
                        {entry.learned && <p className="text-blue-700"><strong>学到:</strong> {entry.learned}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {project.status === 'abandoned' && project.abandonReason && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  放弃原因
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.abandonReason}</p>
                {project.restartPotential && (
                  <p className="text-sm text-gray-500 mt-2">
                    重启可能性: {project.restartPotential === 'high' ? '高' : project.restartPotential === 'medium' ? '中' : '低'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>项目状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PROJECT_STATUSES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      project.status === s.value
                        ? statusColorMap[s.color]
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                资源需求
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="资源名称"
                  value={newResourceName}
                  onChange={e => setNewResourceName(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    value={newResourceType}
                    onChange={e => setNewResourceType(e.target.value as any)}
                    className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="time">时间</option>
                    <option value="money">资金</option>
                    <option value="skill">技能</option>
                    <option value="tool">工具</option>
                    <option value="other">其他</option>
                  </select>
                  <Input
                    placeholder="数量"
                    value={newResourceQuantity}
                    onChange={e => setNewResourceQuantity(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Button onClick={handleAddResource} variant="secondary" className="w-full" disabled={!newResourceName.trim() || !newResourceQuantity.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加资源
                </Button>
              </div>

              <div className="space-y-2">
                {project.resources.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">暂无资源需求</p>
                ) : (
                  project.resources.map(resource => {
                    const Icon = resourceTypeIcons[resource.type];
                    return (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{resource.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{resource.quantity}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${resource.secured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {resource.secured ? '已到位' : '待确认'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {project.status !== 'abandoned' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setAbandonDialogOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              放弃项目
            </Button>
          )}
        </div>
      </div>

      <Dialog open={abandonDialogOpen} onOpenChange={setAbandonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>放弃项目</DialogTitle>
            <DialogDescription>
              记录放弃原因，未来可能重新启动
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="为什么放弃这个项目？"
              value={abandonReason}
              onChange={e => setAbandonReason(e.target.value)}
              rows={4}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">未来重启可能性</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setRestartPotential(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      restartPotential === level
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAbandonDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleAbandon} disabled={!abandonReason.trim()}>
              确认放弃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
