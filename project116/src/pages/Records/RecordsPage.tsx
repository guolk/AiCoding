import { Plus, CalendarDays, Users, Star, Smile, Frown, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecords } from '../../context/RecordContext';
import { useJokes } from '../../context/JokeContext';
import { usePerformances } from '../../context/PerformanceContext';
import { AUDIENCE_TYPES, AudienceType, ShowRecord, JokeFeedback } from '../../types';
import { formatDate, formatDuration } from '../../utils/duration';
import { useState } from 'react';

const audienceLabels: Record<AudienceType, string> = {
  general: '普通观众',
  professional: '行业人士',
  student: '学生群体',
  family: '家庭观众',
  international: '国际观众',
  other: '其他',
};

export default function RecordsPage() {
  const navigate = useNavigate();
  const { records, deleteRecord } = useRecords();
  const { jokes } = useJokes();
  const { performances } = usePerformances();
  const [filterAudience, setFilterAudience] = useState<AudienceType | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredRecords = records.filter(r =>
    filterAudience === 'all' || r.audienceType === filterAudience
  );

  const getLandedRate = (feedbacks: JokeFeedback[]) => {
    const landed = feedbacks.filter(f => f.landed).length;
    const total = feedbacks.length;
    return {
      landed,
      total,
      rate: total > 0 ? (landed / total) * 100 : 0,
    };
  };

  const getPerformanceName = (performanceId?: string) => {
    if (!performanceId) return null;
    const perf = performances.find(p => p.id === performanceId);
    return perf?.name || null;
  };

  const handleDelete = (id: string) => {
    if (id) {
      deleteRecord(id);
      setShowDeleteConfirm(null);
    }
  };

  const avgRating = records.length > 0
    ? records.reduce((sum, r) => sum + r.overallRating, 0) / records.length
    : 0;

  const allFeedbacks = records.flatMap(r => r.jokeFeedbacks);
  const totalLanded = allFeedbacks.filter(f => f.landed).length;
  const overallHitRate = allFeedbacks.length > 0
    ? Math.round((totalLanded / allFeedbacks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              表演记录
            </h1>
            <p className="text-ivory/60">
              记录每次演出，追踪你的成长
            </p>
          </div>
          <button
            onClick={() => navigate('/records/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>新建记录</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-stage-red" />
              </div>
              <span className="text-ivory/60 text-sm">演出场次</span>
            </div>
            <p className="font-display text-3xl font-bold">{records.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-spotlight-gold/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-spotlight-gold" />
              </div>
              <span className="text-ivory/60 text-sm">平均评分</span>
            </div>
            <p className="font-display text-3xl font-bold">
              {avgRating > 0 ? avgRating.toFixed(1) : '-'}
              <span className="text-lg text-ivory/50">/10</span>
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Smile className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-ivory/60 text-sm">整体命中率</span>
            </div>
            <p className="font-display text-3xl font-bold text-emerald-400">
              {overallHitRate}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterAudience('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterAudience === 'all'
                ? 'bg-stage-red text-white'
                : 'bg-white/5 text-ivory/60 hover:bg-white/10'
            }`}
          >
            全部
          </button>
          {AUDIENCE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterAudience(type.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterAudience === type.value
                  ? 'bg-stage-red text-white'
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="card p-12 text-center">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
            <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
              还没有记录
            </h3>
            <p className="text-ivory/40 mb-6">开始记录你的第一次演出吧</p>
            <button onClick={() => navigate('/records/new')} className="btn-primary">
              新建记录
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecords.map((record) => {
              const landedStats = getLandedRate(record.jokeFeedbacks);
              const perfName = getPerformanceName(record.performanceId);

              return (
                <div
                  key={record.id}
                  className="card p-6 hover:scale-[1.01] transition-transform cursor-pointer"
                  onClick={() => navigate(`/records/${record.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-xl font-bold text-ivory">
                          {perfName || record.venue || '未命名演出'}
                        </h3>
                        <span className="badge bg-white/10 text-ivory/70">
                          {audienceLabels[record.audienceType]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-ivory/50">
                          {formatDate(record.date)}
                        </span>
                        {record.venue && (
                          <span className="text-sm text-ivory/50">
                            · {record.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/records/${record.id}`)}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(record.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-ivory/40" />
                      <span className="text-sm text-ivory/70">
                        {record.audienceSize}人
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-spotlight-gold" />
                      <span className="text-sm text-ivory/70">
                        {record.overallRating}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {landedStats.rate >= 70 ? (
                        <Smile className="w-4 h-4 text-emerald-400" />
                      ) : landedStats.rate >= 40 ? (
                        <Star className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Frown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-ivory/70">
                        {landedStats.landed}/{landedStats.total} ({Math.round(landedStats.rate)}%
                      </span>
                    </div>
                  </div>

                  {record.overallFeedback && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-ivory/60 line-clamp-2">
                        {record.overallFeedback}
                      </p>
                    </div>
                  )}

                  {record.jokeFeedbacks.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      {record.jokeFeedbacks.slice(0, 3).map((fb, idx) => {
                        const joke = jokes.find(j => j.id === fb.jokeId);
                        return joke ? (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-full ${
                              fb.landed
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {joke.title}
                          </span>
                        ) : null;
                      })}
                      {record.jokeFeedbacks.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-ivory/50">
                          +{record.jokeFeedbacks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-md bg-theater-dark rounded-2xl p-6 border border-white/10">
            <h3 className="font-display text-xl font-bold text-ivory mb-4">
              确认删除？
            </h3>
            <p className="text-ivory/60 mb-6">
              删除这个记录将无法恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-2.5 rounded-xl text-ivory/60 hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
