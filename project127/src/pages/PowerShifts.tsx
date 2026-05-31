
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { PowerShift, Faction } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  Edit2,
  Shield,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const PowerShifts = () => {
  const {
    worldSetting,
    factions,
    powerShifts,
    addPowerShift,
    updatePowerShift,
    deletePowerShift
  } = useWorldStore();

  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<PowerShift | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const getFactionName = (factionId: string) => {
    return factions.find(f => f.id === factionId)?.name || '未知阵营';
  };

  const getChangeIcon = (change: string) => {
    const lower = change.toLowerCase();
    if (lower.includes('崛起') || lower.includes('增长') || lower.includes('增加') || lower.includes('扩张')) {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    }
    if (lower.includes('衰落') || lower.includes('下降') || lower.includes('减少') || lower.includes('收缩')) {
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const sortedShifts = [...powerShifts].sort((a, b) => {
    const periodA = a.period.toLowerCase();
    const periodB = b.period.toLowerCase();
    return periodA.localeCompare(periodB);
  });

  const periods = sortedShifts.reduce((acc, shift) => {
    if (!acc.includes(shift.period)) {
      acc.push(shift.period);
    }
    return acc;
  }, [] as string[]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            权力格局变化
          </h1>
          <p className="text-gray-400">记录随着故事发展的势力消长</p>
        </div>
        <Button
          onClick={() => {
            setEditingShift(null);
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          记录变化
        </Button>
      </div>

      {powerShifts.length > 0 ? (
        <div className="space-y-8">
          {periods.map((period) => {
            const periodShifts = sortedShifts.filter(s => s.period === period);
            return (
              <div key={period}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Clock className="w-5 h-5" />
                    <h2 className="font-display text-xl font-bold">{period}</h2>
                  </div>
                  <div className="flex-1 h-px bg-dark-border" />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {periodShifts.map((shift) => (
                    <Card key={shift.id}>
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-dark-bg">
                          {getChangeIcon(shift.change)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2 text-white">
                              <Shield className="w-4 h-4 text-gold" />
                              <span className="font-medium">{getFactionName(shift.factionId)}</span>
                            </div>
                            <span className="px-2 py-0.5 text-xs rounded bg-dark-bg text-gray-300">
                              {shift.change}
                            </span>
                          </div>
                          {shift.description && (
                            <p className="text-sm text-gray-300">{shift.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingShift(shift);
                              setShowModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gold"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePowerShift(shift.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无权力变化记录
          </h2>
          <p className="text-gray-400 mb-6">
            记录各个阵营在不同历史时期的权力变化
          </p>
          <Button
            onClick={() => {
              setEditingShift(null);
              setShowModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            记录变化
          </Button>
        </div>
      )}

      <PowerShiftModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingShift(null);
        }}
        powerShift={editingShift}
        factions={factions}
        onSave={(data) => {
          if (editingShift) {
            updatePowerShift(editingShift.id, data);
          } else {
            addPowerShift(data);
          }
          setShowModal(false);
          setEditingShift(null);
        }}
      />
    </div>
  );
};

const PowerShiftModal = ({
  isOpen,
  onClose,
  powerShift,
  factions,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  powerShift: PowerShift | null;
  factions: Faction[];
  onSave: (data: Omit<PowerShift, 'id'>) => void;
}) => {
  const [factionId, setFactionId] = useState(powerShift?.factionId || '');
  const [period, setPeriod] = useState(powerShift?.period || '');
  const [change, setChange] = useState(powerShift?.change || '');
  const [description, setDescription] = useState(powerShift?.description || '');

  const changeTypes = ['崛起', '衰落', '扩张', '收缩', '分裂', '合并', '转型', '其他'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={powerShift ? '编辑权力变化' : '记录权力变化'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ factionId, period, change, description })}
            disabled={!factionId || !period || !change}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">阵营 *</label>
          <select
            value={factionId}
            onChange={(e) => setFactionId(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">选择阵营...</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">历史时期 *</label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：纪元前300年、大灾变之后"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">变化类型 *</label>
          <div className="flex flex-wrap gap-2">
            {changeTypes.map((t) => (
              <button
                key={t}
                onClick={() => setChange(t)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                  change === t
                    ? 'bg-gold text-dark-bg font-medium'
                    : 'bg-dark-bg text-gray-300 hover:bg-dark-border'
                }`}
              >
                {(t === '崛起' || t === '扩张') && <ArrowUp className="w-4 h-4" />}
                {(t === '衰落' || t === '收缩') && <ArrowDown className="w-4 h-4" />}
                {t}
              </button>
            ))}
          </div>
          {change === '其他' && (
            <input
              type="text"
              value={change === '其他' ? '' : change}
              onChange={(e) => setChange(e.target.value)}
              className="mt-2 w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="输入自定义变化类型"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">详细描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个变化的具体过程和影响..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default PowerShifts;
