import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Wallet,
  Award,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: typeof LayoutDashboard;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: "仪表盘",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "社团档案",
    icon: Building2,
    children: [
      { label: "基本信息", path: "/club/info" },
      { label: "历届干部", path: "/club/cadres" },
      { label: "章程管理", path: "/club/constitution" },
    ],
  },
  {
    label: "成员管理",
    icon: Users,
    children: [
      { label: "成员列表", path: "/members/list" },
      { label: "积分系统", path: "/members/points" },
      { label: "入退社记录", path: "/members/records" },
    ],
  },
  {
    label: "活动管理",
    icon: Calendar,
    children: [
      { label: "活动列表", path: "/activities/list" },
      { label: "策划方案", path: "/activities/plans" },
      { label: "效果评估", path: "/activities/evaluation" },
    ],
  },
  {
    label: "财务管理",
    icon: Wallet,
    children: [
      { label: "收支记录", path: "/finance/records" },
      { label: "财务报告", path: "/finance/reports" },
      { label: "预算规划", path: "/finance/budget" },
    ],
  },
  {
    label: "评优申报",
    icon: Award,
    children: [
      { label: "事迹记录", path: "/honors/achievements" },
      { label: "荣誉申报", path: "/honors/applications" },
    ],
  },
];

function MenuGroup({ item }: { item: MenuItem }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(
    item.children?.some((c) => location.pathname.startsWith(c.path))
  );

  if (!item.children) {
    return (
      <NavLink
        to={item.path!}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            isActive
              ? "bg-primary-800 text-white shadow-md"
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          )
        }
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
          item.children.some((c) => location.pathname.startsWith(c.path))
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 space-y-1 animate-fade-in">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center pl-8 pr-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
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

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-primary-900 to-primary-950 text-white flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">社团管理系统</h1>
            <p className="text-xs text-gray-400">Club Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuGroup key={item.label} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">管理员</p>
            <p className="text-xs text-gray-400 truncate">admin@club.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
