import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FileAudio, Download, Upload, Clock, HardDrive, MoreVertical, Check, X, Plus, Layers } from 'lucide-react';
import { formatDate, formatDuration, formatFileSize, getStatusLabel, cn } from '../../utils/helpers';

export default function FileManagement() {
  const { files, sessions, episodes } = useAppStore();
  const [versionFilter, setVersionFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getEpisodeTitle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return '未知节目';
    return episodes.find(e => e.id === session.episodeId)?.title || '未知节目';
  };

  const getSessionDate = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? formatDate(session.scheduledAt) : '';
  };

  const filteredFiles = files.filter(f => 
    versionFilter === 'all' || f.version === versionFilter
  );

  const groupedBySession = filteredFiles.reduce((acc, file) => {
    if (!acc[file.sessionId]) {
      acc[file.sessionId] = [];
    }
    acc[file.sessionId].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  const versionOrder = { original: 0, edited: 1, final: 2 };
  const sortedSessions = Object.keys(groupedBySession).sort((a, b) => {
    const dateA = new Date(getSessionDate(a)).getTime();
    const dateB = new Date(getSessionDate(b)).getTime();
    return dateB - dateA;
  });

  const versionColors = {
    original: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: 'text-slate-500' },
    edited: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: 'text-blue-500' },
    final: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: 'text-green-500' },
  };

  const storageUsed = files.reduce((sum, f) => sum + f.fileSize, 0);
  const totalDuration = files.reduce((sum, f) => sum + f.duration, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{files.length}</p>
              <p className="text-sm text-slate-500">总文件数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatDuration(totalDuration)}</p>
              <p className="text-sm text-slate-500">总时长</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <HardDrive size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatFileSize(storageUsed)}</p>
              <p className="text-sm text-slate-500">存储空间</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'original', 'edited', 'final'] as const).map(v => (
            <button
              key={v}
              onClick={() => setVersionFilter(v)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                versionFilter === v
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-accent-500 hover:text-accent-500'
              )}
            >
              {v === 'all' ? '全部' : getStatusLabel(v)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Upload size={18} />
          上传文件
        </button>
      </div>

      <div className="space-y-6">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <FileAudio size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">暂无录制文件</p>
            <p className="text-slate-400 text-sm mt-1">上传录制文件后会在这里显示</p>
          </div>
        ) : (
          sortedSessions.map((sessionId, sessionIndex) => {
            const sessionFiles = groupedBySession[sessionId]
              .sort((a, b) => versionOrder[a.version] - versionOrder[b.version]);
            
            return (
              <div
                key={sessionId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${sessionIndex * 100}ms` }}
              >
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{getEpisodeTitle(sessionId)}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">录制日期: {getSessionDate(sessionId)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {(['original', 'edited', 'final'] as const).map(v => (
                          <div
                            key={v}
                            className={cn(
                              'w-3 h-3 rounded-full',
                              sessionFiles.some(f => f.version === v)
                                ? versionColors[v].bg.replace('bg-', 'bg-').replace('-100', '-500')
                                : 'bg-slate-200'
                            )}
                            title={getStatusLabel(v)}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">{sessionFiles.length} 个版本</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    {sessionFiles.map((file, index) => {
                      const colors = versionColors[file.version];
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all hover:shadow-md',
                            colors.border,
                            'bg-white'
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'w-14 h-14 rounded-xl flex items-center justify-center',
                              colors.bg,
                              colors.icon
                            )}>
                              <FileAudio size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  colors.bg,
                                  colors.text
                                )}>
                                  {getStatusLabel(file.version)}
                                </span>
                                <h4 className="font-medium text-slate-800 truncate">{file.fileName}</h4>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDuration(file.duration)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive size={14} />
                                  {formatFileSize(file.fileSize)}
                                </span>
                                <span>上传于 {formatDate(file.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary-600 transition-colors">
                                <Download size={20} />
                              </button>
                              <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreVertical size={20} />
                              </button>
                            </div>
                          </div>

                          {index < sessionFiles.length - 1 && (
                            <div className="mt-4 pl-7">
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span>↓ 处理后</span>
                                <div className="flex-1 h-px bg-slate-200" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">上传录音文件</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择录制会话</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500">
                  <option value="">请选择关联的录制会话</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{getEpisodeTitle(s.id)} - {formatDate(s.scheduledAt)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">文件版本</label>
                <div className="flex gap-2">
                  {(['original', 'edited', 'final'] as const).map(v => (
                    <button
                      key={v}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2',
                        versionColors[v].border,
                        versionColors[v].bg,
                        versionColors[v].text
                      )}
                    >
                      {getStatusLabel(v)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-accent-500 transition-colors cursor-pointer">
                <Upload size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 font-medium">点击或拖拽文件到此处上传</p>
                <p className="text-sm text-slate-400 mt-1">支持 MP3, WAV, M4A 格式</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                开始上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
