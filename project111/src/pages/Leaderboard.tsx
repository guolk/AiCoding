import React from 'react';
import { Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useTaskStore } from '../stores/useTaskStore';
import UserAvatar from '../components/UserAvatar';
import RankChangeIndicator from '../components/RankChangeIndicator';

type Period = 'week' | 'month';

export default function Leaderboard() {
  const { familyMembers } = useUserStore();
  const { tasks } = useTaskStore();
  const [period, setPeriod] = React.useState<Period>('week');

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter((t) => t.assignedTo === userId);
    const completedTasks = userTasks.filter((t) => t.status === 'completed');
    
    return {
      tasksCompleted: completedTasks.length,
      totalExp: completedTasks.reduce((sum, t) => sum + t.expReward, 0),
      totalCoins: completedTasks.reduce((sum, t) => sum + t.coinReward, 0),
    };
  };

  const rankedMembers = [...familyMembers]
    .map((member) => ({
      ...member,
      stats: getUserStats(member.id),
      rankChange: Math.floor(Math.random() * 5) - 2,
    }))
    .sort((a, b) => b.stats.totalExp - a.stats.totalExp);

  const currentUserIndex = rankedMembers.findIndex(
    (m) => m.id === useUserStore.getState().currentUser.id
  );
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300';
    return 'bg-white';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-500" />;
    if (rank === 3) return <Award className="w-8 h-8 text-orange-500" />;
    return <span className="w-8 h-8 flex items-center justify-center text-xl font-bold text-neutral-400">#{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">🏆 排行榜</h1>
          <p className="text-neutral-500">看看谁是家务小能手！</p>
        </div>
        <div className="flex bg-neutral-100 rounded-xl p-1">
          <button
            onClick={() => setPeriod('week')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              period === 'week'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            周榜
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              period === 'month'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            月榜
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {rankedMembers.slice(0, 3).map((member, index) => (
          <div
            key={member.id}
            className={`card border-2 text-center ${getRankStyle(index + 1)} ${
              index === 0 ? 'md:order-2 md:-mt-4' : index === 1 ? 'md:order-1' : 'md:order-3'
            }`}
          >
            <div className="flex justify-center mb-4">
              {getRankIcon(index + 1)}
            </div>
            <div className="relative inline-block mb-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl shadow-lg ${
                index === 0
                  ? 'bg-gradient-warm animate-pulse-glow'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                  : 'bg-gradient-to-br from-orange-300 to-orange-400'
              }`}>
                {member.avatarUrl}
              </div>
            </div>
            <h3 className="font-display text-xl text-neutral-800 mb-1">
              {member.roleName}
            </h3>
            <p className="text-sm text-neutral-500 mb-4">Lv.{member.level}</p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-display text-primary-600">
                  {member.stats.totalExp}
                </p>
                <p className="text-xs text-neutral-500">经验值</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-secondary-600">
                  {member.stats.tasksCompleted}
                </p>
                <p className="text-xs text-neutral-500">任务数</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-display text-lg text-neutral-800 mb-4">📊 完整排名</h3>
        <div className="space-y-3">
          {rankedMembers.map((member, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUserRank === rank;
            
            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200'
                    : 'bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="w-10 flex justify-center">
                  {rank <= 3 ? (
                    getRankIcon(rank)
                  ) : (
                    <span className="text-xl font-bold text-neutral-400">#{rank}</span>
                  )}
                </div>

                <UserAvatar user={member} size="sm" showLevel={false} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary-700' : 'text-neutral-800'}`}>
                      {member.roleName}
                    </p>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                        我
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span>Lv.{member.level}</span>
                    <span>•</span>
                    <span>{member.stats.tasksCompleted} 个任务</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-display text-lg text-primary-600">
                      {member.stats.totalExp}
                    </p>
                    <p className="text-xs text-neutral-500">经验值</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-secondary-600">
                      {member.stats.totalCoins}
                    </p>
                    <p className="text-xs text-neutral-500">金币</p>
                  </div>
                </div>

                <RankChangeIndicator value={member.rankChange} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">你的排名</p>
              <p className="font-display text-2xl text-primary-600">
                #{currentUserRank || '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white">
              <Award className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">领先成员</p>
              <p className="font-display text-2xl text-secondary-600">
                {rankedMembers[0]?.roleName || '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-accent-50 to-accent-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white">
              <Crown className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">最高经验值</p>
              <p className="font-display text-2xl text-accent-600">
                {rankedMembers[0]?.stats.totalExp || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
