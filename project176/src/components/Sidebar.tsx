import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Code,
  GitBranch,
  Bug,
  TrendingUp,
  Settings,
  Gamepad2,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/devlog", icon: Code, label: "开发日志" },
  { to: "/versions", icon: GitBranch, label: "版本管理" },
  { to: "/testing", icon: Bug, label: "测试管理" },
  { to: "/business", icon: TrendingUp, label: "商业规划" },
  { to: "/settings", icon: Settings, label: "设置" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-base-900 bg-grid-pattern bg-grid flex flex-col border-r border-white/5 z-50">
      <div className="flex items-center gap-3 px-5 py-5">
        <Gamepad2 className="w-7 h-7 text-neon-green" />
        <span className="neon-text font-mono text-lg font-bold tracking-wider">
          暗影迷途
        </span>
      </div>

      <div className="mx-4 h-px bg-neon-green/30 shadow-neon" />

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm transition-all duration-200",
                isActive
                  ? "text-neon-green bg-neon-green/10 border-l-2 border-neon-green shadow-[inset_2px_0_8px_rgba(0,255,136,0.15)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-neon-green/10",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-[18px] h-[18px] ${isActive ? "text-neon-green" : ""}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/5">
        <span className="font-mono text-xs text-gray-600">v0.4.0</span>
      </div>
    </aside>
  );
}
