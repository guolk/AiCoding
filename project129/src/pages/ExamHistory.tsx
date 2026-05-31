import { useState, useCallback } from 'react';
import {
  Plus, Trash2, CheckCircle2, XCircle, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getLevelBgClass } from '@/utils/helpers';
import type { JLPTLevel } from '@/types';

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const SECTION_MAX = 60;

const SECTION_COLORS = {
  vocabularyGrammar: '#d4a574',
  reading: '#4a90d9',
  listening: '#c0392b',
};

function SectionBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.min((score / SECTION_MAX) * 100, 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-warm-white/50">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 shrink-0 text-right text-warm-white/70">{score}</span>
    </div>
  );
}

export default function ExamHistory() {
  const records = useAppStore((s) => s.examHistory);
  const addExamHistory = useAppStore((s) => s.addExamHistory);
  const deleteExamHistory = useAppStore((s) => s.deleteExamHistory);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    level: 'N3' as JLPTLevel,
    totalScore: 0,
    vocabularyGrammarScore: 0,
    readingScore: 0,
    listeningScore: 0,
    passed: false,
  });

  const resetForm = useCallback(() => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      level: 'N3',
      totalScore: 0,
      vocabularyGrammarScore: 0,
      readingScore: 0,
      listeningScore: 0,
      passed: false,
    });
    setShowForm(false);
  }, []);

  const handleSave = useCallback(() => {
    addExamHistory(form);
    resetForm();
  }, [form, addExamHistory, resetForm]);

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(5),
      totalScore: r.totalScore,
      語彙文法: r.vocabularyGrammarScore,
      読解: r.readingScore,
      聴解: r.listeningScore,
      level: r.level,
    }));

  const inputCls = 'w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none';

  return (
    <div className="animate-fade-in-up space-y-8">
      <h1 className="font-serif-jp text-2xl font-bold text-pale-gold">試験成績</h1>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-jp text-lg text-pale-gold">成績記録</h2>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-vermillion px-3 py-1.5 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80"
          >
            <Plus size={16} /> 成績を追加
          </button>
        </div>

        {showForm && (
          <div className="card-shine rounded-xl border border-pale-gold/20 bg-ink-light p-4 animate-fade-in-up space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-pale-gold">新規成績</span>
              <button onClick={resetForm} className="text-warm-white/50 hover:text-warm-white text-lg leading-none">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-warm-white/50">日付</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-white/50">レベル</label>
                <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as JLPTLevel }))} className={inputCls}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-warm-white/50">総合スコア</label>
              <input type="number" min={0} value={form.totalScore || ''} onChange={(e) => setForm((f) => ({ ...f, totalScore: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-warm-white/50">語彙・文法</label>
                <input type="number" min={0} value={form.vocabularyGrammarScore || ''} onChange={(e) => setForm((f) => ({ ...f, vocabularyGrammarScore: Number(e.target.value) }))} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-white/50">読解</label>
                <input type="number" min={0} value={form.readingScore || ''} onChange={(e) => setForm((f) => ({ ...f, readingScore: Number(e.target.value) }))} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-white/50">聴解</label>
                <input type="number" min={0} value={form.listeningScore || ''} onChange={(e) => setForm((f) => ({ ...f, listeningScore: Number(e.target.value) }))} placeholder="0" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-warm-white/50">合格 / 不合格</label>
              <button
                onClick={() => setForm((f) => ({ ...f, passed: !f.passed }))}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.passed ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
              >
                {form.passed ? <><CheckCircle2 size={16} /> 合格</> : <><XCircle size={16} /> 不合格</>}
              </button>
            </div>
            <button
              onClick={handleSave}
              className="rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80"
            >
              保存
            </button>
          </div>
        )}

        {sorted.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-warm-white/40">試験記録がまだありません</p>
        )}

        <div className="relative space-y-0">
          {sorted.map((r, i) => (
            <div key={r.id} className="relative flex gap-4 animate-fade-in-up">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 shrink-0 rounded-full ${getLevelBgClass(r.level)}`} />
                {i < sorted.length - 1 && <div className="w-px flex-1 bg-pale-gold/20" />}
              </div>
              <div className="card-shine mb-4 flex-1 rounded-xl border border-pale-gold/10 bg-ink-light p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-warm-white/40">{formatDate(r.date)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getLevelBgClass(r.level)}`}>{r.level}</span>
                    {r.passed
                      ? <CheckCircle2 size={16} className="text-green-400" />
                      : <XCircle size={16} className="text-red-400" />}
                  </div>
                  <button onClick={() => deleteExamHistory(r.id)} className="rounded-lg p-1 text-warm-white/40 hover:text-vermillion"><Trash2 size={14} /></button>
                </div>
                <p className="mt-2 font-serif-jp text-3xl font-bold text-warm-white">{r.totalScore}<span className="text-sm font-normal text-warm-white/40"> / 180</span></p>
                <div className="mt-3 space-y-1.5">
                  <SectionBar label="語彙・文法" score={r.vocabularyGrammarScore} color={SECTION_COLORS.vocabularyGrammar} />
                  <SectionBar label="読解" score={r.readingScore} color={SECTION_COLORS.reading} />
                  <SectionBar label="聴解" score={r.listeningScore} color={SECTION_COLORS.listening} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sakura-divider" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-pale-gold" />
          <h2 className="font-serif-jp text-lg text-pale-gold">成績推移</h2>
        </div>

        {records.length < 2 ? (
          <p className="py-8 text-center text-sm text-warm-white/40">傾向分析には2回以上の試験記録が必要です</p>
        ) : (
          <div className="space-y-6">
            <div className="card-shine rounded-xl border border-pale-gold/10 bg-ink-light p-4">
              <h3 className="mb-3 text-sm font-medium text-pale-gold/80">総合スコア推移</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                  <XAxis dataKey="date" tick={{ fill: '#faf3e0', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#faf3e0', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d2d4a', border: '1px solid #d4a574', borderRadius: 8, color: '#faf3e0' }}
                    labelStyle={{ color: '#d4a574' }}
                  />
                  <Line type="monotone" dataKey="totalScore" stroke="#d4a574" strokeWidth={2} dot={{ fill: '#d4a574', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card-shine rounded-xl border border-pale-gold/10 bg-ink-light p-4">
              <h3 className="mb-3 text-sm font-medium text-pale-gold/80">セクション別スコア</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                  <XAxis dataKey="date" tick={{ fill: '#faf3e0', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#faf3e0', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d2d4a', border: '1px solid #d4a574', borderRadius: 8, color: '#faf3e0' }}
                    labelStyle={{ color: '#d4a574' }}
                  />
                  <Legend wrapperStyle={{ color: '#faf3e0' }} />
                  <Bar dataKey="語彙文法" fill={SECTION_COLORS.vocabularyGrammar} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="読解" fill={SECTION_COLORS.reading} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="聴解" fill={SECTION_COLORS.listening} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
