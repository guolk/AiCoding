import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, FolderKanban, Image, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { MENU_ITEMS } from '../../utils/constants';

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Package,
  Boxes,
  FolderKanban,
  Image,
  BarChart3,
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lego-sm z-50 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} border-b border-gray-100`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-lego rounded-brick flex items-center justify-center shadow-lego-md">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-lego-dark">BrickVault</h1>
              <p className="text-xs text-gray-500">乐高收藏管理</p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-10 h-10 bg-gradient-lego rounded-brick flex items-center justify-center shadow-lego-md">
            <span className="text-white font-bold text-lg">B</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-brick transition-all duration-200 ${
                    isActive
                      ? 'bg-lego-red/10 text-lego-red font-medium shadow-lego-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-lego-dark'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  {Icon && <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-gray-500 hover:text-lego-dark hover:bg-gray-100 rounded-brick transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!sidebarCollapsed && <span className="text-sm">收起</span>}
        </button>
      </div>

      <div
        className={`absolute w-8 h-1.5 bg-lego-red rounded-full ${
          sidebarCollapsed ? 'left-4' : 'left-8'
        }`}
        style={{ top: '2px' }}
      />
    </aside>
  );
}
