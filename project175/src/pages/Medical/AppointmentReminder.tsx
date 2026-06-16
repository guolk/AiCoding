import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  StickyNote,
  Bell,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useHealthStore } from '@/store';
import type { Appointment } from '@/types';
import { cn, formatDate } from '@/utils';

const appointmentTypeLabels: Record<Appointment['type'], string> = {
  'follow-up': '定期复诊',
  consultation: '门诊咨询',
  exam: '检查预约',
  other: '其他',
};

const appointmentTypeColors: Record<Appointment['type'], string> = {
  'follow-up': 'bg-blue-100 text-blue-700 border-blue-200',
  consultation: 'bg-purple-100 text-purple-700 border-purple-200',
  exam: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function AppointmentReminder() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    time: '09:00',
    doctor: '',
    department: '',
    hospital: '',
    type: 'follow-up' as Appointment['type'],
    note: '',
    isCompleted: false,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = formatDate(new Date());

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.time < b.time ? -1 : 1;
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(
    () => sortedAppointments.filter((a) => !a.isCompleted && a.date >= today),
    [sortedAppointments, today]
  );

  const pastAppointments = useMemo(
    () => sortedAppointments.filter((a) => a.isCompleted || a.date < today).reverse(),
    [sortedAppointments, today]
  );

  const openAddModal = () => {
    setEditingAppointment(null);
    setFormData({
      date: formatDate(new Date()),
      time: '09:00',
      doctor: '',
      department: '',
      hospital: '',
      type: 'follow-up',
      note: '',
      isCompleted: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      date: apt.date,
      time: apt.time,
      doctor: apt.doctor,
      department: apt.department,
      hospital: apt.hospital,
      type: apt.type,
      note: apt.note || '',
      isCompleted: apt.isCompleted,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.doctor.trim()) return;

    const data = {
      date: formData.date,
      time: formData.time,
      doctor: formData.doctor,
      department: formData.department,
      hospital: formData.hospital,
      type: formData.type,
      note: formData.note || undefined,
      isCompleted: formData.isCompleted,
    };

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, data);
    } else {
      addAppointment(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    setDeleteConfirmId(null);
  };

  const toggleCompleted = (id: string, currentStatus: boolean) => {
    updateAppointment(id, { isCompleted: !currentStatus });
  };

  const getDaysUntil = (date: string) => {
    const diff = Math.ceil(
      (new Date(date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-amber-100 text-sm">
            <Bell className="w-4 h-4" />
            待复诊
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{upcomingAppointments.length}</span>
            <span className="text-lg text-amber-100">次</span>
          </div>
          <div className="mt-2 text-xs text-amber-100">
            近期预约
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            最近一次
          </div>
          <div className="mt-2">
            {upcomingAppointments.length > 0 ? (
              <>
                <p className="text-xl font-bold text-gray-800">
                  {upcomingAppointments[0].date}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {upcomingAppointments[0].doctor} · {upcomingAppointments[0].department}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-400">暂无预约</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            已完成
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-green-600 tabular-nums">
              {pastAppointments.length}
            </span>
            <span className="text-lg text-gray-400">次</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            历史就诊
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">即将到来</h3>
              <p className="text-xs text-gray-500">近期的预约和复诊提醒</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            添加预约
          </button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无待就诊预约</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-amber-600 hover:text-amber-700"
            >
              点击添加第一个预约
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => {
              const daysUntil = getDaysUntil(apt.date);
              const isUrgent = daysUntil <= 3;
              return (
                <div
                  key={apt.id}
                  className={cn(
                    'group flex items-start gap-4 p-4 rounded-xl transition-all',
                    isUrgent
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-gray-50/50 hover:bg-gray-50 border border-transparent'
                  )}
                >
                  <div className="shrink-0 w-16 h-16 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {new Date(apt.date).toLocaleDateString('zh-CN', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {new Date(apt.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900">{apt.doctor}</h4>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full border',
                        appointmentTypeColors[apt.type]
                      )}>
                        {appointmentTypeLabels[apt.type]}
                      </span>
                      {isUrgent && daysUntil >= 0 && (
                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {daysUntil === 0 ? '今天' : `还有 ${daysUntil} 天`}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {apt.department}
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {apt.hospital}
                      </div>
                    </div>
                    {apt.note && (
                      <p className="mt-2 text-xs text-gray-400 line-clamp-2">{apt.note}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleCompleted(apt.id, apt.isCompleted)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="标记为已完成"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(apt)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(apt.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pastAppointments.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              历史记录
            </h3>
          </div>
          <div className="space-y-2">
            {pastAppointments.slice(0, 5).map((apt) => (
              <div
                key={apt.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50/30 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400">
                      {new Date(apt.date).toLocaleDateString('zh-CN', { month: 'short' })}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {new Date(apt.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{apt.doctor}</p>
                    <p className="text-xs text-gray-500">{apt.department} · {apt.hospital}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full border',
                    appointmentTypeColors[apt.type]
                  )}>
                    {appointmentTypeLabels[apt.type]}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(apt)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(apt.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAppointment ? '编辑预约' : '添加预约'}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    时间 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(appointmentTypeLabels) as Appointment['type'][]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={cn(
                        'py-2 px-1 rounded-lg text-xs font-medium border transition-colors',
                        formData.type === type
                          ? appointmentTypeColors[type]
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {appointmentTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  医生 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="请输入医生姓名"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    科室
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="如：心内科"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    医院
                  </label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder="请输入医院名称"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <StickyNote className="inline w-4 h-4 mr-1" />
                  备注（选填）
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="记录注意事项等..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isCompleted" className="text-sm text-gray-700">
                  已完成
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white',
                    formData.doctor.trim() && formData.date && formData.time
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'cursor-not-allowed bg-amber-300'
                  )}
                  disabled={!formData.doctor.trim() || !formData.date || !formData.time}
                >
                  {editingAppointment ? '保存修改' : '添加预约'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              确定要删除这条预约记录吗？删除后无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
