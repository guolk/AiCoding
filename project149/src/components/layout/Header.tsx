import { Search, Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = '仪表盘', onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-serif text-xl font-bold text-primary-700">{title}</h2>
            <p className="text-sm text-gray-500">欢迎回来， Chef 👨‍🍳</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户、菜单..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
            />
          </div>

          <button className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center">
              <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-coral-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500" />
            </span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">陈大厨</p>
              <p className="text-xs text-gray-500">高级私厨</p>
            </div>
            <div className="relative">
              <Avatar name="陈大厨" size="md" />
              <Badge
                variant="success"
                size="sm"
                className="absolute -bottom-0.5 -right-0.5 border-2 border-white"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
