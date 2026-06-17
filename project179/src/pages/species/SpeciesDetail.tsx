import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  FileText,
  Edit3,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Image,
  Music,
  Play,
  Pause,
  Volume2,
  Leaf,
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { SpeciesRecord } from '@/types';
import { cn } from '@/lib/utils';
import SpeciesFormModal from './SpeciesFormModal';

export default function SpeciesDetail() {
  const { speciesId } = useParams<{ speciesId: string }>();
  const navigate = useNavigate();
  const { getSpeciesById, getSiteById, deleteSpecies } = useAppStore();

  const species = useMemo(
    () => (speciesId ? getSpeciesById(speciesId) : undefined),
    [speciesId, getSpeciesById]
  );

  const site = useMemo(
    () => (species ? getSiteById(species.siteId) : undefined),
    [species, getSiteById]
  );

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  if (!species) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
        <Header title="物种详情" />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-300 mb-5">
              <Leaf className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-forest-800 mb-2">
              物种记录不存在
            </h3>
            <p className="text-sm text-forest-600 mb-6">
              该物种记录可能已被删除，请返回列表查看其他记录
            </p>
            <button
              onClick={() => navigate('/species')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回物种列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? species.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === species.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleDelete = () => {
    if (speciesId) {
      deleteSpecies(speciesId);
      navigate('/species');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="物种详情" subtitle={species.name} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => navigate('/species')}
            className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回物种列表
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card border border-forest-100/50 animate-slide-up">
              <div className="relative h-80 sm:h-96 bg-gradient-to-br from-forest-100 to-lake-100 overflow-hidden">
                {species.photos.length > 0 ? (
                  <>
                    <img
                      src={species.photos[currentPhotoIndex]}
                      alt={species.name}
                      className="h-full w-full object-cover"
                    />
                    {species.photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-forest-700 hover:bg-white transition-colors shadow-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-forest-700 hover:bg-white transition-colors shadow-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {species.photos.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentPhotoIndex(idx)}
                              className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                idx === currentPhotoIndex
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 hover:bg-white/80'
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Leaf className="h-32 w-32 text-forest-300 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge text={species.taxonomy} variant="info" />
                    {species.isInvasive && (
                      <Badge text="入侵物种" variant="danger" />
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    {species.name}
                  </h1>
                </div>
              </div>
            </div>

            {species.isInvasive && (
              <div
                className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6 animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800 mb-2">
                      入侵物种警告
                    </h3>
                    <p className="text-sm text-red-700 mb-3 leading-relaxed">
                      该物种被认定为入侵物种，可能对本地生态系统造成威胁。请密切关注其扩散情况，及时采取防控措施。
                    </p>
                    <div className="bg-white/60 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800">
                          扩散范围
                        </span>
                      </div>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {species.spreadRange || '暂无详细扩散数据'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className="rounded-2xl bg-white shadow-card border border-forest-100/50 p-6 animate-fade-in"
              style={{ animationDelay: '150ms' }}
            >
              <h2 className="text-lg font-bold text-forest-800 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-forest-500" />
                基本信息
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-forest-50/50">
                  <MapPin className="w-5 h-5 text-forest-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-forest-500 mb-1">所属监测点</p>
                    <p className="text-sm font-semibold text-forest-800">
                      {site?.name || '未知监测点'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-forest-50/50">
                  <MapPin className="w-5 h-5 text-lake-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-forest-500 mb-1">发现位置</p>
                    <p className="text-sm font-semibold text-forest-800">
                      {species.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-forest-50/50">
                  <Calendar className="w-5 h-5 text-sun-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-forest-500 mb-1">发现日期</p>
                    <p className="text-sm font-semibold text-forest-800">
                      {species.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-forest-50/50">
                  <Users className="w-5 h-5 text-forest-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-forest-500 mb-1">观测数量</p>
                    <p className="text-sm font-semibold text-forest-800">
                      {species.count} 个/只
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-lake-50/50">
                <p className="text-xs text-forest-500 mb-2">行为观察描述</p>
                <p className="text-sm text-forest-700 leading-relaxed">
                  {species.behavior}
                </p>
              </div>
            </div>

            {(species.photos.length > 1 || species.audios.length > 0) && (
              <div
                className="rounded-2xl bg-white shadow-card border border-forest-100/50 p-6 animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <h2 className="text-lg font-bold text-forest-800 mb-5 flex items-center gap-2">
                  <Image className="w-5 h-5 text-forest-500" />
                  多媒体资料
                </h2>

                {species.photos.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-forest-700 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4 text-lake-500" />
                      照片画廊
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {species.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={cn(
                            'aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2',
                            idx === currentPhotoIndex
                              ? 'border-forest-500 shadow-card'
                              : 'border-transparent hover:border-forest-300'
                          )}
                        >
                          <img
                            src={photo}
                            alt={`${species.name} - 照片${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {species.audios.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-forest-700 mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-sun-500" />
                      音频记录
                    </h3>
                    <div className="space-y-3">
                      {species.audios.map((audio, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 rounded-xl bg-sun-50/50 border border-sun-200/50"
                        >
                          <button
                            onClick={() =>
                              setIsPlayingAudio(
                                isPlayingAudio === audio ? null : audio
                              )
                            }
                            className="w-12 h-12 rounded-full bg-sun-500 text-white flex items-center justify-center hover:bg-sun-600 transition-colors shadow-md flex-shrink-0"
                          >
                            {isPlayingAudio === audio ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-forest-800 truncate">
                                录音记录 {idx + 1}
                              </p>
                              <Volume2 className="w-4 h-4 text-sun-500 flex-shrink-0 ml-2" />
                            </div>
                            <div className="h-2 bg-sun-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  isPlayingAudio === audio
                                    ? 'bg-sun-500 w-3/4'
                                    : 'bg-sun-400 w-0'
                                )}
                                style={{
                                  animation:
                                    isPlayingAudio === audio
                                      ? 'audioProgress 30s linear infinite'
                                      : undefined,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div
              className="rounded-2xl bg-white shadow-card border border-forest-100/50 p-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <h2 className="text-lg font-bold text-forest-800 mb-5 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-forest-500" />
                操作
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl',
                    'bg-forest-500 text-white text-sm font-medium',
                    'hover:bg-forest-600 active:bg-forest-700',
                    'transition-all duration-200 shadow-sm hover:shadow-card'
                  )}
                >
                  <Edit3 className="w-4 h-4" />
                  编辑记录
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl',
                    'border border-red-200 text-red-600 text-sm font-medium bg-red-50',
                    'hover:bg-red-100 hover:border-red-300',
                    'transition-all duration-200'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  删除记录
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl bg-white shadow-card border border-forest-100/50 p-6 animate-fade-in"
              style={{ animationDelay: '150ms' }}
            >
              <h2 className="text-lg font-bold text-forest-800 mb-5">
                统计信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50">
                  <span className="text-sm text-forest-600">照片数量</span>
                  <span className="text-sm font-bold text-forest-800">
                    {species.photos.length} 张
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50">
                  <span className="text-sm text-forest-600">音频数量</span>
                  <span className="text-sm font-bold text-forest-800">
                    {species.audios.length} 条
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50">
                  <span className="text-sm text-forest-600">创建时间</span>
                  <span className="text-sm font-bold text-forest-800">
                    {species.createdAt ? new Date(species.createdAt).toLocaleDateString('zh-CN') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SpeciesFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        editingSpecies={species as SpeciesRecord}
      />

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-forest-800 text-lg">
                  确认删除
                </h3>
                <p className="text-sm text-forest-600 mt-1">
                  您确定要删除物种记录「{species.name}」吗？此操作不可撤销。
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-medium',
                  'border border-forest-200 text-forest-600 bg-white',
                  'hover:bg-forest-50 hover:border-forest-300',
                  'transition-colors duration-200'
                )}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-medium',
                  'bg-red-500 text-white',
                  'hover:bg-red-600 active:bg-red-700',
                  'transition-colors duration-200 shadow-sm'
                )}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes audioProgress {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
