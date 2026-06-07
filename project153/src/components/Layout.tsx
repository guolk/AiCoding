import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Archive,
  BookOpen,
  GitCompare,
  FolderOpen,
  FileText,
  Menu,
  X,
  ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: '首页概览' },
  { path: '/relics', icon: Archive, label: '文物档案' },
  { path: '/notes', icon: BookOpen, label: '研究笔记' },
  { path: '/analysis', icon: GitCompare, label: '类型分析' },
  { path: '/materials', icon: FolderOpen, label: '图像资料' },
  { path: '/output', icon: FileText, label: '成果输出' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-paper-light">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white/80 backdrop-blur-sm border-r border-accent-gold/20 shadow-scroll transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-accent-gold/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <ScrollText className="w-8 h-8 text-accent-gold" />
              <div>
                <h1 className="text-lg font-semibold text-ink">文物研究</h1>
                <p className="text-xs text-ink-light">数字化整理平台</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-ink-light" /> : <Menu className="w-5 h-5 text-ink-light" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'sidebar-item w-full text-left',
                  isActive && 'active',
                  !sidebarOpen && 'lg:justify-center lg:px-2'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-accent-gold' : 'text-ink-light')} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-accent-gold/20">
          {sidebarOpen ? (
            <div className="text-xs text-ink-light text-center">
              <p>历史文物数字化研究平台</p>
              <p className="mt-1 text-gold-gradient font-medium">以物证史 · 传承文明</p>
            </div>
          ) : (
            <div className="lg:flex justify-center">
              <ScrollText className="w-6 h-6 text-accent-gold" />
            </div>
          )}
        </div>
      </aside>

      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-accent-gold/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent-gold/10"
              >
                <Menu className="w-5 h-5 text-ink" />
              </button>
              <h2 className="text-xl font-semibold text-ink">
                {navItems.find((item) =>
                  item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
                )?.label || '文物研究平台'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-light">
              <span className="hidden sm:inline">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
