
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Faction, FactionRelation } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Users2,
  Swords,
  Heart,
  Minus,
  ArrowDown,
  Flag
} from 'lucide-react';

const Factions = () => {
  const {
    worldSetting,
    factions,
    characters,
    factionRelations,
    addFaction,
    updateFaction,
    deleteFaction,
    addFactionRelation,
    updateFactionRelation,
    deleteFactionRelation
  } = useWorldStore();

  const [showFactionModal, setShowFactionModal] = useState(false);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [editingRelation, setEditingRelation] = useState<FactionRelation | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const getRelationIcon = (type: string) => {
    switch (type) {
      case 'ally': return <Heart className="w-4 h-4" />;
      case 'enemy': return <Swords className="w-4 h-4" />;
      case 'neutral': return <Minus className="w-4 h-4" />;
      case 'vassal': return <ArrowDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getRelationColor = (type: string) => {
    switch (type) {
      case 'ally': return 'text-green-400';
      case 'enemy': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      case 'vassal': return 'text-tech-purple';
      default: return 'text-gray-400';
    }
  };

  const getRelationLabel = (type: string) => {
    switch (type) {
      case 'ally': return '盟友';
      case 'enemy': return '敌对';
      case 'neutral': return '中立';
      case 'vassal': return '附属';
      default: return type;
    }
  };

  const getFactionCharacters = (factionId: string) => {
    return characters.filter(c => c.factionId === factionId);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            阵营组织
          </h1>
          <p className="text-gray-400">管理阵营、组织和他们之间的关系</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setEditingRelation(null);
              setShowRelationModal(true);
            }}
            variant="secondary"
            icon={<Users2 className="w-4 h-4" />}
          >
            添加关系
          </Button>
          <Button
            onClick={() => {
              setEditingFaction(null);
              setShowFactionModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            添加阵营
          </Button>
        </div>
      </div>

      {factions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {factions.map((faction) => (
            <Card key={faction.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-copper flex items-center justify-center">
                    <Shield className="w-7 h-7 text-dark-bg" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">
                      {faction.name}
                    </h4>
                    <p className="text-xs text-gray-400">{faction.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingFaction(faction);
                      setShowFactionModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gold"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFaction(faction.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {faction.ideology && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">意识形态</p>
                  <p className="text-sm text-gray-300">{faction.ideology}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">领袖</p>
                  <p className="text-white">{faction.leadership || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">成员</p>
                  <p className="text-white">{getFactionCharacters(faction.id).length} 人</p>
                </div>
              </div>

              {faction.territory && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">势力范围</p>
                  <p className="text-sm text-gray-300">{faction.territory}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-dark-border">
                <button
                  onClick={() => setSelectedFaction(selectedFaction === faction.id ? null : faction.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFaction === faction.id
                      ? 'bg-gold/20 text-gold'
                      : 'bg-dark-bg text-gray-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  关系网络
                </button>
              </div>

              {selectedFaction === faction.id && (
                <div className="mt-4 pt-4 border-t border-dark-border space-y-3 fade-in">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">阵营关系</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingRelation(null);
                        setShowRelationModal(true);
                      }}
                      icon={<Plus className="w-3 h-3" />}
                    >
                      添加
                    </Button>
                  </div>
                  {factionRelations.some(r => r.factionA === faction.id || r.factionB === faction.id) ? (
                    <div className="space-y-2">
                      {factionRelations
                        .filter(r => r.factionA === faction.id || r.factionB === faction.id)
                        .map((rel) => {
                          const otherFactionId = rel.factionA === faction.id ? rel.factionB : rel.factionA;
                          const otherFaction = factions.find(f => f.id === otherFactionId);
                          return (
                            <div
                              key={rel.id}
                              className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 ${getRelationColor(rel.type)}`}>
                                  {getRelationIcon(rel.type)}
                                  <span className="text-sm">{getRelationLabel(rel.type)}</span>
                                </div>
                                <span className="text-white">{otherFaction?.name || '未知'}</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingRelation(rel);
                                    setShowRelationModal(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gold"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteFactionRelation(rel.id)}
                                  className="p-1 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      暂无关系记录
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无阵营
          </h2>
          <p className="text-gray-400 mb-6">开始创建你的第一个阵营</p>
          <Button
            onClick={() => {
              setEditingFaction(null);
              setShowFactionModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            添加阵营
          </Button>
        </div>
      )}

      <FactionModal
        isOpen={showFactionModal}
        onClose={() => {
          setShowFactionModal(false);
          setEditingFaction(null);
        }}
        faction={editingFaction}
        onSave={(data) => {
          if (editingFaction) {
            updateFaction(editingFaction.id, data);
          } else {
            addFaction(data);
          }
          setShowFactionModal(false);
          setEditingFaction(null);
        }}
      />

      <FactionRelationModal
        isOpen={showRelationModal}
        onClose={() => {
          setShowRelationModal(false);
          setEditingRelation(null);
        }}
        relation={editingRelation}
        factions={factions}
        onSave={(data) => {
          if (editingRelation) {
            updateFactionRelation(editingRelation.id, data);
          } else {
            addFactionRelation(data);
          }
          setShowRelationModal(false);
          setEditingRelation(null);
        }}
      />
    </div>
  );
};

const FactionModal = ({
  isOpen,
  onClose,
  faction,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  faction: Faction | null;
  onSave: (data: Omit<Faction, 'id'>) => void;
}) => {
  const [name, setName] = useState(faction?.name || '');
  const [type, setType] = useState(faction?.type || '');
  const [ideology, setIdeology] = useState(faction?.ideology || '');
  const [leadership, setLeadership] = useState(faction?.leadership || '');
  const [territory, setTerritory] = useState(faction?.territory || '');

  const factionTypes = ['王国', '帝国', '共和国', '教会', '行会', '秘密组织', '商人工会', '佣兵公会', '其他'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={faction ? '编辑阵营' : '添加阵营'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ name, type, ideology, leadership, territory })}
            disabled={!name.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">阵营名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：光明教廷"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">类型</label>
          <div className="flex flex-wrap gap-2">
            {factionTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  type === t
                    ? 'bg-gold text-dark-bg font-medium'
                    : 'bg-dark-bg text-gray-300 hover:bg-dark-border'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {type === '其他' && (
            <input
              type="text"
              value={type === '其他' ? '' : type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="输入自定义类型"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">意识形态</label>
          <textarea
            value={ideology}
            onChange={(e) => setIdeology(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个阵营的核心信仰或目标..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">领导结构</label>
          <input
            type="text"
            value={leadership}
            onChange={(e) => setLeadership(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：君主制、长老会等"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">势力范围</label>
          <textarea
            value={territory}
            onChange={(e) => setTerritory(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个阵营控制的领土或影响范围..."
          />
        </div>
      </div>
    </Modal>
  );
};

const FactionRelationModal = ({
  isOpen,
  onClose,
  relation,
  factions,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  relation: FactionRelation | null;
  factions: Faction[];
  onSave: (data: Omit<FactionRelation, 'id'>) => void;
}) => {
  const [factionA, setFactionA] = useState(relation?.factionA || '');
  const [factionB, setFactionB] = useState(relation?.factionB || '');
  const [type, setType] = useState<FactionRelation['type']>(relation?.type || 'neutral');
  const [description, setDescription] = useState(relation?.description || '');

  const relationTypes: Array<{ value: FactionRelation['type']; label: string }> = [
    { value: 'ally', label: '盟友' },
    { value: 'enemy', label: '敌对' },
    { value: 'neutral', label: '中立' },
    { value: 'vassal', label: '附属' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={relation ? '编辑关系' : '添加关系'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ factionA, factionB, type, description })}
            disabled={!factionA || !factionB || factionA === factionB}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">阵营 A</label>
            <select
              value={factionA}
              onChange={(e) => setFactionA(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="">选择阵营...</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">阵营 B</label>
            <select
              value={factionB}
              onChange={(e) => setFactionB(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="">选择阵营...</option>
              {factions.filter(f => f.id !== factionA).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">关系类型</label>
          <div className="grid grid-cols-4 gap-2">
            {relationTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-3 rounded-lg text-sm transition-colors flex flex-col items-center gap-1 ${
                  type === t.value
                    ? 'bg-gold text-dark-bg font-medium'
                    : 'bg-dark-bg text-gray-300 hover:bg-dark-border'
                }`}
              >
                {t.value === 'ally' && <Heart className="w-5 h-5" />}
                {t.value === 'enemy' && <Swords className="w-5 h-5" />}
                {t.value === 'neutral' && <Minus className="w-5 h-5" />}
                {t.value === 'vassal' && <ArrowDown className="w-5 h-5" />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">关系描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述两个阵营之间关系的细节..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default Factions;
