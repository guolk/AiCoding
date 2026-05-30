import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Disc3,
  BookOpen,
  Star,
  Play,
  Clock,
  Users,
  Award,
  Music2
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { workApi } from '../services/api';
import {
  formatDuration,
  formatDate,
  formatRating
} from '../utils/formatters';
import { Modal } from '../components/Modal';
import { RatingStars } from '../components/RatingStars';
import type { Work, Version, ListeningNote } from '../../shared/types';

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, deleteWork, updateWork, fetchWorks } = useAppStore();
  const [work, setWork] = useState<Work | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [notes, setNotes] = useState<ListeningNote[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'notes'>('overview');

  useEffect(() => {
    if (id) {
      const foundWork = works.find((w) => w.id === id);
      if (foundWork) {
        setWork(foundWork);
        loadWorkDetails(id);
      } else {
        workApi.getById(id).then((w) => {
          setWork(w);
          if (w) {
            loadWorkDetails(id);
          }
        });
      }
    }
  }, [id, works]);

  const loadWorkDetails = async (workId: string) => {
    const [workVersions, workNotes] = await Promise.all([
      workApi.getVersions(workId),
      workApi.getNotes(workId)
    ]);
    setVersions(workVersions.sort((a, b) => (a.personalRank || 999) - (b.personalRank || 999)));
    setNotes(workNotes);
  };

  const handleDelete = async () => {
    if (id) {
      await deleteWork(id);
      navigate('/works');
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (id && work) {
      await updateWork(id, { personalRating: rating });
      setWork({ ...work, personalRating: rating });
    }
  };

  if (!work) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/works"
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-burgundy-800">
            {work.title}
          </h1>
          <p className="text-gray-600">{work.composer}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/works/${id}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-xl font-medium">作品信息</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {work.opus && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">作品编号</p>
                    <p className="font-medium">{work.opus}</p>
                  </div>
                )}
                {work.catalogNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">目录编号</p>
                    <p className="font-medium">{work.catalogNumber}</p>
                  </div>
                )}
                {work.compositionYear && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">创作年代</p>
                    <p className="font-medium">{work.compositionYear}</p>
                  </div>
                )}
                {work.form && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">曲式</p>
                    <p className="font-medium">{work.form}</p>
                  </div>
                )}
                {work.duration && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">时长</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-600" />
                      {formatDuration(work.duration)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">聆听次数</p>
                  <p className="font-medium flex items-center gap-2">
                    <Play className="w-4 h-4 text-gold-600" />
                    {work.listenCount} 次
                  </p>
                </div>
              </div>

              {work.instrumentation && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">乐队编制</p>
                  <p className="text-sm">{work.instrumentation}</p>
                </div>
              )}

              <div className="pt-4 border-t border-parchment-100">
                <p className="text-sm text-gray-500 mb-2">个人评分</p>
                <div className="flex items-center gap-3">
                  <RatingStars
                    rating={work.personalRating || 0}
                    onChange={handleRatingChange}
                    size="lg"
                  />
                  <span className="text-sm text-gray-500">
                    {work.personalRating ? formatRating(work.personalRating) : '未评分'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {work.movements && work.movements.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Music2 className="w-5 h-5" />
                <h2 className="font-display text-xl font-medium">乐章结构</h2>
              </div>
              <div className="divide-y divide-parchment-100">
                {work.movements.map((movement, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-burgundy-100 text-burgundy-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {movement.number}
                      </span>
                      <div>
                        <p className="font-medium">{movement.title}</p>
                        <p className="text-sm text-gray-500">
                          {movement.tempo && `${movement.tempo}`}
                          {movement.tempo && movement.key && ' • '}
                          {movement.key}
                        </p>
                      </div>
                    </div>
                    {movement.duration && (
                      <span className="text-sm text-gray-500">
                        {formatDuration(movement.duration)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc3 className="w-5 h-5" />
                <h2 className="font-display text-xl font-medium">收藏版本</h2>
              </div>
              <Link
                to={`/works/${id}/versions/new`}
                className="text-sm text-gold-200 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </Link>
            </div>
            <div className="p-4">
              {versions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无版本</p>
              ) : (
                <div className="space-y-3">
                  {versions.slice(0, 3).map((version) => (
                    <Link
                      key={version.id}
                      to={`/versions/compare/${id}`}
                      className="block p-3 bg-parchment-50 rounded-lg hover:bg-parchment-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm">{version.conductor}</p>
                        {version.personalRank && (
                          <span className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded">
                            #{version.personalRank}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{version.orchestra}</p>
                      <p className="text-xs text-gray-400">
                        {version.recordingYear || version.releaseYear || '未知年份'}
                      </p>
                    </Link>
                  ))}
                  {versions.length > 3 && (
                    <Link
                      to={`/versions/compare/${id}`}
                      className="block text-center text-sm text-burgundy-600 hover:text-burgundy-800 py-2"
                    >
                      查看全部 {versions.length} 个版本
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h2 className="font-display text-xl font-medium">欣赏笔记</h2>
              </div>
              <Link
                to={`/notes/new?workId=${id}`}
                className="text-sm text-gold-200 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                新建
              </Link>
            </div>
            <div className="p-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无笔记</p>
              ) : (
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note) => (
                    <Link
                      key={note.id}
                      to={`/notes/${note.id}`}
                      className="block p-3 bg-parchment-50 rounded-lg hover:bg-parchment-100 transition-colors"
                    >
                      <p className="text-sm text-gray-500 mb-1">
                        {formatDate(note.listenDate)}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {note.overallImpression || '点击查看详情'}
                      </p>
                    </Link>
                  ))}
                  {notes.length > 3 && (
                    <Link
                      to="/notes"
                      className="block text-center text-sm text-burgundy-600 hover:text-burgundy-800 py-2"
                    >
                      查看全部 {notes.length} 条笔记
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除 "{work.title}" 吗？此操作将同时删除所有相关的版本和笔记，且无法撤销。
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
      </Modal>
    </div>
  );
}
