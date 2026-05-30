import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export function RatingStars({
  rating,
  onChange,
  readonly = false,
  size = 'md'
}: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-gold-500 text-gold-500'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
