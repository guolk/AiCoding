import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Route,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  User,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';

interface SubMenuItem {
  key: string;
  label: string;
  path: string;
  isHint?: boolean;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  children?: SubMenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const getProjectById = useProjectStore((state) => state.getProjectById);
  const projects = useProjectStore((state) => state.projects);

  const projectId = useMemo(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const currentProject = useMemo(
    () => (projectId ? getProjectById(projectId) : undefined),
    [projectId, getProjectById]
  );

  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'project',
    'progress',
    'effect',
    'issue',
  ]);

  const getProjectPath = (suffix: string = ''): string => {
    if (projectId) {
      return suffix ? `/projects/${projectId}/${suffix}` : `/projects/${projectId}`;
    }
    return '/projects';
  };

  const toggleMenu = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isMenuActive = (key: string): boolean => {
    const path = location.pathname;
    switch (key) {
      case 'dashboard':
        return path === '/';
      case 'project':
        return (
          path.startsWith('/projects') &&
          !path.includes('/progress') &&
          !path.includes('/milestones') &&
          !path.includes('/visits') &&
          !path.includes('/photos') &&
          !path.includes('/effects') &&
          !path.includes('/risks')
        );
      case 'progress':
        return (
          path.includes('/progress') ||
          path.includes('/milestones') ||
          path.includes('/visits') ||
          path.includes('/photos')
        );
      case 'effect':
        return path.includes('/effects');
      case 'issue':
        return path.includes('/risks');
      default:
        return false;
    }
  };

  const isSubItemActive = (subItem: SubMenuItem): boolean => {
    if (subItem.isHint) return false;
    return (
      location.pathname === subItem.path ||
      location.pathname.startsWith(subItem.path + '/')
    );
  };

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
      children: [
        { key: 'project-list', label: '全部项目', path: '/projects' },
        ...(projects.length > 0
          ? projects.slice(0, 5).map((p) => ({
              key: `project-${p.id}`,
              label: p.name,
              path: `/projects/${p.id}`,
            }))
          : [
              {
                key: 'project-empty',
                label: '暂无项目',
                path: '/projects',
                isHint: true,
              },
            ]),
      ],
    },
    {
      key: 'progress',
      label: '实施进度',
      icon: Route,
      path: getProjectPath('progress'),
      children: projectId
        ? [
            { key: 'progress-overview', label: '进度概览', path: getProjectPath('progress') },
            { key: 'milestone', label: '里程碑管理', path: getProjectPath('milestones') },
            { key: 'visit', label: '走访记录', path: getProjectPath('visits') },
            { key: 'photo', label: '照片时间轴', path: getProjectPath('photos') },
          ]
        : [
            {
              key: 'progress-hint',
              label: '请先选择项目',
              path: '/projects',
              isHint: true,
            },
          ],
    },
    {
      key: 'effect',
      label: '成效数据',
      icon: TrendingUp,
      path: getProjectPath('effects'),
      children: projectId
        ? [
            { key: 'effect-overview', label: '成效概览', path: getProjectPath('effects') },
            { key: 'effect-input', label: '指标录入', path: getProjectPath('effects/input') },
            {
              key: 'effect-analysis',
              label: '对比分析',
              path: getProjectPath('effects/analysis'),
            },
            { key: 'effect-cases', label: '受益案例', path: getProjectPath('effects/cases') },
          ]
        : [
            {
              key: 'effect-hint',
              label: '请先选择项目',
              path: '/projects',
              isHint: true,
            },
          ],
    },
    {
      key: 'issue',
      label: '问题风险',
      icon: AlertTriangle,
      path: getProjectPath('risks'),
      children: projectId
        ? [
            { key: 'risk-overview', label: '风险概览', path: getProjectPath('risks') },
            { key: 'issue-manage', label: '问题管理', path: getProjectPath('risks/issues') },
            {
              key: 'risk-warning',
              label: '风险预警',
              path: getProjectPath('risks/warnings'),
            },
          ]
        : [
            {
              key: 'issue-hint',
              label: '请先选择项目',
              path: '/projects',
              isHint: true,
            },
          ],
    },
  ];

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
          'fixed left-0 top-0 h-full bg-white shadow-lg z-50',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              'h-16 flex items-center border-b border-gray-100',
              collapsed ? 'justify-center px-2' : 'px-6'
            )}
          >
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
                const isActive = isMenuActive(item.key);
                const isExpanded = expandedMenus.includes(item.key);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <li key={item.key}>
                    <a
                      href={item.path}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-white' : 'text-gray-400'
                        )}
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>

                          {hasChildren && (
                            <span
                              onClick={(e) => toggleMenu(e, item.key)}
                              className="flex-shrink-0 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </a>

                    {!collapsed && hasChildren && isExpanded && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.children!.map((subItem) => {
                          const subActive = isSubItemActive(subItem);
                          return (
                            <li key={subItem.key}>
                              <a
                                href={subItem.path}
                                onClick={onMobileClose}
                                className={cn(
                                  'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                                  subActive
                                    ? 'bg-primary-100 text-primary-700 font-medium'
                                    : subItem.isHint
                                      ? 'text-gray-400 italic hover:bg-gray-50'
                                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                )}
                              >
                                {subItem.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={cn('border-t border-gray-100 p-4 space-y-3', collapsed && 'px-2')}
          >
            <div
              className={cn('flex items-center gap-3', collapsed && 'justify-center')}
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    系统管理员
                  </p>
                  <p className="text-xs text-gray-500 truncate">admin@rural.gov</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => {
                  if (confirm('确定要重置演示数据吗？所有修改将恢复为初始状态。')) {
                    setTimeout(() => {
                      useProjectStore.getState().resetData();
                      window.location.reload();
                    }, 0);
                  }
                }}
                className="w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置演示数据
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
