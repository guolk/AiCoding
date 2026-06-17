import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= value ? 'currentColor' : 'none'}
          strokeWidth={1.5}
          className={cn(i <= value ? 'text-gold-500' : 'text-gold-500/30')}
        />
      ))}
    </div>
  )
}

export function StrengthBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const color = value >= 8 ? 'bg-emerald-500' : value >= 6 ? 'bg-gold-500' : value >= 4 ? 'bg-amber-500' : 'bg-rose-500'
  const label = value >= 8 ? '极强' : value >= 6 ? '较强' : value >= 4 ? '一般' : '较弱'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 strength-bar min-w-[80px]">
        <div
          className={cn('strength-bar-fill', color)}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-semibold text-ink-900 whitespace-nowrap w-10">{label}</span>}
    </div>
  )
}

export function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('chip', className)}>{children}</span>
  )
}

export function StatCard({
  icon: Icon, label, value, sub, delay = 0,
}: {
  icon: any; label: string; value: string | number; sub?: string; delay?: number;
}) {
  return (
    <div
      className="debate-card p-6 bg-ink-gradient relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gold-500/10 blur-2xl group-hover:bg-gold-500/20 transition-all duration-500" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gold-100/70 font-medium mb-1">{label}</div>
          <div className="text-4xl font-black font-serif text-gold-400 tracking-tight mt-1 leading-none">{value}</div>
          {sub && <div className="mt-3 text-xs text-gold-100/50">{sub}</div>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gold-500/20 backdrop-blur flex items-center justify-center shrink-0 text-gold-400">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, right, breadcrumb }: {
  title: string; subtitle?: string; right?: React.ReactNode; breadcrumb?: string;
}) {
  return (
    <div className="page-header">
      <div>
        {breadcrumb && <div className="text-xs text-ink-900/50 mb-2 font-medium">{breadcrumb}</div>}
        <h1 className="text-3xl font-black font-serif text-ink-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-900/60 mt-2">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: any; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-ink-100/80 flex items-center justify-center text-ink-900/40 mb-5">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-bold font-serif text-ink-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-900/60 max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null
  const w = size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-lg' : size === 'lg' ? 'max-w-2xl' : 'max-w-3xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full', w)}>
        <div className="debate-card shadow-ink p-0 animate-slide-up max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-ink-100">
            <h3 className="font-serif text-xl font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-900/60 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto scrollbar-thin">{children}</div>
        </div>
      </div>
    </div>
  )
}
