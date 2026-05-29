import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/review/')) return '年度回顾';
    if (path.startsWith('/gratitude/')) return '感恩与反思';
    if (path.startsWith('/plan/')) return '新年计划';
    if (path.startsWith('/visualize/')) return '可视化总结';
    if (path.startsWith('/export/')) return '分享与存档';
    return '年度回顾与计划';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-warm-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-warm-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-secondary-500" />
              ) : (
                <Menu className="w-6 h-6 text-secondary-500" />
              )}
            </button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600",
                "flex items-center justify-center shadow-lg shadow-primary-500/25",
                "transition-transform group-hover:scale-105"
              )}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg font-semibold text-secondary-500 leading-tight">
                  年度回顾与计划
                </h1>
                <p className="text-xs text-gray-500">{getPageTitle()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warm-100 rounded-full">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-secondary-500 font-medium">记录成长，规划未来</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
