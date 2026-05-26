import { Link } from 'react-router-dom'
import { Home, MessageCircle, User, Flame, Map, Compass, Plus, Bell, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'

export function Header() {
  const { currentUser } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/questions', label: '问答社区', icon: MessageCircle },
    { path: '/learning', label: '学习激励', icon: Flame },
    { path: '/stream', label: '学习流', icon: Compass },
    { path: '/map', label: '知识地图', icon: Map },
    { path: '/profile', label: '我的档案', icon: User },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">知识社区</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <nav className="hidden md:flex lg:hidden items-center gap-1">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-56">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="搜索问题..."
                className="bg-transparent border-none outline-none text-sm flex-1 ml-2 min-w-0"
              />
            </div>
            <Link to="/questions/ask" className="flex items-center gap-1.5 bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">提问</span>
            </Link>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/profile" className="flex items-center gap-2 flex-shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500"
              />
              <span className="hidden lg:block text-sm font-medium text-gray-700">{currentUser.username}</span>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
