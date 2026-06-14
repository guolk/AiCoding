import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
};

export default function RatingStars({
  rating,
  size = 'md',
  className,
}: RatingStarsProps) {
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
  const starSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={starSize}
          className={cn(
            'transition-all duration-200',
            star <= clampedRating
              ? 'fill-terracotta-400 text-terracotta-400'
              : 'text-forest-200'
          )}
        />
      ))}
    </div>
  );
}
