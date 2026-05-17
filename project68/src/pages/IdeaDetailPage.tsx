import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { IDEA_SOURCES, IDEA_EMOTIONS, IDEA_STATUSES } from '@/types';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { ArrowLeft, Plus, Clock, BookOpen, Sparkles, Calendar, Target, CheckCircle2, BarChart3 } from 'lucide-react';

export default function IdeaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = useAppStore(state => state.getIdea(id || ''));
  const addIncubationEntry = useAppStore(state => state.addIncubationEntry);
  const updateFeasibility = useAppStore(state => state.updateFeasibility);
  const addFermentReminder = useAppStore(state => state.addFermentReminder);
  const updateIdea = useAppStore(state => state.updateIdea);

  const [newEntry, setNewEntry] = useState('');
  const [entryMood, setEntryMood] = useState('');
  const [marketScore, setMarketScore] = useState(5);
  const [technicalScore, setTechnicalScore] = useState(5);
  const [timelineScore, setTimelineScore] = useState(5);
  const [feasibilityNotes, setFeasibilityNotes] = useState('');
  const [fermentDays, setFermentDays] = useState(7);

  if (!idea) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">灵感不存在</p>
        <Button onClick={() => navigate('/ideas')}>返回灵感列表</Button>
      </div>
    );
  }

  const source = IDEA_SOURCES.find(s => s.value === idea.source);
  const emotion = IDEA_EMOTIONS.find(e => e.value === idea.emotion);
  const status = IDEA_STATUSES.find(s => s.value === idea.status);

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    addIncubationEntry(idea.id, { content: newEntry.trim(), mood: entryMood || undefined });
    setNewEntry('');
    setEntryMood('');
  };

  const handleSaveFeasibility = () => {
    updateFeasibility(idea.id, {
      market: marketScore,
      technical: technicalScore,
      timeline: timelineScore,
      notes: feasibilityNotes || undefined
    });
  };

  const handleSetFerment = () => {
    addFermentReminder(idea.id, fermentDays);
    updateIdea(idea.id, { status: 'incubating' });
  };

  const avgFeasibility = idea.feasibility 
    ? Math.round((idea.feasibility.market + idea.feasibility.technical + idea.feasibility.timeline) / 3)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{idea.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            {getRelativeTime(idea.createdAt)}
            <span>·</span>
            <span>{source?.icon} {source?.label}</span>
            <span>·</span>
            <span>{emotion?.emoji} {emotion?.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>灵感描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {idea.description || '暂无详细描述'}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {idea.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                孵化日记
                <Badge variant="secondary" className="ml-2">
                  {idea.incubationEntries.length} 条记录
                </Badge>
              </CardTitle>
              <CardDescription>
                持续记录对这个灵感的新想法和关联思考
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="今天对这个灵感有什么新想法？"
                  value={newEntry}
                  onChange={e => setNewEntry(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="当时的心情（可选）"
                    value={entryMood}
                    onChange={e => setEntryMood(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddEntry} disabled={!newEntry.trim()}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {idea.incubationEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    还没有孵化记录，开始记录你的思考吧
                  </p>
                ) : (
                  <div className="relative pl-4 border-l-2 border-purple-100">
                    {idea.incubationEntries.slice().reverse().map((entry) => (
                      <div key={entry.id} className="relative mb-6">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500" />
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{entry.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{formatDate(entry.date)}</span>
                            {entry.mood && (
                              <>
                                <span>·</span>
                                <span>心情: {entry.mood}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                可行性评估
              </CardTitle>
              <CardDescription>
                从市场、技术、时间三个维度评估
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {idea.feasibility && (
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl mb-4">
                  <div className="text-3xl font-bold text-purple-600">{avgFeasibility}/10</div>
                  <div className="text-sm text-gray-600">综合可行性得分</div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>市场需求</span>
                    <span className="font-medium">{idea.feasibility?.market ?? marketScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={idea.feasibility?.market ?? marketScore}
                    onChange={e => setMarketScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>技术可行</span>
                    <span className="font-medium">{idea.feasibility?.technical ?? technicalScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={idea.feasibility?.technical ?? technicalScore}
                    onChange={e => setTechnicalScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>时间投入</span>
                    <span className="font-medium">{idea.feasibility?.timeline ?? timelineScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={idea.feasibility?.timeline ?? timelineScore}
                    onChange={e => setTimelineScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <Textarea
                placeholder="评估备注..."
                value={idea.feasibility?.notes ?? feasibilityNotes}
                onChange={e => setFeasibilityNotes(e.target.value)}
                rows={2}
              />

              <Button onClick={handleSaveFeasibility} className="w-full">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                保存评估
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                发酵提醒
              </CardTitle>
              <CardDescription>
                让灵感沉淀一段时间后再审视
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={fermentDays}
                  onChange={e => setFermentDays(Number(e.target.value))}
                />
                <span className="text-sm text-gray-500">天后重看</span>
              </div>
              <Button onClick={handleSetFerment} variant="secondary" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                设置发酵提醒
              </Button>
              {idea.fermentReminders.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  已设置 {idea.fermentReminders.filter(r => r.isActive).length} 个活跃提醒
                </div>
              )}
            </CardContent>
          </Card>

          {idea.status !== 'project' && (
            <Button
              onClick={() => navigate(`/convert/${idea.id}`)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              转化为项目
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
