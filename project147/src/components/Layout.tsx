import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Users,
  GitCompare,
  Home,
  Menu,
  X,
  BookOpen,
  Archive,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/observations', label: '观察记录', icon: MapPin },
  { path: '/analysis', label: '空间分析', icon: Building2 },
  { path: '/pedestrian', label: '行人研究', icon: Users },
  { path: '/comparison', label: '比较研究', icon: GitCompare },
  { path: '/cases', label: '案例库', icon: BookOpen },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const { projects, activeProjectId, setActiveProjectId, loadAllData, isLoading } = useStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-clay-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-display text-slate-800 mb-2">城市观察</h2>
          <p className="text-slate-500 font-sans">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-sm border-r border-slate-200/80 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200/80">
            <Link to="/" className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-clay-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="animate-fade-in">
                  <h1 className="font-display text-xl font-bold text-slate-800 leading-tight">
                    城市观察
                  </h1>
                  <p className="text-xs text-slate-500 font-sans">Urban Observer</p>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => !sidebarOpen && window.innerWidth < 1024 && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {sidebarOpen && (
              <div className="border-t border-slate-200/80 pt-4 animate-fade-in">
                <div className="flex items-center justify-between px-3 mb-3">
                  <h3 className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    研究项目
                  </h3>
                  <button
                    onClick={() => navigate('/')}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setProjectsOpen(!projectsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    全部项目
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${projectsOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                {projectsOpen && (
                  <ul className="mt-2 space-y-1 animate-fade-in">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <button
                          onClick={() => {
                            setActiveProjectId(project.id === activeProjectId ? null : project.id);
                          }}
                          className={`w-full text-left px-3 py-2 pl-9 rounded-lg font-sans text-sm transition-all duration-200 ${
                            project.id === activeProjectId
                              ? 'bg-clay-50 text-clay-700 border-l-2 border-clay-500'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                        >
                          <span className="line-clamp-1">{project.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-slate-200/80">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors font-sans text-sm"
            >
              {sidebarOpen ? (
                <>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>收起侧边栏</span>
                </>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-800">
                  {navItems.find((item) =>
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)
                  )?.label || '城市观察'}
                </h2>
                {activeProjectId && (
                  <p className="text-xs text-slate-500 font-sans">
                    {projects.find((p) => p.id === activeProjectId)?.title}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 text-sm font-sans text-slate-600">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                本地数据已保存
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative">{children}</main>
      </div>

      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
