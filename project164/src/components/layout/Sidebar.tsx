import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  FolderOpen,
  Wallet,
  GraduationCap as CapIcon,
} from "lucide-react";

const navItems = [
  { path: "/", label: "仪表盘", icon: LayoutDashboard },
  { path: "/applications", label: "申请项目", icon: GraduationCap },
  { path: "/documents", label: "文书管理", icon: FileText },
  { path: "/materials", label: "材料准备", icon: FolderOpen },
  { path: "/finance", label: "财务规划", icon: Wallet },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <CapIcon className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-serif font-bold text-lg">留学助手</span>
            <span className="text-xs text-slate-400">StudyTrack Pro</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:block hidden"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary-700 text-white shadow-lg shadow-primary-900/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                } ${isCollapsed ? "justify-center" : ""}`
              }
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        className={`p-4 border-t border-slate-800 ${isCollapsed ? "text-center" : ""}`}
      >
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center font-bold text-white flex-shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">同学</span>
              <span className="text-xs text-slate-400">2026 Fall申请季</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
