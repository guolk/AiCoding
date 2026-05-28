import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Brain, 
  Target,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: '', icon: LayoutDashboard, label: '仪表盘' },
  { id: 'learning', icon: BookOpen, label: '投资学习' },
  { id: 'strategy', icon: TrendingUp, label: '策略研究' },
  { id: 'diary', icon: FileText, label: '投资日记' },
  { id: 'psychology', icon: Brain, label: '投资心理' },
  { id: 'growth', icon: Target, label: '成长追踪' },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-primary-700 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-primary-600">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-800" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">投资学习助手</h1>
                <p className="text-xs text-primary-300">Investment Learning</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-gold-500 text-primary-800 font-medium'
                  : 'hover:bg-primary-600 text-primary-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-600">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">投资者</p>
                <p className="text-xs text-primary-300 truncate">investor@example.com</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
