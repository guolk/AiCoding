import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Users,
  PenTool,
  Megaphone,
} from "lucide-react";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard },
  { to: "/publications", label: "出版物档案", icon: BookOpen },
  { to: "/sales", label: "销售数据", icon: TrendingUp },
  { to: "/readers", label: "读者互动", icon: Users },
  { to: "/planning", label: "创作计划", icon: PenTool },
  { to: "/marketing", label: "内容营销", icon: Megaphone },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-ink flex flex-col">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-ink-400">
          <BookOpen className="w-7 h-7 text-gold" />
          <h1 className="font-display text-2xl font-bold text-gold tracking-wide">
            PubVault
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-400 text-gold border-l-[3px] border-gold"
                    : "text-ink-100 hover:bg-ink-400 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-ink-400">
          <p className="text-xs text-ink-200">© 2025 林墨白</p>
        </div>
      </aside>

      <main className="ml-[260px] flex-1 min-h-screen bg-ivory">
        <Outlet />
      </main>
    </div>
  );
}
