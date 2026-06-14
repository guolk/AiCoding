import React from 'react';
import { X } from 'lucide-react';
import { Tag as TagType, TAG_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface TagProps {
  tag: TagType;
  onRemove?: (id: string) => void;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  tag,
  onRemove,
  onClick,
  selected = false,
  size = 'md',
  className,
}) => {
  const categoryInfo = TAG_CATEGORIES[tag.category];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
        sizeClasses[size],
        selected
          ? 'ring-2 ring-offset-2'
          : 'hover:opacity-90',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        backgroundColor: selected ? tag.color : `${tag.color}20`,
        color: selected ? '#ffffff' : tag.color,
        borderColor: tag.color,
        borderWidth: '1px',
        borderStyle: 'solid',
        '--tw-ring-color': tag.color,
      } as React.CSSProperties}
      onClick={onClick}
    >
      <span className="text-current">{categoryInfo?.icon && (
        <span className="mr-1">{categoryInfo.icon}</span>
      )}</span>
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="ml-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
        </button>
      )}
    </span>
  );
};

interface TagFilterProps {
  tags: TagType[];
  selectedTags: string[];
  onTagClick: (tagId: string) => void;
  category?: string;
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onTagClick,
  category,
  className,
}) => {
  const filteredTags = category
    ? tags.filter(t => t.category === category)
    : tags;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filteredTags.map(tag => (
        <Tag
          key={tag.id}
          tag={tag}
          selected={selectedTags.includes(tag.id)}
          onClick={() => onTagClick(tag.id)}
          size="sm"
        />
      ))}
    </div>
  );
};

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
          selectedCategory === null
            ? 'bg-forest-600 text-white'
            : 'bg-earth-100 text-earth-700 hover:bg-earth-200 dark:bg-earth-900/50 dark:text-earth-300'
        )}
        onClick={() => onCategoryChange(null)}
      >
        全部
      </button>
      {Object.entries(TAG_CATEGORIES).map(([key, value]) => (
        <button
          key={key}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
            selectedCategory === key
              ? 'text-white border-transparent'
              : 'border-earth-200 hover:border-earth-300 dark:border-earth-700'
          )}
          style={{
            backgroundColor: selectedCategory === key ? value.color : 'transparent',
            color: selectedCategory === key ? '#ffffff' : value.color,
          }}
          onClick={() => onCategoryChange(selectedCategory === key ? null : key)}
        >
          {value.label}
        </button>
      ))}
    </div>
  );
};
