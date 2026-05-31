import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Search,
  TestTube,
  BookOpen,
  Home,
  ChevronLeft,
  ChevronRight,
  ScrollText
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';

interface SidebarProps {
  projectId: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { currentProjectData } = useProjectStore();

  const menuItems = [
    {
      path: `/project/${projectId}/script`,
      label: '剧本创作',
      icon: ScrollText,
      subItems: [
        { label: '基础信息' },
        { label: '角色档案' },
        { label: '时间线' }
      ]
    },
    {
      path: `/project/${projectId}/clues`,
      label: '线索系统',
      icon: Search,
      subItems: [
        { label: '线索分层' },
        { label: '关联图' },
        { label: '发放时机' }
      ]
    },
    {
      path: `/project/${projectId}/testing`,
      label: '测试管理',
      icon: TestTube,
      subItems: [
        { label: '试玩记录' },
        { label: '玩家反馈' },
        { label: '版本管理' }
      ]
    },
    {
      path: `/project/${projectId}/review`,
      label: '复盘资料',
      icon: BookOpen,
      subItems: [
        { label: 'DM手册' },
        { label: 'FAQ库' },
        { label: '真相揭晓' }
      ]
    }
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`
        bg-dark-surface border-r border-dark-border
        flex flex-col transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent-gold" />
            <div className="min-w-0">
              <h2 className="font-serif font-semibold text-white truncate">
                {currentProjectData?.name || '未命名剧本'}
              </h2>
              <p className="text-xs text-dark-muted">
                {currentProjectData?.currentVersion || 'v1.0.0'}
              </p>
            </div>
          </div>
        )}
        {collapsed && <FileText className="w-6 h-6 text-accent-gold mx-auto" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-dark-card transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-dark-muted" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-dark-muted" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <button
          onClick={() => navigate('/')}
          className={`
            sidebar-link w-full mb-2
            ${location.pathname === '/' ? 'sidebar-link-active' : ''}
          `}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>返回项目列表</span>}
        </button>

        <div className="border-t border-dark-border my-3" />

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <div key={item.path} className="mb-1">
              <button
                onClick={() => navigate(item.path)}
                className={`
                  sidebar-link w-full
                  ${active ? 'sidebar-link-active' : ''}
                `}
                style={{ '--stagger': idx } as React.CSSProperties}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
              {active && !collapsed && (
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {item.subItems.map((sub) => (
                    <div
                      key={sub.label}
                      className="text-sm text-dark-muted py-1 px-2"
                    >
                      • {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-dark-border">
          <div className="text-xs text-dark-muted text-center">
            剧本杀创作工具
          </div>
        </div>
      )}
    </aside>
  );
}
