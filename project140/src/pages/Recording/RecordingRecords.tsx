import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Clock, AlertTriangle, Scissors, FileAudio, Plus, Save, X, Trash2 } from 'lucide-react';
import { formatDateTime, formatDuration, cn, generateId } from '../../utils/helpers';
import { ClipMarker } from '../../types';

export default function RecordingRecords() {
  const { sessions, episodes, updateSession } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addClipModal, setAddClipModal] = useState<string | null>(null);
  const [newClip, setNewClip] = useState({
    startTime: 0,
    endTime: 0,
    note: '',
    type: 'cut' as ClipMarker['type'],
  });

  const completedSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => 
    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const getEpisodeTitle = (id: string) => episodes.find(e => e.id === id)?.title || '未知节目';

  const getTypeColor = (type: ClipMarker['type']) => {
    switch (type) {
      case 'cut': return 'bg-red-100 text-red-700';
      case 'keep': return 'bg-green-100 text-green-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeLabel = (type: ClipMarker['type']) => {
    switch (type) {
      case 'cut': return '需剪切';
      case 'keep': return '需保留';
      case 'review': return '待审核';
    }
  };

  const handleAddClip = (sessionId: string) => {
    if (newClip.startTime >= newClip.endTime || newClip.endTime === 0) return;
    
    const clip: ClipMarker = {
      id: generateId(),
      ...newClip,
    };
    
    const session = sessions.find(s => s.id === sessionId);
    const existingClips = session?.clipsToEdit || [];
    
    updateSession(sessionId, {
      clipsToEdit: [...existingClips, clip],
    });
    
    setAddClipModal(null);
    setNewClip({ startTime: 0, endTime: 0, note: '', type: 'cut' });
  };

  const handleDeleteClip = (sessionId: string, clipId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    updateSession(sessionId, {
      clipsToEdit: session.clipsToEdit?.filter(c => c.id !== clipId),
    });
  };

  return (
    <div className="space-y-6">
      {completedSessions.length === 0 ? (
        <div className="text-center py-16">
          <FileAudio size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">暂无录制记录</p>
          <p className="text-slate-400 text-sm mt-1">完成录制后，录制记录会显示在这里</p>
        </div>
      ) : (
        completedSessions.map((session, index) => (
          <div
            key={session.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                  <FileAudio size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{getEpisodeTitle(session.episodeId)}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDateTime(session.scheduledAt)}
                    </span>
                    {session.actualDuration && (
                      <span className="flex items-center gap-1">
                        时长: {formatDuration(session.actualDuration)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {session.clipsToEdit && session.clipsToEdit.length > 0 && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-700">{session.clipsToEdit.length}</p>
                      <p className="text-xs text-slate-400">待处理片段</p>
                    </div>
                  )}
                  <div className={cn(
                    'transition-transform',
                    expandedId === session.id ? 'rotate-180' : ''
                  )}>
                    ▼
                  </div>
                </div>
              </div>

              {session.techIssues && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">技术问题记录</p>
                    <p className="text-sm text-red-600">{session.techIssues}</p>
                  </div>
                </div>
              )}
            </div>

            {expandedId === session.id && (
              <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50 animate-slide-down">
                <div className="pt-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Scissors size={18} className="text-accent-500" />
                        需处理片段标记
                      </h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddClipModal(session.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus size={14} />
                        添加标记
                      </button>
                    </div>

                    {session.actualDuration && (
                      <div className="relative h-12 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-30" style={{ width: '100%' }} />
                        {session.clipsToEdit?.map(clip => {
                          const startPercent = (clip.startTime / session.actualDuration!) * 100;
                          const endPercent = (clip.endTime / session.actualDuration!) * 100;
                          const width = endPercent - startPercent;
                          return (
                            <div
                              key={clip.id}
                              className={cn(
                                'absolute top-0 h-full',
                                clip.type === 'cut' ? 'bg-red-500' :
                                clip.type === 'keep' ? 'bg-green-500' : 'bg-yellow-500'
                              )}
                              style={{
                                left: `${startPercent}%`,
                                width: `${Math.max(width, 2)}%`,
                                opacity: 0.6,
                              }}
                              title={`${formatDuration(clip.startTime)} - ${formatDuration(clip.endTime)}: ${clip.note}`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {!session.clipsToEdit || session.clipsToEdit.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6 bg-white rounded-lg border border-dashed border-slate-200">
                        暂无片段标记
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {session.clipsToEdit.map(clip => (
                          <div key={clip.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <span className={cn('px-2 py-1 rounded text-xs font-medium', getTypeColor(clip.type))}>
                              {getTypeLabel(clip.type)}
                            </span>
                            <span className="font-mono text-sm text-slate-600">
                              {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
                            </span>
                            <span className="flex-1 text-sm text-slate-700">{clip.note}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClip(session.id, clip.id); }}
                              className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">录制详情</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-400">实际录制时长</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">
                          {session.actualDuration ? formatDuration(session.actualDuration) : '未记录'}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-400">标记片段数</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">
                          {session.clipsToEdit?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {addClipModal === session.id && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={(e) => { e.stopPropagation(); setAddClipModal(null); }}>
                <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-semibold">添加片段标记</h3>
                    <button onClick={() => setAddClipModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">开始时间 (秒)</label>
                        <input
                          type="number"
                          min="0"
                          value={newClip.startTime}
                          onChange={(e) => setNewClip({ ...newClip, startTime: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">结束时间 (秒)</label>
                        <input
                          type="number"
                          min="0"
                          value={newClip.endTime}
                          onChange={(e) => setNewClip({ ...newClip, endTime: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">标记类型</label>
                      <div className="flex gap-2">
                        {(['cut', 'keep', 'review'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setNewClip({ ...newClip, type })}
                            className={cn(
                              'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                              newClip.type === type
                                ? getTypeColor(type)
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                          >
                            {getTypeLabel(type)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">备注说明</label>
                      <textarea
                        value={newClip.note}
                        onChange={(e) => setNewClip({ ...newClip, note: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                        rows={2}
                        placeholder="描述这个片段需要处理的原因..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setAddClipModal(null)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleAddClip(session.id)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      添加标记
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
