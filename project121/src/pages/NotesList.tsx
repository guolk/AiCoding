import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  ArrowRight,
  Music,
  Calendar
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import type { ListeningNote, Work } from '../../shared/types';

export function NotesList() {
  const navigate = useNavigate();
  const { notes, works, fetchNotes, fetchWorks } = useAppStore();
  const [filterWork, setFilterWork] = useState('all');

  useEffect(() => {
    fetchNotes();
    fetchWorks();
  }, []);

  const getWorkById = (workId: string): Work | undefined =>
    works.find((w) => w.id === workId);

  const filteredNotes = notes
    .filter((note) => {
      if (filterWork !== 'all') {
        return note.workId === filterWork;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-burgundy-800 mb-2">
            欣赏笔记
          </h1>
          <p className="text-gray-600">共 {notes.length} 条聆听记录</p>
        </div>
        <button
          onClick={() => navigate('/notes/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      {notes.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <span className="text-sm text-gray-600">按作品筛选:</span>
            <select
              value={filterWork}
              onChange={(e) => setFilterWork(e.target.value)}
              className="input-field min-w-[200px]"
            >
              <option value="all">全部作品</option>
              {works.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.composer}: {work.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-burgundy-400" />}
          title="暂无欣赏笔记"
          description="记录您聆听古典音乐的感受、分析和思考，构建个人音乐学习日志。"
          action={{
            label: '创建第一条笔记',
            onClick: () => navigate('/notes/new')
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const work = getWorkById(note.workId);
            return (
              <NoteCard key={note.id} note={note} work={work} />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: ListeningNote;
  work?: Work;
}

function NoteCard({ note, work }: NoteCardProps) {
  return (
    <Link to={`/notes/${note.id}`} className="card hover:shadow-gold transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-burgundy-800">
                {work?.composer}
              </h3>
              <p className="text-sm text-gray-600">{work?.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(note.listenDate)}
            </div>
          </div>
        </div>

        {note.overallImpression && (
          <p className="text-gray-700 mb-4 line-clamp-2">
            {note.overallImpression}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-parchment-100">
          <div className="flex flex-wrap gap-2">
            {note.movementNotes.length > 0 && (
              <span className="text-xs bg-burgundy-50 text-burgundy-700 px-2 py-1 rounded">
                {note.movementNotes.length} 个乐章笔记
              </span>
            )}
            {note.highlightMoments.length > 0 && (
              <span className="text-xs bg-gold-50 text-gold-800 px-2 py-1 rounded">
                {note.highlightMoments.length} 个精彩时刻
              </span>
            )}
            {note.structureAnalysis && (
              <span className="text-xs bg-parchment-100 text-parchment-800 px-2 py-1 rounded">
                结构分析
              </span>
            )}
          </div>
          <span className="text-burgundy-600 text-sm flex items-center gap-1">
            查看详情 <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
