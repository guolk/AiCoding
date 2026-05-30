import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Music2,
  Heart,
  Clock,
  BookMarked,
  History,
  Lightbulb
} from 'lucide-react';
import { noteApi, workApi, versionApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import type { ListeningNote, Work, Version } from '../../shared/types';

export function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<ListeningNote | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [version, setVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const noteData = await noteApi.getById(id);
    setNote(noteData);

    if (noteData) {
      const workData = await workApi.getById(noteData.workId);
      setWork(workData);

      if (noteData.versionId) {
        const versionData = await versionApi.getById(noteData.versionId);
        setVersion(versionData);
      }
    }
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/notes"
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-burgundy-800">
            {work?.title}
          </h1>
          <p className="text-gray-600">{work?.composer}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>聆听日期: {formatDate(note.listenDate)}</p>
          {version && (
            <p className="text-gold-700">
              版本: {version.conductor} / {version.orchestra}
            </p>
          )}
        </div>
      </div>

      {note.movementNotes.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            <h2 className="font-display text-lg font-medium">乐章笔记</h2>
          </div>
          <div className="divide-y divide-parchment-100">
            {note.movementNotes.map((mNote, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-burgundy-100 text-burgundy-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {mNote.movementNumber}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-burgundy-800 mb-2">
                      {mNote.title}
                    </h3>
                    {mNote.impression && (
                      <p className="text-gray-700 mb-2">
                        {mNote.impression}
                      </p>
                    )}
                    {mNote.structureNotes && (
                      <p className="text-sm text-gray-600 bg-parchment-50 p-3 rounded">
                        结构分析: {mNote.structureNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {note.emotionalJourney && (
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <h2 className="font-display text-lg font-medium">情感旅程</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">{note.emotionalJourney}</p>
            </div>
          </div>
        )}

        {note.highlightMoments.length > 0 && (
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="font-display text-lg font-medium">精彩时刻</h2>
            </div>
            <div className="p-6 space-y-3">
              {note.highlightMoments.map((moment, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gold-50 rounded-lg"
                >
                  <span className="text-gold-700 font-mono text-sm font-medium flex-shrink-0">
                    {moment.timestamp}
                  </span>
                  <p className="text-gray-700 text-sm">{moment.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {note.structureAnalysis && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
            <h2 className="font-display text-lg font-medium">结构分析</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {note.structureAnalysis}
            </p>
          </div>
        </div>
      )}

      {note.historicalNotes && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="font-display text-lg font-medium">历史背景笔记</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {note.historicalNotes}
            </p>
          </div>
        </div>
      )}

      {note.overallImpression && (
        <div className="card border-2 border-gold-200">
          <div className="card-header bg-gradient-to-r from-gold-500 to-gold-600">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              <h2 className="font-display text-lg font-medium">整体印象</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-800 leading-relaxed text-lg">
              {note.overallImpression}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
