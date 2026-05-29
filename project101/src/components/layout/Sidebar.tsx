import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Home as HomeIcon, Calendar, Users, ClipboardList, DollarSign,
  Building2, BookOpen, UserCheck, Sparkles, Menu, X
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/', label: '仪表盘', icon: Home },
  { path: '/properties', label: '房源管理', icon: Building2 },
  { path: '/bookings', label: '预订管理', icon: Calendar },
  { path: '/customers', label: '客户关系', icon: Users },
  { path: '/operations/cleaning', label: '运营管理', icon: ClipboardList },
  { path: '/finance', label: '财务管理', icon: DollarSign },
];

const operationsItems = [
  { path: '/operations/cleaning', label: '保洁任务', icon: Sparkles },
  { path: '/operations/inventory', label: '耗材库存', icon: BookOpen },
  { path: '/operations/maintenance', label: '维修任务', icon: UserCheck },
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const location = useLocation();

  const isOperationsActive = location.pathname.startsWith('/operations');

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-serif">民宿管家</span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-1 text-emerald-200 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path) && item.path !== '/operations/cleaning';

            if (item.label === '运营管理') {
              return (
                <div key={item.path}>
                  <button
                    onClick={() => setIsOperationsOpen(!isOperationsOpen)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isOperationsActive
                        ? 'bg-emerald-700/50 text-white shadow-inner'
                        : 'text-emerald-200 hover:bg-emerald-700/30 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className={clsx('transition-transform', isOperationsOpen ? 'rotate-90' : '')}>
                      ›
                    </span>
                  </button>
                  {isOperationsOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {operationsItems.map((opItem) => {
                        const OpIcon = opItem.icon;
                        const isOpActive = location.pathname === opItem.path;
                        return (
                          <NavLink
                            key={opItem.path}
                            to={opItem.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) => clsx(
                              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                              isActive
                                ? 'bg-amber-500/20 text-amber-300 font-medium'
                                : 'text-emerald-300 hover:bg-emerald-700/20 hover:text-white'
                            )}
                          >
                            <OpIcon className="w-4 h-4" />
                            {opItem.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                    : 'text-emerald-200 hover:bg-emerald-700/30 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
          <div className="bg-emerald-700/30 rounded-lg p-4">
            <p className="text-xs text-emerald-300 mb-2">今日概览</p>
            <div className="flex justify-between text-sm">
              <span className="text-white font-semibold">待处理</span>
              <span className="text-amber-400 font-bold">5</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
