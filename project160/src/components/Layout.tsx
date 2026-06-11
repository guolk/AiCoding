import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  Building,
  ShieldAlert,
  FileText,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navGroups: NavGroup[] = [
  { label: '首页仪表盘', icon: <LayoutDashboard size={18} />, path: '/' },
  {
    label: '消防设施管理',
    icon: <Building size={18} />,
    children: [
      { label: '设施台账', path: '/facilities' },
      { label: '检查记录', path: '/facilities/inspection' },
      { label: '维护记录', path: '/facilities/maintenance' },
    ],
  },
  {
    label: '隐患排查管理',
    icon: <ShieldAlert size={18} />,
    children: [
      { label: '隐患记录', path: '/hazards' },
      { label: 'A类重大隐患', path: '/hazards/level-a' },
      { label: 'B类一般隐患', path: '/hazards/level-b' },
      { label: '统计分析', path: '/hazards/statistics' },
    ],
  },
  {
    label: '应急预案管理',
    icon: <FileText size={18} />,
    children: [
      { label: '预案文档', path: '/emergency/plans' },
      { label: '应急小组', path: '/emergency/team' },
      { label: '演练管理', path: '/emergency/drills' },
    ],
  },
  {
    label: '培训管理',
    icon: <GraduationCap size={18} />,
    children: [
      { label: '培训记录', path: '/training/records' },
      { label: '入职培训追踪', path: '/training/onboarding' },
      { label: '题库管理', path: '/training/questions' },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      if (g.children) {
        const isActive = g.children.some((c) => location.pathname === c.path);
        if (isActive) initial[g.label] = true;
      }
    });
    return initial;
  });

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.path) return location.pathname === group.path;
    return group.children?.some((c) => location.pathname === c.path) ?? false;
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1A2E] text-gray-300">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#E8384F] flex items-center justify-center">
          <Flame size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-serif-title text-base font-bold text-white leading-tight">消防安全管理</h1>
          <p className="text-[10px] text-gray-500 leading-tight">Fire Safety Management</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {group.path ? (
              <NavLink
                to={group.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0F3460] text-white font-medium'
                      : 'hover:bg-[#16213E] hover:text-white'
                  }`
                }
              >
                {group.icon}
                <span>{group.label}</span>
              </NavLink>
            ) : (
              <>
                <button
                  onClick={() => toggle(group.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isGroupActive(group)
                      ? 'text-white font-medium'
                      : 'hover:bg-[#16213E] hover:text-white'
                  }`}
                >
                  {group.icon}
                  <span className="flex-1 text-left">{group.label}</span>
                  {expanded[group.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expanded[group.label] && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {group.children?.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                            isActive
                              ? 'bg-[#C41E3A]/20 text-[#E8384F] font-medium'
                              : 'hover:bg-[#16213E] hover:text-white text-gray-400'
                          }`
                        }
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${location.pathname === child.path ? 'bg-[#E8384F]' : 'bg-gray-600'}`} />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[10px] text-gray-600 text-center">v1.0.0 · 消防安全管理系统</p>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Flame size={14} className="text-[#C41E3A]" />
            <span>消防安全管理系统</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
