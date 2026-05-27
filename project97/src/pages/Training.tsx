import { Link } from 'react-router-dom';
import { Target, Clock, Brain, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTrainingStore } from '../stores/trainingStore';
import { format } from 'date-fns';

const trainingModes = [
  {
    title: '每日刷题',
    description: '设定目标数量，系统推荐题目，稳步提升',
    icon: Target,
    color: 'bg-primary/10 text-primary',
    link: '/training/daily',
  },
  {
    title: '模拟考试',
    description: '限时作答，模拟真实竞赛环境',
    icon: Clock,
    color: 'bg-success/10 text-success',
    link: '/training/exam',
  },
  {
    title: '知识强化',
    description: '针对薄弱知识点专项训练',
    icon: Brain,
    color: 'bg-danger/10 text-danger',
    link: '/training/reinforce',
  },
];

export function Training() {
  const { dailyGoals, trainingRecords, getTodayProgress } = useTrainingStore();
  const todayProgress = getTodayProgress();

  const recentGoals = dailyGoals
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const examRecords = trainingRecords
    .filter((r) => r.type === 'exam')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">训练计划</h1>
        <p className="text-text-secondary mt-1">制定训练计划，系统提升竞赛能力</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trainingModes.map((mode) => (
          <Link key={mode.title} to={mode.link}>
            <Card hover className="h-full">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${mode.color}`}>
                  <mode.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{mode.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{mode.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              今日进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">刷题目标</span>
                  <span className="text-text-primary font-medium">
                    {todayProgress.completed}/{todayProgress.target} 题
                  </span>
                </div>
                <div className="h-4 bg-background-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((todayProgress.completed / todayProgress.target) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/training/daily" className="flex-1">
                  <Button className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    继续刷题
                  </Button>
                </Link>
                <Link to="/training/exam" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    参加模考
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近模拟考</CardTitle>
          </CardHeader>
          <CardContent>
            {examRecords.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-text-muted">暂无模拟考试记录</p>
                <Link to="/training/exam" className="mt-3 inline-block">
                  <Button variant="secondary" size="sm">
                    参加模拟考试
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {examRecords.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 bg-background-hover rounded-lg"
                  >
                    <div>
                      <p className="text-text-primary font-medium">{exam.score} 分</p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(exam.createdAt), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-text-secondary">
                        用时 {exam.duration} 分钟
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/progress" className="block mt-2">
                  <Button variant="ghost" size="sm" className="w-full">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>训练日历</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-sm text-text-muted py-2">
                {day}
              </div>
            ))}
            {recentGoals.map((goal, index) => {
              const dayOfWeek = new Date(goal.date).getDay();
              const isToday = goal.date === format(new Date(), 'yyyy-MM-dd');
              const completionRate = goal.targetCount > 0 ? goal.completedCount / goal.targetCount : 0;

              return (
                <div
                  key={goal.id}
                  className={`p-2 rounded-lg text-center ${
                    isToday
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-background-hover'
                  }`}
                >
                  <p className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-text-muted'}`}>
                    {format(new Date(goal.date), 'd')}
                  </p>
                  <div className="mt-1 h-1 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${completionRate * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
