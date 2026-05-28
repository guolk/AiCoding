import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, History, BookOpen, Search, Share2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/family-tree', label: '家谱管理', icon: Users },
    { path: '/history', label: '历史记录', icon: History },
    { path: '/stories', label: '故事整理', icon: BookOpen },
    { path: '/research', label: '数据考证', icon: Search },
    { path: '/share', label: '分享', icon: Share2 },
  ];

  return (
    <nav className="bg-brown-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold font-song text-gold-accent">家族历史</h1>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brown-600 text-gold-accent'
                        : 'text-gray-300 hover:bg-brown-700 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:hidden border-t border-brown-700">
        <div className="flex justify-around px-2 py-2 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center px-3 py-2 rounded-md text-xs transition-colors',
                  isActive
                    ? 'bg-brown-600 text-gold-accent'
                    : 'text-gray-300 hover:bg-brown-700 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
