import { cn } from '@/lib/utils';
import {
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6',
        className
      )}
    >
      <div className='flex items-center gap-4 flex-1'>
        <div className='relative max-w-md w-full'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='搜索文件、证件、提醒...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all'
          />
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <button
          onClick={toggleDarkMode}
          className='p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors'
          aria-label={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDarkMode ? (
            <Sun className='w-5 h-5' />
          ) : (
            <Moon className='w-5 h-5' />
          )}
        </button>

        <button
          className='relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors'
          aria-label='通知'
        >
          <Bell className='w-5 h-5' />
          <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full' />
        </button>

        <div className='w-px h-8 bg-gray-200 mx-2' />

        <div className='relative'>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className='flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <div className='w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center'>
              <span className='text-white text-sm font-medium'>U</span>
            </div>
            <div className='text-left'>
              <p className='text-sm font-medium text-gray-900'>用户</p>
              <p className='text-xs text-gray-500'>user@example.com</p>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform',
                showUserMenu && 'rotate-180'
              )}
            />
          </button>

          {showUserMenu && (
            <div className='absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <p className='text-sm font-medium text-gray-900'>用户</p>
                <p className='text-xs text-gray-500'>user@example.com</p>
              </div>
              <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50'>
                个人资料
              </button>
              <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50'>
                账户设置
              </button>
              <div className='border-t border-gray-100 mt-1'>
                <button className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50'>
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
