import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Star,
  Clock,
  Smile,
  Frown,
  Video,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { useRecords } from '../../context/RecordContext';
import { useJokes } from '../../context/JokeContext';
import { usePerformances } from '../../context/PerformanceContext';
import StarRating from '../../components/UI/StarRating';
import {
  AUDIENCE_TYPES,
  VIDEO_NOTE_TYPES,
  OCCASION_TYPES,
  ShowRecord,
  JokeFeedback,
  SelfEvaluation,
  VideoNote,
  VideoNoteType,
  AudienceType,
} from '../../types';
import { formatTimestamp } from '../../utils/duration';

const today = new Date().toISOString().split('T')[0];

export default function RecordDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const {
    records,
    addRecord,
    updateRecord,
    updateJokeFeedback,
    updateSelfEvaluation,
    addVideoNote,
    updateVideoNote,
    deleteVideoNote,
  } = useRecords();

  const { jokes } = useJokes();
  const { performances } = usePerformances();

  const existingRecord = isNew ? undefined : records.find(r => r.id === id);

  const [date, setDate] = useState(today);
  const [venue, setVenue] = useState('');
  const [audienceType, setAudienceType] = useState<AudienceType>('general');
  const [audienceSize, setAudienceSize] = useState<number>(30);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [jokeFeedbacks, setJokeFeedbacks] = useState<JokeFeedback[]>([]);
  const [selfEvaluation, setSelfEvaluation] = useState<SelfEvaluation | undefined>();
  const [videoNotes, setVideoNotes] = useState<VideoNote[]>([]);
  const [performanceId, setPerformanceId] = useState<string | undefined>();
  const [selectedPerformance, setSelectedPerformance] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'basic' | 'feedback' | 'self' | 'video'>('basic');

  useEffect(() => {
    if (existingRecord) {
      setDate(existingRecord.date);
      setVenue(existingRecord.venue || '');
      setAudienceType(existingRecord.audienceType);
      setAudienceSize(existingRecord.audienceSize);
      setOverallFeedback(existingRecord.overallFeedback || '');
      setOverallRating(existingRecord.overallRating);
      setJokeFeedbacks(existingRecord.jokeFeedbacks || []);
      setSelfEvaluation(existingRecord.selfEvaluation);
      setVideoNotes(existingRecord.videoNotes || []);
      setPerformanceId(existingRecord.performanceId);
    }
  }, [existingRecord]);

  const loadFromPerformance = (perfId: string) => {
    const performance = performances.find(p => p.id === perfId);
    if (performance) {
      setPerformanceId(perfId);
      setVenue(performance.venue || '');
      if (performance.date) {
        setDate(performance.date);
      }
      const newFeedbacks: JokeFeedback[] = performance.jokeSlots.map(slot => ({
        jokeId: slot.jokeId,
        landed: true,
        bestLines: [],
        weakPoints: [],
      }));
      setJokeFeedbacks(newFeedbacks);
    }
  };

  const getJokeById = (jokeId: string) => jokes.find(j => j.id === jokeId);

  const handleAddJokeFeedback = () => {
    const availableJokes = jokes.filter(j => !jokeFeedbacks.find(f => f.jokeId === j.id));
    if (availableJokes.length > 0) {
      setJokeFeedbacks([
        ...jokeFeedbacks,
        {
          jokeId: availableJokes[0].id,
          landed: true,
          bestLines: [],
          weakPoints: [],
        },
      ]);
    }
  };

  const handleRemoveJokeFeedback = (jokeId: string) => {
    setJokeFeedbacks(jokeFeedbacks.filter(f => f.jokeId !== jokeId));
  };

  const handleUpdateJokeFeedback = (index: number, updates: Partial<JokeFeedback>) => {
    const newFeedbacks = [...jokeFeedbacks];
    newFeedbacks[index] = { ...newFeedbacks[index], ...updates };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleAddBestLine = (index: number) => {
    const newFeedbacks = [...jokeFeedbacks];
    newFeedbacks[index] = {
      ...newFeedbacks[index],
      bestLines: [...(newFeedbacks[index].bestLines || []), ''],
    };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleUpdateBestLine = (fbIndex: number, lineIndex: number, value: string) => {
    const newFeedbacks = [...jokeFeedbacks];
    const lines = [...(newFeedbacks[fbIndex].bestLines || [])];
    lines[lineIndex] = value;
    newFeedbacks[fbIndex] = { ...newFeedbacks[fbIndex], bestLines: lines };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleRemoveBestLine = (fbIndex: number, lineIndex: number) => {
    const newFeedbacks = [...jokeFeedbacks];
    newFeedbacks[fbIndex] = {
      ...newFeedbacks[fbIndex],
      bestLines: (newFeedbacks[fbIndex].bestLines || []).filter((_, i) => i !== lineIndex),
    };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleAddWeakPoint = (index: number) => {
    const newFeedbacks = [...jokeFeedbacks];
    newFeedbacks[index] = {
      ...newFeedbacks[index],
      weakPoints: [...(newFeedbacks[index].weakPoints || []), ''],
    };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleUpdateWeakPoint = (fbIndex: number, pointIndex: number, value: string) => {
    const newFeedbacks = [...jokeFeedbacks];
    const points = [...(newFeedbacks[fbIndex].weakPoints || [])];
    points[pointIndex] = value;
    newFeedbacks[fbIndex] = { ...newFeedbacks[fbIndex], weakPoints: points };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleRemoveWeakPoint = (fbIndex: number, pointIndex: number) => {
    const newFeedbacks = [...jokeFeedbacks];
    newFeedbacks[fbIndex] = {
      ...newFeedbacks[fbIndex],
      weakPoints: (newFeedbacks[fbIndex].weakPoints || []).filter((_, i) => i !== pointIndex),
    };
    setJokeFeedbacks(newFeedbacks);
  };

  const handleAddVideoNote = () => {
    const newNote: VideoNote = {
      id: `temp-${Date.now()}`,
      timestamp: 0,
      note: '',
      type: 'note',
    };
    setVideoNotes([...videoNotes, newNote]);
  };

  const handleUpdateVideoNote = (index: number, updates: Partial<VideoNote>) => {
    const newNotes = [...videoNotes];
    newNotes[index] = { ...newNotes[index], ...updates };
    setVideoNotes(newNotes);
  };

  const handleRemoveVideoNote = (index: number) => {
    const note = videoNotes[index];
    if (note.id.startsWith('temp-')) {
      setVideoNotes(videoNotes.filter((_, i) => i !== index));
    } else if (id) {
      deleteVideoNote(id, note.id);
      setVideoNotes(videoNotes.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const recordData = {
      date,
      venue: venue || undefined,
      audienceType,
      audienceSize,
      overallFeedback: overallFeedback || undefined,
      overallRating,
      jokeFeedbacks: jokeFeedbacks.filter(f => f.jokeId),
      selfEvaluation,
      videoNotes,
      performanceId: performanceId || undefined,
    };

    if (isNew) {
      const newId = addRecord(recordData);
      navigate('/records');
    } else if (id) {
      updateRecord(id, recordData);
      navigate('/records');
    }
  };

  const hitRate = jokeFeedbacks.length > 0
    ? Math.round((jokeFeedbacks.filter(f => f.landed).length / jokeFeedbacks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/records')}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-1">
              {isNew ? '新建表演记录' : '编辑表演记录'}
            </h1>
            <p className="text-ivory/60">记录演出的每一个细节</p>
          </div>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>保存</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin">
          {[
            { key: 'basic', label: '基本信息', icon: <Star className="w-4 h-4" /> },
            { key: 'feedback', label: '段子反馈', icon: <Smile className="w-4 h-4" /> },
            { key: 'self', label: '自我评估', icon: <Star className="w-4 h-4" /> },
            { key: 'video', label: '录像笔记', icon: <Video className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-stage-red text-white'
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div className="card p-6 space-y-6">
            <div>
              <label className="label">关联节目单</label>
              <select
                value={performanceId || ''}
                onChange={e => {
                  const val = e.target.value;
                  if (val) {
                    loadFromPerformance(val);
                  } else {
                    setPerformanceId(undefined);
                  }
                }}
                className="input"
              >
                <option value="">不关联节目单</option>
                {performances.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({OCCASION_TYPES.find(o => o.value === p.occasion)?.label})
                  </option>
                ))}
              </select>
              {performanceId && (
                <p className="text-xs text-spotlight-gold/60 mt-2">
                  已自动加载该节目单的段子到反馈记录中
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">演出日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">演出场地</label>
                <input
                  type="text"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  placeholder="例如：某某喜剧俱乐部"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">观众类型</label>
                <select
                  value={audienceType}
                  onChange={e => setAudienceType(e.target.value as AudienceType)}
                  className="input"
                >
                  {AUDIENCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">观众人数</label>
                <input
                  type="number"
                  min="1"
                  value={audienceSize}
                  onChange={e => setAudienceSize(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">整体评分 (1-10)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={overallRating}
                  onChange={e => setOverallRating(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="font-display text-2xl font-bold text-spotlight-gold">
                  {overallRating}/10
                </span>
              </div>
            </div>

            <div>
              <label className="label">整体反馈</label>
              <textarea
                value={overallFeedback}
                onChange={e => setOverallFeedback(e.target.value)}
                placeholder="记录整体演出感受..."
                rows={4}
                className="input"
              />
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">段子反馈记录</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>响了: {jokeFeedbacks.filter(f => f.landed).length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>没响: {jokeFeedbacks.filter(f => !f.landed).length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Star className="w-4 h-4 text-spotlight-gold" />
                    <span className={hitRate >= 70 ? 'text-emerald-400' : hitRate >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                      命中率: {hitRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {jokeFeedbacks.map((feedback, index) => {
                  const joke = getJokeById(feedback.jokeId);
                  return (
                    <div
                      key={`${feedback.jokeId}-${index}`}
                      className={`p-4 rounded-xl border ${
                        feedback.landed
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <select
                            value={feedback.jokeId}
                            onChange={e => handleUpdateJokeFeedback(index, { jokeId: e.target.value })}
                            className="input max-w-xs"
                          >
                            <option value="">选择段子</option>
                            {jokes.map(j => (
                              <option key={j.id} value={j.id}>
                                {j.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateJokeFeedback(index, { landed: !feedback.landed })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              feedback.landed
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {feedback.landed ? '响了' : '没响'}
                          </button>
                          <button
                            onClick={() => handleRemoveJokeFeedback(feedback.jokeId)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-ivory/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {joke && (
                        <div className="mb-4">
                          <p className="text-sm text-ivory/60 line-clamp-2">
                            {joke.setup} → {joke.punchline}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label text-xs mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            亮点金句
                          </label>
                          <div className="space-y-2">
                            {(feedback.bestLines || []).map((line, lineIndex) => (
                              <div key={lineIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={line}
                                  onChange={e => handleUpdateBestLine(index, lineIndex, e.target.value)}
                                  placeholder="记录最响的那句..."
                                  className="input text-sm py-2"
                                />
                                <button
                                  onClick={() => handleRemoveBestLine(index, lineIndex)}
                                  className="p-2 rounded-lg hover:bg-white/10 text-ivory/40"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddBestLine(index)}
                              className="text-xs text-spotlight-gold/70 hover:text-spotlight-gold flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              添加金句
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="label text-xs mb-2 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            问题点
                          </label>
                          <div className="space-y-2">
                            {(feedback.weakPoints || []).map((point, pointIndex) => (
                              <div key={pointIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={point}
                                  onChange={e => handleUpdateWeakPoint(index, pointIndex, e.target.value)}
                                  placeholder="需要改进的地方..."
                                  className="input text-sm py-2"
                                />
                                <button
                                  onClick={() => handleRemoveWeakPoint(index, pointIndex)}
                                  className="p-2 rounded-lg hover:bg-white/10 text-ivory/40"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddWeakPoint(index)}
                              className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              添加问题
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-ivory/40" />
                          <span className="text-sm text-ivory/60">笑声时长(秒):</span>
                          <input
                            type="number"
                            min="0"
                            value={feedback.laughterDuration || ''}
                            onChange={e => handleUpdateJokeFeedback(index, {
                              laughterDuration: e.target.value ? parseInt(e.target.value) : undefined,
                            })}
                            className="input w-20 text-sm py-2"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddJokeFeedback}
                className="mt-4 w-full p-4 rounded-xl border-2 border-dashed border-white/20 text-ivory/40 hover:border-spotlight-gold/50 hover:text-spotlight-gold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加段子反馈
              </button>
            </div>
          </div>
        )}

        {activeTab === 'self' && (
          <div className="card p-6 space-y-6">
            <h3 className="font-display text-lg font-bold">自我评估</h3>

            <div className="space-y-6">
              <div>
                <label className="label flex items-center justify-between">
                  <span>节奏把控</span>
                  <span className="text-spotlight-gold font-bold">
                    {selfEvaluation?.rhythmRating || 0}/10
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selfEvaluation?.rhythmRating || 0}
                  onChange={e => setSelfEvaluation({
                    ...(selfEvaluation || {
                      rhythmRating: 0,
                      bodyLanguageRating: 0,
                      interactionRating: 0,
                    }),
                    rhythmRating: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>肢体语言</span>
                  <span className="text-spotlight-gold font-bold">
                    {selfEvaluation?.bodyLanguageRating || 0}/10
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selfEvaluation?.bodyLanguageRating || 0}
                  onChange={e => setSelfEvaluation({
                    ...(selfEvaluation || {
                      rhythmRating: 0,
                      bodyLanguageRating: 0,
                      interactionRating: 0,
                    }),
                    bodyLanguageRating: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>观众互动</span>
                  <span className="text-spotlight-gold font-bold">
                    {selfEvaluation?.interactionRating || 0}/10
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selfEvaluation?.interactionRating || 0}
                  onChange={e => setSelfEvaluation({
                    ...(selfEvaluation || {
                      rhythmRating: 0,
                      bodyLanguageRating: 0,
                      interactionRating: 0,
                    }),
                    interactionRating: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="label">自我点评</label>
                <textarea
                  value={selfEvaluation?.comment || ''}
                  onChange={e => setSelfEvaluation({
                    ...(selfEvaluation || {
                      rhythmRating: 0,
                      bodyLanguageRating: 0,
                      interactionRating: 0,
                    }),
                    comment: e.target.value,
                  })}
                  placeholder="记录这次表演的整体感受、哪些地方做得好、哪些需要改进..."
                  rows={5}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold">录像回看笔记</h3>
                <button
                  onClick={handleAddVideoNote}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  添加笔记
                </button>
              </div>

              {videoNotes.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
                  <p className="text-ivory/40 mb-2">还没有录像笔记</p>
                  <p className="text-ivory/30 text-sm">
                    记录录像回看时的关键时间点和发现
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videoNotes
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((note, index) => (
                      <div
                        key={note.id}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-shrink-0 w-20">
                          <input
                            type="number"
                            min="0"
                            value={note.timestamp}
                            onChange={e => handleUpdateVideoNote(index, {
                              timestamp: parseInt(e.target.value) || 0,
                            })}
                            className="input text-center text-sm py-2"
                            placeholder="秒"
                          />
                          <p className="text-xs text-ivory/40 text-center mt-1">
                            {formatTimestamp(note.timestamp)}
                          </p>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={note.type}
                              onChange={e => handleUpdateVideoNote(index, {
                                type: e.target.value as VideoNoteType,
                              })}
                              className="input max-w-xs text-sm py-1.5"
                            >
                              {VIDEO_NOTE_TYPES.map(t => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            <span className={`text-xs font-medium ${
                              VIDEO_NOTE_TYPES.find(t => t.value === note.type)?.color
                            }`}>
                              {VIDEO_NOTE_TYPES.find(t => t.value === note.type)?.label}
                            </span>
                          </div>
                          <textarea
                            value={note.note}
                            onChange={e => handleUpdateVideoNote(index, { note: e.target.value })}
                            placeholder="记录这个时间点的观察..."
                            rows={2}
                            className="input text-sm py-2"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveVideoNote(index)}
                          className="flex-shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
