import { useLocation } from 'react-router-dom'
import { Settings, Sun, Moon, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'
import { useTheme } from '@/hooks/useTheme'
import { resetDemoData } from '@/data/mockData'

const routeTitles: Record<string, string> = {
  '/': '总览',
  '/knowledge': '知识体系',
  '/okr': 'OKR制定',
  '/resources': '学习资源',
  '/output': '检验输出',
}

export default function Header() {
  const location = useLocation()
  const currentQuarter = useAppStore((s) => s.currentQuarter)
  const { isDark, toggleTheme } = useTheme()

  const title = routeTitles[location.pathname] || '页面未找到'

  function handleResetDemo() {
    if (confirm('确定要重置所有演示数据吗？此操作不可撤销。')) {
      resetDemoData()
      window.location.reload()
    }
  }

  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 bg-white border-b shrink-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h1
        className="font-serif font-bold text-xl"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: 'rgba(30,58,95,0.08)',
            color: 'var(--color-primary)',
          }}
        >
          {currentQuarter}
        </span>

        <button
          onClick={handleResetDemo}
          className={cn(
            'px-3 h-9 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors duration-200',
            'hover:bg-[var(--color-accent)] hover:text-white',
            'border border-[var(--color-accent)]'
          )}
          style={{ color: 'var(--color-accent)' }}
          title="重置演示数据"
        >
          <RefreshCw size={14} />
          重置演示
        </button>

        <button
          onClick={toggleTheme}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200',
            'hover:bg-[var(--color-bg-warm)]'
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200',
            'hover:bg-[var(--color-bg-warm)]'
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
