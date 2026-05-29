import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Share2, Download, Eye, EyeOff, Camera, Star, Clock, Link2, Copy, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StarRating from '../components/gallery/StarRating';
import { formatDate, exportToCSV } from '../utils/helpers';

export default function WorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    works,
    workPhotos,
    deleteWork,
    updateWork,
    getWorkPhotos,
    getBOMItems,
    projects,
  } = useAppStore();

  const work = works.find((w) => w.id === id);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!work) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Camera size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-500 mb-2">作品不存在</h3>
        <button
          onClick={() => navigate('/gallery')}
          className="brick-btn-outline"
        >
          返回作品展示
        </button>
      </div>
    );
  }

  const photos = getWorkPhotos(work.id);
  const activePhoto = photos[activePhotoIndex];
  const relatedProject = work.project_id
    ? projects.find((p) => p.id === work.project_id)
    : null;

  const handleDelete = () => {
    if (window.confirm('确定要删除这个作品吗？所有照片都将被删除。')) {
      deleteWork(work.id);
      navigate('/gallery');
    }
  };

  const handleTogglePublic = () => {
    updateWork(work.id, { is_public: !work.is_public });
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${work.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportBOM = () => {
    if (relatedProject) {
      const bomItems = getBOMItems(relatedProject.id);
      const csvData = bomItems.map((item) => ({
        '零件编号': item.part_num,
        '零件名称': item.part_name,
        '颜色': item.color_name,
        '需要数量': item.required_quantity,
      }));
      exportToCSV(csvData, `${work.title}-用料清单`);
    } else {
      alert('此作品没有关联的项目，无法导出用料清单');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/gallery')}
          className="p-2 hover:bg-gray-100 rounded-brick transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`status-badge ${
                work.is_public
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {work.is_public ? (
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  公开
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff size={12} />
                  私密
                </span>
              )}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(work.created_at)}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-lego-dark mt-1">
            {work.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublic}
            className="brick-btn-secondary flex items-center gap-2"
          >
            {work.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{work.is_public ? '设为私密' : '设为公开'}</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-brick transition-colors">
            <Edit2 size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-lego-red rounded-brick transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="brick-card overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {activePhoto ? (
                <img
                  src={activePhoto.photo_url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🎨</span>
                </div>
              )}
              {activePhoto?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white">{activePhoto.caption}</p>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setActivePhotoIndex(index)}
                      className={`w-20 h-16 flex-shrink-0 rounded-brick overflow-hidden border-2 transition-all ${
                        activePhotoIndex === index
                          ? 'border-lego-blue shadow-lego-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || `照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-3">
              作品描述
            </h3>
            <p className="text-gray-600 leading-relaxed">{work.description}</p>
          </div>

          {relatedProject && (
            <div className="brick-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Link2 size={18} className="text-lego-blue" />
                  <h3 className="font-display font-semibold text-lego-dark">
                    关联项目
                  </h3>
                </div>
                <button
                  onClick={() => navigate(`/projects/${relatedProject.id}`)}
                  className="text-sm text-lego-blue hover:underline"
                >
                  查看项目详情
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-brick">
                <h4 className="font-medium text-lego-dark">
                  {relatedProject.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {relatedProject.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    总耗时: {Math.round(relatedProject.total_hours)} 小时
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-4">
              作品评价
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  搭建难度
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={`${
                        star <= work.difficulty_rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {work.difficulty_rating} / 5
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  满意度
                </label>
                <div className="flex items-center gap-1">
                  <StarRating
                    rating={work.satisfaction_rating}
                    size={24}
                    interactive={false}
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    {work.satisfaction_rating} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-4">
              分享
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleCopyShareLink}
                className="w-full flex items-center justify-center gap-2 p-3 bg-lego-blue/10 text-lego-blue rounded-brick hover:bg-lego-blue/20 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? '已复制' : '复制分享链接'}</span>
              </button>
              {relatedProject && (
                <button
                  onClick={handleExportBOM}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-600 rounded-brick hover:bg-gray-200 transition-colors"
                >
                  <Download size={18} />
                  <span>导出用料清单</span>
                </button>
              )}
            </div>
            {work.is_public && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-brick">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <Share2 size={16} />
                  <span>此作品已公开，任何人都可以查看</span>
                </div>
              </div>
            )}
          </div>

          <div className="brick-card p-6 bg-gradient-to-br from-lego-yellow/10 to-lego-red/5">
            <h3 className="font-display font-semibold text-lego-dark mb-3">
              作品信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="font-medium text-lego-dark">
                  {formatDate(work.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">照片数量</span>
                <span className="font-medium text-lego-dark">
                  {photos.length} 张
                </span>
              </div>
              {relatedProject && (
                <div className="flex justify-between">
                  <span className="text-gray-500">项目关联</span>
                  <span className="font-medium text-lego-dark">已关联</span>
                </div>
              )}
            </div>
          </div>

          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-3">
              分享链接
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-brick p-3 text-sm text-gray-600 truncate">
                /share/{work.share_token}
              </div>
              <button
                onClick={handleCopyShareLink}
                className="p-2 hover:bg-gray-100 rounded-brick transition-colors"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-500" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
