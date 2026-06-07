import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, User, BookOpen, Award, FileText, 
  Menu, X, GraduationCap, ChevronRight, Search
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/students', icon: Users, label: '学生列表' },
];

const studentMenuItems = (studentId: number) => [
  { path: `/students/${studentId}`, icon: User, label: '学生档案' },
  { path: `/students/${studentId}/portfolio`, icon: BookOpen, label: '作品收藏' },
  { path: `/students/${studentId}/assessment`, icon: Award, label: '能力评估' },
  { path: `/students/${studentId}/report`, icon: FileText, label: '学习报告' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentStudent, students, fetchStudents } = useStudentStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStudentSelect = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    useStudentStore.getState().setCurrentStudent(student || null);
    navigate(`/students/${studentId}`);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      fetchStudents(e.target.value);
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  };

  const isStudentPath = location.pathname.startsWith('/students/') && 
    location.pathname !== '/students';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20 lg:w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-display text-lg font-bold text-slate-800">成长档案</h1>
                <p className="text-xs text-slate-500">学生成长管理平台</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Student submenu when viewing a student */}
          {isStudentPath && currentStudent && sidebarOpen && (
            <div className="mt-6 px-3">
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {currentStudent.name}
                </p>
              </div>
              <div className="space-y-1">
                {studentMenuItems(currentStudent.id).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-secondary-50 text-secondary-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Student quick list */}
          {sidebarOpen && (
            <div className="mt-6 px-3">
              <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                快速访问
              </p>
            </div>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索学生..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {searchOpen && students.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                    >
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.grade}年级{student.className}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </nav>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-slate-200 text-slate-500 hover:text-slate-700"
        >
          {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-800">
                {isStudentPath && currentStudent
                  ? `${currentStudent.name} - ${currentStudent.grade}年级${currentStudent.className}`
                  : menuItems.find(m => m.path === location.pathname)?.label || '学生成长档案'
                }
              </h2>
            </div>
          </div>

          {/* Student selector on mobile */}
          {isStudentPath && currentStudent && (
            <div className="flex items-center gap-3">
              <img
                src={currentStudent.avatar}
                alt={currentStudent.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {currentStudent.name}
              </span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
