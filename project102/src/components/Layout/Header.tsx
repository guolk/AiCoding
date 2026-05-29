import { Bell, Search, Menu, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': '仪表盘',
  '/equipment': '设备台账',
  '/equipment/new': '新增设备',
  '/inspection/standards': '点检标准',
  '/inspection/tasks': '点检任务',
  '/inspection/records': '点检记录',
  '/workorders': '维修工单',
  '/workorders/new': '新建工单',
  '/lubrication/points': '润滑点管理',
  '/lubrication/records': '换油记录',
  '/statistics/failure': '故障率统计',
  '/statistics/cost': '成本分析',
  '/statistics/completion': '完成率分析',
};

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const getTitle = () => {
    let title = routeTitles[location.pathname];
    if (title) return title;
    if (location.pathname.startsWith('/equipment/')) {
      return location.pathname.includes('edit') ? '编辑设备' : '设备详情';
    }
    if (location.pathname.startsWith('/workorders/')) {
      return '工单详情';
    }
    return '设备管理系统';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg mr-4 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <h1 className="text-xl font-semibold text-gray-800 flex-1">{getTitle()}</h1>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索设备..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
