import { HTMLAttributes, forwardRef, Children, ReactNode } from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  fallback?: ReactNode;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', name = '', size = 'md', fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 text-white font-medium shadow-md',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : name ? (
          <span className="tracking-wide">{getInitials(name)}</span>
        ) : (
          fallback || <User className="w-1/2 h-1/2" />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: ReactNode;
}

export function AvatarGroup({ className, max = 5, children, ...props }: AvatarGroupProps) {
  const childrenArray = Children.toArray(children);
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const remainingCount = max ? childrenArray.length - max : 0;

  return (
    <div className={clsx('flex -space-x-2', className)} {...props}>
      {visibleChildren.map((child: ReactNode, index: number) => (
        <div
          key={index}
          className="ring-2 ring-white rounded-full"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="ring-2 ring-white rounded-full relative inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium"
          style={{ zIndex: 0 }}
        >
          <Avatar name={`+${remainingCount}`} />
        </div>
      )}
    </div>
  );
}
