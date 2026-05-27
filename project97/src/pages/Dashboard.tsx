import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Target,
  AlertCircle,
  FileText,
  TrendingUp,
  Calendar,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useNoteStore } from '../stores/noteStore';
import { mockQuestions, mockWrongNotes, mockStudyNotes, mockTrainingRecords } from '../data/mockData';

export function Dashboard() {
  const { questions, loadQuestions } = useQuestionStore();
  const { wrongNotes, loadWrongNotes, getDueNotes } = useWrongNoteStore();
  const { loadTrainingData, getStreakDays, getTodayProgress } = useTrainingStore();
  const { notes, loadNotes } = useNoteStore();

  useEffect(() => {
    loadQuestions();
    loadWrongNotes();
    loadNotes();
    loadTrainingData();

    if (questions.length === 0) {
      mockQuestions.forEach((q) => useQuestionStore.getState().addQuestion(q));
    }
    if (wrongNotes.length === 0) {
      mockWrongNotes.forEach((w) => useWrongNoteStore.getState().addWrongNote({
        questionId: w.questionId,
        errorReason: w.errorReason,
        errorReasonText: w.errorReasonText,
        correctSolution: w.correctSolution,
      }));
    }
    if (notes.length === 0) {
      mockStudyNotes.forEach((n) => useNoteStore.getState().addNote(n));
    }
    const store = useTrainingStore.getState();
    mockTrainingRecords.forEach((r) => {
      if (!store.trainingRecords.find((tr) => tr.id === r.id)) {
        store.addTrainingRecord(r);
      }
    });
  }, [questions.length, wrongNotes.length, notes.length]);

  const streak = getStreakDays();
  const todayProgress = getTodayProgress();
  const dueNotes = getDueNotes();
  const recentExams = mockTrainingRecords.filter((r) => r.type === 'exam').slice(-3);
  const lastExam = recentExams[recentExams.length - 1];

  const stats = [
    {
      label: '题目总数',
      value: questions.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: '今日进度',
      value: `${todayProgress.completed}/${todayProgress.target}`,
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: '待复习错题',
      value: dueNotes.length,
      icon: AlertCircle,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
    },
    {
      label: '学习笔记',
      value: notes.length,
      icon: FileText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">学习仪表盘</h1>
          <p className="text-text-secondary mt-1">查看你的训练进度和数据统计</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-semibold">连续学习 {streak} 天</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              今日任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">刷题进度</span>
                  <span className="text-text-primary font-medium">
                    {todayProgress.completed}/{todayProgress.target} 题
                  </span>
                </div>
                <div className="h-3 bg-background-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((todayProgress.completed / todayProgress.target) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {dueNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-danger" />
                      <span className="text-text-primary font-medium">
                        有 {dueNotes.length} 道错题需要复习
                      </span>
                    </div>
                    <Link to="/errors">
                      <Button variant="danger" size="sm">
                        去复习
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link to="/training/daily" className="flex-1">
                  <Button className="w-full" size="lg">
                    <Target className="w-5 h-5 mr-2" />
                    开始刷题
                  </Button>
                </Link>
                <Link to="/training/exam" className="flex-1">
                  <Button variant="secondary" className="w-full" size="lg">
                    模拟考试
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              最近成绩
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastExam ? (
              <div className="space-y-4">
                <div className="text-center p-6 rounded-xl bg-success/10">
                  <p className="text-4xl font-bold text-success">{lastExam.score}</p>
                  <p className="text-text-muted mt-1">满分 100</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">考试时长</span>
                    <span className="text-text-primary">{lastExam.duration} 分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">完成时间</span>
                    <span className="text-text-primary">
                      {new Date(lastExam.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                <Link to="/progress">
                  <Button variant="ghost" className="w-full">
                    查看趋势
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted">暂无模拟考试记录</p>
                <Link to="/training/exam" className="mt-3 inline-block">
                  <Button variant="secondary" size="sm">
                    参加模拟考试
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/questions">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">题目库</h3>
                <p className="text-sm text-text-muted">浏览和录入竞赛题目</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/notes">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">学习笔记</h3>
                <p className="text-sm text-text-muted">整理知识体系和方法论</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/errors">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-danger/10">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">错题本</h3>
                <p className="text-sm text-text-muted">复习和巩固薄弱知识点</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
