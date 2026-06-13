import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, CheckCircle, XCircle, RotateCcw, HelpCircle, Star } from 'lucide-react';
import GoBoard from '@/components/board/GoBoard';
import Card from '@/components/ui/Card';
import type { LifeDeathProblem, StoneColor, Point } from '@/types';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/dateUtils';
import { DIFFICULTY_LABELS, DIFFICULTY_STARS } from '@/types';

interface ProblemPracticeModalProps {
  problem: LifeDeathProblem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (isCorrect: boolean, timeSpent: number, notes?: string) => void;
}

interface Stone {
  point: Point;
  color: StoneColor;
  moveNumber: number;
}

function getInitialStones(): Stone[] {
  const stones: Stone[] = [];
  for (let y = 0; y < 5; y++) {
    stones.push({ point: { x: 0, y }, color: 'white', moveNumber: 0 });
  }
  for (let y = 1; y < 4; y++) {
    stones.push({ point: { x: 4, y }, color: 'white', moveNumber: 0 });
  }
  stones.push({ point: { x: 1, y: 0 }, color: 'white', moveNumber: 0 });
  stones.push({ point: { x: 2, y: 0 }, color: 'white', moveNumber: 0 });
  stones.push({ point: { x: 3, y: 0 }, color: 'white', moveNumber: 0 });
  stones.push({ point: { x: 2, y: 4 }, color: 'white', moveNumber: 0 });
  stones.push({ point: { x: 2, y: 1 }, color: 'black', moveNumber: 0 });
  stones.push({ point: { x: 3, y: 1 }, color: 'black', moveNumber: 0 });
  stones.push({ point: { x: 1, y: 2 }, color: 'black', moveNumber: 0 });
  stones.push({ point: { x: 1, y: 3 }, color: 'black', moveNumber: 0 });
  stones.push({ point: { x: 2, y: 3 }, color: 'black', moveNumber: 0 });
  return stones;
}

export default function ProblemPracticeModal({
  problem,
  isOpen,
  onClose,
  onSubmit,
}: ProblemPracticeModalProps) {
  const [userStones, setUserStones] = useState<Stone[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | 'pending'>('pending');
  const [notes, setNotes] = useState('');
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  const [initialStones] = useState<Stone[]>(getInitialStones());
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserStones([]);
      setTimeSpent(0);
      setIsRunning(true);
      setHasSubmitted(false);
      setResult('pending');
      setNotes('');
      setTurn('black');
    }
  }, [isOpen, problem.id]);

  useEffect(() => {
    if (isRunning && isOpen) {
      timerRef.current = window.setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isOpen]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleBoardClick = useCallback(
    (point: Point) => {
      if (hasSubmitted) return;
      if (point.x >= 5 || point.y >= 5) return;
      if (point.x < 0 || point.y < 0) return;

      const allStones = [...initialStones, ...userStones];
      const isOccupied = allStones.some(
        (s) => s.point.x === point.x && s.point.y === point.y
      );
      if (isOccupied) return;

      const newStone: Stone = {
        point,
        color: turn,
        moveNumber: userStones.length + 1,
      };

      setUserStones((prev) => [...prev, newStone]);
      setTurn((prev) => (prev === 'black' ? 'white' : 'black'));
    },
    [userStones, initialStones, turn, hasSubmitted]
  );

  const handleSubmit = useCallback(() => {
    if (userStones.length === 0) return;

    stopTimer();
    setHasSubmitted(true);

    const isCorrect = userStones.length >= 2;
    setResult(isCorrect ? 'correct' : 'wrong');
  }, [userStones, stopTimer]);

  const handleReset = useCallback(() => {
    setUserStones([]);
    setTimeSpent(0);
    setIsRunning(true);
    setHasSubmitted(false);
    setResult('pending');
    setNotes('');
    setTurn('black');
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    onSubmit(result === 'correct', timeSpent, notes);
    onClose();
  }, [result, timeSpent, notes, onSubmit, onClose]);

  const displayStones = [...initialStones, ...userStones];
  const lastMove = userStones.length > 0 ? userStones[userStones.length - 1].point : null;

  if (!isOpen) {
    return null;
  }

  const resultBox = result === 'correct' ? (
    <div className="p-4 text-center bg-green-50 rounded-xl">
      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
      <p className="font-medium text-green-700">回答正确！</p>
      <p className="mt-1 text-sm text-green-600">用时 {formatTime(timeSpent)}</p>
    </div>
  ) : (
    <div className="p-4 text-center bg-red-50 rounded-xl">
      <XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
      <p className="font-medium text-red-700">回答错误</p>
      <p className="mt-1 text-sm text-red-600">用时 {formatTime(timeSpent)}</p>
    </div>
  );

  const practicePanel = hasSubmitted ? (
    <div className="space-y-3">
      {resultBox}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-go-wood-700">
          学习笔记 (可选)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-20 p-3 text-sm border border-go-wood-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-go-wood-400"
          placeholder="写下你的心得..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleReset}
          className="py-2.5 text-sm text-go-wood-600 border border-go-wood-200 rounded-lg hover:bg-go-wood-50 transition-colors"
        >
          再试一次
        </button>
        <button
          onClick={handleConfirmSubmit}
          className="py-2.5 text-sm text-white bg-go-wood-700 rounded-lg hover:bg-go-wood-800 transition-colors"
        >
          确认并记录
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      <button
        onClick={handleSubmit}
        disabled={userStones.length === 0}
        className={cn(
          'w-full py-3 rounded-xl font-medium transition-colors',
          userStones.length > 0
            ? 'bg-go-bamboo text-white hover:bg-go-bamboo/90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        提交答案
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-1 py-2.5 text-sm text-go-wood-600 border border-go-wood-200 rounded-lg hover:bg-go-wood-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
        <button className="flex items-center justify-center gap-1 py-2.5 text-sm text-go-wood-600 border border-go-wood-200 rounded-lg hover:bg-go-wood-50 transition-colors">
          <HelpCircle className="w-4 h-4" />
          提示
        </button>
      </div>
    </div>
  );

  const statusText = hasSubmitted
    ? result === 'correct'
      ? '🎉 回答正确！'
      : '❌ 还需要再想想'
    : turn === 'black'
    ? '⚫ 黑先，请落子'
    : '⚪ 白方应对';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="w-full max-w-2xl mx-4 overflow-hidden bg-white rounded-2xl animate-scale-in">
        <div className="bg-gradient-to-r from-go-wood-700 to-go-wood-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold">{problem.title}</h2>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: DIFFICULTY_STARS[problem.difficulty] }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-300 fill-amber-300" />
                  ))}
                </div>
                <span className="text-sm text-go-wood-200">
                  {DIFFICULTY_LABELS[problem.difficulty]}
                </span>
                <span className="text-go-wood-300">·</span>
                <span className="flex items-center gap-1 text-sm text-go-wood-200">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeSpent)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="p-4 bg-go-wood-100 rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-go-wood-600">{statusText}</span>
                  <GoBoard
                    size={5}
                    stones={displayStones}
                    lastMove={lastMove}
                    showCoordinates={false}
                    showMoveNumbers={true}
                    onPointClick={handleBoardClick}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 gap-4">
              <Card hover={false}>
                <Card.Content className="p-4">
                  <h3 className="mb-3 text-sm font-medium text-go-wood-700">落子记录</h3>
                  {userStones.length === 0 ? (
                    <p className="text-sm text-go-wood-400">暂无落子，请在棋盘上点击开始答题</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userStones.map((stone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 py-1 text-sm text-go-wood-600"
                        >
                          <span
                            className={cn(
                              'w-4 h-4 rounded-full flex-shrink-0',
                              stone.color === 'black'
                                ? 'bg-gray-900'
                                : 'bg-white border-2 border-gray-300'
                            )}
                          />
                          <span>
                            第 {stone.moveNumber} 手: ({String.fromCharCode(65 + stone.point.x)},{' '}
                            {5 - stone.point.y})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>

              {practicePanel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
