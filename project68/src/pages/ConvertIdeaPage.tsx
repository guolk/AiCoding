import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, Plus, X } from 'lucide-react';

export default function ConvertIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = useAppStore(state => state.getIdea(id || ''));
  const convertToProject = useAppStore(state => state.convertToProject);

  const [title, setTitle] = useState(idea?.title || '');
  const [description, setDescription] = useState(idea?.description || '');
  const [goal, setGoal] = useState('');
  const [milestones, setMilestones] = useState<{ title: string; description: string; deadline: string }[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  if (!idea) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">灵感不存在</p>
        <Button onClick={() => navigate('/ideas')}>返回灵感列表</Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    convertToProject(idea.id, {
      title: title.trim(),
      description: description.trim(),
      goal: goal.trim(),
      tags: idea.tags,
      milestones: milestones.map(m => ({
        title: m.title,
        description: m.description || undefined,
        deadline: m.deadline || undefined
      }))
    });
    
    navigate('/projects');
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([...milestones, { title: newMilestone.trim(), description: '', deadline: '' }]);
    setNewMilestone('');
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">转化为项目</h1>
          <p className="text-sm text-muted-foreground">
            将灵感 "{idea.title}" 转化为正式项目
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">项目名称 *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入项目名称"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">项目描述</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简要描述这个项目"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">项目目标</label>
            <Textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="这个项目想要达成什么目标？"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">里程碑（可选）</label>
            <div className="flex gap-2">
              <Input
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                placeholder="添加里程碑..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
              />
              <Button onClick={addMilestone}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-2 mt-3">
                {milestones.map((m, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{m.title}</span>
                    <button onClick={() => removeMilestone(index)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim()} className="gradient">
              <Target className="w-4 h-4 mr-2" />
              创建项目
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
