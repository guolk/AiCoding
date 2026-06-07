import { Link, useLocation, useParams } from "react-router-dom";
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
    pathSuffix: "",
    label: "项目总览",
    icon: LayoutDashboard,
  },
  {
    pathSuffix: "space-planning",
    label: "空间规划",
    icon: Map,
  },
  {
    pathSuffix: "design",
    label: "设计方案",
    icon: Palette,
  },
  {
    pathSuffix: "budget",
    label: "预算管理",
    icon: Wallet,
  },
  {
    pathSuffix: "construction",
    label: "施工进度",
    icon: Construction,
  },
  {
    pathSuffix: "suppliers",
    label: "供应商管理",
    icon: Users,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const projectId = id || '';

  const getFullPath = (suffix: string) => {
    if (!projectId) return '#';
    return suffix ? `/projects/${projectId}/${suffix}` : `/projects/${projectId}`;
  };

  const isActive = (suffix: string) => {
    const fullPath = getFullPath(suffix);
    if (suffix === '') {
      return location.pathname === `/projects/${projectId}`;
    }
    return location.pathname.startsWith(fullPath);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600 font-serif">宿造</h1>
        <p className="text-xs text-gray-500 mt-1">民宿改造项目管理</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.pathSuffix);
          const fullPath = getFullPath(item.pathSuffix);
          return (
            <Link
              key={item.pathSuffix}
              to={fullPath}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary-50 text-primary-600 sidebar-item-active"
                  : "text-primary-400 hover:bg-primary-50 hover:text-primary-500 sidebar-item-inactive"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50"
        >
          <LayoutDashboard className="w-4 h-4" />
          返回项目列表
        </Link>
      </div>
    </aside>
  );
}
