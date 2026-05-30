import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ListTodo,
  Trophy,
  Target,
  Plus,
  Users,
  Flag,
  ShoppingBag,
  Star,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useAchievementStore } from '../stores/useAchievementStore';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import UserAvatar from '../components/UserAvatar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, family, familyMembers } = useUserStore();
  const { tasks, getTodayTasks, completeTask, getWeeklyCompleted, getPendingTasks } =
    useTaskStore();
  const { teamChallenge, getUnlockedCount, getTotalCount } = useAchievementStore();

  const todayTasks = getTodayTasks();
  const pendingTasks = getPendingTasks();
  const weeklyCompleted = getWeeklyCompleted();
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const challengeProgress = teamChallenge
    ? (teamChallenge.currentCoins / teamChallenge.targetCoins) * 100
    : 0;

  const quickActions = [
    { icon: Plus, label: '添加任务', color: 'primary', onClick: () => navigate('/tasks') },
    { icon: Users, label: '创建成员', color: 'secondary', onClick: () => navigate('/leaderboard') },
    { icon: Flag, label: '发起挑战', color: 'accent', onClick: () => navigate('/achievements') },
    { icon: ShoppingBag, label: '兑换奖励', color: 'primary', onClick: () => navigate('/shop') },
  ];

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">
            👋 欢迎回来，{currentUser.roleName}
          </h1>
          <p className="text-neutral-500">今天也要加油完成家务哦！</p>
        </div>
        <div className="flex items-center gap-3">
          <UserAvatar user={currentUser} size="sm" showCoins />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本周完成"
          value={weeklyCompleted}
          subtitle="个任务"
          icon={CheckCircle2}
          color="primary"
          trend={15}
        />
        <StatCard
          title="当前金币"
          value={currentUser.coins}
          subtitle="可兑换奖励"
          icon={Star}
          color="secondary"
        />
        <StatCard
          title="待办任务"
          value={pendingTasks.length}
          subtitle="需要完成"
          icon={ListTodo}
          color="accent"
        />
        <StatCard
          title="成就进度"
          value={`${getUnlockedCount()}/${getTotalCount()}`}
          subtitle="徽章解锁"
          icon={Trophy}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-neutral-800">
                📋 今日任务
              </h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                查看全部 →
              </button>
            </div>
            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>今天没有任务，休息一下吧！</p>
                </div>
              ) : (
                todayTasks.slice(0, 4).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-primary-600" />
              <h2 className="font-display text-lg text-neutral-800">团队挑战</h2>
            </div>
            {teamChallenge && (
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  {teamChallenge.name}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">
                  {teamChallenge.description}
                </p>
                <ProgressBar
                  progress={challengeProgress}
                  color="primary"
                  showLabel
                  height="lg"
                  label="目标进度"
                />
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-neutral-500">
                    🎯 {teamChallenge.currentCoins} / {teamChallenge.targetCoins} 金币
                  </span>
                  <span className="text-primary-600 font-semibold">
                    🏆 {teamChallenge.reward}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>截止日期: {new Date(teamChallenge.deadline).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-secondary-600" />
              <h2 className="font-display text-lg text-neutral-800">快捷操作</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses = {
                  primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
                  secondary: 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
                  accent: 'bg-accent-100 text-accent-600 hover:bg-accent-200',
                }[action.color as 'primary' | 'secondary' | 'accent'];

                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${colorClasses} transition-all duration-300 hover:scale-105`}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="text-sm font-semibold">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-primary-600" />
              <h2 className="font-display text-lg text-neutral-800">家庭成员</h2>
            </div>
            <div className="space-y-3">
              {familyMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <UserAvatar user={member} size="sm" showLevel={false} />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-800">
                      Lv.{member.level}
                    </div>
                    <div className="text-xs text-primary-600">
                      {member.coins} 金币
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-xl text-neutral-800 mb-6">
          📊 本周统计概览
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-2xl bg-primary-50">
            <div className="text-3xl font-display text-primary-600 mb-1">
              {completedTasks}
            </div>
            <div className="text-sm text-neutral-500">已完成任务</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-secondary-50">
            <div className="text-3xl font-display text-secondary-600 mb-1">
              {totalTasks - completedTasks}
            </div>
            <div className="text-sm text-neutral-500">进行中</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-accent-50">
            <div className="text-3xl font-display text-accent-600 mb-1">
              {familyMembers.length}
            </div>
            <div className="text-sm text-neutral-500">家庭成员</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-blue-50">
            <div className="text-3xl font-display text-blue-600 mb-1">
              {Math.round((completedTasks / totalTasks) * 100)}%
            </div>
            <div className="text-sm text-neutral-500">完成率</div>
          </div>
        </div>
      </div>
    </div>
  );
}
