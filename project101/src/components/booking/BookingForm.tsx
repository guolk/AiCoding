import { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, CreditCard, AlertCircle, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Booking, BookingPlatform, BookingStatus, PLATFORM_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Booking>;
  onSuccess?: () => void;
}

const platformOptions: BookingPlatform[] = ['airbnb', 'tujia', 'meituan', 'ctrip', 'booking', 'direct'];

export default function BookingForm({ isOpen, onClose, initialData, onSuccess }: BookingFormProps) {
  const { properties, platformCommissions, addBooking, updateBooking, checkDateConflict } = useAppStore();

  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || '',
    checkIn: initialData?.checkIn || '',
    checkOut: initialData?.checkOut || '',
    customerName: initialData?.customerName || '',
    customerPhone: initialData?.customerPhone || '',
    customerIdNo: initialData?.customerIdNo || '',
    platform: (initialData?.platform as BookingPlatform) || 'direct',
    totalAmount: initialData?.totalAmount || 0,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<string>('');

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const platformCommission = platformCommissions.find((pc) => pc.platform === formData.platform);
  const platformCommissionRate = platformCommission?.rate || 0;

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const endDate = new Date(formData.checkOut);
    const diffTime = endDate.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateAmount = () => {
    if (!selectedProperty || !formData.checkIn || !formData.checkOut) return 0;

    const nights = calculateNights();
    if (nights <= 0) return 0;

    let total = 0;
    const start = new Date(formData.checkIn);

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      total += isWeekend ? selectedProperty.weekendPrice : selectedProperty.basePrice;
    }

    return total;
  };

  const nights = calculateNights();
  const calculatedAmount = calculateAmount();

  useEffect(() => {
    if (!initialData?.totalAmount) {
      setFormData((prev) => ({ ...prev, totalAmount: calculatedAmount }));
    }
  }, [calculatedAmount, initialData?.totalAmount]);

  useEffect(() => {
    if (formData.propertyId && formData.checkIn && formData.checkOut) {
      const conflict = checkDateConflict(
        formData.propertyId,
        formData.checkIn,
        formData.checkOut,
        initialData?.id
      );

      if (conflict) {
        setHasConflict(true);
        setConflictInfo('该时间段已有预订，请选择其他日期');
      } else {
        setHasConflict(false);
        setConflictInfo('');
      }
    } else {
      setHasConflict(false);
      setConflictInfo('');
    }
  }, [formData.propertyId, formData.checkIn, formData.checkOut, checkDateConflict, initialData?.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = '请选择房源';
    }
    if (!formData.checkIn) {
      newErrors.checkIn = '请选择入住日期';
    }
    if (!formData.checkOut) {
      newErrors.checkOut = '请选择退房日期';
    }
    if (formData.checkIn && formData.checkOut && formData.checkIn >= formData.checkOut) {
      newErrors.checkOut = '退房日期必须晚于入住日期';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入客人姓名';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = '请输入有效的手机号码';
    }
    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = '金额必须大于0';
    }
    if (hasConflict) {
      newErrors.dateConflict = '日期冲突，无法保存';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const commission = formData.totalAmount * platformCommissionRate;

    const bookingData = {
      propertyId: formData.propertyId,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerIdNo: formData.customerIdNo.trim() || undefined,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights,
      platform: formData.platform,
      status: (initialData?.status as BookingStatus) || 'pending',
      totalAmount: formData.totalAmount,
      commission,
      platformCommissionRate,
      notes: formData.notes.trim() || undefined,
    };

    if (initialData?.id) {
      updateBooking(initialData.id, bookingData);
    } else {
      addBooking(bookingData);
    }

    onSuccess?.();
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? '编辑预订' : '新建预订'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {hasConflict && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">日期冲突</p>
                <p className="text-sm text-red-600">{conflictInfo}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择房源 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => handleInputChange('propertyId', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                errors.propertyId ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">请选择房源</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - ¥{property.basePrice}/晚
                </option>
              ))}
            </select>
            {errors.propertyId && (
              <p className="text-sm text-red-500 mt-1">{errors.propertyId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-amber-500" />
                入住日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.checkIn}
                min={getToday()}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                  errors.checkIn ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.checkIn && (
                <p className="text-sm text-red-500 mt-1">{errors.checkIn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-amber-500" />
                退房日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.checkOut}
                min={formData.checkIn || getToday()}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                  errors.checkOut ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.checkOut && (
                <p className="text-sm text-red-500 mt-1">{errors.checkOut}</p>
              )}
            </div>
          </div>

          {nights > 0 && selectedProperty && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">共 <span className="font-bold text-amber-600">{nights}</span> 晚</p>
                  <p className="text-sm text-gray-500 mt-1">
                    系统计算: {formatCurrency(calculatedAmount)}
                    {calculatedAmount !== formData.totalAmount && (
                      <span className="text-amber-600 ml-2">(已手动调整)</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('totalAmount', calculatedAmount)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  恢复原价
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1 text-emerald-600" />
                客人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="请输入客人姓名"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                  errors.customerName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1 text-emerald-600" />
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="请输入手机号码"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                  errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500 mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身份证号
            </label>
            <input
              type="text"
              value={formData.customerIdNo}
              onChange={(e) => handleInputChange('customerIdNo', e.target.value)}
              placeholder="请输入身份证号（可选）"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预订平台
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platformOptions.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handleInputChange('platform', platform)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.platform === platform
                      ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1 text-amber-500" />
              订单金额
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                  errors.totalAmount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.totalAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>
            )}
            {platformCommissionRate > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                平台佣金 ({(platformCommissionRate * 100).toFixed(0)}%): {formatCurrency(formData.totalAmount * platformCommissionRate)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="特殊要求、注意事项等..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={hasConflict}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              hasConflict
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            {initialData ? '保存修改' : '创建预订'}
          </button>
        </div>
      </div>
    </div>
  );
}
