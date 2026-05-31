import { Link } from 'react-router-dom';
import {
  BookOpen, Layers, Target, Headphones, Award,
  Languages, Kanban, MessageSquare,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { daysUntil, getLevelBgClass } from '@/utils/helpers';

const modules = [
  { to: '/basics', label: '基礎知識', desc: '仮名・漢字・文法', icon: BookOpen, color: 'text-n5-green' },
  { to: '/vocabulary', label: '語彙蓄積', desc: '単語管理と復習', icon: Layers, color: 'text-n4-blue' },
  { to: '/exam-prep', label: '受験準備', desc: '模試とカウントダウン', icon: Target, color: 'text-n3-purple' },
  { to: '/listening', label: '聴説練習', desc: '精聴・スピーキング・日記', icon: Headphones, color: 'text-n2-amber' },
  { to: '/exam-history', label: '試験履歴', desc: '成績記録と推移', icon: Award, color: 'text-n1-crimson' },
];

export default function Home() {
  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore((s) => s.getStats);
  const kanjiProgress = useAppStore((s) => s.kanjiProgress);
  const grammarProgress = useAppStore((s) => s.grammarProgress);
  const vocabulary = useAppStore((s) => s.vocabulary);

  const s = stats();
  const remaining = profile.examDate ? daysUntil(profile.examDate) : null;

  const statCards = [
    { label: '仮名', mastered: s.kanaMastered, total: s.kanaTotal, icon: Languages, accent: 'text-n5-green' },
    { label: '漢字', mastered: s.kanjiMastered, total: s.kanjiTotal, icon: Kanban, accent: 'text-n4-blue' },
    { label: '文法', mastered: s.grammarMastered, total: s.grammarTotal, icon: MessageSquare, accent: 'text-n3-purple' },
    { label: '語彙', mastered: s.vocabMastered, total: s.vocabTotal, icon: Layers, accent: 'text-n2-amber' },
  ];

  const unlearnedKanji = kanjiProgress.filter((k) => k.status === 'unlearned').length;
  const unlearnedGrammar = grammarProgress.filter((g) => g.status === 'unlearned').length;
  const unlearnedVocab = vocabulary.filter((v) => v.status === 'unlearned').length;

  const totalSpan = (() => {
    if (!profile.examDate || !profile.createdAt) return 0;
    const start = new Date(profile.createdAt + 'T00:00:00');
    const end = new Date(profile.examDate + 'T00:00:00');
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  })();
  const elapsed = totalSpan - Math.max(0, remaining ?? 0);
  const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsed / totalSpan)) : 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="font-serif-jp text-2xl font-bold text-pale-gold">ダッシュボード</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${getLevelBgClass(profile.targetLevel)}`}>
          {profile.targetLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, mastered, total, icon: Icon, accent }) => (
          <div
            key={label}
            className="card-shine rounded-xl border border-pale-gold/20 bg-ink-light p-4 transition-all hover:border-pale-gold/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={accent} />
              <span className="text-xs font-medium text-warm-white/60">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif-jp text-3xl font-bold text-pale-gold">{mastered}</span>
              <span className="text-sm text-warm-white/40">/ {total}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink">
              <div
                className="h-full rounded-full bg-vermillion transition-all duration-500"
                style={{ width: `${total > 0 ? (mastered / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-shine rounded-2xl border border-pale-gold/20 bg-ink-light p-6">
          <h2 className="font-serif-jp text-lg font-bold text-pale-gold mb-4">試験カウントダウン</h2>
          {profile.examDate && remaining !== null ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <svg width="140" height="140" className="-rotate-90">
                  <circle cx="70" cy="70" r={radius} fill="none" stroke="#2d2d4a" strokeWidth="8" />
                  <circle
                    cx="70" cy="70" r={radius}
                    fill="none" stroke="#c0392b" strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif-jp text-4xl font-black text-vermillion">
                    {Math.max(0, remaining)}
                  </span>
                  <span className="text-warm-white/60 text-xs">日</span>
                </div>
              </div>
              <p className="text-sm text-warm-white/60">目標日まで</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-warm-white/50">試験日を設定してください</p>
              <Link to="/exam-prep" className="text-sm text-vermillion hover:underline">
                受験準備ページへ
              </Link>
            </div>
          )}
        </div>

        <div className="card-shine rounded-2xl border border-pale-gold/20 bg-ink-light p-6">
          <h2 className="font-serif-jp text-lg font-bold text-pale-gold mb-4">今日のタスク</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border-l-3 border-vermillion bg-ink/40 p-3">
              <Layers size={16} className="text-vermillion shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-white">復習すべき単語</p>
                <p className="text-xs text-warm-white/50">{s.dueReviews} 語が復習予定</p>
              </div>
              <Link to="/vocabulary/review" className="text-xs text-vermillion hover:underline">開始</Link>
            </div>
            <div className="flex items-center gap-3 rounded-lg border-l-3 border-n4-blue bg-ink/40 p-3">
              <Kanban size={16} className="text-n4-blue shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-white">未学習漢字</p>
                <p className="text-xs text-warm-white/50">{unlearnedKanji} 字が未学習</p>
              </div>
              <Link to="/basics" className="text-xs text-n4-blue hover:underline">学習</Link>
            </div>
            <div className="flex items-center gap-3 rounded-lg border-l-3 border-n3-purple bg-ink/40 p-3">
              <MessageSquare size={16} className="text-n3-purple shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-white">未学習文法</p>
                <p className="text-xs text-warm-white/50">{unlearnedGrammar} 項目が未学習</p>
              </div>
              <Link to="/basics" className="text-xs text-n3-purple hover:underline">学習</Link>
            </div>
            <div className="flex items-center gap-3 rounded-lg border-l-3 border-n2-amber bg-ink/40 p-3">
              <Languages size={16} className="text-n2-amber shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-white">未学習語彙</p>
                <p className="text-xs text-warm-white/50">{unlearnedVocab} 語が未学習</p>
              </div>
              <Link to="/vocabulary" className="text-xs text-n2-amber hover:underline">学習</Link>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif-jp text-lg font-bold text-pale-gold mb-4">モジュールナビ</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {modules.map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="card-shine group rounded-xl border border-pale-gold/20 bg-ink-light p-4 transition-all duration-200 hover:border-pale-gold/40 hover:scale-105"
            >
              <Icon size={28} className={`${color} mb-3 transition-transform group-hover:scale-110`} />
              <p className="font-serif-jp text-sm font-bold text-warm-white">{label}</p>
              <p className="mt-1 text-xs text-warm-white/50">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
