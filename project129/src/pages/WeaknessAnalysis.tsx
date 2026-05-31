import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckSquare,
} from 'lucide-react';
import {
  RadarChart, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, PolarGrid,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';

type SectionKey = 'vocabulary' | 'grammar' | 'reading' | 'listening';

const SECTIONS: { key: SectionKey; label: string; color: string }[] = [
  { key: 'vocabulary', label: '文字・語彙', color: '#27ae60' },
  { key: 'grammar', label: '文法', color: '#2980b9' },
  { key: 'reading', label: '読解', color: '#8e44ad' },
  { key: 'listening', label: '聴解', color: '#e67e22' },
];

const RECOMMENDATIONS: Record<SectionKey, string> = {
  vocabulary: '毎日10語の復習を',
  grammar: '文法パターンの反復練習を',
  reading: '1日1長文を読もう',
  listening: '毎日15分の聴解練習を',
};

export default function WeaknessAnalysis() {
  const mockExams = useAppStore(s => s.mockExams);
  const kanjiProgress = useAppStore(s => s.kanjiProgress);
  const grammarProgress = useAppStore(s => s.grammarProgress);
  const vocabulary = useAppStore(s => s.vocabulary);

  const averages = useMemo(() => {
    if (mockExams.length === 0) return null;
    const sums: Record<SectionKey, number> = {
      vocabulary: 0, grammar: 0, reading: 0, listening: 0,
    };
    mockExams.forEach(e => {
      sums.vocabulary += e.vocabularyTotal > 0 ? (e.vocabularyScore / e.vocabularyTotal) * 100 : 0;
      sums.grammar += e.grammarTotal > 0 ? (e.grammarScore / e.grammarTotal) * 100 : 0;
      sums.reading += e.readingTotal > 0 ? (e.readingScore / e.readingTotal) * 100 : 0;
      sums.listening += e.listeningTotal > 0 ? (e.listeningScore / e.listeningTotal) * 100 : 0;
    });
    const n = mockExams.length;
    return {
      vocabulary: Math.round(sums.vocabulary / n),
      grammar: Math.round(sums.grammar / n),
      reading: Math.round(sums.reading / n),
      listening: Math.round(sums.listening / n),
    };
  }, [mockExams]);

  const radarData = useMemo(() => {
    if (!averages) return [];
    return SECTIONS.map(s => ({
      subject: s.label,
      score: averages[s.key],
      fullMark: 100,
    }));
  }, [averages]);

  const weakest = useMemo<SectionKey | null>(() => {
    if (!averages) return null;
    const entries = Object.entries(averages) as [SectionKey, number][];
    return entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
  }, [averages]);

  const unlearnedVocab = vocabulary.filter(v => v.status !== 'mastered').length;
  const unlearnedGrammar = grammarProgress.filter(g => g.status !== 'mastered').length;
  const unlearnedKanji = kanjiProgress.filter(k => k.status !== 'mastered').length;

  const checklistItems = useMemo(() => {
    if (!weakest) return [];
    const items: { text: string; done: boolean }[] = [];
    switch (weakest) {
      case 'vocabulary':
        items.push({ text: '毎日10語の復習を', done: false });
        items.push({ text: `未習得語彙: ${unlearnedVocab} 語`, done: false });
        break;
      case 'grammar':
        items.push({ text: '文法パターンの反復練習を', done: false });
        items.push({ text: `未習得文法: ${unlearnedGrammar} 項`, done: false });
        break;
      case 'reading':
        items.push({ text: '1日1長文を読もう', done: false });
        break;
      case 'listening':
        items.push({ text: '毎日15分の聴解練習を', done: false });
        break;
    }
    return items;
  }, [weakest, unlearnedVocab, unlearnedGrammar, unlearnedKanji]);

  if (!averages) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 animate-fade-in-up">
        <AlertTriangle size={48} className="text-pale-gold/50" />
        <p className="text-warm-white/70 text-center">
          模擬試験記録を追加してから分析できます
        </p>
        <Link
          to="/exam-prep"
          className="flex items-center gap-2 rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-white hover:bg-vermillion/80 transition"
        >
          <ArrowLeft size={16} />
          試験準備へ戻る
        </Link>
      </div>
    );
  }

  const weakestSection = SECTIONS.find(s => s.key === weakest)!;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Link
        to="/exam-prep"
        className="inline-flex items-center gap-1.5 text-sm text-warm-white/60 hover:text-warm-white transition"
      >
        <ArrowLeft size={16} />
        試験準備に戻る
      </Link>

      <section className="rounded-2xl border border-ink-light bg-ink-light/50 p-6 card-shine">
        <h2 className="font-serif-jp text-xl font-bold text-pale-gold mb-6">四分野スコア</h2>
        <div className="flex justify-center mb-6">
          <ResponsiveContainer width={320} height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2d2d4a" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#faf3e0', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#faf3e0', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="スコア"
                dataKey="score"
                stroke="#c0392b"
                fill="#c0392b"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SECTIONS.map(s => (
            <div key={s.key} className="rounded-lg border border-ink-light bg-ink/60 p-3">
              <div className="text-xs text-warm-white/60 mb-1">{s.label}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>
                {averages[s.key]}%
              </div>
              <div className="mt-2 h-2 rounded-full bg-ink-light overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${averages[s.key]}%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-light bg-ink-light/50 p-6 card-shine">
        <h2 className="font-serif-jp text-xl font-bold text-pale-gold mb-6 flex items-center gap-2">
          <AlertTriangle size={20} />
          弱点判定
        </h2>
        <div className="rounded-xl border-2 border-vermillion/50 bg-vermillion/5 p-4 mb-4">
          <p className="font-serif-jp text-lg font-bold text-vermillion">
            {weakestSection.label}が最も弱い分野です
          </p>
          <p className="text-sm text-warm-white/60 mt-1">
            平均スコア: {averages[weakest!]}%
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTIONS.map(s => (
            <div
              key={s.key}
              className={`rounded-lg border p-3 ${
                s.key === weakest
                  ? 'border-vermillion/50 bg-vermillion/5'
                  : 'border-ink-light bg-ink/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-warm-white/80">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>
                  {averages[s.key]}%
                </span>
              </div>
              <p className="text-xs text-warm-white/50 mt-1">
                {RECOMMENDATIONS[s.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-light bg-ink-light/50 p-6 card-shine">
        <h2 className="font-serif-jp text-xl font-bold text-pale-gold mb-6">強化計画</h2>
        <div className="rounded-xl border border-pale-gold/20 bg-ink/60 p-4">
          <h3 className="font-sans-jp text-sm font-medium text-pale-gold mb-3">
            {weakestSection.label}の強化プラン
          </h3>
          <div className="space-y-3">
            {checklistItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckSquare size={16} className="text-pale-gold/50 shrink-0" />
                <span className="text-sm text-warm-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
