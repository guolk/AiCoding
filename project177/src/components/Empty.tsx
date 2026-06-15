import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export default function Empty({
  title = '暂无数据',
  description = '数据将在添加后显示在这里',
  icon,
  className,
}: EmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4',
      className
    )}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-racing-green/20 blur-2xl rounded-full" />
        <div className="relative p-6 bg-dark-800 border border-racing-green/30">
          {icon || (
            <Inbox className="w-14 h-14 text-racing-green" strokeWidth={1.5} />
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-racing-green animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-racing-green/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        {description}
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-racing-green/60">
        <span className="w-8 h-px bg-racing-green/40" />
        <span>RACE CONTROL SYSTEM</span>
        <span className="w-8 h-px bg-racing-green/40" />
      </div>
    </div>
  )
}
