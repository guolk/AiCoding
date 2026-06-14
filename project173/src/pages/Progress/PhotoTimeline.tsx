import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  Plus,
  Image,
  AlertCircle,
  ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore, useProjectById, useProjectPhotoGroups } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { Modal, EmptyState, PhotoViewer, StatusBadge } from '@/components/UI';
import type { Photo } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PhotoGroupFormData {
  stage: string;
  date: string;
  description: string;
  beforeUrl: string;
  duringUrl: string;
  afterUrl: string;
}

const initialFormData: PhotoGroupFormData = {
  stage: '',
  date: '',
  description: '',
  beforeUrl: '',
  duringUrl: '',
  afterUrl: '',
};

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';
const encode = (str: string) => encodeURIComponent(str);
const imgUrl = (prompt: string) => `${imgBase}?prompt=${encode(prompt)}&image_size=square`;

export default function PhotoTimeline() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    addPhotoGroup,
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PhotoGroupFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const project = useProjectById(projectId);
  const photoGroups = useProjectPhotoGroups(projectId);

  const sortedPhotoGroups = useMemo(() => {
    return [...photoGroups].sort((a, b) =>
      dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );
  }, [photoGroups]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
    return () => {
      setCurrentProjectId(null);
    };
  }, [projectId, setCurrentProjectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.stage.trim()) newErrors.stage = '请输入阶段名称';
    if (!formData.date) newErrors.date = '请选择日期';
    if (!formData.beforeUrl.trim()) newErrors.beforeUrl = '请输入施工前照片URL';
    if (!formData.duringUrl.trim()) newErrors.duringUrl = '请输入施工中照片URL';
    if (!formData.afterUrl.trim()) newErrors.afterUrl = '请输入施工后照片URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm() || !projectId) return;

    const photos: Photo[] = [
      {
        id: uuidv4(),
        groupId: '',
        type: 'before',
        url: formData.beforeUrl.trim(),
        caption: `${formData.stage} - 施工前`,
      },
      {
        id: uuidv4(),
        groupId: '',
        type: 'during',
        url: formData.duringUrl.trim(),
        caption: `${formData.stage} - 施工中`,
      },
      {
        id: uuidv4(),
        groupId: '',
        type: 'after',
        url: formData.afterUrl.trim(),
        caption: `${formData.stage} - 施工后`,
      },
    ];

    addPhotoGroup({
      projectId,
      stage: formData.stage.trim(),
      date: formData.date,
      description: formData.description.trim(),
      photos,
    });

    handleCloseModal();
  };

  const handlePhotoClick = (photos: Photo[], index: number) => {
    setViewerPhotos(photos);
    setViewerInitialIndex(index);
    setViewerOpen(true);
  };

  const handleGenerateImage = (type: 'before' | 'during' | 'after') => {
    const prompts = {
      before: '乡村农田施工前,原始地貌',
      during: '乡村建设工程中,施工现场',
      after: '乡村建设完工后,美丽新农村',
    };
    const url = imgUrl(prompts[type] + ' ' + formData.stage);
    setFormData({ ...formData, [`${type}Url`]: url });
  };

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="项目不存在"
          description="该项目可能已被删除或不存在"
          action={
            <button onClick={() => navigate('/projects')} className="btn-primary">
              返回项目列表
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{project.village} · 照片时间轴</p>
            </div>
            <button
              onClick={handleOpenModal}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              上传照片组
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">照片时间轴</h2>
              <p className="text-sm text-gray-500 mt-1">
                共 {sortedPhotoGroups.length} 组照片
              </p>
            </div>
          </div>

          {sortedPhotoGroups.length === 0 ? (
            <EmptyState
              icon={Image}
              title="暂无照片"
              description="点击右上角按钮上传项目照片"
            />
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />
              <div className="space-y-12">
                {sortedPhotoGroups.map((group, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <div
                      key={group.id}
                      className={cn(
                        'relative flex items-center gap-8',
                        !isLeft && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'flex-1 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300',
                          isLeft ? 'text-right' : 'text-left'
                        )}
                      >
                        <div className={cn(
                          'flex items-center gap-2 mb-2',
                          isLeft && 'justify-end'
                        )}>
                          <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                            {group.stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {dayjs(group.date).format('YYYY-MM-DD')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                        <div className={cn(
                          'grid grid-cols-3 gap-3',
                          isLeft && 'flex-row-reverse'
                        )}>
                          {group.photos.map((photo, photoIndex) => (
                            <div
                              key={photo.id}
                              className="relative group cursor-pointer"
                              onClick={() => handlePhotoClick(group.photos, photoIndex)}
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={photo.url}
                                  alt={photo.caption}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn size={24} className="text-white" />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                {photo.type === 'before'
                                  ? '施工前'
                                  : photo.type === 'during'
                                  ? '施工中'
                                  : '施工后'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
                        <Image size={18} />
                      </div>

                      <div className="flex-1 hidden md:block" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="上传照片组"
        size="xl"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              确认上传
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                阶段名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className={cn('input-field', errors.stage && 'border-red-500')}
                placeholder="如：地基施工阶段、主体建设阶段"
              />
              {errors.stage && (
                <p className="text-xs text-red-500 mt-1">{errors.stage}</p>
              )}
            </div>
            <div>
              <label className="label">
                日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={cn('input-field', errors.date && 'border-red-500')}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[60px] resize-y"
              placeholder="请输入该阶段的描述信息"
              rows={2}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">照片URL（输入URL或点击生成示例图片）</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">
                    施工前 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateImage('before')}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    生成示例
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.beforeUrl}
                  onChange={(e) => setFormData({ ...formData, beforeUrl: e.target.value })}
                  className={cn('input-field text-xs', errors.beforeUrl && 'border-red-500')}
                  placeholder="请输入图片URL"
                />
                {errors.beforeUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.beforeUrl}</p>
                )}
                {formData.beforeUrl && (
                  <div className="mt-2 aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={formData.beforeUrl}
                      alt="施工前预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">
                    施工中 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateImage('during')}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    生成示例
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.duringUrl}
                  onChange={(e) => setFormData({ ...formData, duringUrl: e.target.value })}
                  className={cn('input-field text-xs', errors.duringUrl && 'border-red-500')}
                  placeholder="请输入图片URL"
                />
                {errors.duringUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.duringUrl}</p>
                )}
                {formData.duringUrl && (
                  <div className="mt-2 aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={formData.duringUrl}
                      alt="施工中预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">
                    施工后 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateImage('after')}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    生成示例
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.afterUrl}
                  onChange={(e) => setFormData({ ...formData, afterUrl: e.target.value })}
                  className={cn('input-field text-xs', errors.afterUrl && 'border-red-500')}
                  placeholder="请输入图片URL"
                />
                {errors.afterUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.afterUrl}</p>
                )}
                {formData.afterUrl && (
                  <div className="mt-2 aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={formData.afterUrl}
                      alt="施工后预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <PhotoViewer
        photos={viewerPhotos}
        initialIndex={viewerInitialIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
