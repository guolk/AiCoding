
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Religion, Deity } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Star,
  BookOpen,
  Heart
} from 'lucide-react';

const Religion = () => {
  const {
    worldSetting,
    religions,
    deities,
    addReligion,
    updateReligion,
    deleteReligion,
    addDeity,
    updateDeity,
    deleteDeity
  } = useWorldStore();

  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [showReligionModal, setShowReligionModal] = useState(false);
  const [showDeityModal, setShowDeityModal] = useState(false);
  const [editingReligion, setEditingReligion] = useState<Religion | null>(null);
  const [editingDeity, setEditingDeity] = useState<Deity | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const religionDeities = selectedReligion
    ? deities.filter(d => d.religionId === selectedReligion.id)
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            宗教神话
          </h1>
          <p className="text-gray-400">记录神祇、信仰体系和神话故事</p>
        </div>
        <Button
          onClick={() => {
            setEditingReligion(null);
            setShowReligionModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加宗教
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        <div className="col-span-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-display font-semibold text-gold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              宗教列表
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {religions.length > 0 ? (
              religions.map((religion) => (
                <div key={religion.id}>
                  <button
                    onClick={() => setSelectedReligion(religion)}
                    className={`w-full text-left px-4 py-3 hover:bg-dark-bg/50 transition-colors flex items-center justify-between ${
                      selectedReligion?.id === religion.id
                        ? 'bg-gold/10 border-r-2 border-gold'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{religion.name}</p>
                      <p className="text-xs text-gray-500">
                        {religion.type}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingReligion(religion);
                          setShowReligionModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gold"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReligion(religion.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无宗教</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            {selectedReligion ? (
              <>
                <div>
                  <h3 className="font-display font-semibold text-gold">
                    {selectedReligion.name}
                  </h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDeity(null);
                    setShowDeityModal(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  添加神祇
                </Button>
              </>
            ) : (
              <h3 className="font-display font-semibold text-gray-500">
                选择宗教查看详情
              </h3>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedReligion ? (
              <div className="p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-tech-purple/20 text-tech-purple rounded-full text-sm">
                      {selectedReligion.type}
                    </span>
                  </div>
                </div>

                {selectedReligion.coreBeliefs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gold font-medium mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      核心信仰
                    </h4>
                    <div className="space-y-2">
                      {selectedReligion.coreBeliefs.map((belief, idx) => (
                        <p key={idx} className="text-gray-300 flex items-start gap-2">
                          <span className="text-gold mt-0.5">•</span>
                          {belief}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReligion.practices.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-2">宗教实践</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReligion.practices.map((practice, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-dark-bg text-gray-300 rounded-full text-sm"
                        >
                          {practice}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold" />
                    神祇 ({religionDeities.length})
                  </h4>
                  {religionDeities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {religionDeities.map((deity) => (
                        <Card key={deity.id}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-copper flex items-center justify-center">
                                  <Star className="w-5 h-5 text-dark-bg" />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">{deity.name}</h5>
                                  <p className="text-xs text-gray-400">{deity.domain}</p>
                                </div>
                              </div>
                              {deity.mythology && (
                                <p className="text-sm text-gray-300 mt-3">{deity.mythology}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingDeity(deity);
                                  setShowDeityModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gold"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteDeity(deity.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无神祇，点击上方按钮添加</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>选择左侧的宗教</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReligionModal
        isOpen={showReligionModal}
        onClose={() => {
          setShowReligionModal(false);
          setEditingReligion(null);
        }}
        religion={editingReligion}
        onSave={(data) => {
          if (editingReligion) {
            updateReligion(editingReligion.id, data);
          } else {
            addReligion(data);
          }
          setShowReligionModal(false);
          setEditingReligion(null);
        }}
      />

      <DeityModal
        isOpen={showDeityModal}
        onClose={() => {
          setShowDeityModal(false);
          setEditingDeity(null);
        }}
        deity={editingDeity}
        religionId={selectedReligion?.id}
        onSave={(data) => {
          if (editingDeity) {
            updateDeity(editingDeity.id, data);
          } else {
            addDeity(data);
          }
          setShowDeityModal(false);
          setEditingDeity(null);
        }}
      />
    </div>
  );
};

const ReligionModal = ({
  isOpen,
  onClose,
  religion,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  religion: Religion | null;
  onSave: (data: Omit<Religion, 'id'>) => void;
}) => {
  const [name, setName] = useState(religion?.name || '');
  const [type, setType] = useState(religion?.type || '');
  const [beliefsText, setBeliefsText] = useState(religion?.coreBeliefs.join('\n') || '');
  const [practicesText, setPracticesText] = useState(religion?.practices.join('\n') || '');

  const religionTypes = ['一神教', '多神教', '万物有灵论', '祖先崇拜', '神秘主义', '无神论', '其他'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={religion ? '编辑宗教' : '添加宗教'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              name,
              type,
              coreBeliefs: beliefsText.split('\n').filter(b => b.trim()),
              practices: practicesText.split('\n').filter(p => p.trim())
            })}
            disabled={!name.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">宗教名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：光明神教"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">宗教类型</label>
          <div className="flex flex-wrap gap-2">
            {religionTypes.map((t) => (
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
          <label className="block text-sm text-gray-400 mb-1">核心信仰（每行一个）</label>
          <textarea
            value={beliefsText}
            onChange={(e) => setBeliefsText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;相信命运由神决定&#10;死后灵魂会回归神的怀抱"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">宗教实践（每行一个）</label>
          <textarea
            value={practicesText}
            onChange={(e) => setPracticesText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;每日祈祷&#10;献祭仪式"
          />
        </div>
      </div>
    </Modal>
  );
};

const DeityModal = ({
  isOpen,
  onClose,
  deity,
  religionId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  deity: Deity | null;
  religionId?: string;
  onSave: (data: Omit<Deity, 'id'>) => void;
}) => {
  const [name, setName] = useState(deity?.name || '');
  const [domain, setDomain] = useState(deity?.domain || '');
  const [mythology, setMythology] = useState(deity?.mythology || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deity ? '编辑神祇' : '添加神祇'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              religionId: deity?.religionId || religionId || '',
              name,
              domain,
              mythology
            })}
            disabled={!name.trim() || !religionId}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">神祇名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：光明之神"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">神职领域</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：光明、正义、战争"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">神话故事</label>
          <textarea
            value={mythology}
            onChange={(e) => setMythology(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这位神祇的神话故事和传说..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default Religion;
