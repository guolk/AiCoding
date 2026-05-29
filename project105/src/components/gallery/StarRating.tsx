import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, maxRating = 5, size = 18, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < rating;
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => onChange && onChange(index + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={size}
              className={isFilled ? 'fill-lego-yellow text-lego-yellow' : 'text-gray-300'}
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
    </div>
  );
}
