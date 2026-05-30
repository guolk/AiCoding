import { useState } from 'react';
import { 
  Pill, 
  AlertTriangle, 
  Leaf, 
  FileText,
  Check,
  X,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/common/StatCard';
import { 
  isExpiringThisMonth, 
  isExpiringNextMonth, 
  isExpired, 
  getDaysUntilExpiry,
  formatDate,
  getMealRelationText
} from '../utils/dateUtils';
import { getMakeupAdvice } from '../utils/dosageAdvice';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';

export function Dashboard() {
  const navigate = useNavigate();
  const [showMissedModal, setShowMissedModal] = useState(false);
  
  const { 
    medicines, reminders, supplements, medicalRecords, dosageRecords, addDosageRecord
  } = useAppStore();

  const activeReminders = reminders.filter(r => r.isActive);
  const thisMonthExpiring = medicines.filter(m => isExpiringThisMonth(m.expiryDate));
  const nextMonthExpiring = medicines.filter(m => isExpiringNextMonth(m.expiryDate));
  const expiredMedicines = medicines.filter(m => isExpired(m.expiryDate));
  
  const todayDosageRecords = dosageRecords.filter(r => {
    const today = new Date();
    const recordDate = new Date(r.createdAt);
    return recordDate.toDateString() === today.toDateString();
  });
  
  const missedDosages = dosageRecords.filter(r => r.status === 'missed');

  type MedicineWithUrgency = typeof medicines[0] & { urgency: string };
  const allExpiring: MedicineWithUrgency[] = [
    ...expiredMedicines.map(m => ({ ...m, urgency: 'expired' })),
    ...thisMonthExpiring.map(m => ({ ...m, urgency: 'thisMonth' })),
    ...nextMonthExpiring.map(m => ({ ...m, urgency: 'nextMonth' })),
  ].sort((a, b) => {
    const order: Record<string, number> = { expired: 0, thisMonth: 1, nextMonth: 2 };
    return order[a.urgency] - order[b.urgency];
  });

  const upcomingVisits = medicalRecords
    .filter(r => r.nextVisitDate)
    .filter(r => {
      const visitDate = new Date(r.nextVisitDate!);
      return visitDate >= new Date();
    })
    .sort((a, b) => new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">欢迎回来 👋</h1>
        <p className="text-slate-500">今日健康管理一目了然</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日用药"
          value={todayDosageRecords.length}
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="本月过期药品"
          value={thisMonthExpiring.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="药品总数"
          value={medicines.length}
          icon={Pill}
          color="green"
        />
        <StatCard
          title="保健品数量"
          value={supplements.length}
          icon={Leaf}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">今日用药计划</h2>
              <button
                onClick={() => navigate('/reminders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeReminders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无用药提醒</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      reminder.isChronic ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{reminder.medicineName}</h3>
                        {reminder.isChronic && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            慢性病
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {reminder.time} {getMealRelationText(reminder.relationToMeal)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addDosageRecord({
                            medicineId: reminder.medicineId,
                            medicineName: reminder.medicineName,
                            type: reminder.isChronic ? 'prescription' : 'otc',
                            dosage: '',
                            scheduledTime: reminder.time,
                            status: 'taken',
                            actualTime: new Date().toISOString()
                          });
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        已服用
                      </button>
                      <button
                        onClick={() => {
                          addDosageRecord({
                            medicineId: reminder.medicineId,
                            medicineName: reminder.medicineName,
                            type: reminder.isChronic ? 'prescription' : 'otc',
                            dosage: '',
                            scheduledTime: reminder.time,
                            status: 'missed',
                            makeupAdvice: getMakeupAdvice().join('\n')
                          });
                        }}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        漏服
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">最近就医记录</h2>
              <button
                onClick={() => navigate('/medical-records')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {medicalRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无就医记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{record.hospital}</h3>
                      <p className="text-sm text-slate-500">{record.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600">{formatDate(record.date)}</p>
                      {record.nextVisitDate && (
                        <p className="text-xs text-emerald-600">复诊: {formatDate(record.nextVisitDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todayDosageRecords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">今日用药记录</h2>
              <div className="space-y-3">
                {todayDosageRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border",
                      record.status === 'taken' ? "bg-emerald-50 border-emerald-100" :
                      record.status === 'missed' ? "bg-red-50 border-red-100" :
                      "bg-slate-50 border-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      record.status === 'taken' ? "bg-emerald-500 text-white" :
                      record.status === 'missed' ? "bg-red-500 text-white" :
                      "bg-slate-300 text-slate-700"
                    )}>
                      {record.status === 'taken' ? <Check className="w-5 h-5" /> :
                       record.status === 'missed' ? <X className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{record.medicineName}</p>
                      <p className="text-sm text-slate-500">
                        {record.scheduledTime}
                        {record.actualTime && ` · ${record.actualTime}`}
                      </p>
                    </div>
                    <div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        record.status === 'taken' ? "bg-emerald-100 text-emerald-700" :
                        record.status === 'missed' ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {record.status === 'taken' ? "已服用" :
                         record.status === 'missed' ? "漏服" : "待服用"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {allExpiring.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                过期预警
              </h2>
              <div className="space-y-3">
                {allExpiring.slice(0, 5).map((medicine) => {
                  const daysUntil = getDaysUntilExpiry(medicine.expiryDate);
                  return (
                    <div
                      key={medicine.id}
                      className={cn(
                        "p-4 rounded-xl border",
                        medicine.urgency === 'expired' ? "bg-red-50 border-red-200" :
                        medicine.urgency === 'thisMonth' ? "bg-orange-50 border-orange-200" :
                        "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn(
                          "w-5 h-5",
                          medicine.urgency === 'expired' ? "text-red-500" :
                          medicine.urgency === 'thisMonth' ? "text-orange-500" :
                          "text-amber-500"
                        )} />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{medicine.name}</p>
                          <p className={cn(
                            "text-sm",
                            medicine.urgency === 'expired' ? "text-red-600" :
                            medicine.urgency === 'thisMonth' ? "text-orange-600" :
                            "text-amber-600"
                          )}>
                            {medicine.urgency === 'expired' ? "已过期" :
                             medicine.urgency === 'thisMonth' ? `还有 ${daysUntil} 天过期` :
                             "下月过期"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => navigate('/safety')}
                className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium text-center"
              >
                查看全部过期药品
              </button>
            </div>
          )}

          {missedDosages.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">漏服记录</h2>
              <div className="space-y-3">
                {missedDosages.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-red-50 border border-red-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{record.medicineName}</p>
                        <p className="text-sm text-slate-500">
                          {record.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMissedModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      查看补服建议
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/reminders')}
                className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium text-center"
              >
                查看全部漏服记录
              </button>
            </div>
          )}

          {upcomingVisits.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                复诊提醒
              </h2>
              <div className="space-y-3">
                {upcomingVisits.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-purple-50 border border-purple-200"
                  >
                    <p className="font-medium text-slate-800">{record.hospital}</p>
                    <p className="text-sm text-purple-600">
                      {formatDate(record.nextVisitDate!)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">用药小贴士</h3>
            <ul className="space-y-2 text-sm text-blue-50">
              <li>• 请按时服药，保持规律</li>
              <li>• 定期检查药品有效期</li>
              <li>• 保健品与药物可能有相互作用</li>
              <li>• 漏服不要加倍服用</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showMissedModal}
        onClose={() => setShowMissedModal(false)}
        title="漏服补服建议"
      >
        <div className="space-y-4">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h4 className="font-medium text-slate-800 mb-2">补服原则：</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {getMakeupAdvice().map((advice, index) => (
                <li key={index}>• {advice}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setShowMissedModal(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            我知道了
          </button>
        </div>
      </Modal>
    </div>
  );
}
