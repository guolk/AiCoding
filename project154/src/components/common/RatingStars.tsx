import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  maxStars?: number;
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const RatingStars = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  maxStars = 5,
  className,
}: RatingStarsProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseMove = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="flex gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseMove={() => handleMouseMove(star)}
            whileHover={!readOnly ? { scale: 1.2 } : undefined}
            whileTap={!readOnly ? { scale: 0.9 } : undefined}
            className={cn(
              'focus:outline-none transition-colors',
              !readOnly && 'cursor-pointer'
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                'transition-colors duration-150',
                star <= displayValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {showValue && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-gray-600"
          >
            {value.toFixed(1)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
