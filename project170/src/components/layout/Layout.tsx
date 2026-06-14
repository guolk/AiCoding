import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Calendar, Bell } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { useAppStore } from '@/store/useAppStore';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const loanRecords = useAppStore((s) => s.loanRecords);

  const onLoanCount = loanRecords.filter((l) => l.status === 'on-loan').length;

  const today = formatDate(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 animate-slide-in-right">
            <Sidebar />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="fixed top-4 left-60 z-50 p-2 bg-white rounded-lg shadow-lg"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 shadow-nav sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-amber-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{today}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 text-gray-500 hover:text-amber-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {onLoanCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>
              {notifOpen && onLoanCount > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-card-hover border border-gray-100 animate-fade-in z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-amber-800">出借提醒</p>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    有 <span className="font-semibold text-amber-600">{onLoanCount}</span> 批标本正在外借中
                  </p>
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              矿
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
