import { useCallback, useMemo, useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  initialFen?: string;
  moves?: string;
  flipped?: boolean;
  showControls?: boolean;
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♙',
  r: '♖',
  n: '♘',
  b: '♗',
  q: '♕',
  k: '♔',
  P: '♟',
  R: '♜',
  N: '♞',
  B: '♝',
  Q: '♛',
  K: '♚',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export default function ChessBoard({
  initialFen,
  moves,
  flipped = false,
  showControls = true,
}: ChessBoardProps) {
  const moveList = useMemo(() => {
    if (!moves) return [];
    const parts = moves.split(' ').filter(m => /^[a-zA-Z0-9#+=-]/.test(m));
    return parts;
  }, [moves]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const currentPosition = useMemo(() => {
    const c = new Chess();
    if (initialFen) {
      try {
        c.load(initialFen);
      } catch {
        // 忽略无效的 FEN
      }
    }

    for (let i = 0; i < Math.min(currentMoveIndex, moveList.length); i++) {
      try {
        c.move(moveList[i]);
      } catch {
        break;
      }
    }
    return c;
  }, [initialFen, moveList, currentMoveIndex]);

  const handlePrev = useCallback(() => {
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentMoveIndex(prev => Math.min(moveList.length, prev + 1));
  }, [moveList.length]);

  const handleReset = useCallback(() => {
    setCurrentMoveIndex(0);
  }, []);

  const board = currentPosition.board();

  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;

  const squares = displayRanks.flatMap((rank, rankIdx) =>
    displayFiles.map((file, fileIdx) => ({
      square: `${file}${rank}` as Square,
      file,
      rank,
      rankIdx,
      fileIdx,
      actualRank: flipped ? 7 - rankIdx : rankIdx,
      actualFile: flipped ? 7 - fileIdx : fileIdx,
    }))
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 border-4 border-wood-brown-800 rounded-lg overflow-hidden shadow-2xl">
        {squares.map(({ square, actualRank, actualFile }) => {
          const piece = board[actualRank][actualFile];
          const isLightSquare = (actualRank + actualFile) % 2 === 0;

          return (
            <div
              key={square}
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl select-none transition-all duration-200",
                isLightSquare ? 'bg-light-square' : 'bg-dark-square',
                "hover:brightness-110"
              )}
            >
              {piece ? (
                <span
                  className={cn(
                    "drop-shadow-lg",
                    piece.color === 'w' ? 'text-white' : 'text-wood-brown-950'
                  )}
                >
                  {PIECE_SYMBOLS[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {showControls && moveList.length > 0 ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMoveIndex === 0}
            title="重置"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMoveIndex === 0}
            title="上一步"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 bg-ivory-100 rounded-lg text-wood-brown-800 font-medium min-w-[100px] text-center">
            {currentMoveIndex} / {moveList.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMoveIndex >= moveList.length}
            title="下一步"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}

      {moveList.length > 0 ? (
        <div className="w-full max-w-lg p-4 bg-ivory-100 rounded-lg border border-wood-brown-200">
          <h4 className="text-sm font-semibold text-wood-brown-700 mb-2">走法序列</h4>
          <div className="flex flex-wrap gap-1 text-sm text-wood-brown-800">
            {moveList.map((move, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded transition-colors cursor-pointer",
                  index < currentMoveIndex
                    ? "bg-wood-brown-200 text-wood-brown-900"
                    : index === currentMoveIndex
                    ? "bg-gold-400 text-wood-brown-900 font-semibold"
                    : "bg-ivory-200 text-wood-brown-600"
                )}
                onClick={() => setCurrentMoveIndex(index)}
              >
                {index % 2 === 0 ? (
                  <span className="text-wood-brown-500 mr-1">{Math.floor(index / 2) + 1}.</span>
                ) : null}
                {move}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
