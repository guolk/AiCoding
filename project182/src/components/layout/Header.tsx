import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Settings, User } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const eventDate = new Date('2026-10-18T18:00:00');
  const eventTitle = '张先生 & 李女士 婚礼庆典';

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white dark:bg-warmGray-900 border-b border-warmGray-200 dark:border-warmGray-800 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-warmGray-900 dark:text-white">
              {eventTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 px-4 py-2 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-display">
                {timeLeft.days}
              </div>
              <div className="text-xs text-warmGray-500 dark:text-warmGray-400">天</div>
            </div>
            <div className="text-primary-300 dark:text-primary-600 font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-display">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-warmGray-500 dark:text-warmGray-400">时</div>
            </div>
            <div className="text-primary-300 dark:text-primary-600 font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-display">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-warmGray-500 dark:text-warmGray-400">分</div>
            </div>
            <div className="text-primary-300 dark:text-primary-600 font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-500 dark:text-accent-400 font-display animate-bounce-soft">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-warmGray-500 dark:text-warmGray-400">秒</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
            ) : (
              <Moon className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
            )}
          </button>

          <button className="p-2 rounded-lg hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors relative">
            <Bell className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
          </button>

          <button className="p-2 rounded-lg hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors">
            <Settings className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
          </button>

          <div className="w-px h-8 bg-warmGray-200 dark:bg-warmGray-700 mx-2"></div>

          <div className="flex items-center gap-3 cursor-pointer hover:bg-warmGray-100 dark:hover:bg-warmGray-800 px-3 py-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-warmGray-900 dark:text-white">
                管理员
              </div>
              <div className="text-xs text-warmGray-500 dark:text-warmGray-400">
                admin@wedding.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
