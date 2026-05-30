import { Menu, Bell, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const today = new Date();
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">{formatDate(today)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm">
              {['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()]}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">用户</span>
          </div>
        </div>
      </div>
    </header>
  );
}
