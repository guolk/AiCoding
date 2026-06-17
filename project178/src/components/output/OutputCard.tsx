import type { OutputItem } from '@/types'
import { OUTPUT_TYPE_LABELS } from '@/types'
import { FileText, FolderGit2, BookOpen, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OutputCardProps {
  item: OutputItem
  onEdit: (item: OutputItem) => void
  onDelete: (id: string) => void
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4" />,
  project: <FolderGit2 className="w-4 h-4" />,
  material: <BookOpen className="w-4 h-4" />,
}

const TYPE_COLORS: Record<string, string> = {
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  project: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  material: 'bg-amber-50 text-amber-700 border-amber-200',
}

const TAG_COLORS: Record<string, string> = {
  article: 'bg-blue-50 text-blue-600',
  project: 'bg-emerald-50 text-emerald-600',
  material: 'bg-amber-50 text-amber-600',
}

export default function OutputCard({ item, onEdit, onDelete }: OutputCardProps) {
  return (
    <div className="card p-4 rounded-xl group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', TYPE_COLORS[item.type])}>
            {TYPE_ICONS[item.type]}
            {OUTPUT_TYPE_LABELS[item.type]}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-warm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 line-clamp-2">
        {item.title}
      </h4>

      <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2 leading-relaxed">
        {item.contentSummary}
      </p>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', TAG_COLORS[item.type])}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)]">
        <span className="text-[11px] text-[var(--color-text-muted)]">{item.publishDate}</span>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] text-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            链接
          </a>
        )}
      </div>
    </div>
  )
}
