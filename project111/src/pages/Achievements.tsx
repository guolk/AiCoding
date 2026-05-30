import React from 'react';
import { Target, Lock, Sparkles, Trophy, Users, Eye, EyeOff, X } from 'lucide-react';
import { useAchievementStore } from '../stores/useAchievementStore';
import AchievementBadge from '../components/AchievementBadge';
import ProgressBar from '../components/ProgressBar';
import type { AchievementCategory, Achievement } from '../types';
import { ACHIEVEMENT_CATEGORY_LABELS } from '../types';

export default function Achievements() {
  const {
    allAchievements,
    teamChallenge,
    filterCategory,
    setFilterCategory,
    getFilteredAchievements,
    getUnlockedCount,
    getTotalCount,
  } = useAchievementStore();

  const categories: (AchievementCategory | 'all')[] = ['all', 'individual', 'team', 'hidden'];
  const filteredAchievements = getFilteredAchievements();

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const progress = (unlockedCount / totalCount) * 100;

  const challengeProgress = teamChallenge
    ? (teamChallenge.currentCoins / teamChallenge.targetCoins) * 100
    : 0;

  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null);

  const getCategoryIcon = (category: AchievementCategory | 'all') => {
    switch (category) {
      case 'individual': return <Trophy className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'hidden': return <EyeOff className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">🎖️ 成就系统</h1>
          <p className="text-neutral-500">解锁成就，收集徽章！</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-warm rounded-2xl text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
          <span className="font-display text-xl">
            {unlockedCount} / {totalCount}
          </span>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-neutral-800">总体进度</h3>
          <span className="text-2xl font-display text-primary-600">
            {progress.toFixed(0)}%
          </span>
        </div>
        <ProgressBar
          progress={progress}
          color="primary"
          height="lg"
          showLabel
          label="成就解锁进度"
        />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 rounded-2xl bg-white/70">
            <p className="text-3xl font-display text-primary-600">{unlockedCount}</p>
            <p className="text-sm text-neutral-500">已解锁</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/70">
            <p className="text-3xl font-display text-neutral-400">
              {totalCount - unlockedCount}
            </p>
            <p className="text-sm text-neutral-500">待解锁</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/70">
            <p className="text-3xl font-display text-secondary-600">
              {allAchievements.filter((a) => a.category === 'team' && a.isUnlocked).length}
            </p>
            <p className="text-sm text-neutral-500">团队成就</p>
          </div>
        </div>
      </div>

      {teamChallenge && teamChallenge.isActive && (
        <div className="card bg-gradient-to-br from-accent-50 to-primary-50 border-2 border-accent-200">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-accent-600" />
            <h3 className="font-display text-lg text-neutral-800">🔥 团队挑战</h3>
            <span className="px-3 py-1 bg-accent-500 text-white text-xs rounded-full font-semibold animate-pulse">
              进行中
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h4 className="font-semibold text-lg text-neutral-800 mb-2">
                {teamChallenge.name}
              </h4>
              <p className="text-neutral-500 mb-4">{teamChallenge.description}</p>
              <ProgressBar
                progress={challengeProgress}
                color="accent"
                showLabel
                height="lg"
                label="挑战进度"
              />
            </div>
            <div className="flex flex-col justify-center items-center p-4 rounded-2xl bg-white/70">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-semibold text-neutral-800">目标奖励</p>
              <p className="text-sm text-primary-600 font-medium">
                {teamChallenge.reward}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-accent-200">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>🎯 当前金币:</span>
              <span className="font-bold text-accent-600">{teamChallenge.currentCoins}</span>
              <span>/</span>
              <span>{teamChallenge.targetCoins}</span>
            </div>
            <div className="text-sm text-neutral-500">
              截止: {new Date(teamChallenge.deadline).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-neutral-500" />
          <span className="font-medium text-neutral-600">成就分类</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = cat === 'all'
              ? allAchievements.filter((a) => a.isUnlocked).length
              : allAchievements.filter((a) => a.category === cat && a.isUnlocked).length;
            const total = cat === 'all'
              ? allAchievements.length
              : allAchievements.filter((a) => a.category === cat).length;
            
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {getCategoryIcon(cat)}
                {cat === 'all' ? '全部成就' : ACHIEVEMENT_CATEGORY_LABELS[cat]}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    filterCategory === cat ? 'bg-white/20' : 'bg-white'
                  }`}
                >
                  {count}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            onClick={() => setSelectedAchievement(achievement)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="card text-center py-12">
          <Lock className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h3 className="font-display text-xl text-neutral-700 mb-2">暂无成就</h3>
          <p className="text-neutral-500">继续努力完成任务来解锁更多成就！</p>
        </div>
      )}

      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div
              className={`p-8 text-center ${
                selectedAchievement.isUnlocked
                  ? 'bg-gradient-warm'
                  : 'bg-neutral-200'
              }`}
            >
              <div
                className={`text-7xl mb-4 ${
                  selectedAchievement.isUnlocked ? 'animate-bounce-slow' : ''
                }`}
              >
                {selectedAchievement.isUnlocked ? (
                  selectedAchievement.icon
                ) : (
                  <Lock className="w-20 h-20 mx-auto text-neutral-400" />
                )}
              </div>
              <h2
                className={`font-display text-2xl ${
                  selectedAchievement.isUnlocked ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {selectedAchievement.isUnlocked
                  ? selectedAchievement.name
                  : '???'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 mb-4">
                {selectedAchievement.isUnlocked
                  ? selectedAchievement.description
                  : '完成更多任务来解锁这个成就！'}
              </p>
              
              {selectedAchievement.isUnlocked && (
                <div className="flex gap-4 mb-4">
                  {selectedAchievement.coinReward > 0 && (
                    <div className="flex-1 p-3 rounded-xl bg-primary-50 text-center">
                      <p className="text-sm text-neutral-500">金币奖励</p>
                      <p className="font-display text-xl text-primary-600">
                        +{selectedAchievement.coinReward} 💰
                      </p>
                    </div>
                  )}
                  {selectedAchievement.expReward > 0 && (
                    <div className="flex-1 p-3 rounded-xl bg-secondary-50 text-center">
                      <p className="text-sm text-neutral-500">经验奖励</p>
                      <p className="font-display text-xl text-secondary-600">
                        +{selectedAchievement.expReward} EXP
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedAchievement.unlockedAt && (
                <div className="text-center py-3 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600">
                    ✨ 于 {new Date(selectedAchievement.unlockedAt).toLocaleDateString('zh-CN')} 解锁
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
