import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Wines from './pages/Wines'
import WineDetail from './pages/WineDetail'
import Bottles from './pages/Bottles'
import Tasting from './pages/Tasting'
import TastingForm from './pages/TastingForm'
import Inventory from './pages/Inventory'
import Purchases from './pages/Purchases'
import Wishlist from './pages/Wishlist'
import Promotions from './pages/Promotions'
import Recommendations from './pages/Recommendations'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: '仪表盘', icon: '📊' },
    { path: '/wines', label: '酒窖管理', icon: '🍷' },
    { path: '/bottles', label: '酒款库存', icon: '📦' },
    { path: '/tasting', label: '品饮记录', icon: '📝' },
    { path: '/inventory', label: '库存概览', icon: '📈' },
    { path: '/purchases', label: '采购管理', icon: '🛒' },
    { path: '/wishlist', label: '愿望清单', icon: '⭐' },
    { path: '/promotions', label: '促销机会', icon: '🎁' },
    { path: '/recommendations', label: '推荐搭配', icon: '🍽️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 bg-wine-900 text-white h-screen transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-wine-800">
          <h1 className="text-2xl font-bold">🍷 酒窖管理</h1>
          <p className="text-wine-200 text-sm mt-1">Wine Cellar Manager</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-wine-700 text-white'
                      : 'text-wine-100 hover:bg-wine-800'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(item => location.pathname === item.path)?.label || '酒窖管理系统'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wines" element={<Wines />} />
            <Route path="/wines/:id" element={<WineDetail />} />
            <Route path="/bottles" element={<Bottles />} />
            <Route path="/tasting" element={<Tasting />} />
            <Route path="/tasting/new" element={<TastingForm />} />
            <Route path="/tasting/edit/:id" element={<TastingForm />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
