import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Star, Pencil, Trash2, Mic, MicOff, Play, Pause,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, todayISO } from '@/utils/helpers';
import type { ListeningSourceType } from '@/types';

const TABS = [
  { key: 'listening' as const, label: '精聴' },
  { key: 'speaking' as const, label: 'スピーキング' },
  { key: 'diary' as const, label: '日記' },
];

type TabKey = (typeof TABS)[number]['key'];

const TYPE_BADGE: Record<ListeningSourceType, { label: string; cls: string }> = {
  nhk: { label: 'NHK', cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  drama: { label: 'ドラマ', cls: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  anime: { label: 'アニメ', cls: 'bg-pink-500/20 text-pink-400 border border-pink-500/30' },
  other: { label: 'その他', cls: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
};

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={18}
          className={`transition-colors ${n <= value ? 'fill-pale-gold text-pale-gold' : 'text-warm-white/30'} ${onChange ? 'cursor-pointer hover:text-pale-gold' : ''}`}
          onClick={() => onChange?.(n)}
        />
      ))}
    </div>
  );
}

function IntensiveListeningTab() {
  const records = useAppStore((s) => s.listeningRecords);
  const addListeningRecord = useAppStore((s) => s.addListeningRecord);
  const updateListeningRecord = useAppStore((s) => s.updateListeningRecord);
  const deleteListeningRecord = useAppStore((s) => s.deleteListeningRecord);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    title: '',
    source: '',
    type: 'other' as ListeningSourceType,
    completionPercent: 0,
    comprehensionScore: 0,
    notes: '',
  });

  const resetForm = useCallback(() => {
    setForm({ title: '', source: '', type: 'other', completionPercent: 0, comprehensionScore: 0, notes: '' });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const startEdit = useCallback((r: typeof records[number]) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      source: r.source,
      type: r.type,
      completionPercent: r.completionPercent,
      comprehensionScore: r.comprehensionScore,
      notes: r.notes,
    });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) return;
    if (editingId) {
      updateListeningRecord(editingId, form);
    } else {
      addListeningRecord({ ...form, date: todayISO() });
    }
    resetForm();
  }, [form, editingId, addListeningRecord, updateListeningRecord, resetForm]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif-jp text-lg text-pale-gold">精聴記録</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-vermillion px-3 py-1.5 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80"
        >
          <Plus size={16} /> 記録を追加
        </button>
      </div>

      {showForm && (
        <div className="card-shine rounded-xl border border-pale-gold/20 bg-ink-light p-4 animate-fade-in-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-pale-gold">{editingId ? '記録を編集' : '新規記録'}</span>
            <button onClick={resetForm} className="text-warm-white/50 hover:text-warm-white"><X size={18} /></button>
          </div>
          <input
            placeholder="タイトル"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none"
          />
          <input
            placeholder="ソース (例: NHKニュース)"
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none"
          />
          <div className="flex gap-2">
            {(['nhk', 'drama', 'anime', 'other'] as ListeningSourceType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.type === t ? TYPE_BADGE[t].cls + ' ring-1 ring-current' : 'bg-ink text-warm-white/50 hover:text-warm-white/70'}`}
              >
                {TYPE_BADGE[t].label}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-warm-white/60">
              <span>完了度</span><span>{form.completionPercent}%</span>
            </div>
            <input
              type="range" min={0} max={100}
              value={form.completionPercent}
              onChange={(e) => setForm((f) => ({ ...f, completionPercent: Number(e.target.value) }))}
              className="w-full accent-vermillion"
            />
          </div>
          <div>
            <span className="mb-1 block text-xs text-warm-white/60">理解度</span>
            <Stars value={form.comprehensionScore} onChange={(v) => setForm((f) => ({ ...f, comprehensionScore: v }))} />
          </div>
          <textarea
            placeholder="メモ"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80 disabled:opacity-40"
          >
            保存
          </button>
        </div>
      )}

      {records.length === 0 && !showForm && (
        <p className="py-8 text-center text-sm text-warm-white/40">精聴記録がまだありません</p>
      )}

      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.id} className="card-shine rounded-xl border border-pale-gold/10 bg-ink-light p-4 animate-fade-in-up">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-warm-white">{r.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_BADGE[r.type].cls}`}>
                    {TYPE_BADGE[r.type].label}
                  </span>
                </div>
                {r.source && <p className="mt-0.5 text-xs text-warm-white/50">{r.source}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(r)} className="rounded-lg p-1.5 text-warm-white/40 hover:bg-ink hover:text-pale-gold"><Pencil size={14} /></button>
                <button onClick={() => deleteListeningRecord(r.id)} className="rounded-lg p-1.5 text-warm-white/40 hover:bg-ink hover:text-vermillion"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[10px] text-warm-white/50">
                <span>完了度</span><span>{r.completionPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                <div className="h-full rounded-full bg-vermillion transition-all" style={{ width: `${r.completionPercent}%` }} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-warm-white/50">理解度</span>
              <Stars value={r.comprehensionScore} />
            </div>
            {r.notes && (
              <div className="mt-2">
                <button onClick={() => toggleExpand(r.id)} className="flex items-center gap-1 text-xs text-pale-gold/70 hover:text-pale-gold">
                  {expandedIds.has(r.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  メモ
                </button>
                {expandedIds.has(r.id) && (
                  <p className="mt-1 text-xs text-warm-white/60 leading-relaxed">{r.notes}</p>
                )}
              </div>
            )}
            <p className="mt-2 text-[10px] text-warm-white/30">{formatDate(r.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeakingTab() {
  const records = useAppStore((s) => s.speakingRecords);
  const addSpeakingRecord = useAppStore((s) => s.addSpeakingRecord);
  const deleteSpeakingRecord = useAppStore((s) => s.deleteSpeakingRecord);

  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [audioBase64, setAudioBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', notes: '', selfRating: 0 });
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    };
  }, [previewUrl]);

  const startRecording = async () => {
    try {
      setRecordError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          setAudioBase64(reader.result as string);
          const audio = new Audio(url);
          previewAudioRef.current = audio;
          audio.play();
        };
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordError('ブラウザが録音をサポートしていません');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !audioBase64) return;
    addSpeakingRecord({ title: form.title, audioData: audioBase64, selfRating: form.selfRating, notes: form.notes, date: todayISO() });
    setForm({ title: '', notes: '', selfRating: 0 });
    setAudioBase64('');
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
  };

  const playRecord = (id: string, audioData: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(audioData);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(id);
  };

  const resetRecording = () => {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    setAudioBase64('');
    setForm({ title: '', notes: '', selfRating: 0 });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif-jp text-lg text-pale-gold">スピーキング練習</h2>

      <div className="card-shine rounded-xl border border-pale-gold/20 bg-ink-light p-6 text-center">
        {recordError && <p className="mb-3 text-sm text-vermillion">{recordError}</p>}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all ${
            isRecording ? 'bg-vermillion shadow-lg shadow-vermillion/30' : 'bg-ink border-2 border-pale-gold/30 hover:border-pale-gold'
          }`}
        >
          {isRecording ? <MicOff size={32} className="text-warm-white" /> : <Mic size={32} className="text-pale-gold" />}
        </button>

        {isRecording && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-vermillion" />
            <span className="text-sm text-vermillion">録音中...</span>
          </div>
        )}

        {previewUrl && !isRecording && (
          <div className="mt-4 space-y-3 animate-fade-in-up">
            <p className="text-xs text-warm-white/50">録音完了 — 自動再生中</p>
            <div className="space-y-2 text-left">
              <input
                placeholder="タイトル"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none"
              />
              <div>
                <span className="mb-1 block text-xs text-warm-white/60">自己評価</span>
                <Stars value={form.selfRating} onChange={(v) => setForm((f) => ({ ...f, selfRating: v }))} />
              </div>
              <textarea
                placeholder="メモ"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || !audioBase64}
                  className="rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80 disabled:opacity-40"
                >
                  保存
                </button>
                <button onClick={resetRecording} className="rounded-lg border border-pale-gold/20 px-4 py-2 text-sm text-warm-white/60 hover:text-warm-white">
                  やり直す
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-serif-jp text-sm text-pale-gold/80">過去の記録</h3>
        {records.length === 0 && <p className="py-4 text-center text-sm text-warm-white/40">スピーキング記録がまだありません</p>}
        {records.map((r) => (
          <div key={r.id} className="card-shine flex items-center gap-3 rounded-xl border border-pale-gold/10 bg-ink-light p-3 animate-fade-in-up">
            <button
              onClick={() => playRecord(r.id, r.audioData)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-pale-gold transition-colors hover:bg-vermillion hover:text-warm-white"
            >
              {playingId === r.id ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-warm-white">{r.title}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-warm-white/40">{formatDate(r.date)}</span>
                <Stars value={r.selfRating} />
              </div>
            </div>
            <button onClick={() => deleteSpeakingRecord(r.id)} className="shrink-0 rounded-lg p-1.5 text-warm-white/40 hover:text-vermillion"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaryTab() {
  const entries = useAppStore((s) => s.diaryEntries);
  const addDiaryEntry = useAppStore((s) => s.addDiaryEntry);
  const updateDiaryEntry = useAppStore((s) => s.updateDiaryEntry);
  const deleteDiaryEntry = useAppStore((s) => s.deleteDiaryEntry);

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const existingEntry = entries.find((e) => e.date === selectedDate);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
      setEditingId(existingEntry.id);
    } else {
      setContent('');
      setEditingId(null);
    }
  }, [selectedDate, existingEntry]);

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    if (editingId) {
      updateDiaryEntry(editingId, content);
    } else {
      addDiaryEntry(content);
    }
  };

  const loadEntry = (entry: typeof entries[number]) => {
    setSelectedDate(entry.date);
    setContent(entry.content);
    setEditingId(entry.id);
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <h2 className="font-serif-jp text-lg text-pale-gold">日記</h2>

      <div className="card-shine rounded-xl border border-pale-gold/20 bg-ink-light p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => shiftDate(-1)} className="rounded-lg p-1 text-warm-white/50 hover:text-pale-gold"><ChevronLeft size={18} /></button>
          <span className="font-serif-jp text-sm text-pale-gold">{formatDate(selectedDate)}</span>
          <button onClick={() => shiftDate(1)} className="rounded-lg p-1 text-warm-white/50 hover:text-pale-gold"><ChevronRight size={18} /></button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の日本語練習を書きましょう..."
          className="w-full rounded-lg border border-ink-light bg-ink px-3 py-2 text-sm text-warm-white placeholder:text-warm-white/30 focus:border-pale-gold focus:outline-none resize-none"
          style={{ minHeight: 300 }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-warm-white/40">{content.length} 文字</span>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="rounded-lg bg-vermillion px-4 py-2 text-sm font-medium text-warm-white transition-colors hover:bg-vermillion/80 disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-serif-jp text-sm text-pale-gold/80">過去の日記</h3>
        {sorted.length === 0 && <p className="py-4 text-center text-sm text-warm-white/40">日記がまだありません</p>}
        {sorted.map((e) => (
          <div
            key={e.id}
            className={`card-shine rounded-xl border bg-ink-light p-3 cursor-pointer transition-colors ${e.date === selectedDate ? 'border-pale-gold/40' : 'border-pale-gold/10 hover:border-pale-gold/20'}`}
            onClick={() => loadEntry(e)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-warm-white/40">{formatDate(e.date)}</p>
                <p className="mt-0.5 truncate text-sm text-warm-white/80">{e.content.slice(0, 50)}</p>
                <p className="mt-0.5 text-[10px] text-warm-white/30">{e.wordCount} 語</p>
              </div>
              <button
                onClick={(ev) => { ev.stopPropagation(); deleteDiaryEntry(e.id); }}
                className="shrink-0 rounded-lg p-1.5 text-warm-white/40 hover:text-vermillion"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Listening() {
  const [activeTab, setActiveTab] = useState<TabKey>('listening');

  return (
    <div className="animate-fade-in-up space-y-4">
      <h1 className="font-serif-jp text-2xl font-bold text-pale-gold">听说練習</h1>

      <div className="flex gap-1 rounded-xl bg-ink-light p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
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

      {activeTab === 'listening' && <IntensiveListeningTab />}
      {activeTab === 'speaking' && <SpeakingTab />}
      {activeTab === 'diary' && <DiaryTab />}
    </div>
  );
}
