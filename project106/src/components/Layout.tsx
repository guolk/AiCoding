import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Sprout, Users, Package, Menu, X, Leaf, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/plots', label: '地块管理', icon: Map },
  { path: '/planting', label: '种植追踪', icon: Sprout },
  { path: '/collaboration', label: '社区协作', icon: Users },
  { path: '/resources', label: '资源管理', icon: Package },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-garden-100 transition-all duration-300 flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-garden-100 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-garden-500 to-garden-700 flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-display text-lg font-bold text-garden-800">社区花园</h1>
                <p className="text-xs text-garden-600">共享绿地管理</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-garden-50 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-garden-600" /> : <Menu className="w-5 h-5 text-garden-600" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''} ${!sidebarOpen && 'justify-center'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-garden-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-garden-400 to-garden-600 flex items-center justify-center text-white font-bold">
                张
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">张三</p>
                <p className="text-xs text-gray-500">社区成员</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-sm border-b border-garden-100 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-800">
                {navItems.find((item) => item.path === location.pathname)?.label || '社区花园'}
              </h2>
              <p className="text-sm text-gray-500">欢迎回来，今天也是种植的好日子 🌱</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
