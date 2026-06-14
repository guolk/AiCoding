import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle,
  X,
  Users,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectCases } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { StatusBadge, EmptyState, Modal, ConfirmDialog, PhotoViewer } from '@/components/UI';
import type { BenefitCase, Photo } from '@/types';

interface FormData {
  farmerName: string;
  village: string;
  familyMembers: string;
  photo: string;
  story: string;
  incomeIncrease: string;
}

export default function BenefitCases() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    addCase,
    updateCase,
    deleteCase,
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<BenefitCase | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BenefitCase | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [formData, setFormData] = useState<FormData>({
    farmerName: '',
    village: '',
    familyMembers: '',
    photo: '',
    story: '',
    incomeIncrease: '',
  });

  const project = useProjectById(projectId);
  const cases = useProjectCases(projectId);

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

  const sortedCases = useMemo(() => {
    return [...cases].sort(
      (a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf()
    );
  }, [cases]);

  const handleOpenModal = (caseItem?: BenefitCase) => {
    if (caseItem) {
      setEditingCase(caseItem);
      setFormData({
        farmerName: caseItem.farmerName,
        village: caseItem.village,
        familyMembers: caseItem.familyMembers.toString(),
        photo: caseItem.photo,
        story: caseItem.story,
        incomeIncrease: caseItem.incomeIncrease.toString(),
      });
    } else {
      setEditingCase(null);
      setFormData({
        farmerName: '',
        village: project?.village || '',
        familyMembers: '',
        photo: '',
        story: '',
        incomeIncrease: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
  };

  const handleSubmit = () => {
    if (!projectId) return;

    const data = {
      projectId,
      farmerName: formData.farmerName,
      village: formData.village,
      familyMembers: parseInt(formData.familyMembers),
      photo: formData.photo,
      story: formData.story,
      incomeIncrease: parseFloat(formData.incomeIncrease),
    };

    if (editingCase) {
      updateCase(editingCase.id, data);
    } else {
      addCase(data);
    }

    handleCloseModal();
  };

  const handleDelete = (caseItem: BenefitCase) => {
    setConfirmDelete(caseItem);
  };

  const confirmDeleteCase = () => {
    if (confirmDelete) {
      deleteCase(confirmDelete.id);
    }
    setConfirmDelete(null);
  };

  const handleViewPhoto = (photoUrl: string) => {
    setViewerPhotos([{
      id: 'view',
      groupId: 'view',
      type: 'after',
      url: photoUrl,
      caption: '农户照片',
    }]);
    setViewerOpen(true);
  };

  const toggleExpand = (caseId: string) => {
    setExpandedCase(expandedCase === caseId ? null : caseId);
  };

  const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';
  const encode = (str: string) => encodeURIComponent(str);
  const imgUrl = (prompt: string) => `${imgBase}?prompt=${encode(prompt)}&image_size=square`;

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{project.village} · 受益案例</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary inline-flex items-center gap-2 self-start md:self-auto"
            >
              <Plus size={18} />
              新增案例
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        {sortedCases.length === 0 ? (
          <div className="card p-12 text-center">
            <EmptyState
              icon={Users}
              title="暂无受益案例"
              description="点击右上角新增案例按钮，添加第一个受益农户的故事"
              action={
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  新增案例
                </button>
              }
            />
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {sortedCases.map((caseItem) => {
              const isExpanded = expandedCase === caseItem.id;
              const photoUrl = caseItem.photo || imgUrl(`农民肖像照片 ${caseItem.farmerName}`);
              return (
                <div
                  key={caseItem.id}
                  className="break-inside-avoid card hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                        onClick={() => handleViewPhoto(photoUrl)}
                      >
                        <img
                          src={photoUrl}
                          alt={caseItem.farmerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {caseItem.farmerName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{caseItem.village}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{caseItem.familyMembers}人</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(caseItem)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(caseItem)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 font-medium">收入增加</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={20} className="text-green-600" />
                            <span className="text-2xl font-bold text-green-700">
                              +{caseItem.incomeIncrease.toLocaleString()}
                            </span>
                            <span className="text-sm text-green-600 font-medium">万元/年</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className={`text-sm text-gray-600 leading-relaxed ${
                        !isExpanded ? 'line-clamp-3' : ''
                      }`}>
                        {caseItem.story}
                      </p>
                      {caseItem.story.length > 100 && (
                        <button
                          onClick={() => toggleExpand(caseItem.id)}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {isExpanded ? (
                            <>
                              收起 <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              展开详情 <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>{dayjs(caseItem.createTime).format('YYYY-MM-DD')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingCase ? '编辑案例' : '新增案例'}
        size="lg"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingCase ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">农户姓名</label>
              <input
                type="text"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                placeholder="请输入农户姓名"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">所在村庄</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="请输入所在村庄"
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">家庭人口数</label>
              <input
                type="number"
                value={formData.familyMembers}
                onChange={(e) => setFormData({ ...formData, familyMembers: e.target.value })}
                placeholder="请输入家庭人口数"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">年收入增加（万元）</label>
              <input
                type="number"
                step="0.1"
                value={formData.incomeIncrease}
                onChange={(e) => setFormData({ ...formData, incomeIncrease: e.target.value })}
                placeholder="请输入年收入增加金额"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">照片URL</label>
            <input
              type="text"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="请输入照片URL（可选）"
              className="input-field"
            />
            {formData.photo && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={formData.photo}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label className="label">受益故事</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              placeholder="请详细描述农户的受益故事，包括项目实施前后的变化等"
              rows={6}
              className="input-field resize-none"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="确认删除"
        message={`确定要删除"${confirmDelete?.farmerName}"的案例吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDeleteCase}
        onClose={() => setConfirmDelete(null)}
      />

      <PhotoViewer
        open={viewerOpen}
        photos={viewerPhotos}
        initialIndex={0}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
