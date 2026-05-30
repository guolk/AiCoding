import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  value: number;
}

export default function RankChangeIndicator({ value }: Props) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
        <TrendingUp className="w-4 h-4" />
        +{value}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
        <TrendingDown className="w-4 h-4" />
        {value}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-neutral-400 font-semibold text-sm">
      <Minus className="w-4 h-4" />
      0
    </span>
  );
}
