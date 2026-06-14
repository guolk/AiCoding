import { ReactNode } from 'react'
import { LucideIcon, Circle, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatusValue } from './StatusBadge'
import StatusBadge from './StatusBadge'

export interface TimelineItem {
  date: string
  title: string
  description?: string
  status?: StatusValue
  icon?: LucideIcon
  type?: 'milestone' | 'issue' | 'risk' | 'level' | 'project'
}

export interface TimelineProps {
  items: TimelineItem[]
}

const statusIconMap: Record<string, { icon: LucideIcon; color: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500' },
  in_progress: { icon: Clock, color: 'text-blue-500' },
  pending: { icon: Circle, color: 'text-gray-400' },
  delayed: { icon: AlertCircle, color: 'text-red-500' },
  open: { icon: AlertCircle, color: 'text-red-500' },
  processing: { icon: Clock, color: 'text-orange-500' },
  resolved: { icon: CheckCircle, color: 'text-green-500' },
  closed: { icon: CheckCircle, color: 'text-gray-500' },
  identified: { icon: AlertCircle, color: 'text-red-500' },
  monitoring: { icon: Clock, color: 'text-orange-500' },
  mitigated: { icon: CheckCircle, color: 'text-green-500' },
  occurred: { icon: AlertCircle, color: 'text-purple-500' },
  planning: { icon: Circle, color: 'text-gray-400' },
  ongoing: { icon: Clock, color: 'text-primary-500' },
  suspended: { icon: AlertCircle, color: 'text-orange-500' },
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {items.map((item, index) => {
          const IconComponent = item.icon
            ? item.icon
            : item.status && statusIconMap[item.status]
              ? statusIconMap[item.status].icon
              : Circle

          const iconColor = item.status && statusIconMap[item.status]
            ? statusIconMap[item.status].color
            : 'text-gray-400'

          const isLast = index === items.length - 1

          return (
            <div key={index} className="relative flex gap-4">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                <IconComponent size={16} className={cn(iconColor)} />
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'absolute left-4 top-8 w-0.5 -translate-x-1/2',
                    item.status === 'completed' || item.status === 'resolved' || item.status === 'closed' || item.status === 'mitigated'
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  )}
                  style={{ height: 'calc(100% + 24px)' }}
                />
              )}

              <div className="flex-1 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">{item.date}</span>
                  {item.status && item.type && (
                    <StatusBadge status={item.status} type={item.type} />
                  )}
                </div>
                <h4 className="mt-1 text-base font-medium text-gray-900">{item.title}</h4>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
