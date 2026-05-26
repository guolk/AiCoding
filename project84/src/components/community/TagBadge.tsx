import { Tag as TagIcon, Users, HelpCircle, Plus, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import type { Tag } from '../../types'

interface TagBadgeProps {
  tag: Tag
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  isFollowed?: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function TagBadge({ tag, showCount = false, size = 'md', isFollowed, onFollow, onUnfollow }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        sizeClasses[size]
      )}
      style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
    >
      <TagIcon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />
      {tag.name}
      {showCount && (
        <span className="ml-1 opacity-70">({tag.questionCount})</span>
      )}
      {onFollow && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            isFollowed ? onUnfollow?.() : onFollow?.()
          }}
          className={cn(
            "ml-1 p-0.5 rounded-full transition-colors",
            isFollowed ? 'bg-green-500 text-white' : 'hover:bg-opacity-20'
          )}
        >
          {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </button>
      )}
    </span>
  )
}

export function TagCloud({ tags, onFollow, onUnfollow, followedIds }: {
  tags: Tag[]
  onFollow?: (id: string) => void
  onUnfollow?: (id: string) => void
  followedIds?: string[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge
          key={tag.id}
          tag={tag}
          showCount
          isFollowed={followedIds?.includes(tag.id)}
          onFollow={onFollow ? () => onFollow(tag.id) : undefined}
          onUnfollow={onUnfollow ? () => onUnfollow(tag.id) : undefined}
        />
      ))}
    </div>
  )
}
