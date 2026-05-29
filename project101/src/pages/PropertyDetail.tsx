import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { PriceRule, FACILITIES_OPTIONS, Property } from '@/types';
import {
  ArrowLeft, Save, Trash2, Plus, MapPin, Home, Ruler, Users,
  Sparkles, Tag, Calendar, Clock, PawPrint, Cigarette, FileText,
  X, AlertCircle
} from 'lucide-react';

interface PriceRuleFormData {
  type: 'holiday' | 'custom';
  name: string;
  startDate: string;
  endDate: string;
  price: number;
}

const defaultProperty: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  address: {
    province: '',
    city: '',
    district: '',
    street: '',
    detail: '',
  },
  layout: {
    bedrooms: 1,
    livingRooms: 1,
    bathrooms: 1,
  },
  area: 50,
  maxGuests: 2,
  facilities: [],
  features: [],
  photos: [],
  basePrice: 200,
  weekendPrice: 250,
  rules: {
    minNights: 1,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    allowPets: false,
    allowSmoking: false,
    cancellationPolicy: '入住前7天可免费取消',
  },
  status: 'available',
};

const defaultPriceRule: PriceRuleFormData = {
  type: 'holiday',
  name: '',
  startDate: '',
  endDate: '',
  price: 0,
};

export default function PropertyDetail() {
  const navigate = useNavigate();
  const { propertyId, mode } = useParams<{ propertyId: string; mode?: string }>();
  const isEdit = mode === 'edit';
  const isNew = propertyId === 'new';

  const {
    getPropertyById,
    addProperty,
    updateProperty,
    priceRules,
    addPriceRule,
    deletePriceRule,
  } = useAppStore();

  const existingProperty = useMemo(() => {
    if (isNew) return null;
    return propertyId ? getPropertyById(propertyId) : null;
  }, [propertyId, getPropertyById, isNew]);

  const propertyPriceRules = useMemo(() => {
    if (isNew || !propertyId) return [];
    return priceRules.filter((r) => r.propertyId === propertyId);
  }, [priceRules, propertyId, isNew]);

  const [formData, setFormData] = useState<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>(defaultProperty);
  const [priceRuleForm, setPriceRuleForm] = useState<PriceRuleFormData>(defaultPriceRule);
  const [featuresText, setFeaturesText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        name: existingProperty.name,
        address: { ...existingProperty.address },
        layout: { ...existingProperty.layout },
        area: existingProperty.area,
        maxGuests: existingProperty.maxGuests,
        facilities: [...existingProperty.facilities],
        features: [...existingProperty.features],
        photos: [...existingProperty.photos],
        basePrice: existingProperty.basePrice,
        weekendPrice: existingProperty.weekendPrice,
        rules: { ...existingProperty.rules },
        status: existingProperty.status,
      });
      setFeaturesText(existingProperty.features.join('\n'));
    }
  }, [existingProperty]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入房源名称';
    }
    if (!formData.address.province.trim()) {
      newErrors.province = '请输入省份';
    }
    if (!formData.address.city.trim()) {
      newErrors.city = '请输入城市';
    }
    if (!formData.address.street.trim()) {
      newErrors.street = '请输入街道';
    }
    if (formData.basePrice <= 0) {
      newErrors.basePrice = '基础价格必须大于0';
    }
    if (formData.weekendPrice <= 0) {
      newErrors.weekendPrice = '周末价格必须大于0';
    }
    if (formData.maxGuests <= 0) {
      newErrors.maxGuests = '可住人数必须大于0';
    }
    if (formData.area <= 0) {
      newErrors.area = '面积必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const dataToSave = {
      ...formData,
      features,
    };

    if (isNew) {
      addProperty(dataToSave);
      navigate('/properties');
    } else if (propertyId && isEdit) {
      updateProperty(propertyId, dataToSave);
      navigate(`/properties/${propertyId}`);
    }
  };

  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handlePriceRuleSubmit = () => {
    if (!priceRuleForm.name.trim() || !priceRuleForm.startDate || !priceRuleForm.endDate || priceRuleForm.price <= 0) {
      return;
    }

    if (!isNew && propertyId) {
      addPriceRule({
        ...priceRuleForm,
        propertyId,
      });
    }

    setPriceRuleForm(defaultPriceRule);
  };

  const handleDeletePriceRule = (id: string) => {
    deletePriceRule(id);
  };

  const isViewMode = !isEdit && !isNew;

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    error,
    disabled = false,
  }: {
    label: React.ReactNode;
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    type?: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        disabled={isViewMode || disabled}
        className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
          error
            ? 'border-red-300 bg-red-50'
            : isViewMode
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-emerald-200'
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/properties')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {isNew
                    ? '添加新房源'
                    : isEdit
                      ? '编辑房源'
                      : existingProperty?.name || '房源详情'}
                </h1>
                {!isNew && (
                  <p className="text-xs text-gray-500">
                    {isEdit ? '修改房源信息' : '查看房源详情'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isViewMode && (
                <button
                  onClick={() => navigate(`/properties/${propertyId}/edit`)}
                  className="px-4 py-2 text-emerald-700 bg-emerald-50 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  编辑
                </button>
              )}
              {(isNew || isEdit) && (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <InputField
                label="房源名称"
                value={formData.name}
                onChange={(v) => setFormData((prev) => ({ ...prev, name: String(v) }))}
                placeholder="例如：温馨一居室公寓（市中心）"
                error={errors.name}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    地址信息
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="省份"
                    value={formData.address.province}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, province: String(v) },
                      }))
                    }
                    placeholder="上海市"
                    error={errors.province}
                  />
                  <InputField
                    label="城市"
                    value={formData.address.city}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: String(v) },
                      }))
                    }
                    placeholder="上海市"
                    error={errors.city}
                  />
                  <InputField
                    label="区/县"
                    value={formData.address.district}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, district: String(v) },
                      }))
                    }
                    placeholder="黄浦区"
                  />
                </div>
                <div className="mt-4">
                  <InputField
                    label="街道"
                    value={formData.address.street}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: String(v) },
                      }))
                    }
                    placeholder="南京东路"
                    error={errors.street}
                  />
                </div>
                <div className="mt-4">
                  <InputField
                    label="详细地址"
                    value={formData.address.detail}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, detail: String(v) },
                      }))
                    }
                    placeholder="100号15楼1503室"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-emerald-600" />
                      户型
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'bedrooms', label: '卧室' },
                      { key: 'livingRooms', label: '客厅' },
                      { key: 'bathrooms', label: '卫生间' },
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="block text-xs text-gray-500 mb-1">{item.label}</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.layout[item.key as keyof typeof formData.layout]}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              layout: {
                                ...prev.layout,
                                [item.key]: Math.max(0, Number(e.target.value)),
                              },
                            }))
                          }
                          disabled={isViewMode}
                          className={`w-full px-3 py-2 border rounded-lg text-center font-semibold ${
                            isViewMode
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'bg-white border-gray-200 hover:border-emerald-200'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label={<span className="flex items-center gap-1.5"><Ruler className="w-4 h-4 text-emerald-600" /> 面积 (㎡)</span>}
                      type="number"
                      value={formData.area}
                      onChange={(v) => setFormData((prev) => ({ ...prev, area: Number(v) }))}
                      placeholder="50"
                      error={errors.area}
                    />
                  </div>
                  <div>
                    <InputField
                      label={<span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-600" /> 可住人数</span>}
                      type="number"
                      value={formData.maxGuests}
                      onChange={(v) => setFormData((prev) => ({ ...prev, maxGuests: Number(v) }))}
                      placeholder="2"
                      error={errors.maxGuests}
                    />
                  </div>
                </div>
              </div>

              {(isNew || isEdit) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">房源状态</label>
                  <div className="flex flex-wrap gap-3">
                    {(['available', 'occupied', 'maintenance'] as const).map((status) => (
                      <label
                        key={status}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                          formData.status === status
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={() => setFormData((prev) => ({ ...prev, status }))}
                          className="sr-only"
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status === 'available'
                              ? 'bg-green-500'
                              : status === 'occupied'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {status === 'available'
                            ? '可订'
                            : status === 'occupied'
                              ? '已占用'
                              : '维修中'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">设施清单</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {FACILITIES_OPTIONS.map((facility) => {
                  const isSelected = formData.facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => !isViewMode && toggleFacility(facility)}
                      disabled={isViewMode}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                          : isViewMode
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">特色卖点</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">每行一个特色卖点</p>
            </div>
            <div className="p-6">
              <textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="近地铁&#10;市中心位置&#10;安静&#10;新装修"
                disabled={isViewMode}
                rows={4}
                className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isViewMode
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-emerald-200'
                }`}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">¥</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">价格设置</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="基础价格 (元/晚)"
                  type="number"
                  value={formData.basePrice}
                  onChange={(v) => setFormData((prev) => ({ ...prev, basePrice: Number(v) }))}
                  placeholder="200"
                  error={errors.basePrice}
                />
                <InputField
                  label="周末价格 (元/晚)"
                  type="number"
                  value={formData.weekendPrice}
                  onChange={(v) => setFormData((prev) => ({ ...prev, weekendPrice: Number(v) }))}
                  placeholder="250"
                  error={errors.weekendPrice}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">入住规则</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label={<span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600" /> 最低入住天数</span>}
                  type="number"
                  value={formData.rules.minNights}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, minNights: Math.max(1, Number(v)) },
                    }))
                  }
                  placeholder="1"
                />
                <InputField
                  label={<span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> 入住时间</span>}
                  value={formData.rules.checkInTime}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, checkInTime: String(v) },
                    }))
                  }
                  placeholder="14:00"
                />
                <InputField
                  label={<span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> 退房时间</span>}
                  value={formData.rules.checkOutTime}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, checkOutTime: String(v) },
                    }))
                  }
                  placeholder="12:00"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label
                  className={`flex items-center gap-3 cursor-pointer transition-all ${
                    isViewMode ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      !isViewMode &&
                      setFormData((prev) => ({
                        ...prev,
                        rules: { ...prev.rules, allowPets: !prev.rules.allowPets },
                      }))
                    }
                    disabled={isViewMode}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.rules.allowPets ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.rules.allowPets ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-gray-700">
                    <PawPrint className="w-4 h-4 text-emerald-600" />
                    允许宠物
                  </span>
                </label>

                <label
                  className={`flex items-center gap-3 cursor-pointer transition-all ${
                    isViewMode ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      !isViewMode &&
                      setFormData((prev) => ({
                        ...prev,
                        rules: { ...prev.rules, allowSmoking: !prev.rules.allowSmoking },
                      }))
                    }
                    disabled={isViewMode}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.rules.allowSmoking ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.rules.allowSmoking ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Cigarette className="w-4 h-4 text-emerald-600" />
                    允许吸烟
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  取消政策
                </label>
                <input
                  type="text"
                  value={formData.rules.cancellationPolicy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, cancellationPolicy: e.target.value },
                    }))
                  }
                  placeholder="例如：入住前7天可免费取消"
                  disabled={isViewMode}
                  className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    isViewMode
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-emerald-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {!isNew && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">价格规则</h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {propertyPriceRules.length} 条规则
                  </span>
                </div>
              </div>

              {(isEdit || propertyPriceRules.length > 0) && (
                <div className="p-6">
                  {isEdit && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">添加新规则</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">类型</label>
                          <select
                            value={priceRuleForm.type}
                            onChange={(e) =>
                              setPriceRuleForm((prev) => ({
                                ...prev,
                                type: e.target.value as 'holiday' | 'custom',
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                          >
                            <option value="holiday">节假日</option>
                            <option value="custom">自定义</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">名称</label>
                          <input
                            type="text"
                            value={priceRuleForm.name}
                            onChange={(e) =>
                              setPriceRuleForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="如：春节"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                          <input
                            type="date"
                            value={priceRuleForm.startDate}
                            onChange={(e) =>
                              setPriceRuleForm((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                          <input
                            type="date"
                            value={priceRuleForm.endDate}
                            onChange={(e) =>
                              setPriceRuleForm((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">价格</label>
                            <input
                              type="number"
                              value={priceRuleForm.price || ''}
                              onChange={(e) =>
                                setPriceRuleForm((prev) => ({
                                  ...prev,
                                  price: Number(e.target.value),
                                }))
                              }
                              placeholder="元/晚"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <button
                            onClick={handlePriceRuleSubmit}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {propertyPriceRules.length > 0 && (
                    <div className="space-y-3">
                      {propertyPriceRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-2 h-10 rounded-full ${
                                rule.type === 'holiday' ? 'bg-red-400' : 'bg-emerald-400'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{rule.name}</h4>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    rule.type === 'holiday'
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-emerald-100 text-emerald-600'
                                  }`}
                                >
                                  {rule.type === 'holiday' ? '节假日' : '自定义'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {rule.startDate} 至 {rule.endDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-2xl font-bold text-amber-600">¥{rule.price}</span>
                              <span className="text-sm text-gray-500">/晚</span>
                            </div>
                            {isEdit && (
                              <button
                                onClick={() => handleDeletePriceRule(rule.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {propertyPriceRules.length === 0 && !isEdit && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>暂无价格规则</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
