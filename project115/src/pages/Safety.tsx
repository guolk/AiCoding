import { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Calendar,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Info,
  Trash2,
  History
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  formatDate, 
  isExpired, 
  getDaysUntilExpiry, 
  isExpiringThisMonth,
  isExpiringNextMonth,
  isDaysOverdue,
  getTodayDateString
} from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';
import { Medicine } from '../types';

interface InventoryCheckFormData {
  medicineCount: number;
  expiredCount: number;
  notes: string;
}

const initialInventoryForm: InventoryCheckFormData = {
  medicineCount: 0,
  expiredCount: 0,
  notes: ''
};

export function Safety() {
  const { 
    medicines, 
    inventoryChecks, 
    lastInventoryCheckDate, 
    inventoryCheckInterval,
    addInventoryCheck,
    updateLastInventoryCheck,
    updateMedicine
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'expired' | 'contraindications' | 'inventory'>('expired');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [showContraindicationDetail, setShowContraindicationDetail] = useState<Medicine | null>(null);
  const [inventoryForm, setInventoryForm] = useState<InventoryCheckFormData>(initialInventoryForm);

  const expiredMedicines = medicines.filter(m => isExpired(m.expiryDate));
  const thisMonthExpiring = medicines.filter(m => isExpiringThisMonth(m.expiryDate));
  const nextMonthExpiring = medicines.filter(m => isExpiringNextMonth(m.expiryDate));

  const hasContraindications = medicines.filter(m => 
    m.contraindications.children || 
    m.contraindications.elderly || 
    m.contraindications.pregnancy ||
    m.contraindications.custom
  );

  const isInventoryOverdue = lastInventoryCheckDate 
    ? isDaysOverdue(lastInventoryCheckDate, inventoryCheckInterval)
    : true;

  const handleInventorySubmit = () => {
    addInventoryCheck({
      checkDate: getTodayDateString(),
      medicineCount: inventoryForm.medicineCount,
      expiredCount: inventoryForm.expiredCount,
      notes: inventoryForm.notes
    });
    updateLastInventoryCheck(getTodayDateString());
    setIsInventoryModalOpen(false);
    setInventoryForm(initialInventoryForm);
  };

  const handleDiscardExpired = (medicine: Medicine) => {
    if (window.confirm(`确定要将 "${medicine.name}" 标记为已处理（丢弃）吗？`)) {
      updateMedicine(medicine.id, { 
        currentQuantity: 0,
        notes: medicine.notes + '\n[已过期丢弃]'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">药品安全</h1>
          <p className="text-slate-500">过期药品、用药禁忌与库存管理</p>
        </div>
        <button
          onClick={() => setIsInventoryModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          新增盘点
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="已过期"
          value={expiredMedicines.length}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="本月过期"
          value={thisMonthExpiring.length}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="下月过期"
          value={nextMonthExpiring.length}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="有禁忌药品"
          value={hasContraindications.length}
          icon={Shield}
          color="purple"
        />
      </div>

      {isInventoryOverdue && lastInventoryCheckDate && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">库存盘点提醒</p>
            <p className="text-xs text-orange-600">
              上次盘点: {formatDate(lastInventoryCheckDate)}，已超过 {inventoryCheckInterval} 天，请及时盘点
            </p>
          </div>
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
          >
            立即盘点
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {([
            { key: 'expired', label: '过期药品', icon: AlertTriangle },
            { key: 'contraindications', label: '用药禁忌', icon: Shield },
            { key: 'inventory', label: '库存盘点', icon: Package }
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'expired' && (
            <div className="space-y-6">
              {expiredMedicines.length === 0 && thisMonthExpiring.length === 0 && nextMonthExpiring.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="暂无过期药品"
                  description="您的药品库状态良好，继续保持定期检查"
                />
              ) : (
                <>
                  {expiredMedicines.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        已过期药品 ({expiredMedicines.length})
                      </h3>
                      <div className="space-y-2">
                        {expiredMedicines.map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-4 bg-red-50 border border-red-200 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                  <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{medicine.name}</p>
                                  <p className="text-sm text-red-600">
                                    过期 {Math.abs(getDaysUntilExpiry(medicine.expiryDate))} 天
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                  已过期
                                </span>
                                <button
                                  onClick={() => handleDiscardExpired(medicine)}
                                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                  title="标记为已处理"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {thisMonthExpiring.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        本月过期 ({thisMonthExpiring.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {thisMonthExpiring.map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-4 bg-orange-50 border border-orange-200 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">{medicine.name}</p>
                                <p className="text-sm text-orange-600">
                                  剩余 {getDaysUntilExpiry(medicine.expiryDate)} 天
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                本月过期
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {nextMonthExpiring.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        下月过期 ({nextMonthExpiring.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {nextMonthExpiring.map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">{medicine.name}</p>
                                <p className="text-sm text-amber-600">
                                  剩余 {getDaysUntilExpiry(medicine.expiryDate)} 天
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                                下月过期
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'contraindications' && (
            <div className="space-y-4">
              {hasContraindications.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="暂无特殊禁忌药品"
                  description="您的药品库中没有标记特殊禁忌的药品"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasContraindications.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="p-5 bg-purple-50 border border-purple-200 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{medicine.name}</p>
                            <p className="text-sm text-slate-500">{medicine.specification}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowContraindicationDetail(medicine)}
                          className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Info className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {medicine.contraindications.children && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            儿童禁用
                          </span>
                        )}
                        {medicine.contraindications.elderly && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            老人慎用
                          </span>
                        )}
                        {medicine.contraindications.pregnancy && (
                          <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">
                            孕妇禁用
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">药品总数</p>
                  <p className="text-2xl font-bold text-slate-800">{medicines.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">上次盘点</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {lastInventoryCheckDate ? formatDate(lastInventoryCheckDate) : '未记录'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">盘点周期</p>
                  <p className="text-2xl font-bold text-slate-800">{inventoryCheckInterval} 天</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  盘点记录
                </h3>
                {inventoryChecks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无盘点记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inventoryChecks
                      .sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime())
                      .map((check) => (
                        <div
                          key={check.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-slate-800">
                                {formatDate(check.checkDate)} 盘点
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-slate-600">
                              药品: <span className="font-medium">{check.medicineCount}</span>
                            </span>
                            <span className="text-slate-600">
                              过期: <span className="font-medium text-red-600">{check.expiredCount}</span>
                            </span>
                          </div>
                          {check.notes && (
                            <p className="text-sm text-slate-500 mt-2">{check.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title="新增库存盘点"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleInventorySubmit(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                盘点日期
              </label>
              <input
                type="date"
                value={getTodayDateString()}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                盘点药品总数
              </label>
              <input
                type="number"
                min="0"
                value={inventoryForm.medicineCount}
                onChange={(e) => setInventoryForm({ ...inventoryForm, medicineCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              发现过期药品数量
            </label>
            <input
              type="number"
              min="0"
              value={inventoryForm.expiredCount}
              onChange={(e) => setInventoryForm({ ...inventoryForm, expiredCount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              备注
            </label>
            <textarea
              value={inventoryForm.notes}
              onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
              placeholder="记录盘点中的发现..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsInventoryModalOpen(false)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              保存盘点
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showContraindicationDetail}
        onClose={() => setShowContraindicationDetail(null)}
        title="用药禁忌详情"
      >
        {showContraindicationDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{showContraindicationDetail.name}</h2>
                <p className="text-slate-500">{showContraindicationDetail.specification}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">禁忌人群：</h4>
              <div className="grid grid-cols-1 gap-2">
                {showContraindicationDetail.contraindications.children && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-700">儿童禁用</p>
                    <p className="text-xs text-red-600 mt-1">本品可能影响儿童生长发育，请在医生指导下使用</p>
                  </div>
                )}
                {showContraindicationDetail.contraindications.elderly && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-700">老人慎用</p>
                    <p className="text-xs text-orange-600 mt-1">老人用药剂量可能需要调整，建议咨询医生</p>
                  </div>
                )}
                {showContraindicationDetail.contraindications.pregnancy && (
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-sm font-medium text-pink-700">孕妇禁用</p>
                    <p className="text-xs text-pink-600 mt-1">本品可能对胎儿造成影响，怀孕期间请勿使用</p>
                  </div>
                )}
                {showContraindicationDetail.contraindications.custom && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-700">其他禁忌</p>
                    <p className="text-xs text-amber-600 mt-1">{showContraindicationDetail.contraindications.custom}</p>
                  </div>
                )}
              </div>
            </div>

            {showContraindicationDetail.indications && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">适应症</p>
                <p className="font-medium text-slate-800">{showContraindicationDetail.indications}</p>
              </div>
            )}

            {showContraindicationDetail.notes && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">备注</p>
                <p className="font-medium text-slate-800">{showContraindicationDetail.notes}</p>
              </div>
            )}

            <button
              onClick={() => setShowContraindicationDetail(null)}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
