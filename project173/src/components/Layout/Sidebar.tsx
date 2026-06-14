import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Route,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  hasSubMenu?: boolean;
  subItems?: { key: string; label: string; path: string }[];
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const currentProject = useProjectStore((state) =>
    state.currentProjectId ? state.getProjectById(state.currentProjectId) : undefined
  );
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['project', 'progress', 'effect', 'issue']);

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: '首页仪表板',
      icon: LayoutDashboard,
      path: '/',
    },
    {
      key: 'project',
      label: '项目档案',
      icon: FolderKanban,
      path: '/projects',
      hasSubMenu: true,
      subItems: currentProjectId
        ? [
            { key: 'project-list', label: '项目列表', path: '/projects' },
            { key: 'project-detail', label: currentProject?.name || '项目详情', path: `/projects/${currentProjectId}` },
          ]
        : [{ key: 'project-list', label: '项目列表', path: '/projects' }],
    },
    {
      key: 'progress',
      label: '实施进度',
      icon: Route,
      path: '/progress',
      hasSubMenu: true,
      subItems: currentProjectId
        ? [
            { key: 'progress-all', label: '全部进度', path: '/progress' },
            { key: 'progress-detail', label: currentProject?.name || '项目进度', path: `/projects/${currentProjectId}/progress` },
          ]
        : [{ key: 'progress-all', label: '全部进度', path: '/progress' }],
    },
    {
      key: 'effect',
      label: '成效数据',
      icon: TrendingUp,
      path: '/effects',
      hasSubMenu: true,
      subItems: currentProjectId
        ? [
            { key: 'effect-all', label: '全部成效', path: '/effects' },
            { key: 'effect-detail', label: currentProject?.name || '项目成效', path: `/projects/${currentProjectId}/effects` },
          ]
        : [{ key: 'effect-all', label: '全部成效', path: '/effects' }],
    },
    {
      key: 'issue',
      label: '问题风险',
      icon: AlertTriangle,
      path: '/issues',
      hasSubMenu: true,
      subItems: currentProjectId
        ? [
            { key: 'issue-all', label: '全部问题风险', path: '/issues' },
            { key: 'issue-detail', label: currentProject?.name || '项目问题风险', path: `/projects/${currentProjectId}/issues` },
          ]
        : [{ key: 'issue-all', label: '全部问题风险', path: '/issues' }],
    },
  ];

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease',
          collapsed ? 'w-16' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            'h-16 flex items-center border-b border-gray-100',
            collapsed ? 'justify-center px-2' : 'px-6'
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">乡</span>
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-bold text-gray-800 text-lg">乡村振兴</h1>
                  <p className="text-xs text-gray-500">项目管理系统</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);
                const isExpanded = expandedMenus.includes(item.key);

                return (
                  <li key={item.key}>
                    {item.hasSubMenu ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.key)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease group',
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            collapsed && 'justify-center'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5 flex-shrink-0 transition-transform duration-300 ease',
                              isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                            )}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm font-medium">
                                {item.label}
                              </span>
                              {item.subItems && item.subItems.length > 1 && (
                                <span className="transition-transform duration-300 ease">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </button>

                        {!collapsed && item.subItems && isExpanded && item.subItems.length > 1 && (
                          <ul className="mt-1 ml-8 space-y-1">
                            {item.subItems.slice(1).map((subItem) => (
                              <li key={subItem.key}>
                                <NavLink
                                  to={subItem.path}
                                  onClick={onMobileClose}
                                  className={({ isActive }) =>
                                    cn(
                                      'block px-3 py-2 rounded-lg text-sm transition-all duration-300 ease',
                                      isActive
                                        ? 'bg-primary-100 text-primary-700 font-medium'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    )
                                  }
                                >
                                  {subItem.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={onMobileClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease group',
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            collapsed && 'justify-center'
                          )
                        }
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0 transition-transform duration-300 ease',
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                          )}
                        />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={cn(
            'border-t border-gray-100 p-4',
            collapsed && 'px-2'
          )}>
            <div className={cn(
              'flex items-center gap-3',
              collapsed && 'justify-center'
            )}>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">系统管理员</p>
                  <p className="text-xs text-gray-500 truncate">admin@rural.gov</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
