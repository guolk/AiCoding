import { LayoutDashboard, FolderKanban, FlaskConical, BookOpen, Award, Calendar, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'projects', label: '项目管理', icon: FolderKanban, path: '/projects' },
  { id: 'lab-records', label: '实验记录', icon: FlaskConical, path: '/lab-records' },
  { id: 'literature', label: '文献共享', icon: BookOpen, path: '/literature' },
  { id: 'achievements', label: '成果管理', icon: Award, path: '/achievements' },
  { id: 'meetings', label: '组会管理', icon: Calendar, path: '/meetings' },
  { id: 'discussions', label: '技术讨论', icon: MessageSquare, path: '/discussions' },
];

export default function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-neutral-100 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-neutral-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-neutral-900">LabCollab</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">L</span>
          </div>
        )}
      </div>

      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-neutral-500" /> : <ChevronLeft className="w-4 h-4 text-neutral-500" />}
      </button>
    </aside>
  );
}
