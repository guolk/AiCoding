import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Phone,
  Calendar,
  Users,
  UserCheck,
  XCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { format } from 'date-fns';

export default function ServiceDemandDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serviceDemands, deleteServiceDemand, approveApplicant, rejectApplicant, volunteers } = useStore();
  
  const demand = serviceDemands.find((d) => d.id === id);
  const [activeTab, setActiveTab] = useState<'info' | 'applicants'>('info');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteDemand = () => {
    if (demand) {
      deleteServiceDemand(demand.id);
      navigate('/demands');
    }
  };

  if (!demand) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">需求不存在</p>
        <Link to="/demands" className="btn btn-primary mt-4">返回列表</Link>
      </div>
    );
  }

  const matchedVolunteers = volunteers.filter(v =>
    demand.matchedVolunteers.includes(v.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/demands" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{demand.title}</h1>
              <StatusBadge status={demand.status} type="demand" />
            </div>
            <p className="text-gray-500 mt-1">
              发布于 {format(new Date(demand.createdAt), 'yyyy年MM月dd日')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-danger"
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>

      {/* Basic Info */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">需求机构</p>
              <p className="font-medium">{demand.organization}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">联系方式</p>
              <p className="font-medium">{demand.contactPerson}</p>
              <p className="text-sm text-gray-500">{demand.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">期望时间</p>
              <p className="font-medium">{demand.preferredTime || '面议'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">需求人数</p>
              <p className="font-medium">
                {demand.matchedVolunteers.length} / {demand.expectedVolunteers} 人
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'info', label: '需求详情' },
            { key: 'applicants', label: `申请管理 (${demand.applicants.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">需求描述</h3>
            <p className="text-gray-600 leading-relaxed">{demand.description}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">技能要求</h3>
            <div className="flex flex-wrap gap-2">
              {demand.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {matchedVolunteers.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">已匹配志愿者</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedVolunteers.map((volunteer) => (
                  <div key={volunteer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{volunteer.name}</p>
                      <p className="text-sm text-gray-500">{volunteer.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'applicants' && (
        <div className="card p-6">
          {demand.applicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无申请者</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">志愿者</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">申请时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {demand.applicants.map((applicant) => {
                    const volunteer = volunteers.find(v => v.id === applicant.volunteerId);
                    return (
                      <tr key={applicant.volunteerId} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {volunteer && (
                              <img
                                src={volunteer.avatar}
                                alt={applicant.volunteerName}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{applicant.volunteerName}</p>
                              {volunteer && (
                                <p className="text-sm text-gray-500">{volunteer.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(applicant.applyTime), 'yyyy-MM-dd HH:mm')}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={applicant.status} type="registration" />
                        </td>
                        <td className="py-3 px-4">
                          {applicant.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveApplicant(demand.id, applicant.volunteerId)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                通过
                              </button>
                              <button
                                onClick={() => rejectApplicant(demand.id, applicant.volunteerId)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                拒绝
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除服务需求"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确定要删除此服务需求吗？删除后无法恢复。</p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-medium text-red-700">{demand.title}</p>
            <p className="text-sm text-red-600 mt-1">{demand.organization}</p>
          </div>
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
