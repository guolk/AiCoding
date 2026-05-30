import React from 'react';
import { formatTime } from '@/utils';

interface TimerDisplayProps {
  seconds: number;
  isRunning?: boolean;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  isRunning = false,
  className,
}) => {
  return (
    <div className={`font-mono text-center ${className}`}>
      <span className={`text-6xl font-light tracking-wider ${isRunning ? 'text-sage-600' : 'text-sage-700'}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default TimerDisplay;
