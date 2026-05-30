import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Music,
  Star,
  Trash2,
  Edit,
  BookOpen,
  UserPlus
} from 'lucide-react';
import { composerApi } from '../services/api';
import { useAppStore } from '../stores/appStore';
import { Modal } from '../components/Modal';
import type { Composer, TimelineEvent } from '../../shared/types';

export function ComposerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, fetchComposers, deleteComposer } = useAppStore();
  const [composer, setComposer] = useState<Composer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadComposer(id);
    }
  }, [id]);

  const loadComposer = async (composerId: string) => {
    try {
      setLoading(true);
      const data = await composerApi.getById(composerId);
      setComposer(data);
    } catch (error) {
      console.error('Failed to load composer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteComposer(id);
      navigate('/composers');
    } catch (error) {
      console.error('Failed to delete composer:', error);
    }
  };

  const composerWorks = composer
    ? works.filter(w => w.composerId === composer.id || w.composer === composer.name)
    : [];

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!composer) {
    return <div className="text-center py-12">作曲家不存在</div>;
  }

  const lifespan = composer.birthYear && composer.deathYear
    ? `${composer.birthYear} - ${composer.deathYear}`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-burgundy-800">
            {composer.name}
          </h1>
          {lifespan && (
            <p className="text-gray-600">{lifespan}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            编辑
          </button>
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
          {composer.biography && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold-600" />
                <h2 className="font-display text-xl font-medium">传记简介</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {composer.biography}
                </p>
              </div>
            </div>
          )}

          {composer.timelineEvents.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-600" />
                <h2 className="font-display text-xl font-medium">生平时间线</h2>
              </div>
              <div className="p-6">
                <Timeline events={composer.timelineEvents} />
              </div>
            </div>
          )}

          {composer.representativeWorks.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Music className="w-5 h-5 text-gold-600" />
                <h2 className="font-display text-xl font-medium">代表作品</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {composer.representativeWorks.map((work, index) => (
                    <div
                      key={index}
                      className="p-4 bg-parchment-50 rounded-lg border border-parchment-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-burgundy-100 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-burgundy-700" />
                        </div>
                        {work.year && (
                          <span className="text-sm text-gray-500">{work.year}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-burgundy-800 mt-3">{work.title}</h3>
                      {work.form && (
                        <p className="text-sm text-gray-500">{work.form}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {composerWorks.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-gold-600" />
                  <h2 className="font-display text-xl font-medium">已收藏的作品</h2>
                </div>
                <span className="text-sm text-gray-500">
                  共 {composerWorks.length} 部作品
                </span>
              </div>
              <div className="p-6 space-y-3">
                {composerWorks.map((work) => (
                  <Link
                    key={work.id}
                    to={`/works/${work.id}`}
                    className="block p-4 bg-parchment-50 rounded-lg hover:bg-parchment-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-burgundy-800">{work.title}</h3>
                        <p className="text-sm text-gray-500">
                          {work.opus || work.catalogNumber}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>已聆听 {work.listenCount} 次</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-xl font-medium">基本信息</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">国籍</p>
                  <p className="font-medium text-gray-800">{composer.nationality || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">时期</p>
                  <p className="font-medium text-gray-800">{composer.period || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">代表作品数量</p>
                  <p className="font-medium text-gray-800">{composer.representativeWorks.length} 部</p>
                </div>
              </div>
            </div>
          </div>

          {composer.relationships.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-600" />
                <h2 className="font-display text-xl font-medium">关系网络</h2>
              </div>
              <div className="p-6 space-y-3">
                {composer.relationships.map((rel, index) => (
                  <div
                    key={index}
                    className="p-3 bg-parchment-50 rounded-lg border border-parchment-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-burgundy-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{rel.composerName}</p>
                        <p className="text-xs text-burgundy-600">{rel.relationship}</p>
                      </div>
                    </div>
                    {rel.description && (
                      <p className="text-sm text-gray-600 mt-2">{rel.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            确定要删除作曲家 "{composer.name}" 吗？此操作不可撤销。
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface TimelineProps {
  events: TimelineEvent[];
}

function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'birth': return '🎂';
      case 'death': return '🕯️';
      case 'work': return '🎼';
      case 'life': return '📜';
      default: return '📝';
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'birth': return 'bg-green-500';
      case 'death': return 'bg-gray-500';
      case 'work': return 'bg-burgundy-500';
      case 'life': return 'bg-gold-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-parchment-200" />
      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <div key={index} className="relative pl-12">
            <div className={`absolute left-2 w-5 h-5 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-xs`}>
              {getEventIcon(event.type)}
            </div>
            <div className="bg-parchment-50 rounded-lg p-4 border border-parchment-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-burgundy-700">{event.year}</span>
                <span className="text-xs text-gray-500 capitalize">
                  {event.type === 'birth' ? '出生' : event.type === 'death' ? '逝世' : event.type === 'work' ? '作品' : '生平'}
                </span>
              </div>
              <p className="text-gray-700">{event.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
