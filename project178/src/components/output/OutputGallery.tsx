import { useState } from 'react'
import type { OutputItem, OutputType } from '@/types'
import { OUTPUT_TYPE_LABELS } from '@/types'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import OutputCard from './OutputCard'

interface OutputGalleryProps {
  outputs: OutputItem[]
  onAdd: () => void
  onEdit: (item: OutputItem) => void
  onDelete: (id: string) => void
}

type FilterTab = 'all' | OutputType

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'article', label: OUTPUT_TYPE_LABELS.article },
  { key: 'project', label: OUTPUT_TYPE_LABELS.project },
  { key: 'material', label: OUTPUT_TYPE_LABELS.material },
]

export default function OutputGallery({ outputs, onAdd, onEdit, onDelete }: OutputGalleryProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = activeTab === 'all'
    ? outputs
    : outputs.filter((o) => o.type === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">输出作品集</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          新增输出
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-[var(--color-bg-warm)] rounded-lg w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-sm">暂无输出内容</p>
          <p className="text-xs mt-1">点击"新增输出"添加你的学习成果</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <OutputCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
