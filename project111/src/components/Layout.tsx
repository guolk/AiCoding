import React from 'react';
import {
  Home,
  ListTodo,
  User,
  ShoppingBag,
  Trophy,
  Award,
  BarChart3,
  Coins,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';

const navItems = [
  { to: '/dashboard', label: '仪表盘', icon: Home },
  { to: '/tasks', label: '任务中心', icon: ListTodo },
  { to: '/character', label: '角色中心', icon: User },
  { to: '/shop', label: '积分商城', icon: ShoppingBag },
  { to: '/leaderboard', label: '排行榜', icon: Trophy },
  { to: '/achievements', label: '成就系统', icon: Award },
  { to: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Layout() {
  const { currentUser, family } = useUserStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-neutral-700" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl text-gradient-primary">
                  家务大作战
                </h1>
                <p className="text-sm text-neutral-500 mt-1">{family.name}</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1"
              >
                <X className="w-6 h-6 text-neutral-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link-active' : 'nav-link'
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-warm bg-opacity-10">
              <div className="text-3xl">{currentUser.avatarUrl}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800 truncate">
                  {currentUser.roleName}
                </p>
                <div className="flex items-center gap-1 text-sm text-primary-600">
                  <Coins className="w-4 h-4" />
                  <span>{currentUser.coins}</span>
                  <span className="text-neutral-400">|</span>
                  <span>Lv.{currentUser.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
