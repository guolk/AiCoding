import { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle2, Star, Zap, Award, Edit2, X } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { ActivityCategory } from '../types';
import { formatDuration, getToday } from '../utils/date';

const activityCategories: ActivityCategory[] = ['运动', '冥想', '阅读', '社交', '创意', '其他'];

const categoryEmojis: Record<ActivityCategory, string> = {
  '运动': '🏃',
  '冥想': '🧘',
  '阅读': '📚',
  '社交': '👥',
  '创意': '🎨',
  '其他': '✨',
};

export default function AlternativeManagement() {
  const { alternatives, activityLogs, addAlternative, updateAlternative, deleteAlternative, addActivityLog } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState(4);
  const [newActivity, setNewActivity] = useState({
    name: '',
    category: '其他' as ActivityCategory,
    emoji: '✨',
    durationMinutes: 5,
    active: true,
  });

  const activeAlternatives = alternatives.filter((a) => a.active).sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  const topRecommended = [...activeAlternatives].sort((a, b) => b.effectivenessScore - a.effectivenessScore).slice(0, 3);

  const todayLogs = activityLogs.filter((l) => l.date === getToday() && l.completed);
  const todayAlternativesUsed = todayLogs.length;
  const totalTimeSaved = todayLogs.reduce((sum, l) => sum + l.durationMinutes, 0);

  const handleOpenEdit = (id: string) => {
    const alt = alternatives.find((a) => a.id === id);
    if (alt) {
      setEditingId(id);
      setNewActivity({
        name: alt.name,
        category: alt.category,
        emoji: alt.emoji,
        durationMinutes: alt.durationMinutes,
        active: alt.active,
      });
      setShowAddModal(true);
    }
  };

  const handleSaveActivity = () => {
    if (!newActivity.name.trim()) return;
    
    if (editingId) {
      updateAlternative(editingId, newActivity);
    } else {
      addAlternative(newActivity);
    }
    
    setShowAddModal(false);
    setEditingId(null);
    setNewActivity({
      name: '',
      category: '其他',
      emoji: '✨',
      durationMinutes: 5,
      active: true,
    });
  };

  const handleStartActivity = (id: string) => {
    setSelectedActivity(id);
    setRating(4);
    setShowActivityModal(true);
  };

  const handleCompleteActivity = () => {
    if (!selectedActivity) return;
    const alt = alternatives.find((a) => a.id === selectedActivity);
    if (!alt) return;

    addActivityLog({
      alternativeActivityId: selectedActivity,
      date: getToday(),
      startTime: new Date().toISOString(),
      durationMinutes: alt.durationMinutes,
      completed: true,
      effectivenessRating: rating,
    });

    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-500';
    if (score >= 3.5) return 'text-blue-500';
    if (score >= 2.5) return 'text-amber-500';
    return 'text-slate-400';
  };

  const getEffectivenessBg = (score: number) => {
    if (score >= 4.5) return 'bg-emerald-100';
    if (score >= 3.5) return 'bg-blue-100';
    if (score >= 2.5) return 'bg-amber-100';
    return 'bg-slate-100';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">替代方案</h1>
          <p className="text-slate-500 mt-1">当您想玩手机时，试试这些活动</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setNewActivity({
              name: '',
              category: '其他',
              emoji: '✨',
              durationMinutes: 5,
              active: true,
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加活动
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">今日替代次数</p>
              <p className="font-serif text-3xl font-bold text-slate-900">{todayAlternativesUsed}</p>
              <p className="text-xs text-slate-500 mt-1">次成功替代</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">节省屏幕时间</p>
              <p className="font-serif text-3xl font-bold text-slate-900">{formatDuration(totalTimeSaved)}</p>
              <p className="text-xs text-slate-500 mt-1">今日已节省</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">可用活动</p>
              <p className="font-serif text-3xl font-bold text-slate-900">{activeAlternatives.length}</p>
              <p className="text-xs text-slate-500 mt-1">个替代方案</p>
            </div>
          </div>
        </div>
      </div>

      {topRecommended.length > 0 && (
        <div className="card bg-gradient-to-br from-primary-50 to-emerald-50 border-primary-100">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h2 className="font-serif text-xl font-semibold text-slate-900">智能推荐</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">根据您的历史记录，这些活动最有效</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommended.map((alt, index) => (
              <div
                key={alt.id}
                className="bg-white/80 rounded-xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {alt.emoji}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{alt.name}</p>
                      <p className="text-xs text-slate-500">{alt.category}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getEffectivenessBg(alt.effectivenessScore)} ${getEffectivenessColor(alt.effectivenessScore)}`}>
                    #{index + 1}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{alt.effectivenessScore}</span>
                    <span className="text-slate-400">·</span>
                    <span>{alt.durationMinutes}分钟</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartActivity(alt.id)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    开始
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-semibold text-slate-900 mb-4">所有替代活动</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAlternatives.map((alt) => (
            <div key={alt.id} className="card group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(alt.id)}
                  className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-primary-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateAlternative(alt.id, { active: false })}
                  className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {alt.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{alt.name}</h3>
                  <p className="text-sm text-slate-500">{alt.category}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className={`w-4 h-4 ${getEffectivenessColor(alt.effectivenessScore)}`} />
                      <span className={`font-medium ${getEffectivenessColor(alt.effectivenessScore)}`}>
                        {alt.effectivenessScore}/5
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">·</span>
                    <span className="text-sm text-slate-500">{alt.usageCount}次使用</span>
                  </div>
                  <span className="text-sm text-slate-500">{alt.durationMinutes}分钟</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartActivity(alt.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  执行这个活动
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-serif text-xl font-semibold text-slate-900 mb-4">活动分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {activityCategories.map((cat) => {
            const count = alternatives.filter((a) => a.category === cat && a.active).length;
            return (
              <div
                key={cat}
                className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 text-center hover:shadow-md transition-all cursor-pointer group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                  {categoryEmojis[cat]}
                </span>
                <p className="font-medium text-slate-800">{cat}</p>
                <p className="text-sm text-slate-400">{count}个活动</p>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingId ? '编辑活动' : '添加替代活动'}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">活动名称</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：出去散步"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {activityCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setNewActivity({ ...newActivity, category: cat, emoji: categoryEmojis[cat] })}
                  className={`p-3 rounded-xl text-center transition-all ${
                    newActivity.category === cat
                      ? 'bg-primary-100 ring-2 ring-offset-2 ring-primary-400'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xl">{categoryEmojis[cat]}</p>
                  <p className="text-xs text-slate-600 mt-1">{cat}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">图标</label>
            <div className="flex gap-2 flex-wrap">
              {['🚶', '🧘', '📚', '💧', '🎵', '✍️', '🎨', '👥', '🌳', '☕', '🏃', '🧩'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setNewActivity({ ...newActivity, emoji })}
                  className={`w-12 h-12 rounded-xl text-xl transition-all ${
                    newActivity.emoji === emoji
                      ? 'bg-primary-100 ring-2 ring-offset-2 ring-primary-400'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              建议时长：{newActivity.durationMinutes}分钟
            </label>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={newActivity.durationMinutes}
              onChange={(e) => setNewActivity({ ...newActivity, durationMinutes: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="button" onClick={handleSaveActivity} className="btn-primary flex-1">
              {editingId ? '保存修改' : '添加活动'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="活动完成！">
        {selectedActivity && alternatives.find((a) => a.id === selectedActivity) && (
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-float">
              <span className="text-5xl">{alternatives.find((a) => a.id === selectedActivity)?.emoji}</span>
            </div>
            
            <div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                {alternatives.find((a) => a.id === selectedActivity)?.name}
              </h3>
              <p className="text-slate-500 mt-1">
                太棒了！您成功替代了 {formatDuration(alternatives.find((a) => a.id === selectedActivity)?.durationMinutes || 0)} 的屏幕时间
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">这个活动对您有多有效？</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowActivityModal(false)} className="btn-secondary flex-1">
                <X className="w-4 h-4" />
                取消
              </button>
              <button type="button" onClick={handleCompleteActivity} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                完成记录
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return <Zap className={className} />;
}
