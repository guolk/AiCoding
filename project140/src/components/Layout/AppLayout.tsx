import { 
  LayoutDashboard, Lightbulb, Users, FileText, 
  Mic, Film, Calendar, BarChart3, 
  MessageSquare, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard, group: '概览' },
  { path: '/planning/topics', label: '选题库', icon: Lightbulb, group: '节目策划' },
  { path: '/planning/guests', label: '嘉宾管理', icon: Users, group: '节目策划' },
  { path: '/planning/outline', label: '录制大纲', icon: FileText, group: '节目策划' },
  { path: '/recording/sessions', label: '录制会话', icon: Calendar, group: '录制管理' },
  { path: '/recording/records', label: '录制记录', icon: Mic, group: '录制管理' },
  { path: '/recording/files', label: '文件管理', icon: Film, group: '录制管理' },
  { path: '/postproduction/editing', label: '剪辑任务', icon: Film, group: '后期制作' },
  { path: '/postproduction/assets', label: '封面素材', icon: FileText, group: '后期制作' },
  { path: '/postproduction/transcript', label: '文字稿', icon: FileText, group: '后期制作' },
  { path: '/publishing/platforms', label: '平台管理', icon: Settings, group: '发布管理' },
  { path: '/publishing/calendar', label: '内容日历', icon: Calendar, group: '发布管理' },
  { path: '/publishing/analytics', label: '数据追踪', icon: BarChart3, group: '发布管理' },
  { path: '/audience/feedback', label: '听众反馈', icon: MessageSquare, group: '听众关系' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const getPageTitle = () => {
    const item = navItems.find((n) => location.pathname.startsWith(n.path));
    return item?.label || '仪表盘';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'bg-primary-950 text-white transition-all duration-300 flex flex-col',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <h1 className="font-display text-xl font-bold text-accent-500">
              PodFlow
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group} className="mb-4">
              {!collapsed && (
                <h3 className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group}
                </h3>
              )}
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200',
                            'hover:bg-white/10',
                            isActive
                              ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                              : 'text-slate-300 hover:text-white',
                            collapsed && 'justify-center'
                          )
                        }
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-800">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-semibold">
              PF
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
