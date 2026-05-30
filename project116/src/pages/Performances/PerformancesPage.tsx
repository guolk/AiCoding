import { Plus, CalendarDays, Clock, Mic, Edit2, Trash2, Copy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePerformances } from '../../context/PerformanceContext';
import { useJokes } from '../../context/JokeContext';
import { OCCASION_TYPES, OccasionType } from '../../types';
import { formatDate, formatDuration } from '../../utils/duration';
import { useState } from 'react';

const occasionLabels: Record<OccasionType, string> = {
  club: '俱乐部演出',
  corporate: '商务活动',
  open_mic: '开放麦',
  special: '专场演出',
  other: '其他场合',
};

export default function PerformancesPage() {
  const navigate = useNavigate();
  const { performances, addPerformance, deletePerformance } = usePerformances();
  const { jokes } = useJokes();
  const [filterOccasion, setFilterOccasion] = useState<OccasionType | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPerformances = performances.filter(p => 
    filterOccasion === 'all' || p.occasion === filterOccasion
  );

  const getTotalDuration = (performance: typeof performances[0]) => {
    return performance.jokeSlots.reduce((sum, slot) => {
      const joke = jokes.find(j => j.id === slot.jokeId);
      return sum + (joke?.estimatedDuration || 0);
    }, 0);
  };

  const handleDuplicate = (performance: typeof performances[0]) => {
    addPerformance({
      name: `${performance.name} (副本)`,
      occasion: performance.occasion,
      targetDuration: performance.targetDuration,
      date: performance.date,
      venue: performance.venue,
      jokeSlots: performance.jokeSlots.map(slot => ({ ...slot })),
    });
  };

  const handleDelete = (id: string) => {
    if (id) {
      deletePerformance(id);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              演出管理
            </h1>
            <p className="text-ivory/60">组织节目单，掌控演出节奏</p>
          </div>
          <button
            onClick={() => navigate('/performances/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>新建节目单</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-stage-red" />
              </div>
              <span className="text-ivory/60 text-sm">节目单总数</span>
            </div>
            <p className="font-display text-3xl font-bold">{performances.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-spotlight-gold/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-spotlight-gold" />
              </div>
              <span className="text-ivory/60 text-sm">可选用段子</span>
            </div>
            <p className="font-display text-3xl font-bold">{jokes.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-ivory/60 text-sm">即将演出</span>
            </div>
            <p className="font-display text-3xl font-bold">
              {performances.filter(p => p.date && new Date(p.date) >= new Date()).length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterOccasion('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterOccasion === 'all'
                ? 'bg-stage-red text-white'
                : 'bg-white/5 text-ivory/60 hover:bg-white/10'
            }`}
          >
            全部
          </button>
          {OCCASION_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterOccasion(type.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterOccasion === type.value
                  ? 'bg-stage-red text-white'
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {filteredPerformances.length === 0 ? (
          <div className="card p-12 text-center">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
            <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
              还没有节目单
            </h3>
            <p className="text-ivory/40 mb-6">创建你的第一个节目单，组织你的演出</p>
            <button onClick={() => navigate('/performances/new')} className="btn-primary">
              新建节目单
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPerformances.map((performance) => {
              const totalDuration = getTotalDuration(performance);
              const targetSeconds = performance.targetDuration * 60;
              const durationPercent = targetSeconds > 0 ? Math.min((totalDuration / targetSeconds) * 100, 100) : 0;
              const isOverTime = totalDuration > targetSeconds;

              return (
                <div
                  key={performance.id}
                  className="card p-6 hover:scale-[1.01] transition-transform cursor-pointer"
                  onClick={() => navigate(`/performances/${performance.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-xl font-bold text-ivory">
                          {performance.name}
                        </h3>
                        <span className="badge bg-white/10 text-ivory/70">
                          {occasionLabels[performance.occasion]}
                        </span>
                      </div>
                      {performance.venue && (
                        <p className="text-sm text-ivory/50 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {performance.venue}
                          {performance.date && ` · ${formatDate(performance.date)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDuplicate(performance)}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="复制节目单"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/performances/${performance.id}`)}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(performance.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-ivory/60">
                        {performance.jokeSlots.length} 个段子
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-ivory/40" />
                        <span className={isOverTime ? 'text-red-400' : 'text-ivory/70'}>
                          {formatDuration(totalDuration)} / {performance.targetDuration}分
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverTime ? 'bg-red-500' : 'bg-spotlight-gold'
                        }`}
                        style={{ width: `${durationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {performance.jokeSlots.slice(0, 4).map(slot => {
                      const joke = jokes.find(j => j.id === slot.jokeId);
                      return joke ? (
                        <span
                          key={slot.id}
                          className="text-xs px-3 py-1 rounded-full bg-white/10 text-ivory/70"
                        >
                          {joke.title}
                        </span>
                      ) : null;
                    })}
                    {performance.jokeSlots.length > 4 && (
                      <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-ivory/50">
                        +{performance.jokeSlots.length - 4} 个
                      </span>
                    )}
                  </div>
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
              删除这个节目单将无法恢复。
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
