import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, Eye, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function VocabularyReview() {
  const getDueVocabulary = useAppStore((s) => s.getDueVocabulary);
  const reviewVocabulary = useAppStore((s) => s.reviewVocabulary);

  const [dueItems, setDueItems] = useState(() => getDueVocabulary());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  const current = dueItems[currentIdx] ?? null;
  const progress = dueItems.length > 0 ? ((currentIdx) / dueItems.length) * 100 : 100;

  const refreshDue = useCallback(() => {
    setDueItems(getDueVocabulary());
    setCurrentIdx(0);
    setFlipped(false);
  }, [getDueVocabulary]);

  const handleAnswer = (quality: number) => {
    if (!current) return;
    reviewVocabulary(current.id, quality);
    setAnimating(true);
    setTimeout(() => {
      if (currentIdx + 1 >= dueItems.length) {
        refreshDue();
      } else {
        setCurrentIdx((i) => i + 1);
        setFlipped(false);
      }
      setAnimating(false);
    }, 400);
  };

  if (dueItems.length === 0) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="flex gap-2 border-b border-pale-gold/20">
          <Link to="/vocabulary" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
            語彙一覧
          </Link>
          <Link to="/vocabulary/review" className="border-b-2 border-vermillion px-4 py-2 text-sm font-medium text-vermillion">
            復習
          </Link>
          <Link to="/vocabulary/sentences" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
            例文
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
            <PartyPopper size={48} className="text-green-400" />
          </div>
          <p className="font-serif-jp text-2xl font-bold text-warm-white">今日の復習は完了しました！🎉</p>
          <p className="mt-2 text-warm-white/50">お疲れ様でした</p>
          <Link
            to="/vocabulary"
            className="mt-6 rounded-lg border border-pale-gold/30 px-4 py-2 text-sm text-pale-gold transition-colors hover:bg-pale-gold/10"
          >
            語彙一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex gap-2 border-b border-pale-gold/20">
        <Link to="/vocabulary" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
          語彙一覧
        </Link>
        <Link to="/vocabulary/review" className="border-b-2 border-vermillion px-4 py-2 text-sm font-medium text-vermillion">
          復習
        </Link>
        <Link to="/vocabulary/sentences" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
          例文
        </Link>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-ink-light">
        <div
          className="h-full rounded-full bg-vermillion transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-warm-white/60">
        <span>{currentIdx + 1} / {dueItems.length}</span>
        <Link to="/vocabulary" className="flex items-center gap-1 text-warm-white/40 hover:text-warm-white transition-colors">
          <X size={16} />
          終了
        </Link>
      </div>

      <div
        className="flip-card mx-auto w-full max-w-md"
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''} relative h-64 w-full`}>
          <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-pale-gold/20 bg-ink-light card-shine">
            <p className="font-serif-jp text-4xl font-bold text-warm-white">{current?.word}</p>
            <p className="mt-2 text-lg text-pale-gold">{current?.reading}</p>
          </div>
          <div className="flip-card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-pale-gold/30 bg-ink-light">
            <p className="font-serif-jp text-3xl font-bold text-warm-white">{current?.meaning}</p>
            <p className="mt-1 text-sm text-pale-gold">{current?.word}・{current?.reading}</p>
          </div>
        </div>
      </div>

      {!flipped ? (
        <div className="flex justify-center">
          <button
            onClick={() => setFlipped(true)}
            className="flex items-center gap-2 rounded-xl border border-pale-gold/30 px-6 py-3 text-pale-gold transition-colors hover:bg-pale-gold/10"
          >
            <Eye size={18} />
            表示
          </button>
        </div>
      ) : (
        <div className={`flex justify-center gap-3 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <button
            onClick={() => handleAnswer(0)}
            className="flex-1 max-w-[160px] rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            覚えていない
          </button>
          <button
            onClick={() => handleAnswer(2)}
            className="flex-1 max-w-[160px] rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            あいまい
          </button>
          <button
            onClick={() => handleAnswer(4)}
            className="flex-1 max-w-[160px] rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
          >
            覚えている
          </button>
        </div>
      )}
    </div>
  );
}
