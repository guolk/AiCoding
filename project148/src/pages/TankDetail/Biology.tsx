import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Leaf,
  Fish as FishIcon,
  Heart,
  Egg,
  Calendar,
  Activity,
  Stethoscope,
  Sprout,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import {
  formatDate,
  formatDateShort,
  getStatusText,
  getGrowthEventTypeText,
  getStatusColor,
} from '@/utils/helpers';
import type { GrowthLog, DiseaseRecord, BreedingRecord, Plant, Fish } from '@/types';

export default function Biology() {
  const { id } = useParams<{ id: string }>();
  const {
    plants,
    fishes,
    growthLogs,
    diseaseRecords,
    breedingRecords,
    addGrowthLog,
    addDiseaseRecord,
    updateDiseaseRecord,
    addBreedingRecord,
  } = useStore();

  const [growthModal, setGrowthModal] = useState(false);
  const [diseaseModal, setDiseaseModal] = useState(false);
  const [breedingModal, setBreedingModal] = useState(false);
  const [editDiseaseModal, setEditDiseaseModal] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseRecord | null>(null);

  const tankPlants = plants.filter((p) => p.tankId === id);
  const tankFishes = fishes.filter((f) => f.tankId === id);
  const plantIds = tankPlants.map((p) => p.id);
  const fishIds = tankFishes.map((f) => f.id);

  const tankGrowthLogs = growthLogs
    .filter((g) => plantIds.includes(g.plantId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tankDiseaseRecords = diseaseRecords
    .filter((d) => fishIds.includes(d.fishId))
    .sort((a, b) => new Date(b.detectDate).getTime() - new Date(a.detectDate).getTime());

  const tankBreedingRecords = breedingRecords
    .filter((b) => fishIds.includes(b.fishId))
    .sort((a, b) => new Date(b.spawnDate).getTime() - new Date(a.spawnDate).getTime());

  const [growthForm, setGrowthForm] = useState<Omit<GrowthLog, 'id'>>({
    plantId: tankPlants[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    eventType: 'new_leaf',
    description: '',
  });

  const [diseaseForm, setDiseaseForm] = useState<Omit<DiseaseRecord, 'id'>>({
    fishId: tankFishes[0]?.id || '',
    detectDate: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    medication: '',
    result: 'ongoing',
  });

  const [breedingForm, setBreedingForm] = useState<Omit<BreedingRecord, 'id'>>({
    fishId: tankFishes[0]?.id || '',
    spawnDate: new Date().toISOString().split('T')[0],
    eggCount: 0,
    hatchDays: 0,
    fryCount: 0,
    survivalCount: 0,
    notes: '',
  });

  const [editDiseaseForm, setEditDiseaseForm] = useState<Omit<DiseaseRecord, 'id'>>({
    fishId: '',
    detectDate: '',
    symptoms: '',
    diagnosis: '',
    medication: '',
    result: 'ongoing',
    recoverDate: '',
  });

  const getPlantName = (plantId: string): string => {
    const plant = plants.find((p) => p.id === plantId);
    return plant?.name || '未知水草';
  };

  const getFishName = (fishId: string): string => {
    const fish = fishes.find((f) => f.id === fishId);
    return fish?.name || '未知鱼类';
  };

  const getGrowthIcon = (eventType: string) => {
    switch (eventType) {
      case 'new_leaf':
        return <Sprout className="w-4 h-4" />;
      case 'propagation':
        return <Leaf className="w-4 h-4" />;
      case 'flowering':
        return <Heart className="w-4 h-4" />;
      case 'pruning':
        return <Edit className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleAddGrowth = (e: React.FormEvent) => {
    e.preventDefault();
    addGrowthLog(growthForm);
    setGrowthModal(false);
    setGrowthForm({
      plantId: tankPlants[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      eventType: 'new_leaf',
      description: '',
    });
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    addDiseaseRecord(diseaseForm);
    setDiseaseModal(false);
    setDiseaseForm({
      fishId: tankFishes[0]?.id || '',
      detectDate: new Date().toISOString().split('T')[0],
      symptoms: '',
      diagnosis: '',
      medication: '',
      result: 'ongoing',
    });
  };

  const handleAddBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    addBreedingRecord(breedingForm);
    setBreedingModal(false);
    setBreedingForm({
      fishId: tankFishes[0]?.id || '',
      spawnDate: new Date().toISOString().split('T')[0],
      eggCount: 0,
      hatchDays: 0,
      fryCount: 0,
      survivalCount: 0,
      notes: '',
    });
  };

  const openEditDiseaseModal = (record: DiseaseRecord) => {
    setSelectedDisease(record);
    setEditDiseaseForm({
      fishId: record.fishId,
      detectDate: record.detectDate,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      medication: record.medication,
      result: record.result,
      recoverDate: record.recoverDate || '',
    });
    setEditDiseaseModal(true);
  };

  const handleUpdateDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisease) return;
    updateDiseaseRecord(selectedDisease.id, editDiseaseForm);
    setEditDiseaseModal(false);
    setSelectedDisease(null);
  };

  const growthEventTypeOptions = [
    { value: 'new_leaf', label: '新叶生长' },
    { value: 'propagation', label: '植株增殖' },
    { value: 'flowering', label: '开花' },
    { value: 'melting', label: '融叶' },
    { value: 'pruning', label: '修剪' },
  ];

  const diseaseResultOptions = [
    { value: 'ongoing', label: '治疗中' },
    { value: 'recovered', label: '已康复' },
    { value: 'deceased', label: '已死亡' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900">
            生物管理
          </h2>
          <p className="text-gray-500 mt-1">
            {tankPlants.length} 种水草 · {tankFishes.length} 种鱼类 · {tankGrowthLogs.length} 条生长记录
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGrowthModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-reef-50 text-reef-600 rounded-xl hover:bg-reef-100 transition-colors font-medium"
          >
            <Sprout className="w-4 h-4" />
            记录生长
          </button>
          <button
            onClick={() => setDiseaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-coral-50 text-coral-600 rounded-xl hover:bg-coral-100 transition-colors font-medium"
          >
            <Stethoscope className="w-4 h-4" />
            记录疾病
          </button>
          <button
            onClick={() => setBreedingModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            记录繁殖
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="水草种类"
          value={tankPlants.length}
          unit="种"
          icon={Leaf}
          status="normal"
        />
        <StatCard
          title="鱼类种类"
          value={tankFishes.length}
          unit="种"
          icon={FishIcon}
          status="normal"
        />
        <StatCard
          title="生长记录"
          value={tankGrowthLogs.length}
          unit="条"
          icon={Sprout}
          status="normal"
        />
        <StatCard
          title="治疗中"
          value={tankDiseaseRecords.filter((d) => d.result === 'ongoing').length}
          unit="条"
          icon={Stethoscope}
          status={
            tankDiseaseRecords.filter((d) => d.result === 'ongoing').length > 0
              ? 'warning'
              : 'normal'
          }
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-reef-600" />
          <h3 className="text-lg font-bold font-serif text-gray-900">
            生长记录
          </h3>
        </div>

        {tankGrowthLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Leaf className="w-12 h-12 mx-auto text-reef-400 mb-3" />
            <p>暂无生长记录，水草正在茁壮成长中</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-reef-200 to-aqua-200" />
            <div className="space-y-4">
              {tankGrowthLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="relative flex gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
                      log.eventType === 'melting'
                        ? 'bg-coral-100 text-coral-600'
                        : 'bg-reef-100 text-reef-600'
                    }`}
                  >
                    {getGrowthIcon(log.eventType)}
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={log.eventType} size="sm" />
                        <span className="font-medium text-reef-700">
                          {getPlantName(log.plantId)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.date)}
                      </span>
                    </div>
                    <p className="text-gray-700">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Stethoscope className="w-5 h-5 text-coral-600" />
          <h3 className="text-lg font-bold font-serif text-gray-900">
            疾病记录和用药历史
          </h3>
        </div>

        {tankDiseaseRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-reef-400 mb-3" />
            <p>暂无疾病记录，鱼只健康状况良好</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tankDiseaseRecords.map((record, index) => (
              <div
                key={record.id}
                className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        record.result === 'recovered'
                          ? 'bg-reef-100'
                          : record.result === 'ongoing'
                          ? 'bg-coral-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {record.result === 'recovered' ? (
                        <CheckCircle2 className="w-5 h-5 text-reef-600" />
                      ) : record.result === 'ongoing' ? (
                        <AlertCircle className="w-5 h-5 text-coral-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {getFishName(record.fishId)}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(record.detectDate)}
                        {record.recoverDate && (
                          <span className="ml-2">
                            → {formatDate(record.recoverDate)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={record.result} size="sm" />
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">症状：</span>
                    <span className="text-gray-700">{record.symptoms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">诊断：</span>
                    <span className="text-gray-700">{record.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">用药：</span>
                    <span className="text-gray-700">{record.medication}</span>
                  </div>
                </div>

                {record.result === 'ongoing' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditDiseaseModal(record)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-coral-50 text-coral-600 rounded-xl hover:bg-coral-100 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      更新治疗状态
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Egg className="w-5 h-5 text-aqua-600" />
          <h3 className="text-lg font-bold font-serif text-gray-900">
            繁殖事件记录
          </h3>
        </div>

        {tankBreedingRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Egg className="w-12 h-12 mx-auto text-aqua-400 mb-3" />
            <p>暂无繁殖记录，期待新生命的诞生</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tankBreedingRecords.map((record, index) => {
              const survivalRate =
                record.eggCount > 0
                  ? Math.round((record.survivalCount / record.eggCount) * 100)
                  : 0;

              return (
                <div
                  key={record.id}
                  className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-aqua-100">
                        <Egg className="w-5 h-5 text-aqua-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {getFishName(record.fishId)}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          产卵日期：{formatDate(record.spawnDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-aqua-600 font-mono">
                        {survivalRate}%
                      </p>
                      <p className="text-xs text-gray-500">存活率</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-aqua-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-aqua-600 font-mono">
                        {record.eggCount}
                      </p>
                      <p className="text-xs text-gray-500">产卵数</p>
                    </div>
                    <div className="bg-reef-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-reef-600 font-mono">
                        {record.fryCount}
                      </p>
                      <p className="text-xs text-gray-500">孵化数</p>
                    </div>
                    <div className="bg-coral-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-coral-600 font-mono">
                        {record.survivalCount}
                      </p>
                      <p className="text-xs text-gray-500">存活数</p>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-aqua-400 via-reef-400 to-coral-400 transition-all duration-500"
                      style={{ width: `${survivalRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>孵化周期：{record.hatchDays} 天</span>
                  </div>

                  {record.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                      {record.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={growthModal} onClose={() => setGrowthModal(false)} title="记录生长事件">
        <form onSubmit={handleAddGrowth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              水草种类
            </label>
            <select
              value={growthForm.plantId}
              onChange={(e) =>
                setGrowthForm({ ...growthForm, plantId: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
            >
              {tankPlants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={growthForm.date}
              onChange={(e) =>
                setGrowthForm({ ...growthForm, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事件类型
            </label>
            <select
              value={growthForm.eventType}
              onChange={(e) =>
                setGrowthForm({
                  ...growthForm,
                  eventType: e.target.value as GrowthLog['eventType'],
                })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
            >
              {growthEventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              详细描述
            </label>
            <textarea
              value={growthForm.description}
              onChange={(e) =>
                setGrowthForm({ ...growthForm, description: e.target.value })
              }
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent resize-none"
              placeholder="描述生长情况..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setGrowthModal(false)}
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

      <Modal isOpen={diseaseModal} onClose={() => setDiseaseModal(false)} title="记录疾病">
        <form onSubmit={handleAddDisease} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              鱼类
            </label>
            <select
              value={diseaseForm.fishId}
              onChange={(e) =>
                setDiseaseForm({ ...diseaseForm, fishId: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              {tankFishes.map((fish) => (
                <option key={fish.id} value={fish.id}>
                  {fish.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发现日期
            </label>
            <input
              type="date"
              value={diseaseForm.detectDate}
              onChange={(e) =>
                setDiseaseForm({ ...diseaseForm, detectDate: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              症状
            </label>
            <textarea
              value={diseaseForm.symptoms}
              onChange={(e) =>
                setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })
              }
              rows={2}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              placeholder="描述观察到的症状..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              诊断
            </label>
            <input
              type="text"
              value={diseaseForm.diagnosis}
              onChange={(e) =>
                setDiseaseForm({ ...diseaseForm, diagnosis: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              placeholder="疾病诊断结果..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用药方案
            </label>
            <textarea
              value={diseaseForm.medication}
              onChange={(e) =>
                setDiseaseForm({ ...diseaseForm, medication: e.target.value })
              }
              rows={2}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              placeholder="描述用药方案和剂量..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前状态
            </label>
            <select
              value={diseaseForm.result}
              onChange={(e) =>
                setDiseaseForm({
                  ...diseaseForm,
                  result: e.target.value as DiseaseRecord['result'],
                })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              {diseaseResultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDiseaseModal(false)}
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

      <Modal
        isOpen={editDiseaseModal}
        onClose={() => {
          setEditDiseaseModal(false);
          setSelectedDisease(null);
        }}
        title="更新治疗状态"
      >
        <form onSubmit={handleUpdateDisease} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前状态
            </label>
            <select
              value={editDiseaseForm.result}
              onChange={(e) =>
                setEditDiseaseForm({
                  ...editDiseaseForm,
                  result: e.target.value as DiseaseRecord['result'],
                  recoverDate:
                    e.target.value === 'recovered'
                      ? new Date().toISOString().split('T')[0]
                      : editDiseaseForm.recoverDate,
                })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              {diseaseResultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {editDiseaseForm.result === 'recovered' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                康复日期
              </label>
              <input
                type="date"
                value={editDiseaseForm.recoverDate}
                onChange={(e) =>
                  setEditDiseaseForm({
                    ...editDiseaseForm,
                    recoverDate: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              症状（可修改）
            </label>
            <textarea
              value={editDiseaseForm.symptoms}
              onChange={(e) =>
                setEditDiseaseForm({
                  ...editDiseaseForm,
                  symptoms: e.target.value,
                })
              }
              rows={2}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用药方案（可修改）
            </label>
            <textarea
              value={editDiseaseForm.medication}
              onChange={(e) =>
                setEditDiseaseForm({
                  ...editDiseaseForm,
                  medication: e.target.value,
                })
              }
              rows={2}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setEditDiseaseModal(false);
                setSelectedDisease(null);
              }}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all font-medium"
            >
              更新
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={breedingModal} onClose={() => setBreedingModal(false)} title="记录繁殖事件">
        <form onSubmit={handleAddBreeding} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              鱼类
            </label>
            <select
              value={breedingForm.fishId}
              onChange={(e) =>
                setBreedingForm({ ...breedingForm, fishId: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            >
              {tankFishes.map((fish) => (
                <option key={fish.id} value={fish.id}>
                  {fish.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              产卵日期
            </label>
            <input
              type="date"
              value={breedingForm.spawnDate}
              onChange={(e) =>
                setBreedingForm({ ...breedingForm, spawnDate: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                产卵数量
              </label>
              <input
                type="number"
                value={breedingForm.eggCount}
                onChange={(e) =>
                  setBreedingForm({
                    ...breedingForm,
                    eggCount: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                孵化天数
              </label>
              <input
                type="number"
                value={breedingForm.hatchDays}
                onChange={(e) =>
                  setBreedingForm({
                    ...breedingForm,
                    hatchDays: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                孵化数量
              </label>
              <input
                type="number"
                value={breedingForm.fryCount}
                onChange={(e) =>
                  setBreedingForm({
                    ...breedingForm,
                    fryCount: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                存活数量
              </label>
              <input
                type="number"
                value={breedingForm.survivalCount}
                onChange={(e) =>
                  setBreedingForm({
                    ...breedingForm,
                    survivalCount: Number(e.target.value),
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
              备注（可选）
            </label>
            <textarea
              value={breedingForm.notes}
              onChange={(e) =>
                setBreedingForm({ ...breedingForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent resize-none"
              placeholder="记录繁殖过程中的特殊情况..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setBreedingModal(false)}
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
    </div>
  );
}
