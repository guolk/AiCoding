import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Lightbulb, 
  FolderKanban, 
  BarChart3, 
  Award, 
  Menu, 
  X,
  Sparkles,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/ideas', label: '灵感收集', icon: Lightbulb, color: 'text-purple-500' },
  { path: '/projects', label: '项目管理', icon: FolderKanban, color: 'text-blue-500' },
  { path: '/analytics', label: '创意分析', icon: BarChart3, color: 'text-orange-500' },
  { path: '/portfolio', label: '创意展示', icon: Award, color: 'text-pink-500' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const fermentReminders = useAppStore(state => state.getActiveFermentReminders());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IdeaForge
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fermentReminders.length > 0 && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {fermentReminders.length}
              </Badge>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IdeaForge
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                <span>{item.label}</span>
                {item.path === '/ideas' && fermentReminders.length > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs">
                    {fermentReminders.length}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {fermentReminders.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm text-purple-700">发酵提醒</span>
              </div>
              <p className="text-xs text-purple-600 mb-2">
                有 {fermentReminders.length} 个灵感等待你重新审视
              </p>
              <Link
                to="/ideas"
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-purple-600 hover:underline font-medium"
              >
                查看 →
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
