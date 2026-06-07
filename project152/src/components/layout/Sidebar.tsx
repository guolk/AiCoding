import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Award,
  Copyright,
  Users,
  Handshake,
  TrendingUp,
  Calendar,
  Map,
  BarChart3,
  AlertTriangle,
  FileCheck,
  ArrowLeftRight,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '仪表盘',
    items: [
      { label: '概览', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: '专利管理',
    items: [
      { label: '专利列表', path: '/patents', icon: <FileText className="h-5 w-5" /> },
      { label: '年费管理', path: '/patents/annuity', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
  {
    title: '商标版权',
    items: [
      { label: '商标管理', path: '/trademarks', icon: <Award className="h-5 w-5" /> },
      { label: '版权管理', path: '/copyrights', icon: <Copyright className="h-5 w-5" /> },
      { label: '地域分析', path: '/geo-analysis', icon: <Map className="h-5 w-5" /> },
    ],
  },
  {
    title: '竞争对手',
    items: [
      { label: '竞品专利', path: '/competitors/patents', icon: <Users className="h-5 w-5" /> },
      { label: '专利地图', path: '/competitors/map', icon: <BarChart3 className="h-5 w-5" /> },
      { label: '侵权评估', path: '/competitors/infringement', icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
  {
    title: '许可转让',
    items: [
      { label: '许可协议', path: '/licenses', icon: <FileCheck className="h-5 w-5" /> },
      { label: '转让记录', path: '/transfers', icon: <ArrowLeftRight className="h-5 w-5" /> },
      { label: '质押融资', path: '/pledge', icon: <Landmark className="h-5 w-5" /> },
    ],
  },
  {
    title: '价值评估',
    items: [
      { label: '评估中心', path: '/valuation', icon: <TrendingUp className="h-5 w-5" /> },
      { label: '转让记录', path: '/transfers', icon: <Handshake className="h-5 w-5" /> },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navGroups.map((g) => g.title))
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
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
          'fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 flex flex-col',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800">IPManager</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-5 w-5 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-1"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                >
                  {group.title}
                  {expandedGroups.has(group.title) ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}

              {!collapsed && expandedGroups.has(group.title) && (
                <div className="mt-1 space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {collapsed && (
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )
                      }
                      title={item.label}
                    >
                      {item.icon}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-center',
              !collapsed && 'justify-start gap-2'
            )}
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                收起侧边栏
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}

export { Menu };
