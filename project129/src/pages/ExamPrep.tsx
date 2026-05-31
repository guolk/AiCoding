import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, X, Trash2, ChevronDown, ChevronUp,
  Calendar, AlertCircle, Target, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, daysUntil, todayISO, getLevelBgClass } from '@/utils/helpers';
import type { JLPTLevel, MockExam } from '@/types';

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const SECTION_COLORS: Record<string, string> = {
  '文字・語彙': '#27ae60',
  '文法': '#2980b9',
  '読解': '#8e44ad',
  '聴解': '#e67e22',
};

const SECTION_KEYS = ['文字・語彙', '文法', '読解', '聴解'] as const;

function totalScore(e: MockExam) {
  return e.vocabularyScore + e.grammarScore + e.readingScore + e.listeningScore;
}

function totalPossible(e: MockExam) {
  return e.vocabularyTotal + e.grammarTotal + e.readingTotal + e.listeningTotal;
}

function isPass(e: MockExam) {
  return totalPossible(e) > 0 && totalScore(e) / totalPossible(e) >= 0.5;
}

export default function ExamPrep() {
  const profile = useAppStore(s => s.profile);
  const mockExams = useAppStore(s => s.mockExams);
  const kanjiProgress = useAppStore(s => s.kanjiProgress);
  const grammarProgress = useAppStore(s => s.grammarProgress);
  const updateProfile = useAppStore(s => s.updateProfile);
  const addMockExam = useAppStore(s => s.addMockExam);
  const deleteMockExam = useAppStore(s => s.deleteMockExam);
  const getDueVocabulary = useAppStore(s => s.getDueVocabulary);

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formDate, setFormDate] = useState(todayISO());
  const [formLevel, setFormLevel] = useState<JLPTLevel>(profile.targetLevel);
  const [vScore, setVScore] = useState(0);
  const [vTotal, setVTotal] = useState(60);
  const [gScore, setGScore] = useState(0);
  const [gTotal, setGTotal] = useState(60);
  const [rScore, setRScore] = useState(0);
  const [rTotal, setRTotal] = useState(60);
  const [lScore, setLScore] = useState(0);
  const [lTotal, setLTotal] = useState(60);

  const remaining = profile.examDate ? daysUntil(profile.examDate) : null;

  const totalSpan = useMemo(() => {
    if (!profile.examDate || !profile.createdAt) return 0;
    const s = new Date(profile.createdAt + 'T00:00:00');
    const e = new Date(profile.examDate + 'T00:00:00');
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
  }, [profile.examDate, profile.createdAt]);

  const elapsed = totalSpan - Math.max(0, remaining ?? 0);
  const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsed / totalSpan)) : 0;

  const dueVocab = getDueVocabulary();
  const unlearnedKanji = kanjiProgress.filter(k => k.status !== 'mastered').length;
  const unlearnedGrammar = grammarProgress.filter(g => g.status !== 'mastered').length;
  const dailyKanji = remaining && remaining > 0 ? Math.ceil(unlearnedKanji / remaining) : unlearnedKanji;
  const dailyGrammar = remaining && remaining > 0 ? Math.ceil(unlearnedGrammar / remaining) : unlearnedGrammar;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const chartData = useMemo(() =>
    [...mockExams]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({
        date: formatDate(e.date),
        '文字・語彙': e.vocabularyTotal > 0 ? Math.round((e.vocabularyScore / e.vocabularyTotal) * 100) : 0,
        '文法': e.grammarTotal > 0 ? Math.round((e.grammarScore / e.grammarTotal) * 100) : 0,
        '読解': e.readingTotal > 0 ? Math.round((e.readingScore / e.readingTotal) * 100) : 0,
        '聴解': e.listeningTotal > 0 ? Math.round((e.listeningScore / e.listeningTotal) * 100) : 0,
      })),
    [mockExams],
  );

  const handleSave = () => {
    addMockExam({
      date: formDate,
      level: formLevel,
      vocabularyScore: vScore,
      vocabularyTotal: vTotal,
      grammarScore: gScore,
      grammarTotal: gTotal,
      readingScore: rScore,
      readingTotal: rTotal,
      listeningScore: lScore,
      listeningTotal: lTotal,
    });
    setShowAddForm(false);
    setVScore(0);
    setGScore(0);
    setRScore(0);
    setLScore(0);
  };

  const sectionFields = [
    { label: '文字・語彙', score: vScore, setScore: setVScore, total: vTotal, setTotal: setVTotal },
    { label: '文法', score: gScore, setScore: setGScore, total: gTotal, setTotal: setGTotal },
    { label: '読解', score: rScore, setScore: setRScore, total: rTotal, setTotal: setRTotal },
    { label: '聴解', score: lScore, setScore: setLScore, total: lTotal, setTotal: setLTotal },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="rounded-2xl border border-ink-light bg-ink-light/50 p-6 card-shine">
        <h2 className="font-serif-jp text-xl font-bold text-pale-gold mb-6 flex items-center gap-2">
          <Target size={20} />
          試験カウントダウン
        </h2>

        {profile.examDate && remaining !== null ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <svg width="220" height="220" className="-rotate-90">
                <circle
                  cx="110" cy="110" r={radius}
                  fill="none" stroke="#2d2d4a" strokeWidth="10"
                />
                <circle
                  cx="110" cy="110" r={radius}
                  fill="none" stroke="#c0392b" strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif-jp text-6xl font-black text-vermillion">
                  {Math.max(0, remaining)}
                </span>
                <span className="text-warm-white/60 text-sm">日</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${getLevelBgClass(profile.targetLevel)}`}>
                {profile.targetLevel}
              </span>
              <span className="text-warm-white/70 text-sm">{formatDate(profile.examDate)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-pale-gold" />
              <input
                type="date"
                value={profile.examDate}
                onChange={e => updateProfile({ examDate: e.target.value })}
                className="rounded-lg border border-ink-light bg-ink px-3 py-1.5 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
              />
            </div>

            <div className="sakura-divider w-full" />

            <div className="w-full">
              <h3 className="font-sans-jp text-sm font-medium text-pale-gold mb-3">
                1日あたりの必要学習量
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-ink-light bg-ink/60 p-3 text-center">
                  <div className="text-2xl font-bold text-vermillion">{dailyKanji}</div>
                  <div className="text-xs text-warm-white/60">漢字 / 日</div>
                  <div className="text-xs text-warm-white/40">残り {unlearnedKanji} 字</div>
                </div>
                <div className="rounded-lg border border-ink-light bg-ink/60 p-3 text-center">
                  <div className="text-2xl font-bold text-vermillion">{dailyGrammar}</div>
                  <div className="text-xs text-warm-white/60">文法 / 日</div>
                  <div className="text-xs text-warm-white/40">残り {unlearnedGrammar} 項</div>
                </div>
                <div className="rounded-lg border border-ink-light bg-ink/60 p-3 text-center">
                  <div className="text-2xl font-bold text-vermillion">{dueVocab.length}</div>
                  <div className="text-xs text-warm-white/60">復習語彙</div>
                  <div className="text-xs text-warm-white/40">今日の予定</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle size={48} className="text-pale-gold/50" />
            <p className="text-warm-white/70">試験日が設定されていません</p>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-pale-gold" />
              <input
                type="date"
                value={profile.examDate || todayISO()}
                onChange={e => updateProfile({ examDate: e.target.value })}
                className="rounded-lg border border-ink-light bg-ink px-3 py-1.5 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                  if (input?.value) updateProfile({ examDate: input.value });
                }}
                className="rounded-lg bg-vermillion px-4 py-1.5 text-sm font-medium text-white hover:bg-vermillion/80 transition"
              >
                設定
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink-light bg-ink-light/50 p-6 card-shine">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif-jp text-xl font-bold text-pale-gold">模擬試験記録</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-white hover:bg-vermillion/80 transition"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'キャンセル' : '記録を追加'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 rounded-xl border border-pale-gold/20 bg-ink/60 p-4 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-warm-white/60 mb-1 block">日付</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-warm-white/60 mb-1 block">レベル</label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value as JLPTLevel)}
                  className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
                >
                  {JLPT_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {sectionFields.map(({ label, score, setScore, total, setTotal }) => (
                <div key={label} className="rounded-lg border border-ink-light bg-ink/40 p-2">
                  <span className="text-xs text-pale-gold">{label}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number" min={0}
                      value={score}
                      onChange={e => setScore(Number(e.target.value))}
                      className="w-16 rounded border border-ink-light bg-ink px-2 py-1 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
                    />
                    <span className="text-warm-white/40">/</span>
                    <input
                      type="number" min={1}
                      value={total}
                      onChange={e => setTotal(Number(e.target.value))}
                      className="w-16 rounded border border-ink-light bg-ink px-2 py-1 text-sm text-warm-white focus:border-pale-gold focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-lg bg-vermillion py-2 text-sm font-medium text-white hover:bg-vermillion/80 transition"
            >
              保存
            </button>
          </div>
        )}

        {mockExams.length >= 2 && (
          <div className="mb-6">
            <h3 className="font-sans-jp text-sm font-medium text-pale-gold mb-3">スコア推移</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#faf3e0', fontSize: 12 }}
                  axisLine={{ stroke: '#2d2d4a' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#faf3e0', fontSize: 12 }}
                  axisLine={{ stroke: '#2d2d4a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2d2d4a',
                    color: '#faf3e0',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ color: '#faf3e0' }} />
                {SECTION_KEYS.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={SECTION_COLORS[key]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: SECTION_COLORS[key] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {mockExams.length === 0 ? (
          <p className="text-center text-warm-white/50 py-8">模擬試験記録がありません</p>
        ) : (
          <div className="space-y-2">
            {[...mockExams]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(exam => {
                const expanded = expandedId === exam.id;
                const pass = isPass(exam);
                const sections = [
                  { label: '文字・語彙', score: exam.vocabularyScore, total: exam.vocabularyTotal, color: SECTION_COLORS['文字・語彙'] },
                  { label: '文法', score: exam.grammarScore, total: exam.grammarTotal, color: SECTION_COLORS['文法'] },
                  { label: '読解', score: exam.readingScore, total: exam.readingTotal, color: SECTION_COLORS['読解'] },
                  { label: '聴解', score: exam.listeningScore, total: exam.listeningTotal, color: SECTION_COLORS['聴解'] },
                ];
                return (
                  <div key={exam.id} className="rounded-lg border border-ink-light bg-ink/40 overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-ink/60 transition"
                      onClick={() => setExpandedId(expanded ? null : exam.id)}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-warm-white/70">{formatDate(exam.date)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${getLevelBgClass(exam.level)}`}>
                          {exam.level}
                        </span>
                        <span className="text-sm font-medium text-warm-white">
                          {totalScore(exam)} / {totalPossible(exam)}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pass ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                          {pass ? '合格' : '不合格'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {expanded
                          ? <ChevronUp size={16} className="text-warm-white/50" />
                          : <ChevronDown size={16} className="text-warm-white/50" />
                        }
                        <button
                          onClick={e => { e.stopPropagation(); deleteMockExam(exam.id); }}
                          className="rounded p-1 text-warm-white/40 hover:text-red-400 hover:bg-red-900/20 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="border-t border-ink-light p-3 space-y-2 animate-fade-in-up">
                        {sections.map(s => (
                          <div key={s.label} className="flex items-center gap-2">
                            <span className="text-xs text-warm-white/60 w-20 shrink-0">{s.label}</span>
                            <div className="flex-1 h-3 rounded-full bg-ink-light overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${s.total > 0 ? (s.score / s.total) * 100 : 0}%`,
                                  backgroundColor: s.color,
                                }}
                              />
                            </div>
                            <span className="text-xs text-warm-white/70 w-14 text-right">
                              {s.score}/{s.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <Link
        to="/weakness-analysis"
        className="flex items-center justify-between rounded-2xl border border-ink-light bg-ink-light/50 p-5 card-shine hover:border-pale-gold/40 transition group"
      >
        <div>
          <h2 className="font-serif-jp text-lg font-bold text-pale-gold">薄弱項分析</h2>
          <p className="text-sm text-warm-white/50">弱点を特定し、強化計画を立てる</p>
        </div>
        <ArrowRight size={24} className="text-warm-white/30 group-hover:text-vermillion transition" />
      </Link>
    </div>
  );
}
