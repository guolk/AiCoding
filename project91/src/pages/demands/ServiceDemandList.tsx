import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Building2, Phone, Calendar, Users, HandHeart, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { format } from 'date-fns';

export default function ServiceDemandList() {
  const { serviceDemands, addServiceDemand, deleteServiceDemand, currentUser, applyForDemand } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [demandToDelete, setDemandToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    contactPerson: '',
    contactPhone: '',
    requiredSkills: '',
    preferredTime: '',
    expectedVolunteers: 5,
  });

  const filteredDemands = serviceDemands.filter((demand) => {
    const matchesSearch = demand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'open', label: '开放中' },
    { value: 'matched', label: '已匹配' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const handleSubmit = () => {
    if (formData.title && formData.organization) {
      const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      addServiceDemand({
        title: formData.title,
        description: formData.description,
        organization: formData.organization,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        requiredSkills: skillsArray,
        preferredTime: formData.preferredTime,
        expectedVolunteers: formData.expectedVolunteers,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      setFormData({
        title: '',
        description: '',
        organization: '',
        contactPerson: '',
        contactPhone: '',
        requiredSkills: '',
        preferredTime: '',
        expectedVolunteers: 5,
      });
      setShowCreateModal(false);
    }
  };

  const handleApply = (demandId: string) => {
    if (currentUser) {
      applyForDemand(demandId, {
        volunteerId: currentUser.id,
        volunteerName: currentUser.name,
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, demandId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDemandToDelete(demandId);
    setShowDeleteModal(true);
  };

  const handleDeleteDemand = () => {
    if (demandToDelete) {
      deleteServiceDemand(demandToDelete);
      setDemandToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务需求对接</h1>
          <p className="text-gray-500 mt-1">发布和对接社区服务需求，匹配志愿者资源</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          发布需求
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索需求标题、机构或描述..."
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

      {/* Demand List */}
      <div className="space-y-4">
        {filteredDemands.length === 0 ? (
          <div className="card p-12 text-center">
            <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无服务需求</p>
          </div>
        ) : (
          filteredDemands.map((demand) => (
            <Link
              key={demand.id}
              to={`/demands/${demand.id}`}
              className="card p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{demand.title}</h3>
                    <StatusBadge status={demand.status} type="demand" />
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-3">{demand.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {demand.organization}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {demand.contactPerson}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {demand.preferredTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {demand.matchedVolunteers.length}/{demand.expectedVolunteers} 人
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {demand.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {demand.status === 'open' && currentUser && (
                  <div className="flex items-center">
                    {demand.applicants.some(a => a.volunteerId === currentUser.id) ? (
                      <span className="text-sm text-gray-500">已申请</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleApply(demand.id);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        立即申请
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  发布于 {format(new Date(demand.createdAt), 'yyyy-MM-dd')}
                </span>
                <div className="flex items-center gap-4">
                  {demand.applicants.length > 0 && (
                    <span className="text-gray-500">
                      已有 {demand.applicants.length} 人申请
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(e, demand.id)}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="发布服务需求"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">需求标题 *</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入需求标题"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">需求描述 *</label>
              <textarea
                className="input min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述服务需求"
              />
            </div>

            <div>
              <label className="label">需求机构 *</label>
              <input
                type="text"
                className="input"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="请输入机构名称"
              />
            </div>

            <div>
              <label className="label">期望志愿者人数</label>
              <input
                type="number"
                className="input"
                value={formData.expectedVolunteers}
                onChange={(e) => setFormData({ ...formData, expectedVolunteers: Number(e.target.value) })}
                min="1"
              />
            </div>

            <div>
              <label className="label">联系人</label>
              <input
                type="text"
                className="input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="联系人姓名"
              />
            </div>

            <div>
              <label className="label">联系电话</label>
              <input
                type="text"
                className="input"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="联系电话"
              />
            </div>

            <div>
              <label className="label">期望服务时间</label>
              <input
                type="text"
                className="input"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                placeholder="如：周末上午"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">技能要求</label>
              <input
                type="text"
                className="input"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="多个技能用逗号分隔，如：耐心, 沟通能力"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              发布需求
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除服务需求"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确定要删除此服务需求吗？删除后无法恢复。</p>
          {demandToDelete && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium text-red-700">
                {serviceDemands.find(d => d.id === demandToDelete)?.title}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {serviceDemands.find(d => d.id === demandToDelete)?.organization}
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
            <button onClick={handleDeleteDemand} className="btn btn-danger">
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
