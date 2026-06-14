import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'default';

export interface BadgeProps {
  type?: BadgeType;
  children: ReactNode;
  className?: string;
}

// 徽章类型对应的样式
const badgeStyles: Record<BadgeType, string> = {
  success: 'bg-[#00B42A]/10 text-[#00B42A]',
  warning: 'bg-[#FF7D00]/10 text-[#FF7D00]',
  danger: 'bg-[#F53F3F]/10 text-[#F53F3F]',
  info: 'bg-[#165DFF]/10 text-[#165DFF]',
  default: 'bg-[#86909C]/10 text-[#86909C]',
};

export default function Badge({
  type = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-5',
        badgeStyles[type],
        className,
      )}
    >
      {children}
    </span>
  );
}
