import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileAudio,
  Map,
  Flame,
  BarChart3,
  FolderHeart,
  Route,
  Settings,
  HelpCircle,
} from 'lucide-react';

const sidebarItems = [
  {
    category: '主要功能',
    items: [
      { path: '/', label: '仪表板', icon: LayoutDashboard },
      { path: '/archive', label: '录音档案', icon: FileAudio },
      { path: '/map', label: '地图中心', icon: Map },
      { path: '/heatmap', label: '热力图', icon: Flame },
      { path: '/analysis', label: '声音分析', icon: BarChart3 },
      { path: '/collections', label: '收藏展示', icon: FolderHeart },
      { path: '/journey', label: '声音旅行', icon: Route },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden xl:block w-64 shrink-0 border-r border-earth-100 dark:border-forest-800 bg-white/50 dark:bg-forest-950/50 backdrop-blur-sm">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6">
        <div className="px-6 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.category}>
              <p className="text-xs font-semibold text-earth-400 dark:text-earth-500 uppercase tracking-wider mb-3 px-3">
                {section.category}
              </p>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                        ${isActive
                          ? 'bg-forest-600 text-white shadow-lg shadow-forest-600/30'
                          : 'text-earth-600 hover:text-earth-900 hover:bg-earth-100 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-forest-800/50'
                        }`}
                    >
                      <item.icon 
                        size={18} 
                        className={isActive ? 'text-white' : 'text-earth-400 group-hover:text-earth-600 dark:group-hover:text-earth-300'}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="px-6 mt-8 pt-6 border-t border-earth-100 dark:border-forest-800">
          <p className="text-xs font-semibold text-earth-400 dark:text-earth-500 uppercase tracking-wider mb-3 px-3">
            其他
          </p>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-earth-600 hover:text-earth-900 hover:bg-earth-100 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-forest-800/50 transition-all">
              <Settings size={18} className="text-earth-400" />
              设置
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-earth-600 hover:text-earth-900 hover:bg-earth-100 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-forest-800/50 transition-all">
              <HelpCircle size={18} className="text-earth-400" />
              帮助
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />
            <p className="text-sm font-semibold relative z-10">声景收藏馆</p>
            <p className="text-xs text-white/80 mt-1 relative z-10">v1.0.0</p>
            <p className="text-xs text-white/70 mt-2 relative z-10">记录自然的声音</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
