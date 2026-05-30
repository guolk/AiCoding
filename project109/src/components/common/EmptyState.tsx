import { cn } from '@/lib/utils';
import {
  FileText,
  Inbox,
  Search,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { ReactNode } from 'react';

type IconType = 'file' | 'inbox' | 'search' | 'error' | 'default';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconType?: IconType;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap: Record<IconType, ReactNode> = {
  file: <FileText className='w-12 h-12' />,
  inbox: <Inbox className='w-12 h-12' />,
  search: <Search className='w-12 h-12' />,
  error: <AlertCircle className='w-12 h-12' />,
  default: <Inbox className='w-12 h-12' />,
};

export default function EmptyState({
  title,
  description,
  icon,
  iconType = 'default',
  action,
  className,
}: EmptyStateProps) {
  const displayIcon = icon || iconMap[iconType];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      <div className='w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6'>
        <div className='text-primary-400'>{displayIcon}</div>
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2 text-center'>
        {title}
      </h3>

      {description && (
        <p className='text-sm text-gray-500 text-center max-w-sm mb-6'>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className='inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors'
        >
          <Plus className='w-4 h-4' />
          {action.label}
        </button>
      )}
    </div>
  );
}
