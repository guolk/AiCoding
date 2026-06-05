import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FileText, Link, Plus, Trash2, Save, Clock, Check, X } from 'lucide-react';
import { formatDuration, generateId, cn } from '../../utils/helpers';
import { ShowNote } from '../../types';

export default function TranscriptEditor() {
  const { transcripts, episodes, updateTranscript } = useAppStore();
  const [selectedId, setSelectedId] = useState(transcripts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'transcript' | 'shownotes'>('transcript');

  const selected = transcripts.find(t => t.id === selectedId);
  const currentEpisode = episodes.find(e => e.id === selected?.episodeId);

  const [transcriptContent, setTranscriptContent] = useState(selected?.content || '');
  const [showNotes, setShowNotes] = useState<ShowNote[]>(selected?.showNotes || []);
  const [newNote, setNewNote] = useState<Partial<ShowNote>>({
    timestamp: 0,
    content: '',
    link: '',
  });

  const handleContentChange = (content: string) => {
    setTranscriptContent(content);
    const progress = Math.min(100, Math.round((content.length / 5000) * 100));
    if (selected) {
      updateTranscript(selectedId, { content, progress });
    }
  };

  const handleAddNote = () => {
    if (!newNote.content?.trim()) return;
    const note: ShowNote = {
      id: generateId(),
      timestamp: newNote.timestamp || 0,
      content: newNote.content,
      link: newNote.link || undefined,
    };
    const newNotes = [...showNotes, note].sort((a, b) => a.timestamp - b.timestamp);
    setShowNotes(newNotes);
    if (selected) {
      updateTranscript(selectedId, { showNotes: newNotes });
    }
    setNewNote({ timestamp: 0, content: '', link: '' });
  };

  const handleDeleteNote = (noteId: string) => {
    const newNotes = showNotes.filter(n => n.id !== noteId);
    setShowNotes(newNotes);
    if (selected) {
      updateTranscript(selectedId, { showNotes: newNotes });
    }
  };

  const handleUpdateNote = (noteId: string, updates: Partial<ShowNote>) => {
    const newNotes = showNotes.map(n => n.id === noteId ? { ...n, ...updates } : n);
    setShowNotes(newNotes);
  };

  const tabs = [
    { key: 'transcript' as const, label: '文字稿', icon: FileText },
    { key: 'shownotes' as const, label: 'Show Notes', icon: Link, count: showNotes.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">选择节目:</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              const t = transcripts.find(x => x.id === e.target.value);
              if (t) {
                setTranscriptContent(t.content);
                setShowNotes(t.showNotes);
              }
            }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[280px]"
          >
            {transcripts.map(t => (
              <option key={t.id} value={t.id}>
                {episodes.find(e => e.id === t.episodeId)?.title || '未知节目'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            完成进度: <span className="font-semibold text-accent-600">{selected?.progress || 0}%</span>
          </span>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-500"
              style={{ width: `${selected?.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {currentEpisode && (
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">{currentEpisode.title}</h2>
              <p className="text-slate-300 mt-1">
                {transcriptContent.length} 字 · {showNotes.length} 条 Show Notes
              </p>
            </div>
          </div>
        </div>
      )}

      {selected && (
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
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">文字稿编辑</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      输入或粘贴节目文字稿，可以自动转换为时间轴标记
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={transcriptContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-96 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none font-sans text-sm text-slate-700 leading-relaxed"
                    placeholder="在这里输入或粘贴文字稿内容...

提示：
- 可以使用 [00:00] 格式手动标记时间戳
- 系统会根据内容长度估算完成进度
- 完成后可以导出为各种格式"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {transcriptContent.length} 字
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <FileText size={18} />
                    导入字幕文件
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Clock size={18} />
                    自动生成时间轴
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                    <Save size={18} />
                    保存
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'shownotes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">Show Notes 编辑</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      添加节目简介、时间轴要点和相关链接
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">添加新条目</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="number"
                        placeholder="秒"
                        value={newNote.timestamp || ''}
                        onChange={(e) => setNewNote({ ...newNote, timestamp: Number(e.target.value) })}
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                      />
                      <span className="text-xs text-slate-500">
                        {newNote.timestamp ? formatDuration(newNote.timestamp) : ''}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="内容描述"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="相关链接 (可选)"
                      value={newNote.link}
                      onChange={(e) => setNewNote({ ...newNote, link: e.target.value })}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors flex items-center gap-1"
                    >
                      <Plus size={16} />
                      添加
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {showNotes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Link size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">暂无 Show Notes</p>
                      <p className="text-sm text-slate-400 mt-1">添加入场时间点、话题要点和相关链接</p>
                    </div>
                  ) : (
                    showNotes.map((note, index) => (
                      <div
                        key={note.id}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-accent-50/50 to-white rounded-xl border border-accent-100 group"
                      >
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white flex items-center justify-center font-mono text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="font-mono text-sm font-semibold text-accent-600 bg-accent-100 px-3 py-1 rounded-lg">
                            {formatDuration(note.timestamp)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={note.content}
                            onChange={(e) => handleUpdateNote(note.id, { content: e.target.value })}
                            onBlur={() => updateTranscript(selectedId, { showNotes })}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent-500 outline-none py-0.5 text-slate-700 font-medium transition-colors"
                          />
                          {note.link && (
                            <div className="flex items-center gap-2 mt-2">
                              <Link size={14} className="text-slate-400 flex-shrink-0" />
                              <input
                                type="text"
                                value={note.link}
                                onChange={(e) => handleUpdateNote(note.id, { link: e.target.value })}
                                onBlur={() => updateTranscript(selectedId, { showNotes })}
                                className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent-500 outline-none py-0.5 text-sm text-blue-600 transition-colors truncate"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {showNotes.length > 0 && (
                  <div className="bg-gradient-to-br from-primary-950 to-primary-800 rounded-xl p-5 text-white">
                    <h4 className="font-medium mb-3">Show Notes 预览</h4>
                    <div className="space-y-2 text-sm">
                      {showNotes.map((note, index) => (
                        <div key={note.id} className="flex items-start gap-3">
                          <span className="font-mono text-accent-400 flex-shrink-0">
                            [{formatDuration(note.timestamp)}]
                          </span>
                          <span className="text-slate-200">
                            {index + 1}. {note.content}
                            {note.link && (
                              <a href={note.link} className="text-accent-400 hover:underline ml-2">
                                → 链接
                              </a>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
