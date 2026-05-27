import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Search, Filter, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { format } from 'date-fns';

export default function ActivityList() {
  const { activities, deleteActivity } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'recruiting', label: '招募中' },
    { value: 'ongoing', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const handleDeleteClick = (e: React.MouseEvent, activityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActivityToDelete(activityId);
    setShowDeleteModal(true);
  };

  const handleDeleteActivity = () => {
    if (activityToDelete) {
      deleteActivity(activityToDelete);
      setActivityToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">志愿活动管理</h1>
          <p className="text-gray-500 mt-1">管理所有志愿活动的发布、报名和物资</p>
        </div>
        <Link to="/activities/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          发布活动
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动名称或地点..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="input pl-10 appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="grid gap-4">
        {filteredActivities.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无活动数据</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <Link
              key={activity.id}
              to={`/activities/${activity.id}`}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                    <StatusBadge status={activity.status} type="activity" />
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-3">{activity.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {activity.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activity.registrations.filter(r => r.status === 'approved').length}/{activity.maxVolunteers} 人
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    {activity.requiredSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, activity.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="删除活动"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除活动"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确定要删除此活动吗？删除后无法恢复。</p>
          {activityToDelete && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium text-red-700">
                {activities.find(a => a.id === activityToDelete)?.name}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {activities.find(a => a.id === activityToDelete)?.location}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleDeleteActivity} className="btn btn-danger">
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
