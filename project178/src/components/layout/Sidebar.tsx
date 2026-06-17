import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Brain,
  Target,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'

const navItems = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/knowledge', label: '知识体系', icon: Brain },
  { path: '/okr', label: 'OKR制定', icon: Target },
  { path: '/resources', label: '学习资源', icon: BookOpen },
  { path: '/output', label: '检验输出', icon: Award },
]

export default function Sidebar() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-r bg-white transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-2'
        )}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Brain
          className="shrink-0"
          size={24}
          style={{ color: 'var(--color-primary)' }}
        />
        <span
          className={cn(
            'font-serif font-bold text-lg whitespace-nowrap overflow-hidden transition-all duration-300',
            sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
          style={{ color: 'var(--color-primary)' }}
        >
          知识OKR
        </span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg transition-all duration-200 group',
                    sidebarCollapsed
                      ? 'justify-center px-0 py-2.5'
                      : 'px-3 py-2.5',
                    isActive
                      ? 'text-white shadow-sm'
                      : 'hover:bg-[var(--color-bg-warm)]'
                  )
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: 'var(--color-primary)' }
                    : undefined
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      className="shrink-0"
                      style={{
                        color: isActive
                          ? '#ffffff'
                          : 'var(--color-text-secondary)',
                      }}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300',
                        sidebarCollapsed
                          ? 'w-0 opacity-0'
                          : 'w-auto opacity-100'
                      )}
                      style={{
                        color: isActive
                          ? '#ffffff'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="flex items-center justify-center h-12 border-t shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--color-bg-warm)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  )
}
