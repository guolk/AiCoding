import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Scissors, Music, MessageSquareText, Plus, Trash2, Check, Clock, Save, X } from 'lucide-react';
import { formatDuration, getStatusColor, getStatusLabel, cn, generateId } from '../../utils/helpers';
import { CutItem, MusicItem } from '../../types';

export default function EditingTasks() {
  const { editingTasks, episodes, updateEditingTask } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState(editingTasks[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'cuts' | 'music' | 'cta'>('cuts');

  const selectedTask = editingTasks.find(t => t.id === selectedTaskId);
  const currentEpisode = episodes.find(e => e.id === selectedTask?.episodeId);

  const updateCut = (cutId: string, updates: Partial<CutItem>) => {
    if (!selectedTask) return;
    const newCuts = selectedTask.cuts.map(c => c.id === cutId ? { ...c, ...updates } : c);
    const progress = Math.round((newCuts.filter(c => c.done).length / newCuts.length) * 100);
    updateEditingTask(selectedTaskId, { cuts: newCuts, progress });
  };

  const addCut = () => {
    if (!selectedTask) return;
    const newCut: CutItem = {
      id: generateId(),
      startTime: 0,
      endTime: 30,
      description: '',
      done: false,
    };
    const newCuts = [...selectedTask.cuts, newCut];
    updateEditingTask(selectedTaskId, { cuts: newCuts });
  };

  const deleteCut = (cutId: string) => {
    if (!selectedTask) return;
    const newCuts = selectedTask.cuts.filter(c => c.id !== cutId);
    const progress = newCuts.length > 0 
      ? Math.round((newCuts.filter(c => c.done).length / newCuts.length) * 100)
      : 0;
    updateEditingTask(selectedTaskId, { cuts: newCuts, progress });
  };

  const updateMusic = (musicId: string, updates: Partial<MusicItem>) => {
    if (!selectedTask) return;
    const newMusic = selectedTask.music.map(m => m.id === musicId ? { ...m, ...updates } : m);
    updateEditingTask(selectedTaskId, { music: newMusic });
  };

  const addMusic = () => {
    if (!selectedTask) return;
    const newMusic: MusicItem = {
      id: generateId(),
      name: '',
      position: 'background',
      startTime: 0,
      volume: 50,
      done: false,
    };
    updateEditingTask(selectedTaskId, { music: [...selectedTask.music, newMusic] });
  };

  const deleteMusic = (musicId: string) => {
    if (!selectedTask) return;
    updateEditingTask(selectedTaskId, { music: selectedTask.music.filter(m => m.id !== musicId) });
  };

  const updateCta = (cta: string) => {
    if (!selectedTask) return;
    updateEditingTask(selectedTaskId, { cta });
  };

  const updateStatus = (status: 'pending' | 'in_progress' | 'review' | 'completed') => {
    if (!selectedTask) return;
    updateEditingTask(selectedTaskId, { status });
  };

  const tabs = [
    { key: 'cuts' as const, label: '剪切清单', icon: Scissors, count: selectedTask?.cuts.length || 0 },
    { key: 'music' as const, label: '背景音乐', icon: Music, count: selectedTask?.music.length || 0 },
    { key: 'cta' as const, label: '结尾CTA', icon: MessageSquareText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">选择节目:</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[280px]"
          >
            {editingTasks.map(task => (
              <option key={task.id} value={task.id}>
                {episodes.find(e => e.id === task.episodeId)?.title || '未知节目'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {(['pending', 'in_progress', 'review', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => updateStatus(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedTask?.status === status
                  ? getStatusColor(status) + ' shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-accent-500'
              )}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {selectedTask && (
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">{currentEpisode?.title}</h2>
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white')}>
                {getStatusLabel(selectedTask.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300 mb-1">整体进度</p>
              <div className="flex items-center gap-4">
                <div className="w-40 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
                <span className="font-display text-2xl font-bold">{selectedTask.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
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
                  {tab.count !== undefined && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs',
                      activeTab === tab.key ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'cuts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">剪切清单</h3>
                    <p className="text-sm text-slate-500 mt-1">标记需要剪切或保留的片段</p>
                  </div>
                  <button
                    onClick={addCut}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    添加剪切点
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedTask.cuts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Scissors size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">暂无剪切任务，点击上方按钮添加</p>
                    </div>
                  ) : (
                    selectedTask.cuts.map(cut => (
                      <div
                        key={cut.id}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          cut.done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-accent-300'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateCut(cut.id, { done: !cut.done })}
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                              cut.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-accent-500'
                            )}
                          >
                            {cut.done && <Check size={14} />}
                          </button>
                          <div className="flex items-center gap-2 font-mono text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                            <Clock size={14} className="text-slate-400" />
                            {formatDuration(cut.startTime)} - {formatDuration(cut.endTime)}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={cut.description}
                              onChange={(e) => updateCut(cut.id, { description: e.target.value })}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent-500 outline-none py-1 transition-colors"
                              placeholder="添加剪切说明..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={cut.startTime}
                              onChange={(e) => updateCut(cut.id, { startTime: Number(e.target.value) })}
                              className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                              placeholder="开始"
                            />
                            <input
                              type="number"
                              value={cut.endTime}
                              onChange={(e) => updateCut(cut.id, { endTime: Number(e.target.value) })}
                              className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                              placeholder="结束"
                            />
                          </div>
                          <button
                            onClick={() => deleteCut(cut.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'music' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">背景音乐配置</h3>
                    <p className="text-sm text-slate-500 mt-1">添加片头、片尾和背景音乐</p>
                  </div>
                  <button
                    onClick={addMusic}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    添加音乐
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedTask.music.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Music size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">暂无音乐配置，点击上方按钮添加</p>
                    </div>
                  ) : (
                    selectedTask.music.map(music => (
                      <div
                        key={music.id}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          music.done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-accent-300'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateMusic(music.id, { done: !music.done })}
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                              music.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-accent-500'
                            )}
                          >
                            {music.done && <Check size={14} />}
                          </button>
                          <select
                            value={music.position}
                            onChange={(e) => updateMusic(music.id, { position: e.target.value as MusicItem['position'] })}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                          >
                            <option value="intro">片头</option>
                            <option value="outro">片尾</option>
                            <option value="background">背景音乐</option>
                          </select>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={music.name}
                              onChange={(e) => updateMusic(music.id, { name: e.target.value })}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent-500 outline-none py-1 transition-colors"
                              placeholder="音乐名称..."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">音量:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={music.volume}
                              onChange={(e) => updateMusic(music.id, { volume: Number(e.target.value) })}
                              className="w-24 accent-accent-500"
                            />
                            <span className="text-sm text-slate-600 w-10">{music.volume}%</span>
                          </div>
                          <button
                            onClick={() => deleteMusic(music.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'cta' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800">结尾CTA</h3>
                  <p className="text-sm text-slate-500 mt-1">配置节目结尾的号召性用语</p>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-orange-50 rounded-xl p-6 border border-accent-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                      <MessageSquareText size={20} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">CTA 内容</label>
                      <textarea
                        value={selectedTask.cta}
                        onChange={(e) => updateCta(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none bg-white"
                        rows={4}
                        placeholder="例如：如果你喜欢本期节目，请订阅我们的播客，并在评论区分享你的想法..."
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 mb-2">预览效果</p>
                    <p className="text-slate-700 italic">
                      {selectedTask.cta || 'CTA内容将在这里显示...'}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 提示：</strong>好的CTA应该清晰、具体、有价值。可以包括：订阅、评论、分享、加入社群、访问网站等。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
