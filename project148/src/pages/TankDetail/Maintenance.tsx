import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Droplets,
  Leaf,
  Wind,
  Wrench,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  Beaker,
  Gauge,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import {
  formatDate,
  formatDateShort,
  getDaysSince,
} from '@/utils/helpers';
import type { WaterChange, Fertilization, CO2Log, EquipmentMaintenance } from '@/types';

export default function Maintenance() {
  const { id } = useParams<{ id: string }>();
  const {
    aquariums,
    waterChanges,
    fertilizations,
    co2Logs,
    equipmentMaintenances,
    addWaterChange,
    addFertilization,
    addCO2Log,
    addEquipmentMaintenance,
  } = useStore();

  const [waterChangeModal, setWaterChangeModal] = useState(false);
  const [fertilizationModal, setFertilizationModal] = useState(false);
  const [co2Modal, setCO2Modal] = useState(false);
  const [equipmentModal, setEquipmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'water' | 'fert' | 'co2' | 'equipment'>('water');

  const aquarium = aquariums.find((a) => a.id === id);

  const tankWaterChanges = waterChanges
    .filter((w) => w.tankId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tankFertilizations = fertilizations
    .filter((f) => f.tankId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tankCO2Logs = co2Logs
    .filter((c) => c.tankId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tankEquipmentMaintenances = equipmentMaintenances
    .filter((e) => e.tankId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [waterChangeForm, setWaterChangeForm] = useState<Omit<WaterChange, 'id'>>({
    tankId: id || '',
    date: new Date().toISOString().split('T')[0],
    amount: 20,
    waterSource: 'RO水',
    notes: '',
  });

  const [fertilizationForm, setFertilizationForm] = useState<Omit<Fertilization, 'id'>>({
    tankId: id || '',
    date: new Date().toISOString().split('T')[0],
    fertilizerType: '综合液肥',
    dosage: 5,
    notes: '',
  });

  const [co2Form, setCO2Form] = useState<Omit<CO2Log, 'id'>>({
    tankId: id || '',
    date: new Date().toISOString().split('T')[0],
    bubblesPerSecond: 1,
    durationHours: 8,
    effect: '良好',
    notes: '',
  });

  const [equipmentForm, setEquipmentForm] = useState<Omit<EquipmentMaintenance, 'id'>>({
    tankId: id || '',
    date: new Date().toISOString().split('T')[0],
    equipment: '',
    action: '',
    notes: '',
  });

  const lastWaterChange = tankWaterChanges[0];
  const lastFertilization = tankFertilizations[0];
  const lastCO2 = tankCO2Logs[0];

  const totalWaterChanged = tankWaterChanges.reduce((sum, w) => sum + w.amount, 0);

  const getFrequencyText = (days: number): string => {
    if (days <= 7) return '每周一次';
    if (days <= 10) return '每10天一次';
    if (days <= 14) return '每两周一次';
    return '每月一次';
  };

  const averageWaterChangeInterval =
    tankWaterChanges.length >= 2
      ? Math.round(
          (new Date(tankWaterChanges[0].date).getTime() -
            new Date(tankWaterChanges[tankWaterChanges.length - 1].date).getTime()) /
            (1000 * 60 * 60 * 24 * (tankWaterChanges.length - 1))
        )
      : 7;

  const handleAddWaterChange = (e: React.FormEvent) => {
    e.preventDefault();
    addWaterChange(waterChangeForm);
    setWaterChangeModal(false);
    setWaterChangeForm({
      tankId: id || '',
      date: new Date().toISOString().split('T')[0],
      amount: 20,
      waterSource: 'RO水',
      notes: '',
    });
  };

  const handleAddFertilization = (e: React.FormEvent) => {
    e.preventDefault();
    addFertilization(fertilizationForm);
    setFertilizationModal(false);
    setFertilizationForm({
      tankId: id || '',
      date: new Date().toISOString().split('T')[0],
      fertilizerType: '综合液肥',
      dosage: 5,
      notes: '',
    });
  };

  const handleAddCO2 = (e: React.FormEvent) => {
    e.preventDefault();
    addCO2Log(co2Form);
    setCO2Modal(false);
    setCO2Form({
      tankId: id || '',
      date: new Date().toISOString().split('T')[0],
      bubblesPerSecond: 1,
      durationHours: 8,
      effect: '良好',
      notes: '',
    });
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    addEquipmentMaintenance(equipmentForm);
    setEquipmentModal(false);
    setEquipmentForm({
      tankId: id || '',
      date: new Date().toISOString().split('T')[0],
      equipment: '',
      action: '',
      notes: '',
    });
  };

  const tabs = [
    { key: 'water', label: '换水清洁', icon: Droplets },
    { key: 'fert', label: '施肥管理', icon: Leaf },
    { key: 'co2', label: 'CO2补充', icon: Wind },
    { key: 'equipment', label: '设备维护', icon: Wrench },
  ] as const;

  const waterSourceOptions = ['RO水', '自来水曝气24小时', '纯净水', '其他'];
  const fertilizerTypeOptions = ['综合液肥', '铁肥', '钾肥', '氮肥', '磷肥', '微量元素', '根肥'];
  const effectOptions = ['极佳', '良好', '一般', '较差'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900">
            日常维护
          </h2>
          <p className="text-gray-500 mt-1">
            记录换水、施肥、CO2和设备维护
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'water' && (
            <button
              onClick={() => setWaterChangeModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              记录换水
            </button>
          )}
          {activeTab === 'fert' && (
            <button
              onClick={() => setFertilizationModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              记录施肥
            </button>
          )}
          {activeTab === 'co2' && (
            <button
              onClick={() => setCO2Modal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-aqua-500 to-aqua-600 text-white rounded-xl hover:from-aqua-600 hover:to-aqua-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              记录CO2
            </button>
          )}
          {activeTab === 'equipment' && (
            <button
              onClick={() => setEquipmentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              记录维护
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="距上次换水"
          value={lastWaterChange ? getDaysSince(lastWaterChange.date) : '-'}
          unit="天"
          icon={Droplets}
          status={
            lastWaterChange && getDaysSince(lastWaterChange.date) > 7
              ? 'warning'
              : 'normal'
          }
          trend={lastWaterChange ? `上次换了${lastWaterChange.amount}L` : undefined}
        />
        <StatCard
          title="换水频率"
          value={getFrequencyText(averageWaterChangeInterval)}
          icon={Calendar}
          status="normal"
          trend={`累计${totalWaterChanged}L`}
        />
        <StatCard
          title="距上次施肥"
          value={lastFertilization ? getDaysSince(lastFertilization.date) : '-'}
          unit="天"
          icon={Beaker}
          status={
            lastFertilization && getDaysSince(lastFertilization.date) > 5
              ? 'warning'
              : 'normal'
          }
        />
        <StatCard
          title="维护记录"
          value={tankEquipmentMaintenances.length}
          unit="次"
          icon={Wrench}
          status="normal"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-aqua-600 border-b-2 border-aqua-500 bg-aqua-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'water' && (
            <div>
              {aquarium && (
                <div className="bg-gradient-to-r from-aqua-50 to-reef-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-aqua-100 rounded-lg">
                      <Gauge className="w-5 h-5 text-aqua-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">换水建议</p>
                      <p className="text-sm text-gray-600">
                        水体容量：{aquarium.volume}L，建议每次换水 {Math.round(aquarium.volume * 0.2)}L - {Math.round(aquarium.volume * 0.3)}L（20%-30%）
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tankWaterChanges.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Droplets className="w-12 h-12 mx-auto text-aqua-400 mb-3" />
                  <p>暂无换水记录，定期换水保持水质健康</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          日期
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          换水量
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          占比
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          水源
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          备注
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tankWaterChanges.slice(0, 20).map((item, index) => {
                        const percentage = aquarium
                          ? Math.round((item.amount / aquarium.volume) * 100)
                          : 0;

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors animate-slide-up"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <td className="py-4 px-4 text-gray-900 font-medium">
                              {formatDate(item.date)}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-lg font-bold text-aqua-600">
                                {item.amount}
                              </span>
                              <span className="text-gray-500 ml-1">L</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-aqua-400 to-reef-400"
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 font-mono">
                                  {percentage}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {item.waterSource}
                            </td>
                            <td className="py-4 px-4 text-gray-500 text-sm">
                              {item.notes || '-'}
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

          {activeTab === 'fert' && (
            <div>
              {tankFertilizations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Leaf className="w-12 h-12 mx-auto text-reef-400 mb-3" />
                  <p>暂无施肥记录，水草需要营养才能茁壮成长</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tankFertilizations.slice(0, 12).map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-reef-100 rounded-lg">
                            <Beaker className="w-4 h-4 text-reef-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.fertilizerType}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-reef-600 font-mono">
                            {item.dosage}
                          </p>
                          <p className="text-xs text-gray-500">mL</p>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'co2' && (
            <div>
              {tankCO2Logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wind className="w-12 h-12 mx-auto text-aqua-400 mb-3" />
                  <p>暂无CO2记录，CO2是水草光合作用的关键</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tankCO2Logs.slice(0, 15).map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-medium text-gray-900">
                          {formatDateShort(item.date)}
                        </p>
                        <StatusBadge
                          status={
                            item.effect === '极佳'
                              ? 'healthy'
                              : item.effect === '良好'
                              ? 'normal'
                              : item.effect === '一般'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-aqua-50 rounded-lg p-3 text-center">
                          <p className="text-xl font-bold text-aqua-600 font-mono">
                            {item.bubblesPerSecond}
                          </p>
                          <p className="text-xs text-gray-500">泡/秒</p>
                        </div>
                        <div className="bg-reef-50 rounded-lg p-3 text-center">
                          <p className="text-xl font-bold text-reef-600 font-mono">
                            {item.durationHours}
                          </p>
                          <p className="text-xs text-gray-500">小时/天</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        效果：{item.effect}
                      </div>

                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div>
              {tankEquipmentMaintenances.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto text-coral-400 mb-3" />
                  <p>暂无设备维护记录，定期维护延长设备寿命</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral-200 to-gray-200" />
                  <div className="space-y-4">
                    {tankEquipmentMaintenances.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative flex gap-4 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-coral-600" />
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4 border border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-900">
                                {item.equipment}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.action}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </p>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-100">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={waterChangeModal} onClose={() => setWaterChangeModal(false)} title="记录换水">
        <form onSubmit={handleAddWaterChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={waterChangeForm.date}
              onChange={(e) =>
                setWaterChangeForm({ ...waterChangeForm, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                换水量 (L)
              </label>
              <input
                type="number"
                value={waterChangeForm.amount}
                onChange={(e) =>
                  setWaterChangeForm({
                    ...waterChangeForm,
                    amount: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                水源
              </label>
              <select
                value={waterChangeForm.waterSource}
                onChange={(e) =>
                  setWaterChangeForm({
                    ...waterChangeForm,
                    waterSource: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              >
                {waterSourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={waterChangeForm.notes}
              onChange={(e) =>
                setWaterChangeForm({ ...waterChangeForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent resize-none"
              placeholder="记录换水时的特殊情况..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setWaterChangeModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={fertilizationModal} onClose={() => setFertilizationModal(false)} title="记录施肥">
        <form onSubmit={handleAddFertilization} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={fertilizationForm.date}
              onChange={(e) =>
                setFertilizationForm({
                  ...fertilizationForm,
                  date: e.target.value,
                })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                肥料类型
              </label>
              <select
                value={fertilizationForm.fertilizerType}
                onChange={(e) =>
                  setFertilizationForm({
                    ...fertilizationForm,
                    fertilizerType: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              >
                {fertilizerTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                剂量 (mL)
              </label>
              <input
                type="number"
                value={fertilizationForm.dosage}
                onChange={(e) =>
                  setFertilizationForm({
                    ...fertilizationForm,
                    dosage: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={fertilizationForm.notes}
              onChange={(e) =>
                setFertilizationForm({
                  ...fertilizationForm,
                  notes: e.target.value,
                })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent resize-none"
              placeholder="记录施肥后的观察..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFertilizationModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={co2Modal} onClose={() => setCO2Modal(false)} title="记录CO2">
        <form onSubmit={handleAddCO2} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={co2Form.date}
              onChange={(e) =>
                setCO2Form({ ...co2Form, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                气泡数 (泡/秒)
              </label>
              <input
                type="number"
                step="0.5"
                value={co2Form.bubblesPerSecond}
                onChange={(e) =>
                  setCO2Form({
                    ...co2Form,
                    bubblesPerSecond: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                时长 (小时)
              </label>
              <input
                type="number"
                value={co2Form.durationHours}
                onChange={(e) =>
                  setCO2Form({
                    ...co2Form,
                    durationHours: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              效果
            </label>
            <select
              value={co2Form.effect}
              onChange={(e) =>
                setCO2Form({ ...co2Form, effect: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            >
              {effectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={co2Form.notes}
              onChange={(e) =>
                setCO2Form({ ...co2Form, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent resize-none"
              placeholder="记录细化器状态、水草冒泡情况..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCO2Modal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-aqua-500 to-aqua-600 text-white rounded-xl hover:from-aqua-600 hover:to-aqua-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={equipmentModal} onClose={() => setEquipmentModal(false)} title="记录设备维护">
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={equipmentForm.date}
              onChange={(e) =>
                setEquipmentForm({ ...equipmentForm, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              设备名称
            </label>
            <input
              type="text"
              value={equipmentForm.equipment}
              onChange={(e) =>
                setEquipmentForm({ ...equipmentForm, equipment: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              placeholder="如：过滤桶、细化器、加热棒等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              维护操作
            </label>
            <input
              type="text"
              value={equipmentForm.action}
              onChange={(e) =>
                setEquipmentForm({ ...equipmentForm, action: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              placeholder="如：清洗过滤棉、更换滤材等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={equipmentForm.notes}
              onChange={(e) =>
                setEquipmentForm({ ...equipmentForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              placeholder="记录维护时的注意事项..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEquipmentModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
