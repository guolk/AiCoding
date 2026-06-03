import type { MuseumType } from '@/types';
import { MUSEUM_TYPE_LABELS, MUSEUM_TYPE_COLORS } from '@/types';

interface TypeBadgeProps {
  type: MuseumType;
  size?: 'sm' | 'md';
}

export default function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const label = MUSEUM_TYPE_LABELS[type];
  const color = MUSEUM_TYPE_COLORS[type];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
