import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Disc, BookOpen, TrendingUp, Heart, Star, Settings, Menu, X } from 'lucide-react'

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/collections', icon: Disc, label: '收藏档案' },
    { path: '/storage', icon: BookOpen, label: '存放管理' },
    { path: '/value', icon: TrendingUp, label: '价值追踪' },
    { path: '/wishlist', icon: Heart, label: '愿望清单' },
    { path: '/reviews', icon: Star, label: '推荐评分' },
    { path: '/settings', icon: Settings, label: '设置' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#1a1a2e]/80 backdrop-blur-sm"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-[#1a1a2e]/95 backdrop-blur-sm border-r border-white/10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#e94560] to-[#ff6b6b] rounded-lg flex items-center justify-center">
                <Disc size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  收藏家
                </h1>
                <p className="text-xs text-white/60">Media Vault</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#e94560]/20 to-transparent text-white border-l-4 border-[#e94560] shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/5 hover:border-l-4 hover:border-transparent'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-white/40">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="md:ml-64 min-h-screen">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
