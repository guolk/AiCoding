import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Package,
  UserCheck,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { format } from 'date-fns';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, updateRegistration, addMaterial, updateMaterial, deleteMaterial, deleteActivity, currentUser } = useStore();
  
  const activity = activities.find((a) => a.id === id);
  
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: '', responsible: '' });
  const [activeTab, setActiveTab] = useState<'info' | 'registrations' | 'materials'>('info');

  if (!activity) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">活动不存在</p>
        <Link to="/activities" className="btn btn-primary mt-4">返回列表</Link>
      </div>
    );
  }

  const handleCheckIn = (registrationId: string) => {
    updateRegistration(activity.id, registrationId, {
      checkInStatus: 'checked-in',
      checkInTime: new Date().toISOString(),
    });
  };

  const handleCheckOut = (registrationId: string) => {
    updateRegistration(activity.id, registrationId, {
      checkInStatus: 'checked-out',
      checkOutTime: new Date().toISOString(),
    });
  };

  const handleApprove = (registrationId: string) => {
    updateRegistration(activity.id, registrationId, { status: 'approved' });
  };

  const handleReject = (registrationId: string) => {
    updateRegistration(activity.id, registrationId, { status: 'rejected' });
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.quantity) {
      addMaterial(activity.id, {
        name: newMaterial.name,
        quantity: Number(newMaterial.quantity),
        unit: newMaterial.unit,
        responsible: newMaterial.responsible,
        status: 'pending',
      });
      setNewMaterial({ name: '', quantity: '', unit: '', responsible: '' });
      setShowMaterialModal(false);
    }
  };

  const handleSignUp = () => {
    if (currentUser) {
      const alreadyRegistered = activity.registrations.some(r => r.volunteerId === currentUser.id);
      if (!alreadyRegistered) {
        // This would be handled by addRegistration in a real app
        alert('报名功能演示');
      }
    }
    setShowRegistrationModal(false);
  };

  const handleDeleteActivity = () => {
    if (activity) {
      deleteActivity(activity.id);
      navigate('/activities');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>
            <StatusBadge status={activity.status} type="activity" />
          </div>
          <p className="text-gray-500">
            发布于 {format(new Date(activity.startTime), 'yyyy-MM-dd')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="btn btn-primary"
          >
            <UserCheck className="w-4 h-4" />
            立即报名
          </button>
          <Link to={`/activities/${activity.id}/edit`} className="btn btn-secondary">
            <Edit className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">活动时间</p>
              <p className="font-medium">{format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')}</p>
              <p className="text-sm text-gray-500">至 {format(new Date(activity.endTime), 'yyyy-MM-dd HH:mm')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">活动地点</p>
              <p className="font-medium">{activity.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">招募人数</p>
              <p className="font-medium">
                {activity.registrations.filter(r => r.status === 'approved').length} / {activity.maxVolunteers} 人
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'info', label: '活动详情' },
            { key: 'registrations', label: `报名管理 (${activity.registrations.length})` },
            { key: 'materials', label: `物资管理 (${activity.materials.length})` },
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
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">活动简介</h3>
            <p className="text-gray-600">{activity.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">技能要求</h3>
            <div className="flex flex-wrap gap-2">
              {activity.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">志愿者</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">联系方式</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">报名时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">审核状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">签到状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {activity.registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-medium">
                            {reg.volunteerName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{reg.volunteerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{reg.phone}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(reg.signUpTime), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={reg.status} type="registration" />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${
                        reg.checkInStatus === 'checked-out' ? 'text-green-600' :
                        reg.checkInStatus === 'checked-in' ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {reg.checkInStatus === 'checked-out' && <Clock className="w-4 h-4" />}
                        {reg.checkInStatus === 'checked-in' && <CheckCircle className="w-4 h-4" />}
                        {reg.checkInStatus === 'not-started' && <XCircle className="w-4 h-4" />}
                        {reg.checkInStatus === 'checked-out' ? '已签退' :
                         reg.checkInStatus === 'checked-in' ? '已签到' : '未开始'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(reg.id)}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(reg.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && reg.checkInStatus === 'not-started' && (
                          <button
                            onClick={() => handleCheckIn(reg.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            签到
                          </button>
                        )}
                        {reg.checkInStatus === 'checked-in' && (
                          <button
                            onClick={() => handleCheckOut(reg.id)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            签退
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowMaterialModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              添加物资
            </button>
          </div>
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">物资名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">数量</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">负责人</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.materials.map((material) => (
                    <tr key={material.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{material.name}</td>
                      <td className="py-3 px-4 text-gray-600">{material.quantity} {material.unit}</td>
                      <td className="py-3 px-4 text-gray-600">{material.responsible}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={material.status} type="material" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {material.status === 'pending' && (
                            <button
                              onClick={() => updateMaterial(activity.id, material.id, { status: 'prepared' })}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              标记已准备
                            </button>
                          )}
                          {material.status === 'prepared' && (
                            <button
                              onClick={() => updateMaterial(activity.id, material.id, { status: 'used' })}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              标记已使用
                            </button>
                          )}
                          <button
                            onClick={() => deleteMaterial(activity.id, material.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        title="活动报名"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确定要报名参加此活动吗？</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{activity.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')} · {activity.location}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowRegistrationModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSignUp} className="btn btn-primary">
              确认报名
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Material Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title="添加物资"
      >
        <div className="space-y-4">
          <div>
            <label className="label">物资名称</label>
            <input
              type="text"
              className="input"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              placeholder="请输入物资名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">数量</label>
              <input
                type="number"
                className="input"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                placeholder="数量"
              />
            </div>
            <div>
              <label className="label">单位</label>
              <input
                type="text"
                className="input"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                placeholder="如：个、斤、件"
              />
            </div>
          </div>
          <div>
            <label className="label">负责人</label>
            <input
              type="text"
              className="input"
              value={newMaterial.responsible}
              onChange={(e) => setNewMaterial({ ...newMaterial, responsible: e.target.value })}
              placeholder="负责人姓名"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowMaterialModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddMaterial} className="btn btn-primary">
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除活动"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确定要删除此活动吗？删除后无法恢复。</p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-medium text-red-700">{activity.name}</p>
            <p className="text-sm text-red-600 mt-1">
              {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')} · {activity.location}
            </p>
          </div>
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
