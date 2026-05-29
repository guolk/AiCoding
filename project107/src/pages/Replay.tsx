import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Tag,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Star,
  Lightbulb,
  Flag,
} from 'lucide-react';
import { Chess, Square } from 'chess.js';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';
import { validatePGN, loadPGNToChess } from '@/utils/pgn';
import type { ReplayGame, GameResult } from '@/types';

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

const SAMPLE_PGN = `[Event "Sample Game"]
[White "Magnus Carlsen"]
[Black "Viswanathan Anand"]
[Date "2013.11.22"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6 9. c3 Be7 10. Bc2 f5 11. exf6 Bxf6 12. Re1+ Kf7 13. Qxd5 Qxd5 14. Nxd5 Bxd5 15. Rxe4 Bxb3 16. axb3 Nxe5 17. Rxe5 Bxe5 18. Nxe5+ Kf6 19. Ng4+ Kg5 20. h4+ Kxh4 21. Qd1+ 1-0`;

type AnnotationType = 'turning_point' | 'best_move' | 'blunder' | 'mistake' | 'idea';

const ANNOTATION_TYPES: { type: AnnotationType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'turning_point', label: '转折点', icon: <Flag size={16} />, color: 'bg-amber-500' },
  { type: 'best_move', label: '最佳走法', icon: <Star size={16} />, color: 'bg-yellow-500' },
  { type: 'blunder', label: '败招', icon: <AlertTriangle size={16} />, color: 'bg-red-500' },
  { type: 'mistake', label: '失误', icon: <Lightbulb size={16} />, color: 'bg-orange-500' },
  { type: 'idea', label: '战略思想', icon: <Lightbulb size={16} />, color: 'bg-blue-500' },
];

function ReplayChessBoard({
  game,
  currentMoveIndex,
  flipped = false,
}: {
  game: ReplayGame;
  currentMoveIndex: number;
  flipped: boolean;
}) {
  const currentPosition = useMemo(() => {
    const c = new Chess();
    if (game.fen) {
      try {
        c.load(game.fen);
      } catch {
        // ignore
      }
    }

    for (let i = 0; i < Math.min(currentMoveIndex, game.moves.length); i++) {
      try {
        c.move(game.moves[i]);
      } catch {
        break;
      }
    }
    return c;
  }, [game, currentMoveIndex]);

  const board = currentPosition.board();
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;

  const squares = displayRanks.flatMap((rank, rankIdx) =>
    displayFiles.map((file, fileIdx) => ({
      square: `${file}${rank}` as Square,
      rankIdx,
      fileIdx,
      actualRank: flipped ? 7 - rankIdx : rankIdx,
      actualFile: flipped ? 7 - fileIdx : fileIdx,
    }))
  );

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 border-4 border-wood-brown-800 rounded-lg overflow-hidden shadow-2xl">
        {squares.map(({ square, actualRank, actualFile }) => {
          const piece = board[actualRank][actualFile];
          const isLightSquare = (actualRank + actualFile) % 2 === 0;

          return (
            <div
              key={square}
              className={cn(
                'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl select-none transition-all duration-200',
                isLightSquare ? 'bg-light-square' : 'bg-dark-square',
                'hover:brightness-110'
              )}
            >
              {piece ? (
                <span
                  className={cn(
                    'drop-shadow-lg',
                    piece.color === 'w' ? 'text-white' : 'text-wood-brown-950'
                  )}
                >
                  {PIECE_SYMBOLS[
                    piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()
                  ]}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function Replay() {
  const navigate = useNavigate();
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentGame,
    currentMoveIndex,
    annotations,
    loadPGN,
    goToMove,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
    addAnnotation,
    removeAnnotation,
  } = useGameStore();

  const [pgnInput, setPgnInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [selectedAnnotationType, setSelectedAnnotationType] =
    useState<AnnotationType>('idea');
  const [flipped, setFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  const handleParsePGN = useCallback(() => {
    setParseError(null);

    if (!pgnInput.trim()) {
      setParseError('请输入 PGN 棋谱');
      return;
    }

    if (!validatePGN(pgnInput)) {
      setParseError('无效的 PGN 格式，请检查棋谱格式');
      return;
    }

    const chess = loadPGNToChess(pgnInput);
    if (chess) {
      const header = chess.header();
      const history = chess.history();

      let result: GameResult = 'draw';
      if (header.Result === '1-0') result = 'win';
      if (header.Result === '0-1') result = 'loss';

      const game: ReplayGame = {
        id: generateId(),
        title: `${header.White || '未知'} vs ${header.Black || '未知'}`,
        whitePlayer: header.White || '未知',
        blackPlayer: header.Black || '未知',
        result,
        moves: history,
        annotations: [],
        event: header.Event,
        date: header.Date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      loadPGN(game);
    }
  }, [pgnInput, loadPGN]);

  const handleLoadSample = useCallback(() => {
    setPgnInput(SAMPLE_PGN);
    setParseError(null);
  }, []);

  const handleAddAnnotation = useCallback(() => {
    if (!currentGame) {
      return;
    }

    if (!annotationText.trim()) {
      return;
    }

    const move = currentGame.moves[currentMoveIndex] || '';

    addAnnotation({
      moveIndex: currentMoveIndex,
      move,
      text: annotationText,
      symbols: [selectedAnnotationType],
    });

    setAnnotationText('');
  }, [currentGame, currentMoveIndex, annotationText, selectedAnnotationType, addAnnotation]);

  const handleToggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      autoPlayIntervalRef.current = setInterval(() => {
        nextMove();
      }, 1000);
    }
  }, [isAutoPlaying, nextMove]);

  useEffect(() => {
    if (currentGame && currentMoveIndex >= currentGame.moves.length - 1) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsAutoPlaying(false);
    }
  }, [currentMoveIndex, currentGame]);

  const moveListWithAnnotations = useMemo(() => {
    if (!currentGame) return [];

    return currentGame.moves.map((move, index) => {
      const moveAnnotations = annotations.filter((a) => a.moveIndex === index);
      return {
        index,
        move,
        annotations: moveAnnotations,
        isActive: index === currentMoveIndex,
        isPlayed: index < currentMoveIndex,
      };
    });
  }, [currentGame, currentMoveIndex, annotations]);

  const currentAnnotations = useMemo(() => {
    return annotations.filter((a) => a.moveIndex === currentMoveIndex);
  }, [annotations, currentMoveIndex]);

  const getAnnotationTypeInfo = (type: string) => {
    return ANNOTATION_TYPES.find((t) => t.type === type) || ANNOTATION_TYPES[4];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-500 via-ivory-400 to-ivory-300">
      <header className="bg-gradient-to-r from-amber-600 to-amber-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-ivory-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">棋局复盘</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-wood-brown-200">
                  <div className="flex items-center gap-2">
                    <FileText className="text-amber-600" size={20} />
                    <h2 className="font-display font-bold text-xl text-wood-brown-800">
                      PGN 导入
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <textarea
                    value={pgnInput}
                    onChange={(e) => setPgnInput(e.target.value)}
                    placeholder="粘贴 PGN 棋谱..."
                    className="w-full h-48 p-3 border border-wood-brown-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleParsePGN}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <Upload size={18} />
                      解析
                    </button>
                    <button
                      onClick={handleLoadSample}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-wood-brown-200 text-wood-brown-700 rounded-lg hover:bg-wood-brown-300 transition-colors"
                    >
                      示例
                    </button>
                  </div>
                  {parseError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {parseError}
                    </div>
                  )}
                </div>
              </div>

              {currentGame && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden">
                  <div className="px-4 py-4 border-b border-wood-brown-200">
                    <div className="flex items-center gap-2">
                      <Tag className="text-amber-600" size={20} />
                      <h2 className="font-display font-bold text-xl text-wood-brown-800">
                        添加标注
                      </h2>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="text-sm text-wood-brown-600 mb-2">当前步数</div>
                      <div className="text-lg font-semibold text-wood-brown-800">
                        第 {Math.floor(currentMoveIndex / 2) + 1} 步
                        {currentMoveIndex % 2 === 0 ? ' (白方)' : ' (黑方)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-wood-brown-600 mb-2">标注类型</div>
                      <div className="flex flex-wrap gap-2">
                        {ANNOTATION_TYPES.map((item) => (
                          <button
                            key={item.type}
                            onClick={() => setSelectedAnnotationType(item.type)}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm',
                              selectedAnnotationType === item.type
                                ? cn(item.color, 'text-white')
                                : 'bg-wood-brown-100 text-wood-brown-700 hover:bg-wood-brown-200'
                            )}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <textarea
                        value={annotationText}
                        onChange={(e) => setAnnotationText(e.target.value)}
                        placeholder="输入标注内容..."
                        className="w-full h-24 p-3 border border-wood-brown-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddAnnotation}
                      disabled={!annotationText.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={18} />
                      添加标注
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-6">
            {currentGame ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden">
                <div className="p-6 border-b border-wood-brown-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-display font-bold text-wood-brown-900 mb-1">
                        {currentGame.title}
                      </h2>
                      <div className="text-wood-brown-600 text-sm">
                        {currentGame.event && <span>{currentGame.event}</span>}
                        {currentGame.date && <span> · {currentGame.date}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => setFlipped(!flipped)}
                      className="px-3 py-1.5 bg-wood-brown-100 text-wood-brown-700 rounded-lg hover:bg-wood-brown-200 transition-colors text-sm"
                    >
                      翻转棋盘
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <ReplayChessBoard
                    game={currentGame}
                    currentMoveIndex={currentMoveIndex}
                    flipped={flipped}
                  />
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                      onClick={goToStart}
                      disabled={currentMoveIndex === 0}
                      className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipBack size={20} />
                    </button>
                    <button
                      onClick={prevMove}
                      disabled={currentMoveIndex === 0}
                      className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleToggleAutoPlay}
                      className="p-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={nextMove}
                      disabled={currentMoveIndex >= currentGame.moves.length - 1}
                      className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={goToEnd}
                      disabled={currentMoveIndex >= currentGame.moves.length - 1}
                      className="p-2 rounded-lg bg-wood-brown-600 text-ivory-50 hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={currentGame.moves.length - 1}
                      value={currentMoveIndex}
                      onChange={(e) => goToMove(Number(e.target.value))}
                      className="flex-1 accent-amber-600"
                    />
                    <span className="px-3 py-1 bg-ivory-100 rounded-lg text-wood-brown-800 font-medium min-w-[80px] text-center text-sm">
                      {currentMoveIndex + 1} / {currentGame.moves.length}
                    </span>
                  </div>
                </div>

                {currentAnnotations.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="bg-ivory-100 rounded-xl p-4 border border-wood-brown-200">
                      <h3 className="font-semibold text-wood-brown-800 mb-3">
                        当前步标注
                      </h3>
                      <div className="space-y-2">
                        {currentAnnotations.map((annotation) => {
                          const typeInfo = getAnnotationTypeInfo(
                            annotation.symbols?.[0] || 'idea'
                          );
                          return (
                            <div
                              key={annotation.id}
                              className="flex items-start gap-3 p-3 bg-white rounded-lg"
                            >
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                  typeInfo.color
                                )}
                              >
                                {typeInfo.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-wood-brown-800">
                                    {typeInfo.label}
                                  </span>
                                  <span className="text-xs text-wood-brown-500">
                                    {annotation.move}
                                  </span>
                                </div>
                                <p className="text-sm text-wood-brown-600">
                                  {annotation.text}
                                </p>
                              </div>
                              <button
                                onClick={() => removeAnnotation(annotation.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200">
                <FileText className="text-wood-brown-400 mb-4" size={64} />
                <h3 className="text-xl font-display font-semibold text-wood-brown-800 mb-2">
                  导入 PGN 棋谱
                </h3>
                <p className="text-wood-brown-600 text-center max-w-md">
                  从左侧粘贴你的对局 PGN 棋谱，开始复盘分析你的棋局
                </p>
              </div>
            )}
          </main>

          <aside className="lg:col-span-3">
            {currentGame && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden h-[calc(100vh-220px)]">
                <div className="px-4 py-4 border-b border-wood-brown-200">
                  <h2 className="font-display font-bold text-xl text-wood-brown-800">
                    走法列表
                  </h2>
                </div>
                <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-4">
                  <div className="space-y-1">
                    {Array.from(
                      {
                        length: Math.ceil(currentGame.moves.length / 2),
                      },
                      (_, pairIndex) => {
                        const whiteIndex = pairIndex * 2;
                        const blackIndex = pairIndex * 2 + 1;
                        const whiteMove = moveListWithAnnotations[whiteIndex];
                        const blackMove = moveListWithAnnotations[blackIndex];

                        return (
                          <div
                            key={pairIndex}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-wood-brown-50 transition-colors"
                          >
                            <span className="w-6 text-xs text-wood-brown-500 font-mono">
                              {pairIndex + 1}.
                            </span>
                            {whiteMove && (
                              <button
                                onClick={() => goToMove(whiteIndex)}
                                className={cn(
                                  'flex-1 flex items-center gap-1 px-2 py-1 rounded text-left transition-colors',
                                  whiteMove.isActive
                                    ? 'bg-amber-500 text-white font-semibold'
                                    : whiteMove.isPlayed
                                    ? 'text-wood-brown-800'
                                    : 'text-wood-brown-600'
                                )}
                              >
                                <span>{whiteMove.move}</span>
                                {whiteMove.annotations.length > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                )}
                              </button>
                            )}
                            {blackMove && (
                              <button
                                onClick={() => goToMove(blackIndex)}
                                className={cn(
                                  'flex-1 flex items-center gap-1 px-2 py-1 rounded text-left transition-colors',
                                  blackMove.isActive
                                    ? 'bg-amber-500 text-white font-semibold'
                                    : blackMove.isPlayed
                                    ? 'text-wood-brown-800'
                                    : 'text-wood-brown-600'
                                )}
                              >
                                <span>{blackMove.move}</span>
                                {blackMove.annotations.length > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {annotations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-wood-brown-200">
                      <h3 className="font-semibold text-wood-brown-800 mb-3">
                        全部标注 ({annotations.length})
                      </h3>
                      <div className="space-y-2">
                        {annotations.map((annotation) => {
                          const typeInfo = getAnnotationTypeInfo(
                            annotation.symbols?.[0] || 'idea'
                          );
                          return (
                            <div
                              key={annotation.id}
                              className="p-3 bg-ivory-100 rounded-lg cursor-pointer hover:bg-ivory-200 transition-colors"
                              onClick={() => goToMove(annotation.moveIndex)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center',
                                    typeInfo.color
                                  )}
                                >
                                  {typeInfo.icon}
                                </div>
                                <span className="text-sm font-medium text-wood-brown-800">
                                  第 {Math.floor(annotation.moveIndex / 2) + 1} 步
                                  {annotation.moveIndex % 2 === 0 ? ' 白方' : ' 黑方'}
                                </span>
                                <span className="text-xs text-wood-brown-500 ml-auto">
                                  {annotation.move}
                                </span>
                              </div>
                              <p className="text-sm text-wood-brown-600 line-clamp-2">
                                {annotation.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
