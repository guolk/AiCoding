import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  ClipboardCheck,
  Wrench,
  Droplet,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const menuItems = [
  {
    path: '/',
    label: '仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/equipment',
    label: '设备台账',
    icon: Factory,
  },
  {
    label: '点检管理',
    icon: ClipboardCheck,
    children: [
      { path: '/inspection/standards', label: '点检标准' },
      { path: '/inspection/tasks', label: '点检任务' },
      { path: '/inspection/records', label: '点检记录' },
    ],
  },
  {
    path: '/workorders',
    label: '维修工单',
    icon: Wrench,
  },
  {
    label: '润滑管理',
    icon: Droplet,
    children: [
      { path: '/lubrication/points', label: '润滑点管理' },
      { path: '/lubrication/records', label: '换油记录' },
    ],
  },
  {
    label: '统计分析',
    icon: BarChart3,
    children: [
      { path: '/statistics/failure', label: '故障率统计' },
      { path: '/statistics/cost', label: '成本分析' },
      { path: '/statistics/completion', label: '完成率分析' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['点检管理', '润滑管理', '统计分析']);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        'bg-slate-900 text-white h-screen flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Settings className="w-6 h-6" />
        </div>
        {!collapsed && (
          <span className="ml-3 font-bold text-lg whitespace-nowrap">设备管理系统</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus.includes(item.label);

          if (item.children) {
            return (
              <div key={index} className="mb-1">
                <button
                  onClick={() => !collapsed && toggleMenu(item.label)}
                  className={cn(
                    'w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors',
                    collapsed && 'justify-center'
                  )}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && isExpanded && (
                  <div className="mt-1">
                    {item.children.map((child, childIndex) => (
                      <NavLink
                        key={childIndex}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center px-4 py-2 pl-12 text-sm transition-colors',
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={index}
              to={item.path || '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors mb-1',
                  isActive && 'bg-blue-600 text-white',
                  collapsed && 'justify-center'
                )
              }
              end
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">管</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">管理员</p>
              <p className="text-xs text-slate-400">admin@factory.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
