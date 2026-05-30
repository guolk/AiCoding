import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pill, 
  Calendar, 
  MapPin,
  Edit2,
  Trash2,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDate, isExpired, getDaysUntilExpiry, getExpiryStatus } from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Medicine, MedicineType } from '../types';

interface MedicineFormData {
  name: string;
  specification: string;
  indications: string;
  dosage: string;
  storageLocation: string;
  expiryDate: string;
  type: MedicineType;
  isPrescription: boolean;
  initialQuantity: number;
  currentQuantity: number;
  contraindications: {
    children: boolean;
    elderly: boolean;
    pregnancy: boolean;
    custom: string;
  };
  notes: string;
}

const initialFormData: MedicineFormData = {
  name: '',
  specification: '',
  indications: '',
  dosage: '',
  storageLocation: '',
  expiryDate: '',
  type: 'otc',
  isPrescription: false,
  initialQuantity: 0,
  currentQuantity: 0,
  contraindications: {
    children: false,
    elderly: false,
    pregnancy: false,
    custom: ''
  },
  notes: ''
};

export function Medicines() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'prescription' | 'otc'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>(initialFormData);
  const [showDetail, setShowDetail] = useState<Medicine | null>(null);

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, formData);
    } else {
      addMedicine({
        ...formData,
        currentQuantity: formData.initialQuantity
      });
    }

    handleCloseModal();
  };

  const handleOpenEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      specification: medicine.specification,
      indications: medicine.indications,
      dosage: medicine.dosage,
      storageLocation: medicine.storageLocation,
      expiryDate: medicine.expiryDate,
      type: medicine.type,
      isPrescription: medicine.isPrescription,
      initialQuantity: medicine.initialQuantity,
      currentQuantity: medicine.currentQuantity,
      contraindications: { ...medicine.contraindications },
      notes: medicine.notes
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    setFormData(initialFormData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个药品吗？')) {
      deleteMedicine(id);
    }
  };

  const getExpiryBadge = (expiryDate: string) => {
    const status = getExpiryStatus(expiryDate);
    const days = getDaysUntilExpiry(expiryDate);
    
    if (status === 'expired') {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> 已过期
        </span>
      );
    }
    if (status === 'urgent') {
      return (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {days}天后过期
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
          本月过期
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
        有效期内
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">药品档案</h1>
          <p className="text-slate-500">管理您的家庭药品库存</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          新增药品
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索药品名称或规格..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'prescription', 'otc'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  filterType === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type === 'all' ? '全部' : type === 'prescription' ? '处方药' : 'OTC'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="暂无药品"
          description="点击上方按钮添加您的第一个药品"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className={cn(
                "bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md",
                isExpired(medicine.expiryDate) ? "border-red-200 bg-red-50/50" : "border-slate-100"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    medicine.isPrescription ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{medicine.name}</h3>
                    <p className="text-sm text-slate-500">{medicine.specification}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowDetail(medicine)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(medicine)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {medicine.storageLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  有效期: {formatDate(medicine.expiryDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  用法: {medicine.dosage}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    medicine.isPrescription 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-emerald-100 text-emerald-700"
                  )}>
                    {medicine.isPrescription ? '处方药' : 'OTC'}
                  </span>
                  {getExpiryBadge(medicine.expiryDate)}
                </div>
                <span className="text-sm text-slate-500">
                  剩余 {medicine.currentQuantity}/{medicine.initialQuantity}
                </span>
              </div>

              {(medicine.contraindications.children || medicine.contraindications.elderly || medicine.contraindications.pregnancy) && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    禁忌: 
                    {medicine.contraindications.children && ' 儿童'}
                    {medicine.contraindications.elderly && ' 老人'}
                    {medicine.contraindications.pregnancy && ' 孕妇'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMedicine ? '编辑药品' : '新增药品'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                药品名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入药品名称"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                规格
              </label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如: 0.5g × 24粒"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                存放位置
              </label>
              <input
                type="text"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如: 客厅药箱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                有效期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              适应症
            </label>
            <textarea
              value={formData.indications}
              onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="请输入适应症"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              用法用量
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如: 一次1片，一日3次"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                初始数量
              </label>
              <input
                type="number"
                min="0"
                value={formData.initialQuantity}
                onChange={(e) => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                当前剩余
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentQuantity}
                onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                药品类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  type: e.target.value as MedicineType,
                  isPrescription: e.target.value === 'prescription'
                })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="otc">OTC (非处方药)</option>
                <option value="prescription">处方药</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              用药禁忌
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contraindications.children}
                  onChange={(e) => setFormData({
                    ...formData,
                    contraindications: { ...formData.contraindications, children: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">儿童禁用</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contraindications.elderly}
                  onChange={(e) => setFormData({
                    ...formData,
                    contraindications: { ...formData.contraindications, elderly: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">老人慎用</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contraindications.pregnancy}
                  onChange={(e) => setFormData({
                    ...formData,
                    contraindications: { ...formData.contraindications, pregnancy: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">孕妇禁用</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.contraindications.custom}
              onChange={(e) => setFormData({
                ...formData,
                contraindications: { ...formData.contraindications, custom: e.target.value }
              })}
              className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="其他禁忌（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="其他备注信息"
            />
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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {editingMedicine ? '保存修改' : '添加药品'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="药品详情"
        size="lg"
      >
        {showDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                showDetail.isPrescription ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
              )}>
                <Pill className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{showDetail.name}</h2>
                <p className="text-slate-500">{showDetail.specification}</p>
                <div className="flex gap-2 mt-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    showDetail.isPrescription 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-emerald-100 text-emerald-700"
                  )}>
                    {showDetail.isPrescription ? '处方药' : 'OTC'}
                  </span>
                  {getExpiryBadge(showDetail.expiryDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">存放位置</p>
                <p className="font-medium text-slate-800">{showDetail.storageLocation || '-'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">有效期</p>
                <p className="font-medium text-slate-800">{formatDate(showDetail.expiryDate)}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">适应症</p>
              <p className="font-medium text-slate-800">{showDetail.indications || '-'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">用法用量</p>
              <p className="font-medium text-slate-800">{showDetail.dosage || '-'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">库存</p>
              <p className="font-medium text-slate-800">
                当前 {showDetail.currentQuantity} / 初始 {showDetail.initialQuantity}
              </p>
            </div>

            {(showDetail.contraindications.children || showDetail.contraindications.elderly || showDetail.contraindications.pregnancy || showDetail.contraindications.custom) && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  用药禁忌
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {showDetail.contraindications.children && <li>• 儿童禁用</li>}
                  {showDetail.contraindications.elderly && <li>• 老人慎用</li>}
                  {showDetail.contraindications.pregnancy && <li>• 孕妇禁用</li>}
                  {showDetail.contraindications.custom && <li>• {showDetail.contraindications.custom}</li>}
                </ul>
              </div>
            )}

            {showDetail.notes && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">备注</p>
                <p className="font-medium text-slate-800">{showDetail.notes}</p>
              </div>
            )}

            <button
              onClick={() => setShowDetail(null)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
