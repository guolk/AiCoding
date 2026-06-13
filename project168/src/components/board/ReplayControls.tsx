import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplayControlsProps {
  currentMove: number;
  totalMoves: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isAutoPlay: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onToggleAutoPlay: () => void;
  onSliderChange: (value: number) => void;
  className?: string;
}

export default function ReplayControls({
  currentMove,
  totalMoves,
  canGoBack,
  canGoForward,
  isAutoPlay,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onToggleAutoPlay,
  onSliderChange,
  className,
}: ReplayControlsProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-md p-4', className)}>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onFirst}
            disabled={!canGoBack}
            className={cn(
              'p-2 rounded-lg transition-colors',
              canGoBack
                ? 'hover:bg-go-wood-100 text-go-wood-700'
                : 'text-gray-300 cursor-not-allowed'
            )}
            title="第一手"
          >
            <ChevronFirst className="w-5 h-5" />
          </button>
          <button
            onClick={onPrevious}
            disabled={!canGoBack}
            className={cn(
              'p-2 rounded-lg transition-colors',
              canGoBack
                ? 'hover:bg-go-wood-100 text-go-wood-700'
                : 'text-gray-300 cursor-not-allowed'
            )}
            title="上一手"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleAutoPlay}
            className={cn(
              'p-2 rounded-lg transition-colors mx-1',
              isAutoPlay
                ? 'bg-go-bamboo text-white hover:bg-go-bamboo/90'
                : 'bg-go-wood-600 text-white hover:bg-go-wood-700'
            )}
            title={isAutoPlay ? '暂停' : '自动播放'}
          >
            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={onNext}
            disabled={!canGoForward}
            className={cn(
              'p-2 rounded-lg transition-colors',
              canGoForward
                ? 'hover:bg-go-wood-100 text-go-wood-700'
                : 'text-gray-300 cursor-not-allowed'
            )}
            title="下一手"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={onLast}
            disabled={!canGoForward}
            className={cn(
              'p-2 rounded-lg transition-colors',
              canGoForward
                ? 'hover:bg-go-wood-100 text-go-wood-700'
                : 'text-gray-300 cursor-not-allowed'
            )}
            title="最后一手"
          >
            <ChevronLast className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-go-wood-600 whitespace-nowrap font-mono">
            {currentMove} / {totalMoves}
          </span>
          <input
            type="range"
            min={0}
            max={totalMoves}
            value={currentMove}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="flex-1 h-2 bg-go-wood-200 rounded-lg appearance-none cursor-pointer accent-go-wood-600"
          />
        </div>
      </div>
    </div>
  );
}
