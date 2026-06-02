import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ArrowLeft,
  Target,
  Clock,
  MessageSquare,
  Zap,
  Calendar,
  Edit3,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useAppStore } from '@/store/useAppStore';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function SkillImprovement() {
  const { skillImprovements, updateSkillImprovement } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLog, setEditLog] = useState('');

  const getCategoryInfo = (category: string) => {
    const info: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
      speech_speed: { label: '语速控制', icon: <Clock size={18} />, color: 'from-blue-500 to-blue-600' },
      terminology: { label: '专业术语', icon: <MessageSquare size={18} />, color: 'from-emerald-500 to-emerald-600' },
      emotion: { label: '煽情时机', icon: <Zap size={18} />, color: 'from-purple-500 to-purple-600' },
      other: { label: '其他技能', icon: <Target size={18} />, color: 'from-orange-500 to-orange-600' }
    };
    return info[category] || info.other;
  };

  const radarData = skillImprovements.map(s => ({
    skill: getCategoryInfo(s.category).label,
    水平: s.progress,
    目标: 100
  }));

  const handleEditLog = (id: string, currentLog: string) => {
    setEditingId(id);
    setEditLog(currentLog);
  };

  const handleSaveLog = (id: string) => {
    updateSkillImprovement(id, { practiceLog: editLog });
    setEditingId(null);
  };

  const handleProgressChange = (id: string, delta: number) => {
    const skill = skillImprovements.find(s => s.id === id);
    if (skill) {
      const newProgress = Math.max(0, Math.min(100, skill.progress + delta));
      updateSkillImprovement(id, { progress: newProgress });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/reviews">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
            返回
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">技巧改进</h1>
          <p className="text-slate-500 mt-1">追踪解说技巧的提升</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {skillImprovements.map((skill, index) => {
            const categoryInfo = getCategoryInfo(skill.category);
            return (
              <Card key={skill.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card.Content className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-white shadow-lg`}>
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-800">{categoryInfo.label}</h3>
                          <Badge variant={skill.progress >= 80 ? 'success' : skill.progress >= 50 ? 'warning' : 'default'}>
                            {skill.progress}%
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">目标：{skill.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleProgressChange(skill.id, -5)}
                        className="text-slate-500"
                      >
                        -5%
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleProgressChange(skill.id, 5)}
                        className="text-slate-500"
                      >
                        +5%
                      </Button>
                    </div>
                  </div>

                  <Progress value={skill.progress} />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">练习记录</span>
                      {editingId === skill.id ? (
                        <Button size="sm" onClick={() => handleSaveLog(skill.id)}>
                          <Check size={14} />
                          保存
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEditLog(skill.id, skill.practiceLog)}>
                          <Edit3 size={14} />
                          编辑
                        </Button>
                      )}
                    </div>
                    {editingId === skill.id ? (
                      <textarea
                        value={editLog}
                        onChange={e => setEditLog(e.target.value)}
                        className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-slate-600 leading-relaxed">{skill.practiceLog}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar size={14} />
                      开始于 {new Date(skill.startDate).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>技能雷达图</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="当前水平"
                      dataKey="水平"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="目标"
                      dataKey="目标"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.1}
                      strokeDasharray="3 3"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>总体进度</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600">
                  {Math.round(skillImprovements.reduce((acc, s) => acc + s.progress, 0) / skillImprovements.length)}%
                </div>
                <p className="text-slate-500 mt-1">平均完成度</p>
              </div>
              <div className="space-y-3">
                {skillImprovements.map(skill => {
                  const info = getCategoryInfo(skill.category);
                  return (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{info.label}</span>
                        <span className="font-medium text-slate-800">{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} />
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
            <Card.Content>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-medium text-emerald-900">继续加油！</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    你的语速控制练习进度已达75%，距离目标越来越近了！
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
