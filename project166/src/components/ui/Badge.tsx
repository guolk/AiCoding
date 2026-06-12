import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  danger:
    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

export default function Badge({
  variant = 'default',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
