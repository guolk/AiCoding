import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-forest-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-forest-800">{title}</h1>
        {subtitle && (
          <span className="text-xs text-forest-600 mt-0.5">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-2 text-sm text-forest-600">
          <span className="hover:text-forest-800 cursor-pointer transition-colors">首页</span>
          <span className="text-forest-300">/</span>
          <span className="text-forest-800 font-medium">{title}</span>
        </nav>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
          <input
            type="text"
            placeholder="搜索..."
            className={cn(
              'w-56 h-9 pl-9 pr-4 rounded-xl',
              'bg-forest-50 border border-forest-100',
              'text-sm text-forest-800 placeholder-forest-400',
              'focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300',
              'transition-all duration-200'
            )}
          />
        </div>

        <button className="relative w-9 h-9 rounded-xl bg-forest-50 flex items-center justify-center text-forest-700 hover:bg-forest-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
