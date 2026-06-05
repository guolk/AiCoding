import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Trash2, GripVertical, Save, Clock, MessageSquare, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Outline, Question, FlowItem, Transition } from '../../types';
import { generateId, cn, formatDuration } from '../../utils/helpers';

export default function OutlineEditor() {
  const { episodes, outlines, saveOutline } = useAppStore();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'questions' | 'flow' | 'transitions'>('questions');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);

  const currentEpisode = episodes.find(e => e.id === selectedEpisodeId);
  const existingOutline = outlines.find(o => o.episodeId === selectedEpisodeId);

  const [outline, setOutline] = useState<Partial<Outline>>({
    episodeId: selectedEpisodeId,
    questions: existingOutline?.questions || [],
    flow: existingOutline?.flow || [],
    transitions: existingOutline?.transitions || [],
  });

  const handleEpisodeChange = (episodeId: string) => {
    setSelectedEpisodeId(episodeId);
    const found = outlines.find(o => o.episodeId === episodeId);
    setOutline({
      episodeId,
      questions: found?.questions || [],
      flow: found?.flow || [],
      transitions: found?.transitions || [],
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      content: '',
      order: (outline.questions?.length || 0) + 1,
      estimatedTime: 5,
    };
    setOutline({ ...outline, questions: [...(outline.questions || []), newQuestion] });
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setOutline({
      ...outline,
      questions: outline.questions?.map(q => q.id === id ? { ...q, ...updates } : q),
    });
  };

  const deleteQuestion = (id: string) => {
    setOutline({
      ...outline,
      questions: outline.questions?.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i + 1 })),
    });
  };

  const addFlowItem = () => {
    const newItem: FlowItem = {
      id: generateId(),
      title: '',
      description: '',
      duration: 5,
      order: (outline.flow?.length || 0) + 1,
    };
    setOutline({ ...outline, flow: [...(outline.flow || []), newItem] });
    setExpandedFlow(newItem.id);
  };

  const updateFlowItem = (id: string, updates: Partial<FlowItem>) => {
    setOutline({
      ...outline,
      flow: outline.flow?.map(f => f.id === id ? { ...f, ...updates } : f),
    });
  };

  const deleteFlowItem = (id: string) => {
    setOutline({
      ...outline,
      flow: outline.flow?.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i + 1 })),
    });
  };

  const addTransition = () => {
    const newTransition: Transition = {
      id: generateId(),
      from: '',
      to: '',
      content: '',
    };
    setOutline({ ...outline, transitions: [...(outline.transitions || []), newTransition] });
  };

  const updateTransition = (id: string, updates: Partial<Transition>) => {
    setOutline({
      ...outline,
      transitions: outline.transitions?.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  };

  const deleteTransition = (id: string) => {
    setOutline({
      ...outline,
      transitions: outline.transitions?.filter(t => t.id !== id),
    });
  };

  const handleSave = () => {
    if (outline.questions && outline.flow && outline.transitions) {
      saveOutline(outline as Omit<Outline, 'id'>);
      alert('大纲已保存！');
    }
  };

  const totalQuestionTime = outline.questions?.reduce((sum, q) => sum + q.estimatedTime, 0) || 0;
  const totalFlowTime = outline.flow?.reduce((sum, f) => sum + f.duration, 0) || 0;

  const tabs = [
    { key: 'questions' as const, label: '问题清单', icon: MessageSquare, count: outline.questions?.length || 0 },
    { key: 'flow' as const, label: '话题流程', icon: ArrowRight, count: outline.flow?.length || 0 },
    { key: 'transitions' as const, label: '过渡语言', icon: ArrowRight, count: outline.transitions?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">选择节目:</label>
          <select
            value={selectedEpisodeId}
            onChange={(e) => handleEpisodeChange(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[280px]"
          >
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>{ep.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Save size={18} />
          保存大纲
        </button>
      </div>

      {currentEpisode && (
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
          <h2 className="font-display text-2xl font-bold mb-2">{currentEpisode.title}</h2>
          <div className="flex items-center gap-6 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Clock size={16} />
              预计总时长: {formatDuration((totalFlowTime || totalQuestionTime) * 60)}
            </span>
            <span>问题: {outline.questions?.length || 0} 个</span>
            <span>流程: {outline.flow?.length || 0} 段</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-accent-600 border-accent-500 bg-accent-50/50'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon size={18} />
                {tab.label}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.key ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600'
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">问题清单</h3>
                  <p className="text-sm text-slate-500 mt-1">规划要向嘉宾提问的问题，预估每个问题的讨论时间</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    预计时长: <span className="font-semibold text-accent-600">{formatDuration(totalQuestionTime * 60)}</span>
                  </span>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    添加问题
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {outline.questions?.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">还没有问题，点击上方按钮添加第一个问题</p>
                  </div>
                )}
                {outline.questions?.map((question, index) => (
                  <div
                    key={question.id}
                    className={cn(
                      'border rounded-xl overflow-hidden transition-all',
                      expandedQuestion === question.id ? 'border-accent-500 shadow-md' : 'border-slate-200'
                    )}
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                    >
                      <GripVertical size={20} className="text-slate-400 cursor-grab" />
                      <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium truncate', question.content ? 'text-slate-800' : 'text-slate-400 italic')}>
                          {question.content || '点击编辑问题内容...'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock size={14} />
                          {question.estimatedTime} 分钟
                        </span>
                        {expandedQuestion === question.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                    {expandedQuestion === question.id && (
                      <div className="p-4 space-y-4 animate-slide-down">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">问题内容</label>
                          <textarea
                            value={question.content}
                            onChange={(e) => updateQuestion(question.id, { content: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                            rows={3}
                            placeholder="输入要问嘉宾的问题..."
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">预估时间 (分钟)</label>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={question.estimatedTime}
                              onChange={(e) => updateQuestion(question.id, { estimatedTime: Number(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id); }}
                            className="self-end px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={18} />
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">话题流程</h3>
                  <p className="text-sm text-slate-500 mt-1">规划整期节目的话题走向和时间分配</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    预计时长: <span className="font-semibold text-accent-600">{formatDuration(totalFlowTime * 60)}</span>
                  </span>
                  <button
                    onClick={addFlowItem}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    添加流程
                  </button>
                </div>
              </div>

              <div className="relative">
                {outline.flow?.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <ArrowRight size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">还没有流程，点击上方按钮添加第一个流程节点</p>
                  </div>
                )}
                {outline.flow?.map((item, index) => (
                  <div key={item.id} className="relative">
                    <div
                      className={cn(
                        'border rounded-xl overflow-hidden transition-all',
                        expandedFlow === item.id ? 'border-accent-500 shadow-md' : 'border-slate-200'
                      )}
                    >
                      <div
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white cursor-pointer"
                        onClick={() => setExpandedFlow(expandedFlow === item.id ? null : item.id)}
                      >
                        <GripVertical size={20} className="text-slate-400 cursor-grab" />
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-medium truncate', item.title ? 'text-slate-800' : 'text-slate-400 italic')}>
                            {item.title || '点击编辑流程标题...'}
                          </p>
                          {item.description && (
                            <p className="text-sm text-slate-500 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                            {item.duration} 分钟
                          </span>
                          {expandedFlow === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                      {expandedFlow === item.id && (
                        <div className="p-4 space-y-4 animate-slide-down">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">环节标题</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateFlowItem(item.id, { title: e.target.value })}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                              placeholder="如：开场白、话题讨论、总结等"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">环节描述</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateFlowItem(item.id, { description: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                              rows={2}
                              placeholder="描述这个环节要讨论的内容..."
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">时长 (分钟)</label>
                              <input
                                type="number"
                                min="1"
                                value={item.duration}
                                onChange={(e) => updateFlowItem(item.id, { duration: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                              />
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteFlowItem(item.id); }}
                              className="self-end px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={18} />
                              删除
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {index < (outline.flow?.length || 0) - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowRight size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transitions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">过渡语言</h3>
                  <p className="text-sm text-slate-500 mt-1">准备环节之间的过渡语，让节目更流畅自然</p>
                </div>
                <button
                  onClick={addTransition}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  添加过渡
                </button>
              </div>

              <div className="space-y-3">
                {outline.transitions?.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <ArrowRight size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">还没有过渡语，点击上方按钮添加</p>
                  </div>
                )}
                {outline.transitions?.map(transition => (
                  <div key={transition.id} className="p-4 bg-gradient-to-r from-accent-50 to-orange-50 rounded-xl border border-accent-200">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                        <select
                          value={transition.from}
                          onChange={(e) => updateTransition(transition.id, { from: e.target.value })}
                          className="px-3 py-1.5 border border-accent-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          <option value="">从...</option>
                          {outline.flow?.map(f => (
                            <option key={f.id} value={f.title}>{f.title}</option>
                          ))}
                        </select>
                        <ArrowRight size={16} className="text-accent-500" />
                        <select
                          value={transition.to}
                          onChange={(e) => updateTransition(transition.id, { to: e.target.value })}
                          className="px-3 py-1.5 border border-accent-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          <option value="">到...</option>
                          {outline.flow?.map(f => (
                            <option key={f.id} value={f.title}>{f.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={transition.content}
                          onChange={(e) => updateTransition(transition.id, { content: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none bg-white"
                          rows={2}
                          placeholder="写下过渡语，如：'聊了这么多关于A的话题，接下来我们来谈谈B方面...'"
                        />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTransition(transition.id); }}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
