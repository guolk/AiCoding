import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Library, 
  BookOpen, 
  Headphones, 
  Mic, 
  BarChart3,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/materials', label: '材料库', icon: Library },
  { path: '/progress', label: '进度', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#F59E0B] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#1E3A5F] text-lg leading-tight">听力训练</h1>
              <p className="text-xs text-gray-500">English Listening</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              导航菜单
            </p>
            <div className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive 
                      ? 'bg-[#1E3A5F] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[#1E3A5F]/10 to-[#F59E0B]/10 rounded-xl p-4">
              <h4 className="font-semibold text-[#1E3A5F] mb-1">今日目标</h4>
              <p className="text-sm text-gray-600">每天坚持20分钟，听力进步看得见！</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#F59E0B] flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-[#1E3A5F]">听力训练</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">错词本</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2d4f7a] flex items-center justify-center text-white font-semibold">
            U
          </div>
        </div>
      </div>
    </header>
  );
};
