import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { JLPTLevel } from '@/types';

const levels: { value: JLPTLevel; label: string; color: string }[] = [
  { value: 'N5', label: 'N5', color: 'bg-n5-green' },
  { value: 'N4', label: 'N4', color: 'bg-n4-blue' },
  { value: 'N3', label: 'N3', color: 'bg-n3-purple' },
  { value: 'N2', label: 'N2', color: 'bg-n2-amber' },
  { value: 'N1', label: 'N1', color: 'bg-n1-crimson' },
];

export default function SetupModal() {
  const setupProfile = useAppStore((s) => s.setupProfile);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N3');
  const [examDate, setExamDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) return;
    setupProfile(selectedLevel, examDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md animate-fade-in-up rounded-2xl border border-pale-gold/30 bg-ink-light p-8 shadow-2xl">
        <h2 className="font-serif-jp text-center text-2xl font-bold text-pale-gold">
          JLPT学習トラッカーへようこそ
        </h2>

        <div className="sakura-divider my-6" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-warm-white/80">
              目標レベルを選択
            </label>
            <div className="flex gap-2">
              {levels.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedLevel(value)}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition-all duration-200 ${
                    color
                  } ${
                    selectedLevel === value
                      ? 'ring-2 ring-pale-gold ring-offset-2 ring-offset-ink-light scale-105'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-warm-white/80">
              試験日
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full rounded-lg border border-pale-gold/20 bg-ink px-4 py-2.5 text-sm text-warm-white outline-none transition-colors focus:border-pale-gold"
            />
          </div>

          <button
            type="submit"
            disabled={!examDate}
            className="mt-2 rounded-lg bg-vermillion py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-vermillion-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            始めましょう
          </button>
        </form>
      </div>
    </div>
  );
}
