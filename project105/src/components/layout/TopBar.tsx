import { Search, Bell, User, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { debounce } from '../../utils/helpers';

export default function TopBar() {
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useAppStore();

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const pageTitles: Record<string, string> = {
    '/': '仪表盘',
    '/collection': '收藏管理',
    '/inventory': '零件库存',
    '/projects': '项目管理',
    '/gallery': '作品展示',
    '/analytics': '数据分析',
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/collection/')) return '套装详情';
    if (path.startsWith('/projects/')) return '项目详情';
    if (path.startsWith('/gallery/')) return '作品详情';
    return pageTitles[path] || 'BrickVault';
  };

  const showAddButton = ['/collection', '/inventory', '/projects', '/gallery'].includes(location.pathname);

  const getAddButtonText = () => {
    if (location.pathname === '/collection') return '添加套装';
    if (location.pathname === '/inventory') return '添加零件';
    if (location.pathname === '/projects') return '创建项目';
    if (location.pathname === '/gallery') return '发布作品';
    return '添加';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-xl font-semibold text-lego-dark">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索套装、零件、项目..."
            defaultValue={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-brick text-sm focus:outline-none focus:border-lego-blue focus:bg-white transition-all duration-200"
          />
        </div>

        {showAddButton && (
          <button className="brick-btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>{getAddButtonText()}</span>
          </button>
        )}

        <button className="relative p-2 text-gray-500 hover:text-lego-dark hover:bg-gray-100 rounded-brick transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lego-red rounded-full" />
        </button>

        <button className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-brick transition-all duration-200">
          <div className="w-8 h-8 bg-gradient-blue rounded-brick flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">收藏者</span>
        </button>
      </div>
    </header>
  );
}
