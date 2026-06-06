import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Package,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { generateId, formatDate } from '../../utils';

import type {
  VoyagePlan,
  Waypoint,
  SupplyItem,
  RiskAssessment,
} from '../../types';

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'planned', label: '已计划' },
  { value: 'in-progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const supplyCategoryOptions = [
  { value: 'fuel', label: '燃油' },
  { value: 'water', label: '淡水' },
  { value: 'food', label: '食物' },
  { value: 'parts', label: '配件' },
  { value: 'safety', label: '安全' },
  { value: 'other', label: '其他' },
];

const severityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'critical', label: '严重' },
];

const probabilityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
];

const unitOptions = ['升', '公斤', '个', '套', '件', '箱', '米', '人份'];

export default function PlanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const getPlanById = useAppStore((state) => state.getPlanById);
  const addPlan = useAppStore((state) => state.addPlan);
  const updatePlan = useAppStore((state) => state.updatePlan);
  const boats = useAppStore((state) => state.boats);

  const existingPlan = isEdit && id ? getPlanById(id) : undefined;

  const [formData, setFormData] = useState({
    title: '',
    boatId: '',
    startDate: '',
    endDate: '',
    status: 'draft' as VoyagePlan['status'],
    description: '',
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  const [activeTab, setActiveTab] = useState<'basic' | 'waypoints' | 'supplies' | 'risks'>('basic');

  useEffect(() => {
    if (existingPlan) {
      setFormData({
        title: existingPlan.title,
        boatId: existingPlan.boatId,
        startDate: formatDate(existingPlan.startDate, 'yyyy-MM-dd'),
        endDate: formatDate(existingPlan.endDate, 'yyyy-MM-dd'),
        status: existingPlan.status,
        description: existingPlan.description,
      });
      setWaypoints(
        existingPlan.waypoints.sort((a, b) => a.order - b.order)
      );
      setSupplyItems(existingPlan.supplyItems);
      setRiskAssessments(existingPlan.riskAssessments);
    }
  }, [existingPlan]);

  const handleBasicChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: generateId(),
      planId: '',
      name: '',
      latitude: 0,
      longitude: 0,
      order: waypoints.length,
      eta: undefined,
      notes: '',
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const updateWaypoint = (index: number, field: keyof Waypoint, value: any) => {
    setWaypoints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      updated.forEach((wp, i) => {
        wp.order = i;
      });
      return updated;
    });
  };

  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    setWaypoints((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= updated.length) return prev;

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      updated.forEach((wp, i) => {
        wp.order = i;
      });

      return updated;
    });
  };

  const addSupplyItem = () => {
    const newItem: SupplyItem = {
      id: generateId(),
      planId: '',
      name: '',
      quantity: 0,
      unit: '升',
      category: 'other',
      purchased: false,
    };
    setSupplyItems([...supplyItems, newItem]);
  };

  const updateSupplyItem = (
    index: number,
    field: keyof SupplyItem,
    value: any
  ) => {
    setSupplyItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSupplyItem = (index: number) => {
    setSupplyItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addRiskAssessment = () => {
    const newRisk: RiskAssessment = {
      id: generateId(),
      planId: '',
      description: '',
      severity: 'medium',
      probability: 'medium',
      mitigation: '',
    };
    setRiskAssessments([...riskAssessments, newRisk]);
  };

  const updateRiskAssessment = (
    index: number,
    field: keyof RiskAssessment,
    value: any
  ) => {
    setRiskAssessments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeRiskAssessment = (index: number) => {
    setRiskAssessments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.boatId || !formData.startDate || !formData.endDate) {
      alert('请填写所有必填字段');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      alert('结束日期不能早于开始日期，请重新选择');
      return;
    }

    const planData = {
      ...formData,
      waypoints: waypoints.map((wp) => ({
        ...wp,
        latitude: Number(wp.latitude),
        longitude: Number(wp.longitude),
      })),
      supplyItems: supplyItems.map((si) => ({
        ...si,
        quantity: Number(si.quantity),
      })),
      riskAssessments,
    };

    if (isEdit && id) {
      updatePlan(id, planData);
    } else {
      addPlan(planData);
    }

    navigate('/plans');
  };

  const tabs = [
    { key: 'basic', label: '基本信息', icon: Info },
    { key: 'waypoints', label: '途经点', icon: MapPin, count: waypoints.length },
    { key: 'supplies', label: '补给清单', icon: Package, count: supplyItems.length },
    { key: 'risks', label: '风险评估', icon: AlertTriangle, count: riskAssessments.length },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium"
          onClick={() => navigate('/plans')}
        >
          <ArrowLeft className="w-5 h-5" />
          返回计划列表
        </button>
      </div>

      <div className="card p-6">
        <h1 className="font-display text-3xl font-bold text-ocean-800 mb-6">
          {isEdit ? '编辑航行计划' : '新增航行计划'}
        </h1>

        <div className="flex gap-2 mb-6 border-b border-ocean-100 pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-ocean-600 text-white'
                  : 'text-gray-600 hover:bg-ocean-50'
              }`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-white/20'
                      : 'bg-ocean-100 text-ocean-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    计划标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => handleBasicChange('title', e.target.value)}
                    placeholder="请输入航行计划标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    船艇 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.boatId}
                    onChange={(e) => handleBasicChange('boatId', e.target.value)}
                  >
                    <option value="">请选择船艇</option>
                    {boats.map((boat) => (
                      <option key={boat.id} value={boat.id}>
                        {boat.name} ({boat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    状态
                  </label>
                  <select
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => handleBasicChange('status', e.target.value)}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.startDate}
                    onChange={(e) => handleBasicChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.endDate}
                    onChange={(e) => handleBasicChange('endDate', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    计划描述
                  </label>
                  <textarea
                    className="input-field min-h-24"
                    value={formData.description}
                    onChange={(e) => handleBasicChange('description', e.target.value)}
                    placeholder="请输入航行计划的详细描述..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waypoints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-ocean-800">
                  途经点管理
                </h3>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={addWaypoint}
                >
                  <Plus className="w-4 h-4" />
                  添加途经点
                </button>
              </div>

              {waypoints.length === 0 ? (
                <div className="text-center py-12 bg-ocean-50 rounded-xl">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-ocean-300" />
                  <p className="text-gray-500">
                    暂无途经点，点击上方按钮添加
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {waypoints.map((wp, index) => (
                    <div
                      key={wp.id}
                      className="bg-ocean-50 rounded-xl p-4 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-ocean-600 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium text-ocean-800">
                            途经点 {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-2 hover:bg-ocean-200 rounded-lg transition-colors disabled:opacity-30"
                            onClick={() => moveWaypoint(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4 text-ocean-600" />
                          </button>
                          <button
                            type="button"
                            className="p-2 hover:bg-ocean-200 rounded-lg transition-colors disabled:opacity-30"
                            onClick={() => moveWaypoint(index, 'down')}
                            disabled={index === waypoints.length - 1}
                          >
                            <ChevronDown className="w-4 h-4 text-ocean-600" />
                          </button>
                          <button
                            type="button"
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                            onClick={() => removeWaypoint(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            地点名称 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={wp.name}
                            onChange={(e) =>
                              updateWaypoint(index, 'name', e.target.value)
                            }
                            placeholder="例如：青岛奥帆中心"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            纬度
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            className="input-field"
                            value={wp.latitude}
                            onChange={(e) =>
                              updateWaypoint(
                                index,
                                'latitude',
                                e.target.value
                              )
                            }
                            placeholder="例如：36.0570"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            经度
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            className="input-field"
                            value={wp.longitude}
                            onChange={(e) =>
                              updateWaypoint(
                                index,
                                'longitude',
                                e.target.value
                              )
                            }
                            placeholder="例如：120.3836"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            预计到达时间
                          </label>
                          <input
                            type="datetime-local"
                            className="input-field"
                            value={wp.eta ? formatDate(wp.eta, "yyyy-MM-dd'T'HH:mm") : ''}
                            onChange={(e) =>
                              updateWaypoint(index, 'eta', e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            顺序
                          </label>
                          <input
                            type="number"
                            className="input-field bg-gray-100"
                            value={wp.order}
                            disabled
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            备注
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={wp.notes || ''}
                            onChange={(e) =>
                              updateWaypoint(index, 'notes', e.target.value)
                            }
                            placeholder="可选备注信息"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-ocean-800">
                  补给清单管理
                </h3>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={addSupplyItem}
                >
                  <Plus className="w-4 h-4" />
                  添加补给
                </button>
              </div>

              {supplyItems.length === 0 ? (
                <div className="text-center py-12 bg-ocean-50 rounded-xl">
                  <Package className="w-12 h-12 mx-auto mb-3 text-ocean-300" />
                  <p className="text-gray-500">暂无补给项，点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {supplyItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-ocean-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-ocean-800">
                          补给项 {index + 1}
                        </span>
                        <button
                          type="button"
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                          onClick={() => removeSupplyItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            物品名称
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={item.name}
                            onChange={(e) =>
                              updateSupplyItem(index, 'name', e.target.value)
                            }
                            placeholder="例如：柴油"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            数量
                          </label>
                          <input
                            type="number"
                            className="input-field"
                            value={item.quantity}
                            onChange={(e) =>
                              updateSupplyItem(
                                index,
                                'quantity',
                                e.target.value
                              )
                            }
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            单位
                          </label>
                          <select
                            className="input-field"
                            value={item.unit}
                            onChange={(e) =>
                              updateSupplyItem(index, 'unit', e.target.value)
                            }
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            类别
                          </label>
                          <select
                            className="input-field"
                            value={item.category}
                            onChange={(e) =>
                              updateSupplyItem(
                                index,
                                'category',
                                e.target.value
                              )
                            }
                          >
                            {supplyCategoryOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500"
                              checked={item.purchased || false}
                              onChange={(e) =>
                                updateSupplyItem(
                                  index,
                                  'purchased',
                                  e.target.checked
                                )
                              }
                            />
                            <span className="text-sm text-gray-700">
                              已采购
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-ocean-800">
                  风险评估管理
                </h3>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={addRiskAssessment}
                >
                  <Plus className="w-4 h-4" />
                  添加风险
                </button>
              </div>

              {riskAssessments.length === 0 ? (
                <div className="text-center py-12 bg-ocean-50 rounded-xl">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-ocean-300" />
                  <p className="text-gray-500">
                    暂无风险评估，点击上方按钮添加
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {riskAssessments.map((risk, index) => (
                    <div
                      key={risk.id}
                      className="bg-ocean-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-ocean-800">
                          风险项 {index + 1}
                        </span>
                        <button
                          type="button"
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                          onClick={() => removeRiskAssessment(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            风险描述
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={risk.description}
                            onChange={(e) =>
                              updateRiskAssessment(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder="描述可能发生的风险..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            严重程度
                          </label>
                          <select
                            className="input-field"
                            value={risk.severity}
                            onChange={(e) =>
                              updateRiskAssessment(
                                index,
                                'severity',
                                e.target.value
                              )
                            }
                          >
                            {severityOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            发生概率
                          </label>
                          <select
                            className="input-field"
                            value={risk.probability}
                            onChange={(e) =>
                              updateRiskAssessment(
                                index,
                                'probability',
                                e.target.value
                              )
                            }
                          >
                            {probabilityOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            缓解措施
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={risk.mitigation}
                            onChange={(e) =>
                              updateRiskAssessment(
                                index,
                                'mitigation',
                                e.target.value
                              )
                            }
                            placeholder="如何预防或应对此风险..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-ocean-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/plans')}
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" />
              {isEdit ? '保存修改' : '创建计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
