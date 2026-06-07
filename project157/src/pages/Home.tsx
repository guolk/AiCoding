import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, TrendingUp, Palette, Calendar, ArrowRight, Star, Award, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import StatCard from '../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const navigate = useNavigate();
  const { students, courses, evaluations, exhibitions, artworks, getStudentById } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayCourses = courses.filter(c => c.date === today);
  const recentEvaluations = evaluations.slice(0, 5);
  const recentArtworks = artworks.slice(0, 4);
  const awardCount = exhibitions.filter(e => e.award.includes('金') || e.award.includes('银')).length;

  const weeklyData = [
    { name: '周一', 课程数: 3, 作品数: 5 },
    { name: '周二', 课程数: 5, 作品数: 8 },
    { name: '周三', 课程数: 4, 作品数: 6 },
    { name: '周四', 课程数: 6, 作品数: 9 },
    { name: '周五', 课程数: 3, 作品数: 4 },
    { name: '周六', 课程数: 8, 作品数: 12 },
    { name: '周日', 课程数: 6, 作品数: 10 },
  ];

  const quickActions = [
    { title: '学生管理', desc: '查看和管理学员档案', icon: Users, path: '/students', gradient: 'warm', emoji: '👨‍🎨' },
    { title: '课程记录', desc: '记录教学内容和观察', icon: BookOpen, path: '/courses', gradient: 'cool', emoji: '📚' },
    { title: '发展追踪', desc: '评估学员能力成长', icon: TrendingUp, path: '/tracking', gradient: 'green', emoji: '📈' },
    { title: '展览成果', desc: '参展记录和作品集', icon: Palette, path: '/exhibitions', gradient: 'pink', emoji: '🏆' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-primary-400 via-secondary-400 to-green-400 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={24} />
            <span className="text-white/90">今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">
            欢迎回来，李老师！
          </h1>
          <p className="text-white/90 max-w-xl">
            今天有 {todayCourses.length} 节课程，{recentArtworks.length} 幅新作品等待您的点评。
            让我们一起见证孩子们的艺术成长吧！
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="学员总数"
          value={students.length}
          icon={<Users size={24} className="text-white" />}
          emoji="👨‍🎨"
          gradient="warm"
          subtitle="名在册学员"
          trend={{ value: '本月新增2人', isPositive: true }}
        />
        <StatCard
          title="课程记录"
          value={courses.length}
          icon={<BookOpen size={24} className="text-white" />}
          emoji="📚"
          gradient="cool"
          subtitle="条教学记录"
          trend={{ value: '本周新增7节', isPositive: true }}
        />
        <StatCard
          title="作品收藏"
          value={artworks.length}
          icon={<Palette size={24} className="text-white" />}
          emoji="🎨"
          gradient="pink"
          subtitle="幅学员作品"
          trend={{ value: '本月新增12幅', isPositive: true }}
        />
        <StatCard
          title="获奖数量"
          value={awardCount}
          icon={<Award size={24} className="text-white" />}
          emoji="🏆"
          gradient="green"
          subtitle="个重要奖项"
          trend={{ value: '本年度斩获', isPositive: true }}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" />
          快捷操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              className="card cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(action.path)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-${action.gradient} flex items-center justify-center text-white shadow-soft`}>
                  <action.icon size={28} />
                </div>
                <span className="text-3xl">{action.emoji}</span>
              </div>
              <h3 className="text-xl font-display text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{action.desc}</p>
              <div className="flex items-center gap-2 text-primary-500 text-sm font-medium group-hover:gap-3 transition-all">
                <span>立即进入</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card animate-slide-up">
          <h2 className="text-xl font-display text-gray-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" />
            本周教学数据
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="课程数" fill="#FFB347" radius={[4, 4, 0, 0]} />
                <Bar dataKey="作品数" fill="#87CEEB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-slide-up delay-100">
          <h2 className="text-xl font-display text-gray-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-secondary-500" />
            今日课程
          </h2>
          {todayCourses.length > 0 ? (
            <div className="space-y-4">
              {todayCourses.map(course => {
                const student = getStudentById(course.studentId);
                return (
                  <div 
                    key={course.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-warm flex-shrink-0">
                      {student && (
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{course.topic}</h4>
                      <p className="text-sm text-gray-500 truncate">
                        {student?.name} · {course.techniques.slice(0, 2).join('、')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <span>详情</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-gray-500">今天没有课程安排</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display text-gray-800 flex items-center gap-2">
            <Palette className="text-pink-500" />
            近期优秀作品
          </h2>
          <button 
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
            onClick={() => navigate('/exhibitions')}
          >
            查看全部 <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recentArtworks.map((artwork, index) => {
            const student = getStudentById(artwork.studentId);
            return (
              <div 
                key={artwork.id}
                className="group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/tracking/${artwork.studentId}`)}
              >
                <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-soft group-hover:shadow-hover transition-all duration-300 group-hover:-translate-y-1 mb-3">
                  <div className="relative w-full h-full">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {artwork.isPortfolio && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-lg shadow-lg">
                        ⭐
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-sm">{artwork.title}</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">{artwork.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {student && (
                    <>
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-warm flex-shrink-0">
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      </div>
                      <span>{student.name}</span>
                    </>
                  )}
                  <span className="text-gray-300">·</span>
                  <span>{artwork.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card animate-slide-up">
        <h2 className="text-xl font-display text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500" />
          学员能力概览
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">学员</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">班级</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">构图</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">色彩</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">线条</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">创意</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">表现力</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">综合</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const eval_ = evaluations.find(e => e.studentId === student.id);
                const avg = eval_ ? Math.round((eval_.composition + eval_.color + eval_.line + eval_.creativity + eval_.expression) / 5) : '-';
                
                return (
                  <tr 
                    key={student.id} 
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tracking/${student.id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-warm flex-shrink-0">
                          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="tag bg-purple-50 text-purple-700 text-xs">{student.className}</span>
                    </td>
                    <td className="text-center py-4 px-4 font-medium text-gray-700">{eval_?.composition || '-'}</td>
                    <td className="text-center py-4 px-4 font-medium text-pink-600">{eval_?.color || '-'}</td>
                    <td className="text-center py-4 px-4 font-medium text-secondary-600">{eval_?.line || '-'}</td>
                    <td className="text-center py-4 px-4 font-medium text-purple-600">{eval_?.creativity || '-'}</td>
                    <td className="text-center py-4 px-4 font-medium text-green-600">{eval_?.expression || '-'}</td>
                    <td className="text-center py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                        typeof avg === 'number' && avg >= 8 ? 'bg-green-500' :
                        typeof avg === 'number' && avg >= 6 ? 'bg-primary-500' : 'bg-yellow-500'
                      }`}>
                        {avg}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
