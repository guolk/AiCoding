import { cn } from '../lib/utils';
import { getConstitutionName, getConstitutionColor } from '../utils/constitution';

interface ConstitutionBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ConstitutionBadge({
  type,
  size = 'md',
  className,
}: ConstitutionBadgeProps) {
  const name = getConstitutionName(type);
  const color = getConstitutionColor(type);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {name}
    </span>
  );
}
