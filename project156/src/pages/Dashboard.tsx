import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Award, TrendingUp, ChevronRight, Star, Trophy, Calendar } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';

const statCards = [
  { key: 'totalStudents', label: '学生总数', icon: Users, gradient: 'gradient-blue' },
  { key: 'totalPortfolios', label: '作品数量', icon: BookOpen, gradient: 'gradient-teal' },
  { key: 'assessmentCompletion', label: '评估完成率', icon: Award, gradient: 'gradient-amber', suffix: '%' },
  { key: 'monthlyMilestones', label: '本月里程碑', icon: TrendingUp, gradient: 'gradient-rose' },
];

export default function Dashboard() {
  const { dashboardStats, students, fetchDashboardStats, fetchStudents } = useStudentStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchStudents();
  }, [fetchDashboardStats, fetchStudents]);

  const handleStudentClick = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    useStudentStore.getState().setCurrentStudent(student || null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-6 gradient-blue text-white">
        <h1 className="font-display text-2xl font-bold mb-2">欢迎使用学生成长档案管理平台</h1>
        <p className="text-blue-100">记录每一个成长瞬间，见证每一次进步突破</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.key}
            className={cn(
              "card p-5 card-hover animate-slide-up",
              card.gradient,
              "text-white"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">{card.label}</p>
                <p className="font-display text-3xl font-bold">
                  {dashboardStats?.[card.key as keyof typeof dashboardStats] ?? 0}
                  {card.suffix || ''}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-slate-800">学生列表</h3>
            <Link to="/students" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.slice(0, 6).map((student, index) => (
              <Link
                key={student.id}
                to={`/students/${student.id}`}
                onClick={() => handleStudentClick(student.id)}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors card-hover animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{student.name}</p>
                  <p className="text-sm text-slate-500">{student.grade}年级{student.className}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>{student.interests.split('、')[0]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Milestones */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-display text-lg font-semibold text-slate-800">最近里程碑</h3>
          </div>
          <div className="space-y-3">
            {[
              { student: '张小明', title: '校园艺术展一等奖', badge: 'award', date: '3月15日' },
              { student: '李小雨', title: '在校刊发表文章', badge: 'star', date: '3月10日' },
              { student: '王小磊', title: '区数学竞赛一等奖', badge: 'trophy', date: '3月5日' },
              { student: '刘子轩', title: '辩论赛最佳辩手', badge: 'trophy', date: '3月3日' },
              { student: '赵思琪', title: '书法五级考试通过', badge: 'award', date: '2月28日' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  item.badge === 'award' ? 'bg-amber-100 text-amber-600' :
                  item.badge === 'trophy' ? 'bg-rose-100 text-rose-600' :
                  'bg-blue-100 text-blue-600'
                )}>
                  {item.badge === 'award' ? <Award className="w-4 h-4" /> :
                   item.badge === 'trophy' ? <Trophy className="w-4 h-4" /> :
                   <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.student} · {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">年级分布</h3>
        <div className="flex items-end gap-4 h-48">
          {[1, 2, 3, 4, 5, 6].map((grade) => {
            const count = students.filter(s => s.grade === grade).length;
            const maxCount = Math.max(...[1, 2, 3, 4, 5, 6].map(g => students.filter(s => s.grade === g).length), 1);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={grade} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{count}人</span>
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-700 ease-out"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
                <span className="text-sm text-slate-500">{grade}年级</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
