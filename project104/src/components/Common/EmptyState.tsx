import { ReactNode } from 'react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      <div className="mb-4 text-warm-400">
        {icon || <PlusCircle className="w-16 h-16" />}
      </div>
      <h3 className="font-display text-xl font-semibold text-secondary-500 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-lg
                     hover:bg-primary-600 transition-colors duration-200
                     font-medium shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
