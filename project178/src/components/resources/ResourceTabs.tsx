import type { ResourceType } from '@/types'
import { RESOURCE_TYPE_LABELS } from '@/types'
import { BookOpen, GraduationCap, Wrench, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceTabsProps {
  activeType: ResourceType | 'all'
  onChange: (type: ResourceType | 'all') => void
}

const tabs: { key: ResourceType | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <LayoutGrid className="w-4 h-4" /> },
  { key: 'book', label: RESOURCE_TYPE_LABELS.book, icon: <BookOpen className="w-4 h-4" /> },
  { key: 'course', label: RESOURCE_TYPE_LABELS.course, icon: <GraduationCap className="w-4 h-4" /> },
  { key: 'project', label: RESOURCE_TYPE_LABELS.project, icon: <Wrench className="w-4 h-4" /> },
]

export default function ResourceTabs({ activeType, onChange }: ResourceTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--color-bg-warm)] rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeType === tab.key
              ? 'bg-white text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
