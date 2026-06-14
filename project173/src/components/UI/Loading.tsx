import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className={cn('animate-spin text-emerald-600', sizeMap[size], className)} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
