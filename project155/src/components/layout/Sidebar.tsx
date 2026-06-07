import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Palette,
  Wallet,
  Construction,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    path: "/dashboard",
    label: "项目总览",
    icon: LayoutDashboard,
  },
  {
    path: "/space",
    label: "空间规划",
    icon: Map,
  },
  {
    path: "/design",
    label: "设计方案",
    icon: Palette,
  },
  {
    path: "/budget",
    label: "预算管理",
    icon: Wallet,
  },
  {
    path: "/construction",
    label: "施工进度",
    icon: Construction,
  },
  {
    path: "/suppliers",
    label: "供应商管理",
    icon: Users,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">民宿改造管理</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
