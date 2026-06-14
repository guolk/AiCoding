import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  Menu, 
  X, 
  Search, 
  Moon, 
  Sun, 
  Plus,
  Compass,
  BarChart3,
  FolderOpen,
  Map
} from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Compass },
    { path: '/archive', label: '录音档案', icon: FolderOpen },
    { path: '/map', label: '地图中心', icon: Map },
    { path: '/heatmap', label: '热力图', icon: BarChart3 },
    { path: '/analysis', label: '声音分析', icon: BarChart3 },
    { path: '/collections', label: '收藏展示', icon: FolderOpen },
    { path: '/journey', label: '声音旅行', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-forest-950/80 backdrop-blur-lg border-b border-earth-100 dark:border-forest-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-lg shadow-forest-500/30 group-hover:scale-105 transition-transform">
              <Mic size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-earth-900 dark:text-earth-100 font-display">
                声景收藏馆
              </h1>
              <p className="text-xs text-earth-500 dark:text-earth-400 -mt-1">
                SoundScape Archive
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${location.pathname === item.path 
                    ? 'bg-forest-100 text-forest-700 dark:bg-forest-800/50 dark:text-forest-300' 
                    : 'text-earth-600 hover:text-earth-900 hover:bg-earth-50 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-forest-800/30'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center relative">
              <Search size={18} className="absolute left-3 text-earth-400" />
              <input
                type="text"
                placeholder="搜索录音..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-earth-50 dark:bg-forest-900/50 border border-earth-200 dark:border-forest-700 rounded-lg text-sm text-earth-900 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>

            <Link to="/archive/new">
              <IconButton variant="filled" size="md">
                <Plus size={20} />
              </IconButton>
            </Link>

            <IconButton onClick={toggleTheme} size="md">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>

            <IconButton 
              className="lg:hidden" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              size="md"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-earth-100 dark:border-forest-800 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
                    ${location.pathname === item.path 
                      ? 'bg-forest-100 text-forest-700 dark:bg-forest-800/50 dark:text-forest-300' 
                      : 'text-earth-600 hover:text-earth-900 hover:bg-earth-50 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-forest-800/30'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
