import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelBgClass, formatDate } from '@/utils/helpers';

export default function VocabularySentences() {
  const vocabulary = useAppStore((s) => s.vocabulary);
  const sentences = useAppStore((s) => s.sentences);
  const addSentence = useAppStore((s) => s.addSentence);
  const deleteSentence = useAppStore((s) => s.deleteSentence);

  const [vocabId, setVocabId] = useState(vocabulary[0]?.id ?? '');
  const [sentenceText, setSentenceText] = useState('');
  const [translationText, setTranslationText] = useState('');

  const vocabMap = useMemo(() => {
    const m = new Map<string, typeof vocabulary[0]>();
    vocabulary.forEach((v) => m.set(v.id, v));
    return m;
  }, [vocabulary]);

  const grouped = useMemo(() => {
    const sorted = [...sentences].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups: Record<string, typeof sorted> = {};
    sorted.forEach((s) => {
      if (!groups[s.createdAt]) groups[s.createdAt] = [];
      groups[s.createdAt].push(s);
    });
    return groups;
  }, [sentences]);

  const handleSubmit = () => {
    if (!vocabId || !sentenceText.trim() || !translationText.trim()) return;
    addSentence(vocabId, sentenceText.trim(), translationText.trim());
    setSentenceText('');
    setTranslationText('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この例文を削除しますか？')) {
      deleteSentence(id);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex gap-2 border-b border-pale-gold/20">
        <Link to="/vocabulary" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
          語彙一覧
        </Link>
        <Link to="/vocabulary/review" className="px-4 py-2 text-sm font-medium text-warm-white/60 hover:text-warm-white transition-colors">
          復習
        </Link>
        <Link to="/vocabulary/sentences" className="border-b-2 border-vermillion px-4 py-2 text-sm font-medium text-vermillion">
          例文
        </Link>
      </div>

      <div className="rounded-xl border border-pale-gold/20 bg-ink-light p-5">
        <h2 className="font-serif-jp text-lg font-bold text-pale-gold">例文を作る</h2>
        <div className="mt-4 space-y-3">
          <select
            value={vocabId}
            onChange={(e) => setVocabId(e.target.value)}
            className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white focus:border-pale-gold/50 focus:outline-none"
          >
            <option value="">単語を選択</option>
            {vocabulary.map((v) => (
              <option key={v.id} value={v.id}>
                {v.word}（{v.reading}）- {v.meaning}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={sentenceText}
            onChange={(e) => setSentenceText(e.target.value)}
            placeholder="例文（日本語）"
            className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none"
          />
          <input
            type="text"
            value={translationText}
            onChange={(e) => setTranslationText(e.target.value)}
            placeholder="翻訳"
            className="w-full rounded-lg border border-pale-gold/20 bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/40 focus:border-pale-gold/50 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!vocabId || !sentenceText.trim() || !translationText.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-vermillion px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-vermillion/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            追加
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-2 text-sm text-warm-white/50">
              <Calendar size={14} />
              <span>{formatDate(date)}</span>
            </div>
            <div className="mt-2 space-y-2 border-l-2 border-pale-gold/20 pl-4">
              {items.map((s) => {
                const v = vocabMap.get(s.vocabularyId);
                return (
                  <div
                    key={s.id}
                    className="rounded-lg border border-pale-gold/10 bg-ink-light p-4 transition-colors hover:border-pale-gold/25"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif-jp text-lg font-bold text-warm-white">{s.sentence}</p>
                        <p className="mt-1 text-sm text-warm-white/70">{s.translation}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="shrink-0 rounded-md p-1.5 text-warm-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {v && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getLevelBgClass(v.level)}`}>
                          {v.level}
                        </span>
                        <span className="text-xs text-pale-gold">{v.word}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sentences.length === 0 && (
        <div className="py-12 text-center text-warm-white/40">
          <p className="font-serif-jp text-lg">例文がありません</p>
          <p className="mt-1 text-sm">上のフォームから例文を作成してください</p>
        </div>
      )}
    </div>
  );
}
