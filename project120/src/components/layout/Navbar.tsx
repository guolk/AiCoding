import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-dark-300" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
          <input
            type="text"
            placeholder="搜索记录、目标、装备..."
            className="w-80 bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-dark-800 rounded-xl transition-colors">
          <Bell size={20} className="text-dark-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || '用户'}</p>
            <p className="text-xs text-dark-400">{user?.primarySport || '攀岩'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-dark-800 rounded-xl transition-colors text-dark-400 hover:text-white"
            title="退出登录"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
