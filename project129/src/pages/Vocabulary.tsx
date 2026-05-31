import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, RotateCcw, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelBgClass, getStatusColor } from '@/utils/helpers';
import type { JLPTLevel, MasteryStatus } from '@/types';

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const STATUS_CYCLE: MasteryStatus[] = ['unlearned', 'learning', 'mastered'];

export default function Vocabulary() {
  const location = useLocation();
  const vocabulary = useAppStore((s) => s.vocabulary);
  const addVocabulary = useAppStore((s) => s.addVocabulary);
  const updateVocabularyStatus = useAppStore((s) => s.updateVocabularyStatus);
  const getDueVocabulary = useAppStore((s) => s.getDueVocabulary);

  const [activeLevel, setActiveLevel] = useState<JLPTLevel | null>(null);
  const [search, setSearch] = useState('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ word: '', reading: '', meaning: '', level: 'N5' as JLPTLevel });

  const filtered = useMemo(() => {
    return vocabulary.filter((v) => {
      if (activeLevel && v.level !== activeLevel) return false;
      if (search) {
        const q = search.toLowerCase();
        return v.word.toLowerCase().includes(q) || v.reading.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q);
      }
      return true;
    });
  }, [vocabulary, activeLevel, search]);

  const dueCount = getDueVocabulary().length;
  const masteredCount = vocabulary.filter((v) => v.status === 'mastered').length;
  const learningCount = vocabulary.filter((v) => v.status === 'learning').length;

  const handleCycleStatus = (id: string, current: MasteryStatus) => {
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateVocabularyStatus(id, next);
  };

  const handleAdd = () => {
    if (!form.word.trim() || !form.reading.trim() || !form.meaning.trim()) return;
    addVocabulary(form.word.trim(), form.reading.trim(), form.meaning.trim(), form.level);
    setForm({ word: '', reading: '', meaning: '', level: 'N5' });
    setShowModal(false);
  };

  const tabs = [
    { label: '語彙一覧', to: '/vocabulary', active: location.pathname === '/vocabulary' },
    { label: '復習', to: '/vocabulary/review', active: location.pathname === '/vocabulary/review' },
    { label: '例文', to: '/vocabulary/sentences', active: location.pathname === '/vocabulary/sentences' },
  ];

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex gap-2 border-b border-pale-gold/20">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab.active
                ? 'border-b-2 border-vermillion text-vermillion'
                : 'text-warm-white/60 hover:text-warm-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveLevel(null)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              activeLevel === null ? 'bg-pale-gold text-ink' : 'bg-ink-light text-warm-white/70 hover:bg-ink-light/80'
            }`}
          >
            全て
          </button>
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(activeLevel === level ? null : level)}
              className={`rounded-full px-3 py-1 text-xs font-bold text-white transition-all ${
                activeLevel === level ? `${getLevelBgClass(level)} ring-2 ring-white/30` : `${getLevelBgClass(level)} opacity-50 hover:opacity-80`
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="単語を検索..."
            className="w-full rounded-lg border border-pale-gold/20 bg-ink-light py-2 pl-9 pr-10 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none focus:ring-1 focus:ring-pale-gold/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-warm-white/40 transition-colors hover:bg-ink hover:text-warm-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-vermillion px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-vermillion/80"
        >
          <Plus size={16} />
          単語を追加
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-warm-white/60">総数: <span className="font-bold text-warm-white">{vocabulary.length}</span></span>
        {search && (
          <span className="text-pale-gold">検索結果: <span className="font-bold">{filtered.length}</span> 件 / "{search}"</span>
        )}
        <span className="text-warm-white/60">習得済み: <span className="font-bold text-green-400">{masteredCount}</span></span>
        <span className="text-warm-white/60">学習中: <span className="font-bold text-orange-400">{learningCount}</span></span>
        <span className="flex items-center gap-1 text-warm-white/60">
          <RotateCcw size={14} className="text-vermillion" />
          復習予定: <span className="font-bold text-vermillion">{dueCount}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <div
            key={v.id}
            onClick={() => setFlippedId(flippedId === v.id ? null : v.id)}
            className="card-shine cursor-pointer rounded-xl border border-pale-gold/20 bg-ink-light p-4 transition-all hover:border-pale-gold/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-serif-jp text-xl font-bold text-warm-white">{v.word}</p>
                <p className="text-sm text-pale-gold">{v.reading}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getLevelBgClass(v.level)}`}>
                  {v.level}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(v.status)}`} />
              </div>
            </div>
            <p className="mt-2 text-sm text-warm-white/80">{v.meaning}</p>

            {flippedId === v.id && (
              <div className="mt-3 border-t border-pale-gold/10 pt-3 animate-fade-in-up">
                <div className="flex items-center justify-between text-xs text-warm-white/50">
                  <span>追加日: {v.addedDate}</span>
                  <span>次の復習: {v.nextReview}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-warm-white/50">
                    ステータス: <span className="font-medium text-warm-white">{v.status === 'unlearned' ? '未学習' : v.status === 'learning' ? '学習中' : '習得済み'}</span>
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCycleStatus(v.id, v.status); }}
                    className="rounded-md border border-pale-gold/30 px-2 py-1 text-xs text-pale-gold transition-colors hover:bg-pale-gold/10"
                  >
                    変更
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-warm-white/40">
          <p className="font-serif-jp text-lg">単語が見つかりません</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-pale-gold/20 bg-ink-light p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif-jp text-lg font-bold text-pale-gold">単語を追加</h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                placeholder="単語"
                className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none"
              />
              <input
                type="text"
                value={form.reading}
                onChange={(e) => setForm({ ...form, reading: e.target.value })}
                placeholder="読み方"
                className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none"
              />
              <input
                type="text"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                placeholder="意味"
                className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none"
              />
              <div className="flex gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setForm({ ...form, level })}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold text-white transition-all ${
                      form.level === level ? `${getLevelBgClass(level)} ring-2 ring-white/30` : `${getLevelBgClass(level)} opacity-40 hover:opacity-70`
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm text-warm-white/60 hover:text-warm-white">
                キャンセル
              </button>
              <button onClick={handleAdd} className="rounded-lg bg-vermillion px-4 py-2 text-sm font-bold text-white hover:bg-vermillion/80">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
