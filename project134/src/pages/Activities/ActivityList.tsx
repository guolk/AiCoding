import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, ChevronRight, Search, Edit2, Trash2, Mic, GraduationCap, Coffee } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useActivityStore } from '../../store/useActivityStore';
import { useProjectStore } from '../../store/useProjectStore';
import { ACTIVITY_TYPE_OPTIONS, ACTIVITY_STATUS_OPTIONS } from '../../utils/constants';
import { formatDate, getStatusLabel, getStatusColor, cn } from '../../utils/helpers';
import type { Activity, ActivityType, ActivityStatus } from '../../types';

const typeIcons: Record<ActivityType, typeof Mic> = {
  roadshow: Mic,
  training: GraduationCap,
  exchange: Coffee,
};

const typeColors: Record<ActivityType, string> = {
  roadshow: 'from-amber-500 to-orange-500',
  training: 'from-blue-500 to-cyan-500',
  exchange: 'from-emerald-500 to-teal-500',
};

export default function ActivityList() {
  const navigate = useNavigate();
  const activities = useActivityStore((s) => s.activities);
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const deleteActivity = useActivityStore((s) => s.deleteActivity);
  const projects = useProjectStore((s) => s.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'training' as ActivityType,
    name: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    participantIds: [] as string[],
  });

  const filteredActivities = activities.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !typeFilter || a.type === typeFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const getTypeLabel = (value: string) => {
    return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const resetForm = () => {
    setFormData({
      type: 'training' as ActivityType,
      name: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      participantIds: [] as string[],
    });
    setIsEditing(false);
    setEditActivityId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.date || !formData.location.trim()) return;

    if (isEditing && editActivityId) {
      updateActivity(editActivityId, {
        ...formData,
        status: getActivityStatus(formData.date),
      });
    } else {
      addActivity({
        ...formData,
        status: getActivityStatus(formData.date),
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const getActivityStatus = (date: string): ActivityStatus => {
    const today = new Date().toISOString().split('T')[0];
    if (date > today) return 'upcoming';
    if (date === today) return 'ongoing';
    return 'completed';
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      type: activity.type,
      name: activity.name,
      date: activity.date,
      location: activity.location,
      description: activity.description || '',
      participantIds: activity.participants.map((p) => p.projectId),
    });
    setEditActivityId(activity.id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const toggleParticipant = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(projectId)
        ? prev.participantIds.filter((p) => p !== projectId)
        : [...prev.participantIds, projectId],
    }));
  };

  const StatusBadge = ({ status }: { status: ActivityStatus }) => (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-medium',
        getStatusColor(status, ACTIVITY_STATUS_OPTIONS)
      )}
    >
      {getStatusLabel(status, ACTIVITY_STATUS_OPTIONS)}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">活动管理</h1>
          <p className="text-slate-500 mt-1">管理孵化器各类活动和参与记录</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增活动
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索活动名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ActivityType | '')}
                options={[{ value: '', label: '全部类型' }, ...ACTIVITY_TYPE_OPTIONS]}
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | '')}
                options={[{ value: '', label: '全部状态' }, ...ACTIVITY_STATUS_OPTIONS]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => {
          const TypeIcon = typeIcons[activity.type];
          const checkedInCount = activity.participants.filter((p) => p.checkedIn).length;
          return (
            <Card key={activity.id} hover onClick={() => navigate(`/activities/${activity.id}`)}>
              <CardContent className="p-0">
                <div className={cn('h-24 bg-gradient-to-br relative overflow-hidden', typeColors[activity.type])}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-white" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <StatusBadge status={activity.status} />
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {getTypeLabel(activity.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 pr-2 line-clamp-2">
                      {activity.name}
                    </h3>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(activity.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(activity.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>
                        {checkedInCount}/{activity.participants.length} 已签到
                      </span>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex -space-x-2">
                      {activity.participants.slice(0, 4).map((p) => (
                        <div
                          key={p.projectId}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                          title={projects.find((pr) => pr.id === p.projectId)?.name}
                        >
                          {projects.find((pr) => pr.id === p.projectId)?.name.charAt(0)}
                        </div>
                      ))}
                      {activity.participants.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium border-2 border-white">
                          +{activity.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-blue-600 flex items-center gap-1 group">
                      查看详情
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无活动数据</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={isEditing ? '编辑活动' : '新增活动'}
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
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="活动类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
              options={ACTIVITY_TYPE_OPTIONS}
            />
            <Input
              label="活动日期"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <Input
            label="活动名称"
            placeholder="请输入活动名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="活动地点"
            placeholder="请输入活动地点"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              活动描述
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="请输入活动描述..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              参与项目（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleParticipant(p.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all border-2',
                    formData.participantIds.includes(p.id)
                      ? 'bg-blue-100 text-blue-700 border-blue-500'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                  )}
                >
                  {p.name}
                </button>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-slate-400 italic">暂无项目可选择</p>
              )}
            </div>
          </div>
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
                  deleteActivity(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该活动吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
