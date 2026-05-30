import { cn } from '@/lib/utils';
import {
  FileText,
  Scale,
  Users,
  Home,
  Phone,
  Settings,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import type { ReactNode } from 'react';

type ModuleType = 'dashboard' | 'documents' | 'legal' | 'family' | 'property' | 'emergency' | 'settings';

interface ModuleCardProps {
  type?: ModuleType;
  title: string;
  description: string;
  icon?: ReactNode;
  count?: number;
  warningCount?: number;
  dangerCount?: number;
  onClick?: () => void;
  className?: string;
}

const iconMap: Record<ModuleType, ReactNode> = {
  dashboard: <LayoutDashboard className='w-6 h-6' />,
  documents: <FileText className='w-6 h-6' />,
  legal: <Scale className='w-6 h-6' />,
  family: <Users className='w-6 h-6' />,
  property: <Home className='w-6 h-6' />,
  emergency: <Phone className='w-6 h-6' />,
  settings: <Settings className='w-6 h-6' />,
};

const bgColorMap: Record<ModuleType, string> = {
  dashboard: 'bg-primary-100',
  documents: 'bg-blue-100',
  legal: 'bg-purple-100',
  family: 'bg-green-100',
  property: 'bg-orange-100',
  emergency: 'bg-red-100',
  settings: 'bg-gray-100',
};

const iconColorMap: Record<ModuleType, string> = {
  dashboard: 'text-primary-600',
  documents: 'text-blue-600',
  legal: 'text-purple-600',
  family: 'text-green-600',
  property: 'text-orange-600',
  emergency: 'text-red-600',
  settings: 'text-gray-600',
};

export default function ModuleCard({
  type,
  title,
  description,
  icon,
  count,
  warningCount,
  dangerCount,
  onClick,
  className,
}: ModuleCardProps) {
  const displayIcon = icon || (type ? iconMap[type] : <FileText className='w-6 h-6' />);
  const bgColor = type ? bgColorMap[type] : 'bg-primary-100';
  const iconColor = type ? iconColorMap[type] : 'text-primary-600';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer group',
        className
      )}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <div className={iconColor}>{displayIcon}</div>
        </div>
        <ArrowRight className='w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all' />
      </div>

      <h3 className='font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary-700 transition-colors'>
        {title}
      </h3>
      <p className='text-sm text-gray-500 mb-4 line-clamp-2'>{description}</p>

      <div className='flex items-center gap-4'>
        {typeof count !== 'undefined' && (
          <div className='flex items-center gap-1.5'>
            <span className='text-2xl font-bold text-primary-600'>{count}</span>
            <span className='text-sm text-gray-500'>项</span>
          </div>
        )}

        {(typeof warningCount !== 'undefined' || typeof dangerCount !== 'undefined') && (
          <div className='flex items-center gap-3 ml-auto'>
            {typeof dangerCount !== 'undefined' && dangerCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-red-500' />
                <span className='text-sm text-red-600 font-medium'>{dangerCount}</span>
              </div>
            )}
            {typeof warningCount !== 'undefined' && warningCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-yellow-500' />
                <span className='text-sm text-yellow-600 font-medium'>{warningCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
