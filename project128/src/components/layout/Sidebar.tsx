
import { NavLink } from 'react-router-dom';
import { Home, Gem, TrendingUp, Wrench, Shirt, Plus } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '仪表盘' },
  { path: '/collection', icon: Gem, label: '藏品档案' },
  { path: '/value', icon: TrendingUp, label: '价值管理' },
  { path: '/maintenance', icon: Wrench, label: '维护保养' },
  { path: '/outfit', icon: Shirt, label: '穿搭搭配' },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-ink-600 to-ink-700 text-white shadow-xl z-50">
      <div className="p-6 border-b border-gold-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-gradient">珍宝阁</h1>
            <p className="text-xs text-gold-200">珠宝收藏管理系统</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gold-500 text-white shadow-lg'
                  : 'text-ink-200 hover:bg-white/10 hover:text-gold-300'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <NavLink
          to="/collection/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg gold-gradient text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>新增藏品</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
