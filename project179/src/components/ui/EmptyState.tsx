import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6 rounded-2xl',
        'bg-forest-50/50 border border-dashed border-forest-200'
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-forest-300 shadow-sm mb-5">
        {icon}
      </div>

      <h3 className="text-base font-bold text-forest-800">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-forest-600 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'mt-6 px-5 py-2.5 rounded-xl',
            'bg-forest-500 text-white text-sm font-medium',
            'hover:bg-forest-600 active:bg-forest-700',
            'transition-colors duration-200 shadow-sm'
          )}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
