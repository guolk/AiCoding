import { useState, useMemo } from 'react';
import { BookOpen, Target, CheckCircle, Plus, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useGoStore } from '@/store/useGoStore';
import Card from '@/components/ui/Card';
import ProblemPracticeModal from '@/components/practice/ProblemPracticeModal';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_STARS,
  MASTERY_LABELS,
  MASTERY_COLORS,
  TASK_TYPE_LABELS,
  JosekiMastery,
  ProblemDifficulty,
  LifeDeathProblem,
} from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, getWeekDates, formatDuration, getTodayString } from '@/utils/dateUtils';

export default function LearningPage() {
  const { problems, josekis, dailyTasks, toggleDailyTask, updateJoseki, addDailyTask, addPracticeRecord } = useGoStore();
  const [activeTab, setActiveTab] = useState<'problems' | 'joseki' | 'tasks'>('problems');
  const [difficultyFilter, setDifficultyFilter] = useState<ProblemDifficulty | 'all'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [practiceProblem, setPracticeProblem] = useState<LifeDeathProblem | null>(null);

  const today = getTodayString();
  const todayTasks = dailyTasks.filter(t => t.date === today);
  const completedTasks = todayTasks.filter(t => t.isCompleted).length;

  const filteredProblems = useMemo(() => {
    if (difficultyFilter === 'all') return problems;
    return problems.filter(p => p.difficulty === difficultyFilter);
  }, [problems, difficultyFilter]);

  const problemStats = useMemo(() => {
    const totalPractices = problems.reduce((sum, p) => sum + p.practiceRecords.length, 0);
    const correctPractices = problems.reduce(
      (sum, p) => sum + p.practiceRecords.filter(r => r.isCorrect).length,
      0
    );
    const accuracy = totalPractices > 0 ? Math.round((correctPractices / totalPractices) * 100) : 0;
    return { totalPractices, correctPractices, accuracy };
  }, [problems]);

  const josekiStats = useMemo(() => {
    const total = josekis.length;
    const familiar = josekis.filter(j => j.mastery === 'familiar').length;
    const memorized = josekis.filter(j => j.mastery === 'memorized').length;
    const understood = josekis.filter(j => j.mastery === 'understood').length;
    return { total, familiar, memorized, understood };
  }, [josekis]);

  const weeklyData = useMemo(() => {
    const weekDates = getWeekDates();
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    return weekDates.map((date, index) => {
      const dateStr = formatDate(date.getTime());
      const dayTasks = dailyTasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.isCompleted).length;
      
      return {
        name: dayNames[index],
        完成: completed,
        总计: dayTasks.length || 3,
      };
    });
  }, [dailyTasks]);

  const masteryProgress = useMemo(() => {
    if (josekiStats.total === 0) return 0;
    const score = josekiStats.familiar * 1 + josekiStats.memorized * 2 + josekiStats.understood * 3;
    return Math.round((score / (josekiStats.total * 3)) * 100);
  }, [josekiStats]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addDailyTask({
      date: today,
      type: 'custom',
      title: newTaskTitle,
      isCompleted: false,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const masteryLevels: JosekiMastery[] = ['familiar', 'memorized', 'understood'];

  const cycleMastery = (josekiId: string, currentMastery: JosekiMastery) => {
    const currentIndex = masteryLevels.indexOf(currentMastery);
    const nextIndex = (currentIndex + 1) % masteryLevels.length;
    updateJoseki(josekiId, {
      mastery: masteryLevels[nextIndex],
      lastPracticedAt: Date.now(),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-go-wood-800">学习进度</h1>
          <p className="text-go-wood-500 mt-1">追踪你的围棋学习成果</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="animate-fade-in-up animation-delay-100">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{problems.length}</p>
              <p className="text-sm text-go-wood-500">死活题库</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-200">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{problemStats.accuracy}%</p>
              <p className="text-sm text-go-wood-500">做题正确率</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-300">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{masteryProgress}%</p>
              <p className="text-sm text-go-wood-500">定式掌握度</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-400">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{completedTasks}/{todayTasks.length}</p>
              <p className="text-sm text-go-wood-500">今日任务</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：标签页内容 */}
        <div className="col-span-2">
          <Card hover={false}>
            <Card.Header className="pb-0">
              <div className="flex gap-1 -mb-px">
                {[
                  { key: 'problems', label: '死活题', icon: Target },
                  { key: 'joseki', label: '定式', icon: BookOpen },
                  { key: 'tasks', label: '每日任务', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === key
                        ? 'border-go-wood-700 text-go-wood-800'
                        : 'border-transparent text-go-wood-400 hover:text-go-wood-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Card.Header>

            <Card.Content>
              {activeTab === 'problems' && (
                <div className="space-y-4">
                  {/* 难度筛选 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-go-wood-500">难度:</span>
                    {(['all', 'easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={cn(
                          'px-3 py-1 rounded-full text-sm transition-colors',
                          difficultyFilter === diff
                            ? 'bg-go-wood-700 text-white'
                            : 'bg-go-wood-100 text-go-wood-600 hover:bg-go-wood-200'
                        )}
                      >
                        {diff === 'all' ? '全部' : DIFFICULTY_LABELS[diff]}
                      </button>
                    ))}
                  </div>

                  {/* 题目列表 */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProblems.map((problem, index) => {
                      const lastRecord = problem.practiceRecords[problem.practiceRecords.length - 1];
                      const correctCount = problem.practiceRecords.filter(r => r.isCorrect).length;
                      const accuracy = problem.practiceRecords.length > 0
                        ? Math.round((correctCount / problem.practiceRecords.length) * 100)
                        : 0;

                      return (
                        <div
                          key={problem.id}
                          className="flex items-center gap-4 p-4 bg-go-wood-50 rounded-xl hover:bg-go-wood-100 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Target className="w-6 h-6 text-go-wood-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-go-wood-800 truncate">{problem.title}</h4>
                              <div className="flex">
                                {Array.from({ length: DIFFICULTY_STARS[problem.difficulty] }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-go-wood-400 mt-0.5">
                              练习 {problem.practiceRecords.length} 次 · 正确率 {accuracy}%
                              {lastRecord && ` · 上次: ${formatDate(lastRecord.date, 'MM/dd')}`}
                            </p>
                          </div>
                          <button
                            onClick={() => setPracticeProblem(problem)}
                            className="px-4 py-2 bg-go-wood-700 text-white text-sm rounded-lg hover:bg-go-wood-800 transition-colors"
                          >
                            练习
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'joseki' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {josekis.map((joseki, index) => (
                    <div
                      key={joseki.id}
                      className="flex items-center gap-4 p-4 bg-go-wood-50 rounded-xl hover:bg-go-wood-100 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpen className="w-6 h-6 text-go-wood-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-go-wood-800 truncate">{joseki.name}</h4>
                        <p className="text-sm text-go-wood-400 mt-0.5">
                          {joseki.lastPracticedAt
                            ? `上次练习: ${formatDate(joseki.lastPracticedAt, 'MM月dd日')}`
                            : '尚未练习'}
                        </p>
                      </div>
                      <button
                        onClick={() => cycleMastery(joseki.id, joseki.mastery)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                          MASTERY_COLORS[joseki.mastery]
                        )}
                      >
                        {MASTERY_LABELS[joseki.mastery]}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-go-wood-500">
                      今日任务 ({completedTasks}/{todayTasks.length})
                    </span>
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="flex items-center gap-1 text-sm text-go-bamboo hover:text-go-bamboo/80"
                    >
                      <Plus className="w-4 h-4" />
                      添加任务
                    </button>
                  </div>

                  {showAddTask && (
                    <div className="flex gap-2 p-3 bg-go-wood-100 rounded-xl animate-scale-in">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="输入任务名称..."
                        className="flex-1 px-3 py-2 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <button
                        onClick={handleAddTask}
                        className="px-4 py-2 bg-go-wood-700 text-white text-sm rounded-lg hover:bg-go-wood-800"
                      >
                        添加
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {todayTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl transition-all animate-fade-in',
                          task.isCompleted ? 'bg-green-50' : 'bg-go-wood-50 hover:bg-go-wood-100'
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <button
                          onClick={() => toggleDailyTask(task.id)}
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                            task.isCompleted
                              ? 'bg-go-bamboo border-go-bamboo'
                              : 'border-go-wood-300 hover:border-go-bamboo'
                          )}
                        >
                          {task.isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium transition-all',
                            task.isCompleted ? 'text-green-700 line-through' : 'text-go-wood-700'
                          )}>
                            {task.title}
                          </p>
                          <p className="text-xs text-go-wood-400">
                            {TASK_TYPE_LABELS[task.type]}
                            {task.targetCount && ` · ${task.currentCount || 0}/${task.targetCount}`}
                          </p>
                        </div>
                        {task.targetCount && (
                          <div className="w-20 h-2 bg-go-wood-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-go-bamboo rounded-full transition-all"
                              style={{ width: `${Math.min(100, ((task.currentCount || 0) / task.targetCount) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* 右侧：统计图表 */}
        <div className="space-y-6">
          <Card hover={false}>
            <Card.Header>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-go-bamboo" />
                <Card.Title>本周学习情况</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5A3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6D552C' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6D552C' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8E7',
                      border: '1px solid #D4BE7E',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="完成" fill="#7CB342" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          <Card hover={false}>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <Card.Title>定式掌握分布</Card.Title>
              </div>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-amber-700">知道但不熟练</span>
                  <span className="font-medium text-amber-700">{josekiStats.familiar}</span>
                </div>
                <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${josekiStats.total > 0 ? (josekiStats.familiar / josekiStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-blue-700">可以背出</span>
                  <span className="font-medium text-blue-700">{josekiStats.memorized}</span>
                </div>
                <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${josekiStats.total > 0 ? (josekiStats.memorized / josekiStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-green-700">理解其变化</span>
                  <span className="font-medium text-green-700">{josekiStats.understood}</span>
                </div>
                <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${josekiStats.total > 0 ? (josekiStats.understood / josekiStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card hover={false}>
            <Card.Header>
              <Card.Title>学习统计</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-go-wood-100">
                <span className="text-go-wood-500">总做题数</span>
                <span className="font-semibold text-go-wood-800">{problemStats.totalPractices} 题</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-go-wood-100">
                <span className="text-go-wood-500">正确数</span>
                <span className="font-semibold text-green-600">{problemStats.correctPractices} 题</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-go-wood-100">
                <span className="text-go-wood-500">定式总数</span>
                <span className="font-semibold text-go-wood-800">{josekiStats.total} 个</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-go-wood-500">掌握进度</span>
                <span className="font-semibold text-go-bamboo">{masteryProgress}%</span>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {practiceProblem && (
        <ProblemPracticeModal
          problem={practiceProblem}
          isOpen={!!practiceProblem}
          onClose={() => setPracticeProblem(null)}
          onSubmit={(isCorrect, timeSpent, notes) => {
            if (practiceProblem) {
              addPracticeRecord(practiceProblem.id, {
                date: Date.now(),
                isCorrect,
                timeSpent,
                notes,
              });
            }
          }}
        />
      )}
    </div>
  );
}
