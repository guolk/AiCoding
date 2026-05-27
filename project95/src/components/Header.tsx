import { Bell, Search, User, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { currentUser } = useStore();

  return (
    <header className="h-16 bg-white border-b border-neutral-100 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">LabCollab</h1>
        <p className="text-sm text-neutral-500">课题组协作平台</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-9 pr-4 py-2 w-64 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
          />
        </div>

        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
            <User className="w-4 h-4 text-accent-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-neutral-900">{currentUser?.name}</p>
            <p className="text-xs text-neutral-500">{currentUser?.role === 'admin' ? '管理员' : currentUser?.role === 'leader' ? '组长' : '成员'}</p>
          </div>
          <button onClick={onLogout} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="退出登录">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
