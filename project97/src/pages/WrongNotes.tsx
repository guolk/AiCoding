import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Filter, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ErrorReasonBadge } from '../components/common/TopicBadge';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { TopicBadge } from '../components/common/TopicBadge';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useQuestionStore } from '../stores/questionStore';
import { useProgressAnalysis } from '../stores/progressStore';
import type { ErrorReason } from '../types';
import { format, isToday, isPast } from 'date-fns';

const errorReasons: { value: ErrorReason | 'all'; label: string }[] = [
  { value: 'all', label: '全部原因' },
  { value: 'concept', label: '概念不清' },
  { value: 'calculation', label: '计算失误' },
  { value: 'approach', label: '思路跑偏' },
  { value: 'careless', label: '粗心' },
];

export function WrongNotes() {
  const { wrongNotes, getDueNotes, reviewWrongNote } = useWrongNoteStore();
  const { getQuestion } = useQuestionStore();
  const { getErrorStats } = useProgressAnalysis();

  const [filterReason, setFilterReason] = useState<ErrorReason | 'all'>('all');
  const [showMastered, setShowMastered] = useState(false);

  const dueNotes = getDueNotes();
  const errorStats = getErrorStats();

  const filteredNotes = wrongNotes.filter((note) => {
    if (!showMastered && note.isMastered) return false;
    if (filterReason !== 'all' && note.errorReason !== filterReason) return false;
    return true;
  });

  const handleQuickReview = (noteId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    reviewWrongNote(noteId, quality);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">错题本</h1>
        <p className="text-text-secondary mt-1">共 {wrongNotes.length} 道错题，已掌握 {wrongNotes.filter((n) => n.isMastered).length} 道</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {errorStats.map((stat) => (
          <Card key={stat.reason} className="text-center">
            <p className="text-3xl font-bold text-text-primary">{stat.count}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      {dueNotes.length > 0 && (
        <Card className="bg-danger/5 border-danger/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-danger" />
              <span className="text-text-primary font-medium">
                有 {dueNotes.length} 道错题需要复习
              </span>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value as ErrorReason | 'all')}
              className="px-3 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
            >
              {errorReasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMastered}
              onChange={(e) => setShowMastered(e.target.checked)}
              className="w-4 h-4 rounded border-text-muted text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">显示已掌握的错题</span>
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          const question = getQuestion(note.questionId);
          if (!question) return null;

          const isDue = isPast(new Date(note.nextReviewDate)) && !note.isMastered;

          return (
            <Card key={note.id} className={note.isMastered ? 'opacity-60' : ''}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TopicBadge topic={question.topic} />
                    <DifficultyBadge difficulty={question.difficulty} />
                    {note.isMastered && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        已掌握
                      </span>
                    )}
                  </div>
                  <ErrorReasonBadge reason={note.errorReason} />
                </div>

                <p className="text-text-primary font-mono text-sm line-clamp-2">
                  {question.content}
                </p>

                {note.errorReasonText && (
                  <p className="text-sm text-text-muted">
                    <span className="text-text-secondary">错误原因：</span>
                    {note.errorReasonText}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>复习 {note.reviewCount} 次</span>
                  <span className={isDue ? 'text-danger' : ''}>
                    下次复习: {format(new Date(note.nextReviewDate), 'yyyy-MM-dd')}
                  </span>
                </div>

                {!note.isMastered && (
                  <div className="flex gap-2 pt-2 border-t border-background-hover">
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1"
                      onClick={() => handleQuickReview(note.id, 4)}
                    >
                      掌握
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleQuickReview(note.id, 2)}
                    >
                      再复习
                    </Button>
                    <Link to={`/questions/${question.id}`} className="flex-1">
                      <Button size="sm" variant="ghost" className="w-full">
                        查看
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">没有符合条件的错题</p>
          </Card>
        </Card>
      )}
    </div>
  );
}
