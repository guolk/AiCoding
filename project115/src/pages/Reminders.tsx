import { useState } from 'react';
import { 
  Plus, 
  Bell, 
  Clock, 
  Calendar,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Power,
  PowerOff,
  Pill,
  History
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  formatDate, 
  formatTime, 
  getMealRelationText, 
  getFrequencyText,
  getTodayDateString,
  getCurrentTimeString
} from '../utils/dateUtils';
import { getMakeupAdvice } from '../utils/dosageAdvice';
import { cn } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';
import { Reminder, FrequencyType, MealRelation, DosageRecord } from '../types';

interface ReminderFormData {
  medicineId: string;
  medicineName: string;
  time: string;
  frequency: FrequencyType;
  relationToMeal: MealRelation;
  isChronic: boolean;
  startDate: string;
  endDate: string;
}

const initialFormData: ReminderFormData = {
  medicineId: '',
  medicineName: '',
  time: getCurrentTimeString(),
  frequency: 'daily',
  relationToMeal: 'after',
  isChronic: false,
  startDate: getTodayDateString(),
  endDate: ''
};

export function Reminders() {
  const { 
    reminders, 
    medicines, 
    dosageRecords,
    addReminder, 
    updateReminder, 
    deleteReminder,
    addDosageRecord
  } = useAppStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<ReminderFormData>(initialFormData);
  const [selectedMissedRecord, setSelectedMissedRecord] = useState<DosageRecord | null>(null);

  const filteredReminders = reminders.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return r.isActive;
    return !r.isActive;
  });

  const activeReminders = reminders.filter(r => r.isActive);
  const missedDosages = dosageRecords.filter(r => r.status === 'missed');

  const handleSubmit = () => {
    if (!formData.medicineId.trim() || !formData.time.trim()) return;

    const reminderData = {
      medicineId: formData.medicineId,
      medicineName: formData.medicineName,
      time: formData.time,
      frequency: formData.frequency,
      relationToMeal: formData.relationToMeal,
      isChronic: formData.isChronic,
      startDate: formData.startDate,
      ...(formData.endDate ? { endDate: formData.endDate } : {})
    };

    if (editingReminder) {
      updateReminder(editingReminder.id, reminderData);
    } else {
      addReminder({
        ...reminderData,
        isActive: true
      });
    }

    handleCloseModal();
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicineId: reminder.medicineId,
      medicineName: reminder.medicineName,
      time: reminder.time,
      frequency: reminder.frequency,
      relationToMeal: reminder.relationToMeal,
      isChronic: reminder.isChronic,
      startDate: reminder.startDate,
      endDate: reminder.endDate || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReminder(null);
    setFormData(initialFormData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个提醒吗？')) {
      deleteReminder(id);
    }
  };

  const toggleReminderStatus = (id: string, isActive: boolean) => {
    updateReminder(id, { isActive: !isActive });
  };

  const handleMarkTaken = (reminder: Reminder) => {
    addDosageRecord({
      medicineId: reminder.medicineId,
      medicineName: reminder.medicineName,
      type: reminder.isChronic ? 'prescription' : 'otc',
      dosage: '',
      scheduledTime: reminder.time,
      status: 'taken',
      actualTime: new Date().toISOString()
    });
  };

  const handleMarkMissed = (reminder: Reminder) => {
    addDosageRecord({
      medicineId: reminder.medicineId,
      medicineName: reminder.medicineName,
      type: reminder.isChronic ? 'prescription' : 'otc',
      dosage: '',
      scheduledTime: reminder.time,
      status: 'missed',
      makeupAdvice: getMakeupAdvice().join('\n')
    });
  };

  const handleShowMakeupAdvice = (record: DosageRecord) => {
    setSelectedMissedRecord(record);
    setIsMakeupModalOpen(true);
  };

  const handleMedicineSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medicine = medicines.find(m => m.id === e.target.value);
    if (medicine) {
      setFormData({
        ...formData,
        medicineId: medicine.id,
        medicineName: medicine.name
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用药提醒</h1>
          <p className="text-slate-500">管理您的用药提醒和服药记录</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          新增提醒
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="当前提醒"
          value={activeReminders.length}
          icon={Bell}
          color="blue"
        />
        <StatCard
          title="漏服次数"
          value={missedDosages.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="药品可选"
          value={medicines.length}
          icon={Pill}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">用药提醒列表</h2>
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      filterStatus === status
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {status === 'all' ? '全部' : status === 'active' ? '启用' : '停用'}
                  </button>
                ))}
              </div>
            </div>

            {filteredReminders.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="暂无提醒"
                description="点击上方按钮添加您的第一个用药提醒"
              />
            ) : (
              <div className="space-y-4">
                {filteredReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all",
                      reminder.isActive 
                        ? "bg-white border-slate-100 hover:shadow-md" 
                        : "bg-slate-50 border-slate-200 opacity-75"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          reminder.isChronic 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-emerald-100 text-emerald-600"
                        )}>
                          <Bell className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800">{reminder.medicineName}</h3>
                            {reminder.isChronic && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                慢性病
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{getFrequencyText(reminder.frequency)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleReminderStatus(reminder.id, reminder.isActive)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            reminder.isActive 
                              ? "text-emerald-600 hover:bg-emerald-50" 
                              : "text-slate-400 hover:bg-slate-100"
                          )}
                          title={reminder.isActive ? '停用提醒' : '启用提醒'}
                        >
                          {reminder.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(reminder)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatTime(reminder.time)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {getMealRelationText(reminder.relationToMeal)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        开始: {formatDate(reminder.startDate)}
                      </div>
                      {reminder.endDate && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          结束: {formatDate(reminder.endDate)}
                        </div>
                      )}
                    </div>

                    {reminder.isActive && (
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleMarkTaken(reminder)}
                          className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          已服用
                        </button>
                        <button
                          onClick={() => handleMarkMissed(reminder)}
                          className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          漏服
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-500" />
              漏服记录
            </h2>

            {missedDosages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Check className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-400" />
                <p>暂无漏服记录</p>
                <p className="text-sm">继续保持！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {missedDosages.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-red-50 border border-red-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{record.medicineName}</p>
                        <p className="text-sm text-slate-500">
                          计划时间: {record.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShowMakeupAdvice(record)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      查看补服建议
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">漏服小贴士</h3>
            <ul className="space-y-2 text-sm text-amber-50">
              <li>• 不要加倍补服</li>
              <li>• 按时服药是最佳选择</li>
              <li>• 慢性病药物不可随意停药</li>
              <li>• 如有疑问请咨询医生</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingReminder ? '编辑提醒' : '新增提醒'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              选择药品 <span className="text-red-500">*</span>
            </label>
            {medicines.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-sm">
                暂无可用药品，请先在药品档案中添加
              </div>
            ) : (
              <select
                value={formData.medicineId}
                onChange={handleMedicineSelect}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">请选择药品</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} ({medicine.specification})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                提醒时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                频率
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as FrequencyType })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">每天</option>
                <option value="weekdays">工作日</option>
                <option value="weekends">周末</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                与进餐关系
              </label>
              <select
                value={formData.relationToMeal}
                onChange={(e) => setFormData({ ...formData, relationToMeal: e.target.value as MealRelation })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="before">饭前</option>
                <option value="after">饭后</option>
                <option value="any">不限</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isChronic}
                  onChange={(e) => setFormData({ ...formData, isChronic: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">慢性病长期用药</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                结束日期（可选）
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!formData.medicineId}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingReminder ? '保存修改' : '添加提醒'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMakeupModalOpen}
        onClose={() => setIsMakeupModalOpen(false)}
        title="漏服补服建议"
      >
        <div className="space-y-4">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
          
          {selectedMissedRecord && (
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="font-medium text-slate-800 mb-1">{selectedMissedRecord.medicineName}</p>
              <p className="text-sm text-slate-500">计划服药时间: {selectedMissedRecord.scheduledTime}</p>
            </div>
          )}

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h4 className="font-medium text-slate-800 mb-2">补服原则：</h4>
            {selectedMissedRecord?.makeupAdvice ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {selectedMissedRecord.makeupAdvice.split('\n').map((advice, index) => (
                  <li key={index}>• {advice}</li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-slate-600">
                {getMakeupAdvice().map((advice, index) => (
                  <li key={index}>• {advice}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h4 className="font-medium text-slate-800 mb-2">注意事项：</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• 如有疑问，请咨询医生或药师</li>
              <li>• 慢性病药物请不要擅自停药</li>
              <li>• 记录漏服原因，避免再次发生</li>
            </ul>
          </div>

          <button
            onClick={() => setIsMakeupModalOpen(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            我知道了
          </button>
        </div>
      </Modal>
    </div>
  );
}
