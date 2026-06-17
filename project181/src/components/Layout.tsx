import { NavLink, Outlet } from 'react-router-dom'
import { Shield, Key, Monitor, Activity, AlertTriangle, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: Shield, label: '安全仪表盘', color: 'text-cyber-green' },
  { to: '/accounts', icon: Key, label: '账号安全', color: 'text-cyber-blue' },
  { to: '/devices', icon: Monitor, label: '设备管理', color: 'text-cyber-amber' },
  { to: '/habits', icon: Activity, label: '习惯追踪', color: 'text-cyber-green' },
  { to: '/incidents', icon: AlertTriangle, label: '事件记录', color: 'text-cyber-red' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <aside className="hidden lg:flex flex-col w-64 bg-cyber-card border-r border-cyber-border shrink-0">
        <div className="p-6 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyber-green" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg text-white neon-text-green">CyberGuard</h1>
              <p className="text-xs text-slate-500 font-mono">v1.0.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `${item.color} bg-white/5 border border-cyber-border-light`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-cyber-border">
          <div className="px-4 py-3 rounded-lg bg-cyber-surface border border-cyber-border">
            <p className="text-xs text-slate-500 font-mono">数据存储</p>
            <p className="text-xs text-cyber-green font-mono mt-1">● 本地存储已启用</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-cyber-card border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-cyber-green" />
            <span className="font-mono font-bold text-white">CyberGuard</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileMenuOpen && (
          <nav className="lg:hidden bg-cyber-card border-b border-cyber-border p-2 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${item.color} bg-white/5`
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
