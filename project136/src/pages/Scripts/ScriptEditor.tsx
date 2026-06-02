import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Check,
  FileText,
  Users,
  Target,
  History,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { MarkerType, MarkerPriority, EmergencyCategory } from '@/types';

const TABS = [
  { id: 'content', label: '结构化创作', icon: <FileText size={18} /> },
  { id: 'timeline', label: '时间轴标注', icon: <Clock size={18} /> },
  { id: 'emergency', label: '备用台词库', icon: <AlertTriangle size={18} /> }
];

const SECTIONS = [
  { key: 'background', label: '背景介绍', icon: <FileText size={16} />, placeholder: '撰写比赛背景介绍，包括赛事重要性、历史意义等...' },
  { key: 'teamIntro', label: '队伍介绍', icon: <Users size={16} />, placeholder: '介绍双方球队的基本情况、首发阵容等...' },
  { key: 'tacticalAnalysis', label: '战术分析', icon: <Target size={16} />, placeholder: '分析双方的战术打法、关键对位、攻防特点...' },
  { key: 'historyBattle', label: '历史对决', icon: <History size={16} />, placeholder: '回顾双方历史交锋记录、关键战役...' },
  { key: 'suspenseSetup', label: '悬念预设', icon: <Sparkles size={16} />, placeholder: '设置本场比赛的看点、悬念、关键人物...' }
];

export default function ScriptEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchIdFromQuery = searchParams.get('matchId');

  const {
    scripts,
    timelineMarkers,
    emergencyLines,
    matches,
    teams,
    getScriptById,
    getMarkersByScriptId,
    updateScript,
    addScript,
    addTimelineMarker,
    updateTimelineMarker,
    deleteTimelineMarker,
    addEmergencyLine,
    updateEmergencyLine,
    deleteEmergencyLine,
    incrementUsageCount
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState('background');
  const [scriptData, setScriptData] = useState({
    matchId: matchIdFromQuery || '',
    background: '',
    teamIntro: '',
    tacticalAnalysis: '',
    historyBattle: '',
    suspenseSetup: ''
  });
  const [markers, setMarkers] = useState<typeof timelineMarkers>([]);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      const script = getScriptById(id);
      if (script) {
        setScriptData({
          matchId: script.matchId,
          background: script.background,
          teamIntro: script.teamIntro,
          tacticalAnalysis: script.tacticalAnalysis,
          historyBattle: script.historyBattle,
          suspenseSetup: script.suspenseSetup
        });
        setMarkers(getMarkersByScriptId(id));
      }
    }
  }, [id, getScriptById, getMarkersByScriptId]);

  const currentMatch = useMemo(() => {
    return matches.find(m => m.id === scriptData.matchId);
  }, [matches, scriptData.matchId]);

  const handleSave = () => {
    if (id && id !== 'new') {
      updateScript(id, scriptData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      addScript(scriptData);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/scripts');
      }, 1000);
    }
  };

  const handleSectionChange = (key: string, value: string) => {
    setScriptData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddMarker = () => {
    const newMarker = {
      scriptId: id || '',
      timePoint: 0,
      content: '',
      type: 'general' as MarkerType,
      priority: 'medium' as MarkerPriority
    };
    setMarkers(prev => [...prev, { ...newMarker, id: `temp-${Date.now()}` }]);
  };

  const handleMarkerChange = (markerId: string, field: string, value: any) => {
    setMarkers(prev => prev.map(m =>
      m.id === markerId ? { ...m, [field]: value } : m
    ));
  };

  const handleDeleteMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
    if (!markerId.startsWith('temp-')) {
      deleteTimelineMarker(markerId);
    }
  };

  const handleCopyLine = (lineId: string, content: string) => {
    navigator.clipboard.writeText(content);
    incrementUsageCount(lineId);
    setCopiedId(lineId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || '未知球队';

  const sortedMarkers = useMemo(() => {
    return [...markers].sort((a, b) => a.timePoint - b.timePoint);
  }, [markers]);

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmergencyCategoryLabel = (category: EmergencyCategory) => {
    const labels = {
      interruption: '信号中断',
      delay: '比赛延误',
      accident: '意外情况',
      other: '其他'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">
            {id && id !== 'new' ? '编辑解说稿' : '新建解说稿'}
          </h1>
          {currentMatch && (
            <p className="text-slate-500 mt-1">
              {getTeamName(currentMatch.homeTeamId)} vs {getTeamName(currentMatch.awayTeamId)} · {currentMatch.league}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/scripts')}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? '已保存' : '保存'}
          </Button>
        </div>
      </div>

      {!currentMatch && (
        <Card>
          <Card.Content>
            <label className="block text-sm font-medium text-slate-700 mb-2">选择比赛</label>
            <select
              value={scriptData.matchId}
              onChange={e => setScriptData(prev => ({ ...prev, matchId: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">请选择要解说的比赛</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>
                  {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)} · {match.league}
                </option>
              ))}
            </select>
          </Card.Content>
        </Card>
      )}

      {currentMatch && (
        <>
          <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <Card>
                  <Card.Content className="p-2 space-y-1">
                    {SECTIONS.map(section => (
                      <button
                        key={section.key}
                        onClick={() => setActiveSection(section.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activeSection === section.key
                            ? 'bg-orange-50 text-orange-600'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {section.icon}
                        <span className="font-medium">{section.label}</span>
                      </button>
                    ))}
                  </Card.Content>
                </Card>
              </div>

              <div className="col-span-3">
                <Card className="h-full">
                  <Card.Header>
                    <Card.Title>
                      {SECTIONS.find(s => s.key === activeSection)?.label}
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <textarea
                      value={scriptData[activeSection as keyof typeof scriptData] as string}
                      onChange={e => handleSectionChange(activeSection, e.target.value)}
                      placeholder={SECTIONS.find(s => s.key === activeSection)?.placeholder}
                      className="w-full h-96 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                    <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
                      <span>
                        字数: {(scriptData[activeSection as keyof typeof scriptData] as string)?.length || 0}
                      </span>
                      <span>自动保存中...</span>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <Card>
              <Card.Header className="flex items-center justify-between">
                <div>
                  <Card.Title>时间轴标注</Card.Title>
                  <p className="text-sm text-slate-500 mt-1">标记比赛各个时间点的解说重点</p>
                </div>
                <Button onClick={handleAddMarker}>
                  <Plus size={16} />
                  添加标记
                </Button>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                  {sortedMarkers.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>还没有时间轴标记</p>
                      <p className="text-sm">点击上方"添加标记"开始创建</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedMarkers.map(marker => (
                        <div key={marker.id} className="relative pl-12">
                          <div className={`absolute left-4 w-4 h-4 rounded-full -translate-x-1/2 border-2 border-white ${
                            marker.type === 'key' ? 'bg-orange-500' :
                            marker.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />

                          <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-slate-800">
                                  {formatTime(marker.timePoint)}
                                </span>
                                <input
                                  type="range"
                                  min="0"
                                  max="90"
                                  step="5"
                                  value={marker.timePoint}
                                  onChange={e => handleMarkerChange(marker.id, 'timePoint', Number(e.target.value))}
                                  className="w-24"
                                />
                              </div>

                              <select
                                value={marker.type}
                                onChange={e => handleMarkerChange(marker.id, 'type', e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                              >
                                <option value="general">一般</option>
                                <option value="key">重点</option>
                                <option value="warning">警告</option>
                              </select>

                              <select
                                value={marker.priority}
                                onChange={e => handleMarkerChange(marker.id, 'priority', e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                              >
                                <option value="high">高优先级</option>
                                <option value="medium">中优先级</option>
                                <option value="low">低优先级</option>
                              </select>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMarker(marker.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>

                            <input
                              type="text"
                              value={marker.content}
                              onChange={e => handleMarkerChange(marker.id, 'content', e.target.value)}
                              placeholder="输入该时间点的解说内容..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <Card>
                <Card.Header className="flex items-center justify-between">
                  <div>
                    <Card.Title>备用台词库</Card.Title>
                    <p className="text-sm text-slate-500 mt-1">紧急情况下使用的串词</p>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-2 gap-4">
                    {(['interruption', 'delay', 'accident', 'other'] as EmergencyCategory[]).map(category => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            category === 'interruption' ? 'warning' :
                            category === 'delay' ? 'info' :
                            category === 'accident' ? 'danger' : 'default'
                          } size="md">
                            {getEmergencyCategoryLabel(category)}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            ({emergencyLines.filter(l => l.category === category).length}条)
                          </span>
                        </div>

                        <div className="space-y-2">
                          {emergencyLines.filter(l => l.category === category).map(line => (
                            <div
                              key={line.id}
                              className="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors group"
                            >
                              <p className="text-sm text-slate-700 mb-2">{line.content}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                  {line.tags.map(tag => (
                                    <span key={tag} className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-slate-400">使用{line.usageCount}次</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyLine(line.id, line.content)}
                                  >
                                    {copiedId === line.id ? <Check size={14} /> : <Copy size={14} />}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
