import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, Trophy, Flame, PlayCircle, BookMarked, Users, TrendingUp } from 'lucide-react';
import { useGoStore } from '@/store/useGoStore';
import Card from '@/components/ui/Card';
import { formatDate, getStreak } from '@/utils/dateUtils';
import { CATEGORY_COLORS, CATEGORY_LABELS, RESULT_COLORS, RESULT_LABELS, TASK_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { games, problems, matches, dailyTasks, ranks, josekis } = useGoStore();

  const stats = useMemo(() => {
    const totalGames = games.length;
    const totalProblems = problems.length;
    const totalMatches = matches.length;
    
    const wins = matches.filter(m => m.result === 'win').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    
    const practiceDates = problems.flatMap(p => p.practiceRecords.map(r => r.date));
    const matchDates = matches.map(m => m.playedAt);
    const allDates = [...practiceDates, ...matchDates];
    const streak = getStreak(allDates);
    
    const currentRank = ranks.length > 0 ? ranks[ranks.length - 1] : null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = dailyTasks.filter(t => t.date === today);
    const completedTasks = todayTasks.filter(t => t.isCompleted).length;
    
    return {
      totalGames,
      totalProblems,
      totalMatches,
      winRate,
      streak,
      currentRank,
      todayTasks,
      completedTasks,
    };
  }, [games, problems, matches, dailyTasks, ranks]);

  const quickActions = [
    { to: '/games', icon: BookOpen, label: '棋谱管理', desc: '管理和导入棋谱', color: 'from-blue-500 to-blue-600' },
    { to: '/games/replay', icon: PlayCircle, label: '棋局回放', desc: '观看和分析棋谱', color: 'from-green-500 to-green-600' },
    { to: '/learning', icon: Target, label: '学习进度', desc: '追踪学习成果', color: 'from-amber-500 to-amber-600' },
    { to: '/records', icon: Users, label: '对局记录', desc: '记录对局历史', color: 'from-purple-500 to-purple-600' },
  ];

  const recentActivities = useMemo(() => {
    const activities: { id: string; type: string; title: string; time: number; detail?: string }[] = [];
    
    games.slice(0, 3).forEach(g => {
      activities.push({
        id: `game-${g.id}`,
        type: '棋谱',
        title: g.title,
        time: g.updatedAt,
        detail: CATEGORY_LABELS[g.category],
      });
    });
    
    matches.slice(0, 3).forEach(m => {
      activities.push({
        id: `match-${m.id}`,
        type: '对局',
        title: `vs ${m.opponentName}`,
        time: m.playedAt,
        detail: RESULT_LABELS[m.result],
      });
    });
    
    return activities.sort((a, b) => b.time - a.time).slice(0, 6);
  }, [games, matches]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 欢迎区 */}
      <div className="bg-gradient-to-r from-go-wood-700 to-go-wood-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold mb-2">欢迎回来，围棋爱好者</h1>
            <p className="text-go-wood-200">坚持每天学习，棋艺步步高升</p>
            {stats.currentRank && (
              <div className="mt-4 inline-flex items-center gap-2 bg-go-bamboo/20 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-go-bamboo" />
                <span className="text-sm font-medium">当前段位：{stats.currentRank.rank}</span>
              </div>
            )}
          </div>
          <div className="text-6xl">🏯</div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="animate-fade-in-up animation-delay-100">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.totalGames}</p>
              <p className="text-sm text-go-wood-500">收藏棋谱</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-200">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
              <Target className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.totalProblems}</p>
              <p className="text-sm text-go-wood-500">死活题库</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-300">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.winRate}%</p>
              <p className="text-sm text-go-wood-500">对局胜率</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-400">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
              <Flame className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.streak}天</p>
              <p className="text-sm text-go-wood-500">连续学习</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 今日任务 */}
        <Card className="col-span-1">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>今日任务</Card.Title>
              <span className="text-sm text-go-wood-500">
                {stats.completedTasks}/{stats.todayTasks.length} 已完成
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="w-full h-2 bg-go-wood-100 rounded-full mb-4">
              <div
                className="h-full bg-go-bamboo rounded-full transition-all duration-500"
                style={{
                  width: stats.todayTasks.length > 0
                    ? `${(stats.completedTasks / stats.todayTasks.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <div className="space-y-3">
              {stats.todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors',
                    task.isCompleted ? 'bg-green-50' : 'bg-go-wood-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      task.isCompleted
                        ? 'bg-go-bamboo border-go-bamboo'
                        : 'border-go-wood-300'
                    )}
                  >
                    {task.isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      task.isCompleted ? 'text-green-700 line-through' : 'text-go-wood-700'
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-go-wood-400">{TASK_TYPE_LABELS[task.type]}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/learning"
              className="block text-center text-sm text-go-bamboo hover:text-go-bamboo/80 mt-4 font-medium"
            >
              查看全部任务 →
            </Link>
          </Card.Content>
        </Card>

        {/* 快捷入口 */}
        <Card className="col-span-2">
          <Card.Header>
            <Card.Title>快捷入口</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    'group p-5 rounded-xl bg-gradient-to-br text-white transition-all duration-300',
                    action.color,
                    'hover:scale-[1.02] hover:shadow-lg'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <action.icon className="w-8 h-8 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-semibold mb-1">{action.label}</h4>
                  <p className="text-sm text-white/80">{action.desc}</p>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 最近活动 */}
        <Card className="col-span-2">
          <Card.Header>
            <Card.Title>最近活动</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-2 h-2 rounded-full bg-go-bamboo mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-go-wood-800">{activity.title}</span>
                      {activity.detail && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          activity.detail === '胜' ? 'bg-green-100 text-green-700' :
                          activity.detail === '负' ? 'bg-red-100 text-red-700' :
                          'bg-go-wood-100 text-go-wood-600'
                        )}>
                          {activity.detail}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-go-wood-400">{activity.type}</span>
                      <span className="text-xs text-go-wood-400">·</span>
                      <span className="text-xs text-go-wood-400">{formatDate(activity.time, 'MM月dd日 HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* 学习进度 */}
        <Card>
          <Card.Header>
            <Card.Title>学习概览</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-go-wood-600">定式掌握</span>
                  <span className="font-medium text-go-wood-800">{josekis.length} 个</span>
                </div>
                <div className="w-full h-2 bg-go-wood-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (josekis.length / 10) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-go-wood-600">对局数</span>
                  <span className="font-medium text-go-wood-800">{stats.totalMatches} 局</span>
                </div>
                <div className="w-full h-2 bg-go-wood-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(100, (stats.totalMatches / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-go-wood-600">做题数</span>
                  <span className="font-medium text-go-wood-800">{stats.totalProblems} 道</span>
                </div>
                <div className="w-full h-2 bg-go-wood-100 rounded-full">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (stats.totalProblems / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-go-wood-100">
                <p className="text-sm text-go-wood-500 mb-3">棋谱分类</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                    const count = games.filter(g => g.category === key).length;
                    if (count === 0) return null;
                    return (
                      <span
                        key={key}
                        className={cn('text-xs px-2 py-1 rounded-full', CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS])}
                      >
                        {label} {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
