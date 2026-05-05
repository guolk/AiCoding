import { Link, useNavigate } from 'react-router-dom';

const getCurrentUser = () => {
  try {
    const userStr = sessionStorage.getItem('exam_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export default function ExamDashboardPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    sessionStorage.removeItem('exam_token');
    sessionStorage.removeItem('exam_user');
    navigate('/exam/login');
  };

  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const menuItems = isAdminOrTeacher
    ? [
        { icon: '📝', title: '题目管理', desc: '管理六种题型', path: '/exam/questions' },
        { icon: '📄', title: '试卷管理', desc: '手动或随机组卷', path: '/exam/papers' },
        { icon: '🎯', title: '考试管理', desc: '安排考试', path: '/exam/exams' },
        { icon: '✏️', title: '手动评分', desc: '批阅主观题', path: '/exam/grading' },
      ]
    : [
        { icon: '📋', title: '我的考试', desc: '查看可参加的考试', path: '/exam/my-exams' },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-bold text-gray-900">在线考试系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎, {user?.realName || user?.username} ({user?.role === 'admin' ? '管理员' : user?.role === 'teacher' ? '教师' : '学生'})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">工作台</h2>
          <p className="text-gray-600">管理您的考试相关工作</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        {isAdminOrTeacher && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">系统功能概览</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🔧 题目类型</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 单选题</li>
                    <li>• 多选题</li>
                    <li>• 判断题</li>
                    <li>• 填空题</li>
                    <li>• 简答题</li>
                    <li>• 编程题 (Docker沙箱)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎯 组卷模式</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 手动选题</li>
                    <li>• 按标签随机抽题</li>
                    <li>• 按题型分值设置</li>
                  </ul>
                  <h4 className="font-medium text-gray-900 mt-4 mb-2">🛡️ 防作弊</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 切换标签页检测</li>
                    <li>• 随机题目顺序</li>
                    <li>• 选项乱序</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📊 评分分析</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 客观题即时评分</li>
                    <li>• 编程题沙箱测试</li>
                    <li>• 主观题手动评分</li>
                    <li>• 分数分布统计</li>
                    <li>• 题目正答率</li>
                    <li>• 知识点热图</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
