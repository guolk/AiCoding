import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, icon, className }: SectionTitleProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-primary-500">{icon}</div>}
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary-500">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-gray-500 text-base ml-0 md:ml-12">{subtitle}</p>
      )}
    </div>
  );
}
