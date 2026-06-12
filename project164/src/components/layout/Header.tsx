import { useLocation } from "react-router-dom";
import { Bell, Search, ChevronRight } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "仪表盘",
  "/applications": "申请项目管理",
  "/applications/compare": "院校要求对比",
  "/documents": "文书管理",
  "/materials": "材料准备",
  "/materials/recommenders": "推荐人管理",
  "/finance": "财务规划",
  "/finance/scholarships": "奖学金追踪",
  "/finance/expenses": "费用支出记录",
};

const getBreadcrumb = (pathname: string): Array<{ label: string; path?: string }> => {
  if (pathname === "/") return [{ label: "仪表盘" }];

  const parts = pathname.split("/").filter(Boolean);
  const result: Array<{ label: string; path?: string }> = [
    { label: "首页", path: "/" },
  ];

  let currentPath = "";
  for (let i = 0; i < parts.length; i++) {
    currentPath += "/" + parts[i];
    const label = routeTitles[currentPath];
    if (label) {
      if (i === parts.length - 1) {
        result.push({ label });
      } else {
        result.push({ label, path: currentPath });
      }
    } else if (parts[i] && !isNaN(Number(parts[i])) === false && parts[i].length > 20) {
      // This is likely an ID, skip in breadcrumb
    }
  }

  return result;
};

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

export default function Header({ isSidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const breadcrumb = getBreadcrumb(location.pathname);
  const currentTitle = breadcrumb[breadcrumb.length - 1]?.label || "仪表盘";

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 transition-all duration-300 flex items-center justify-between px-6 ${
        isSidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      <div className="flex items-center gap-3">
        <nav className="flex items-center text-sm text-slate-500">
          {breadcrumb.map((item, idx) => (
            <span key={idx} className="flex items-center">
              {idx > 0 && <ChevronRight className="w-4 h-4 mx-1.5 text-slate-300" />}
              {item.path && idx !== breadcrumb.length - 1 ? (
                <span className="hover:text-primary-700 cursor-pointer transition-colors">
                  {item.label}
                </span>
              ) : (
                <span
                  className={`font-medium ${
                    idx === breadcrumb.length - 1 ? "text-slate-900" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索院校、文书、材料..."
            className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
        </button>

        <h1 className="hidden xl:block text-lg font-serif font-semibold text-slate-800">
          {currentTitle}
        </h1>
      </div>
    </header>
  );
}
