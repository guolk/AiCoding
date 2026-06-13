import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { StoneColor, MoveNode, Point, MoveMark } from '@/types';
import { MARK_TYPE_COLORS } from '@/types';

interface GoBoardProps {
  size?: number;
  stones?: { point: Point; color: StoneColor; moveNumber?: number }[];
  currentMove?: MoveNode | null;
  lastMove?: Point | null;
  showCoordinates?: boolean;
  showMoveNumbers?: boolean;
  marks?: MoveMark[];
  onPointClick?: (point: Point) => void;
  className?: string;
}

const STAR_POINTS = [
  { x: 3, y: 3 },
  { x: 9, y: 3 },
  { x: 15, y: 3 },
  { x: 3, y: 9 },
  { x: 9, y: 9 },
  { x: 15, y: 9 },
  { x: 3, y: 15 },
  { x: 9, y: 15 },
  { x: 15, y: 15 },
];

export default function GoBoard({
  size = 19,
  stones = [],
  currentMove,
  lastMove,
  showCoordinates = true,
  showMoveNumbers = false,
  marks = [],
  onPointClick,
  className,
}: GoBoardProps) {
  const padding = showCoordinates ? 24 : 12;
  const cellSize = 28;
  const boardPixelSize = (size - 1) * cellSize + padding * 2;

  const stonePositions = useMemo(() => {
    return stones.map((s, index) => ({
      ...s,
      cx: padding + s.point.x * cellSize,
      cy: padding + s.point.y * cellSize,
      index,
    }));
  }, [stones, padding, cellSize]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPointClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - padding) / cellSize);
    const y = Math.round((e.clientY - rect.top - padding) / cellSize);
    
    if (x >= 0 && x < size && y >= 0 && y < size) {
      onPointClick({ x, y });
    }
  };

  return (
    <div className={cn('inline-block', className)}>
      <svg
        width={boardPixelSize}
        height={boardPixelSize}
        className="bg-wood-texture rounded-lg shadow-lg cursor-pointer"
        onClick={handleClick}
      >
        {/* 棋盘木纹背景 */}
        <defs>
          <radialGradient id="whiteStoneGradient" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#D0D0D0" />
          </radialGradient>
          <radialGradient id="blackStoneGradient" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#555555" />
            <stop offset="50%" stopColor="#2A2A2A" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </radialGradient>
          <filter id="stoneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 棋盘线 */}
        {Array.from({ length: size }).map((_, i) => (
          <g key={`lines-${i}`}>
            {/* 横线 */}
            <line
              x1={padding}
              y1={padding + i * cellSize}
              x2={padding + (size - 1) * cellSize}
              y2={padding + i * cellSize}
              className="board-line"
            />
            {/* 竖线 */}
            <line
              x1={padding + i * cellSize}
              y1={padding}
              x2={padding + i * cellSize}
              y2={padding + (size - 1) * cellSize}
              className="board-line"
            />
          </g>
        ))}

        {/* 星位点 */}
        {STAR_POINTS.filter(p => p.x < size && p.y < size).map((point, i) => (
          <circle
            key={`star-${i}`}
            cx={padding + point.x * cellSize}
            cy={padding + point.y * cellSize}
            r={3.5}
            className="star-point"
          />
        ))}

        {/* 坐标 */}
        {showCoordinates && (
          <g className="text-xs fill-go-wood-700 font-medium">
            {Array.from({ length: size }).map((_, i) => (
              <g key={`coord-${i}`}>
                <text
                  x={padding + i * cellSize}
                  y={10}
                  textAnchor="middle"
                  className="text-[10px]"
                >
                  {String.fromCharCode(65 + i)}
                </text>
                <text
                  x={6}
                  y={padding + i * cellSize + 4}
                  textAnchor="middle"
                  className="text-[10px]"
                >
                  {size - i}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 棋子 */}
        {stonePositions.map((stone, index) => (
          <g key={`stone-${index}`} className="animate-bounce-in" style={{ animationDelay: `${index * 20}ms` }}>
            <circle
              cx={stone.cx}
              cy={stone.cy}
              r={cellSize / 2 - 1}
              fill={stone.color === 'black' ? 'url(#blackStoneGradient)' : 'url(#whiteStoneGradient)'}
              filter="url(#stoneShadow)"
            />
            {/* 最后一手标记 */}
            {lastMove && stone.point.x === lastMove.x && stone.point.y === lastMove.y && (
              <circle
                cx={stone.cx}
                cy={stone.cy}
                r={5}
                fill="none"
                stroke={stone.color === 'black' ? '#FF6B6B' : '#D32F2F'}
                strokeWidth={2}
              />
            )}
            {/* 手数 */}
            {showMoveNumbers && stone.moveNumber && (
              <text
                x={stone.cx}
                y={stone.cy + 4}
                textAnchor="middle"
                className={cn(
                  'text-[10px] font-bold',
                  stone.color === 'black' ? 'fill-white' : 'fill-black'
                )}
              >
                {stone.moveNumber}
              </text>
            )}
          </g>
        ))}

        {/* 标注 */}
        {marks.map((mark, index) => {
          if (!currentMove?.point) return null;
          const cx = padding + currentMove.point.x * cellSize;
          const cy = padding + currentMove.point.y * cellSize;
          const offsetX = (index % 3 - 1) * 18;
          const offsetY = Math.floor(index / 3) * 18 - 24;
          
          return (
            <g key={`mark-${mark.id}`} className="animate-scale-in">
              <circle
                cx={cx + offsetX}
                cy={cy + offsetY}
                r={10}
                fill={MARK_TYPE_COLORS[mark.type]}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={cx + offsetX}
                y={cy + offsetY + 4}
                textAnchor="middle"
                className="text-[10px] fill-white font-bold"
              >
                {mark.type === 'key' ? '★' : mark.type === 'doubt' ? '?' : mark.type === 'good' ? '!' : '✎'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
