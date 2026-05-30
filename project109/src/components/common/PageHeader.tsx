import { cn } from '@/lib/utils';
import {
  Plus,
  ChevronRight,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  icon?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className='flex items-center gap-1.5 mb-3'>
          {breadcrumbs.map((item, index) => (
            <div key={index} className='flex items-center gap-1.5'>
              {index > 0 && (
                <ChevronRight className='w-4 h-4 text-gray-400' />
              )}
              <span
                className={cn(
                  'text-sm',
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-primary-600 cursor-pointer'
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      )}

      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          {icon && (
            <div className='w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600'>
              {icon}
            </div>
          )}
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
            {subtitle && (
              <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>
            )}
          </div>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className='inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md'
          >
            {action.icon || <Plus className='w-4 h-4' />}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
