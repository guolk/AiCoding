import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  Eye,
  Trash2,
  Edit2,
  FolderOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { useDataRoomStore } from '../../store/useDataRoomStore';
import { useProjectStore } from '../../store/useProjectStore';
import { DATAROOM_CATEGORY_OPTIONS, DATAROOM_STATUS_OPTIONS } from '../../utils/constants';
import { formatDate, getStatusLabel, getStatusColor, cn } from '../../utils/helpers';
import type { DataRoomStatus, DataRoomCategory } from '../../types';

export default function DataRoomDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dataRoomItems = useDataRoomStore((s) => s.dataRoomItems);
  const addItem = useDataRoomStore((s) => s.addItem);
  const updateItemStatus = useDataRoomStore((s) => s.updateItemStatus);
  const updateItem = useDataRoomStore((s) => s.updateItem);
  const deleteItem = useDataRoomStore((s) => s.deleteItem);
  const projects = useProjectStore((s) => s.projects);

  const [categoryFilter, setCategoryFilter] = useState<DataRoomCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DataRoomStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'company' as DataRoomCategory,
    description: '',
    status: 'pending' as DataRoomStatus,
    fileName: '',
  });

  const project = projects.find((p) => p.id === projectId);

  const projectItems = useMemo(() => {
    return dataRoomItems.filter((item) => item.projectId === projectId);
  }, [dataRoomItems, projectId]);

  const stats = useMemo(() => {
    const total = projectItems.length;
    const completed = projectItems.filter((i) => i.status === 'completed').length;
    const inProgress = projectItems.filter((i) => i.status === 'in_progress').length;
    const pending = projectItems.filter((i) => i.status === 'pending').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, percentage };
  }, [projectItems]);

  const filteredItems = useMemo(() => {
    return projectItems.filter((item) => {
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchCategory && matchStatus;
    });
  }, [projectItems, categoryFilter, statusFilter]);

  const getCategoryLabel = (value: string) => {
    return DATAROOM_CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    DATAROOM_CATEGORY_OPTIONS.forEach((cat) => {
      const catItems = filteredItems.filter((item) => item.category === cat.value);
      if (catItems.length > 0) {
        groups[cat.value] = catItems;
      }
    });
    return groups;
  }, [filteredItems]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'company' as DataRoomCategory,
      description: '',
      status: 'pending' as DataRoomStatus,
      fileName: '',
    });
    setIsEditing(false);
    setEditItemId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !projectId) return;

    if (isEditing && editItemId) {
      updateItem(editItemId, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        fileName: formData.fileName || undefined,
      });
    } else {
      addItem({
        projectId,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        fileName: formData.fileName || undefined,
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (item: typeof projectItems[0]) => {
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      status: item.status,
      fileName: item.fileName || '',
    });
    setEditItemId(item.id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleQuickStatusChange = (
    itemId: string,
    currentStatus: DataRoomStatus
  ) => {
    if (currentStatus === 'pending') {
      updateItemStatus(itemId, 'in_progress');
    } else if (currentStatus === 'in_progress') {
      updateItemStatus(itemId, 'completed');
    }
  };

  const StatusIcon = ({ status }: { status: DataRoomStatus }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const StatusBadge = ({ status }: { status: DataRoomStatus }) => (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-medium',
        getStatusColor(status, DATAROOM_STATUS_OPTIONS)
      )}
    >
      {getStatusLabel(status, DATAROOM_STATUS_OPTIONS)}
    </span>
  );

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dataroom')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回数据室
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">项目不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dataroom')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回数据室
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {project.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-slate-500 mt-1">
                  {project.track} · {project.founders}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.percentage}%</p>
                <p className="text-sm text-slate-500">完成率</p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                新增材料
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">材料总数</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-600 mb-1">已完成</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-600 mb-1">进行中</p>
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">待收集</p>
              <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">整体进度</span>
              <span className="text-sm font-medium text-slate-700">
                {stats.completed}/{stats.total}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <Select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as DataRoomCategory | 'all')
                }
                options={[
                  { value: 'all', label: '全部分类' },
                  ...DATAROOM_CATEGORY_OPTIONS,
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as DataRoomStatus | 'all')
                }
                options={[
                  { value: 'all', label: '全部状态' },
                  ...DATAROOM_STATUS_OPTIONS,
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([category, items]) => {
          const catCompleted = items.filter((i) => i.status === 'completed').length;
          const catPercentage =
            items.length > 0 ? Math.round((catCompleted / items.length) * 100) : 0;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {getCategoryLabel(category)}
                  </h2>
                  <Badge variant="info" className="text-xs">
                    {catCompleted}/{items.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        catPercentage === 100
                          ? 'bg-emerald-500'
                          : catPercentage > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                      )}
                      style={{ width: `${catPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-12 text-right">
                    {catPercentage}%
                  </span>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between p-4 transition-colors hover:bg-slate-50',
                          item.status === 'completed' && 'bg-emerald-50/50'
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => handleQuickStatusChange(item.id, item.status)}
                            className="transition-transform hover:scale-110"
                          >
                            <StatusIcon status={item.status} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  'font-medium',
                                  item.status === 'completed'
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-900'
                                )}
                              >
                                {item.name}
                              </p>
                              <StatusBadge status={item.status} />
                              {item.fileName && (
                                <Badge variant="info" className="text-xs">
                                  {item.fileName}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                            {item.uploadDate && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                更新于 {formatDate(item.uploadDate)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.fileName && (
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Upload className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无尽调材料</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={isEditing ? '编辑材料' : '新增尽调材料'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>{isEditing ? '保存修改' : '确认添加'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="材料名称"
            placeholder="请输入材料名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="材料分类"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as DataRoomCategory })
            }
            options={DATAROOM_CATEGORY_OPTIONS}
          />
          <Select
            label="收集状态"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as DataRoomStatus })
            }
            options={DATAROOM_STATUS_OPTIONS}
          />
          <Input
            label="文件名（可选）"
            placeholder="已上传的文件名"
            value={formData.fileName}
            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
          />
          <Textarea
            label="材料说明（可选）"
            placeholder="请输入材料说明或备注..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) {
                  deleteItem(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该材料吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
