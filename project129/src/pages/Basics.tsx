import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelBgClass, getStatusColor } from '@/utils/helpers';
import { hiraganaRows, katakanaRows } from '@/data/kana';
import type { JLPTLevel, MasteryStatus, KanaType } from '@/types';

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const STATUS_CYCLE: MasteryStatus[] = ['unlearned', 'learning', 'mastered'];

const STATUS_LABELS: Record<MasteryStatus, string> = {
  unlearned: '未学習',
  learning: '学習中',
  mastered: '習得',
};

const STATUS_DOT: Record<MasteryStatus, string> = {
  unlearned: 'bg-gray-500',
  learning: 'bg-orange-400',
  mastered: 'bg-green-500',
};

function KanaGrid() {
  const kanaProgress = useAppStore((s) => s.kanaProgress);
  const updateKanaStatus = useAppStore((s) => s.updateKanaStatus);
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [selectedKana, setSelectedKana] = useState<string | null>(null);

  const rows = kanaType === 'hiragana' ? hiraganaRows : katakanaRows;

  const kanaMap = useMemo(() => {
    const m = new Map<string, typeof kanaProgress[0]>();
    kanaProgress.filter((k) => k.type === kanaType).forEach((k) => m.set(k.character, k));
    return m;
  }, [kanaProgress, kanaType]);

  const mastered = kanaProgress.filter((k) => k.type === kanaType && k.status === 'mastered').length;
  const learning = kanaProgress.filter((k) => k.type === kanaType && k.status === 'learning').length;
  const total = kanaProgress.filter((k) => k.type === kanaType).length;

  const selected = selectedKana ? kanaMap.get(selectedKana) : null;

  const handleTest = (id: string, correct: boolean) => {
    updateKanaStatus(id, correct ? 'mastered' : 'learning', correct);
  };

  const handleStatusChange = (id: string, current: MasteryStatus) => {
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateKanaStatus(id, next, next === 'mastered');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setKanaType('hiragana')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            kanaType === 'hiragana' ? 'bg-vermillion text-white' : 'bg-ink-light text-warm-white/60 hover:text-warm-white'
          }`}
        >
          ひらがな
        </button>
        <button
          onClick={() => setKanaType('katakana')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            kanaType === 'katakana' ? 'bg-vermillion text-white' : 'bg-ink-light text-warm-white/60 hover:text-warm-white'
          }`}
        >
          カタカナ
        </button>
      </div>

      <div className="flex gap-4 text-sm text-warm-white/60">
        <span>習得: <span className="font-bold text-green-400">{mastered}</span></span>
        <span>学習中: <span className="font-bold text-orange-400">{learning}</span></span>
        <span>未学習: <span className="font-bold text-warm-white/40">{total - mastered - learning}</span></span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-ink-light">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${total > 0 ? (mastered / total) * 100 : 0}%` }}
        />
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(5, 1fr)` }}>
        {rows.map((row, ri) =>
          row.map((kana, ci) => {
            if (!kana.character) return <div key={`${ri}-${ci}`} />;
            const progress = kanaMap.get(kana.character);
            return (
              <button
                key={kana.character}
                onClick={() => setSelectedKana(kana.character)}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:border-pale-gold/40 ${
                  progress?.status === 'mastered'
                    ? 'border-green-500/30 bg-green-500/10'
                    : progress?.status === 'learning'
                    ? 'border-orange-400/30 bg-orange-400/10'
                    : 'border-ink-light bg-ink-light/50'
                }`}
              >
                <span className="font-serif-jp text-2xl font-bold text-warm-white">{kana.character}</span>
                <span className="text-[10px] text-warm-white/40">{kana.romaji}</span>
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${progress ? STATUS_DOT[progress.status] : 'bg-gray-500'}`} />
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedKana(null)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-pale-gold/30 bg-ink-light p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="font-serif-jp text-6xl font-bold text-warm-white">{selected.character}</p>
                <p className="mt-2 text-lg text-pale-gold">{selected.romaji}</p>
              </div>
              <button onClick={() => setSelectedKana(null)} className="text-warm-white/40 hover:text-warm-white">
                <X size={20} />
              </button>
            </div>
            <div className="sakura-divider my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-white/60">ステータス:</span>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[selected.status]}`} />
                <span className="text-sm font-medium text-warm-white">{STATUS_LABELS[selected.status]}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-warm-white/50">
              <span>正解: {selected.correctCount}回</span>
              <span>挑戦: {selected.totalTests}回</span>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-warm-white/50">セルフテスト:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(selected.id, true)}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
                >
                  正解 ✓
                </button>
                <button
                  onClick={() => handleTest(selected.id, false)}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 transition"
                >
                  不正解 ✗
                </button>
              </div>
              <button
                onClick={() => { handleStatusChange(selected.id, selected.status); setSelectedKana(null); }}
                className="w-full rounded-lg border border-pale-gold/30 py-2 text-xs text-pale-gold hover:bg-pale-gold/10 transition"
              >
                ステータスを変更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KanjiGrid() {
  const kanjiProgress = useAppStore((s) => s.kanjiProgress);
  const updateKanjiStatus = useAppStore((s) => s.updateKanjiStatus);
  const [activeLevel, setActiveLevel] = useState<JLPTLevel | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return kanjiProgress.filter((k) => {
      if (activeLevel && k.level !== activeLevel) return false;
      if (search) {
        const q = search.toLowerCase();
        return k.kanji.includes(q) || k.meaning.toLowerCase().includes(q) || k.onyomi.toLowerCase().includes(q) || k.kunyomi.toLowerCase().includes(q);
      }
      return true;
    });
  }, [kanjiProgress, activeLevel, search]);

  const levelKanji = activeLevel ? kanjiProgress.filter((k) => k.level === activeLevel) : kanjiProgress;
  const mastered = levelKanji.filter((k) => k.status === 'mastered').length;

  const cycleStatus = (id: string, current: MasteryStatus) => {
    const idx = STATUS_CYCLE.indexOf(current);
    updateKanjiStatus(id, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveLevel(null)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              activeLevel === null ? 'bg-pale-gold text-ink' : 'bg-ink-light text-warm-white/60 hover:text-warm-white'
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
            placeholder="漢字を検索..."
            className="w-full rounded-lg border border-pale-gold/20 bg-ink-light py-2 pl-9 pr-3 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none focus:ring-1 focus:ring-pale-gold/30"
          />
        </div>
      </div>

      {activeLevel && (
        <div className="flex items-center gap-3 text-sm text-warm-white/60">
          <span>{activeLevel}: 習得 <span className="font-bold text-green-400">{mastered}</span> / {levelKanji.length}</span>
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-ink">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${levelKanji.length > 0 ? (mastered / levelKanji.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {filtered.map((k) => (
          <button
            key={k.id}
            onClick={() => cycleStatus(k.id, k.status)}
            className={`group relative flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:border-pale-gold/40 ${
              k.status === 'mastered' ? 'border-green-500/30 bg-green-500/5' : k.status === 'learning' ? 'border-orange-400/30 bg-orange-400/5' : 'border-ink-light bg-ink-light/50'
            }`}
            title={`${k.kanji} - ${k.meaning}\n音: ${k.onyomi} 訓: ${k.kunyomi}`}
          >
            <span className="font-serif-jp text-2xl font-bold text-warm-white">{k.kanji}</span>
            <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${STATUS_DOT[k.status]}`} />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-40 rounded-lg bg-ink border border-pale-gold/20 p-2 text-xs text-warm-white group-hover:block z-10">
              <p className="font-bold text-pale-gold">{k.meaning}</p>
              <p className="text-warm-white/60">音: {k.onyomi}</p>
              <p className="text-warm-white/60">訓: {k.kunyomi}</p>
              <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getLevelBgClass(k.level)}`}>{k.level}</span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-warm-white/40">
          <p className="font-serif-jp text-lg">漢字が見つかりません</p>
        </div>
      )}
    </div>
  );
}

function GrammarList() {
  const grammarProgress = useAppStore((s) => s.grammarProgress);
  const updateGrammarStatus = useAppStore((s) => s.updateGrammarStatus);
  const [activeLevel, setActiveLevel] = useState<JLPTLevel | null>(null);

  const filtered = useMemo(() => {
    if (!activeLevel) return grammarProgress;
    return grammarProgress.filter((g) => g.level === activeLevel);
  }, [grammarProgress, activeLevel]);

  const cycleStatus = (id: string, current: MasteryStatus) => {
    const idx = STATUS_CYCLE.indexOf(current);
    updateGrammarStatus(id, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveLevel(null)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
            activeLevel === null ? 'bg-pale-gold text-ink' : 'bg-ink-light text-warm-white/60 hover:text-warm-white'
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

      <div className="space-y-2">
        {filtered.map((g) => (
          <div
            key={g.id}
            className={`rounded-xl border p-4 transition-all ${
              g.status === 'mastered' ? 'border-green-500/20 bg-green-500/5' : g.status === 'learning' ? 'border-orange-400/20 bg-orange-400/5' : 'border-ink-light bg-ink-light/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif-jp text-lg font-bold text-warm-white">{g.grammarPoint}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getLevelBgClass(g.level)}`}>{g.level}</span>
                </div>
                <p className="mt-1 text-sm text-pale-gold">{g.meaning}</p>
                <p className="mt-1 text-sm text-warm-white/60">{g.example}</p>
              </div>
              <button
                onClick={() => cycleStatus(g.id, g.status)}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${
                  g.status === 'mastered' ? 'border-green-500/30 text-green-400 bg-green-500/10' : g.status === 'learning' ? 'border-orange-400/30 text-orange-400 bg-orange-400/10' : 'border-ink-light text-warm-white/50 bg-ink hover:border-pale-gold/30'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[g.status]}`} />
                {STATUS_LABELS[g.status]}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-warm-white/40">
          <p className="font-serif-jp text-lg">文法項目が見つかりません</p>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'kana', label: '仮名' },
  { key: 'kanji', label: '漢字' },
  { key: 'grammar', label: '文法' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function Basics() {
  const [activeTab, setActiveTab] = useState<TabKey>('kana');

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="font-serif-jp text-2xl font-bold text-pale-gold">基礎知識</h1>

      <div className="flex gap-1 rounded-xl bg-ink-light p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-vermillion text-warm-white shadow-sm'
                : 'text-warm-white/60 hover:text-warm-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sakura-divider" />

      {activeTab === 'kana' && <KanaGrid />}
      {activeTab === 'kanji' && <KanjiGrid />}
      {activeTab === 'grammar' && <GrammarList />}
    </div>
  );
}
