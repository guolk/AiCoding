import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const pageTitleMap: Record<string, string> = {
  "/": "仪表盘",
  "/club/info": "社团基本信息",
  "/club/cadres": "历届干部",
  "/club/constitution": "章程管理",
  "/members/list": "成员列表",
  "/members/points": "积分系统",
  "/members/records": "入退社记录",
  "/activities/list": "活动列表",
  "/activities/plans": "策划方案",
  "/activities/evaluation": "效果评估",
  "/finance/records": "收支记录",
  "/finance/reports": "财务报告",
  "/finance/budget": "预算规划",
  "/honors/achievements": "事迹记录",
  "/honors/applications": "荣誉申报",
};

export default function MainLayout() {
  const location = useLocation();
  const title = pageTitleMap[location.pathname] || "社团管理系统";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
