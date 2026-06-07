import { useState } from 'react';
import { cn } from '@/lib/utils';
import { scoreDescriptions, scoreLabels } from '@/types/review';

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showDescription?: boolean;
}

export const RatingSlider = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  showDescription = true,
}: RatingSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;
  const descriptions = scoreDescriptions[label.toLowerCase()] || scoreDescriptions.enjoyment;
  const displayLabel = scoreLabels[label.toLowerCase()] || label;
  const descriptionIndex = Math.min(Math.floor(value) - 1, descriptions.length - 1);

  const getColorClass = (val: number) => {
    if (val >= 4.5) return 'from-green-400 to-emerald-500';
    if (val >= 3.5) return 'from-yellow-400 to-orange-500';
    if (val >= 2.5) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
        <span className="text-lg font-bold text-teal-600">{value.toFixed(1)}</span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-150 bg-gradient-to-r',
              getColorClass(value),
              isDragging && 'shadow-lg'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-teal-500 shadow-md pointer-events-none transition-all duration-150',
            isDragging && 'scale-125 shadow-lg'
          )}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      {showDescription && (
        <p className="text-xs text-gray-500 italic">
          {descriptions[descriptionIndex]}
        </p>
      )}
    </div>
  );
};
