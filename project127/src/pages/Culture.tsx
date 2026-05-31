
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Culture, Festival } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  PartyPopper,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Ban,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';

const Culture = () => {
  const {
    worldSetting,
    cultures,
    festivals,
    addCulture,
    updateCulture,
    deleteCulture,
    addFestival,
    updateFestival,
    deleteFestival
  } = useWorldStore();

  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [showCultureModal, setShowCultureModal] = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [editingCulture, setEditingCulture] = useState<Culture | null>(null);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <PartyPopper className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const cultureFestivals = selectedCulture
    ? festivals.filter(f => f.cultureId === selectedCulture.id)
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            文化习俗
          </h1>
          <p className="text-gray-400">记录价值观、禁忌、社会结构和节日</p>
        </div>
        <Button
          onClick={() => {
            setEditingCulture(null);
            setShowCultureModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加文化
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        <div className="col-span-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-display font-semibold text-gold flex items-center gap-2">
              <Users className="w-5 h-5" />
              文化列表
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cultures.length > 0 ? (
              cultures.map((culture) => (
                <div key={culture.id}>
                  <button
                    onClick={() => setSelectedCulture(culture)}
                    className={`w-full text-left px-4 py-3 hover:bg-dark-bg/50 transition-colors flex items-center justify-between ${
                      selectedCulture?.id === culture.id
                        ? 'bg-gold/10 border-r-2 border-gold'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{culture.name}</p>
                      <p className="text-xs text-gray-500">
                        {festivals.filter(f => f.cultureId === culture.id).length} 个节日
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCulture(culture);
                          setShowCultureModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gold"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCulture(culture.id);
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
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无文化</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            {selectedCulture ? (
              <>
                <div>
                  <h3 className="font-display font-semibold text-gold">
                    {selectedCulture.name}
                  </h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingFestival(null);
                    setShowFestivalModal(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  添加节日
                </Button>
              </>
            ) : (
              <h3 className="font-display font-semibold text-gray-500">
                选择文化查看详情
              </h3>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedCulture ? (
              <div className="p-4">
                {selectedCulture.values.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gold font-medium mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      核心价值观
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCulture.values.map((value, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCulture.taboos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      禁忌
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCulture.taboos.map((taboo, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm"
                        >
                          {taboo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCulture.socialStructure && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-2">社会结构</h4>
                    <p className="text-gray-300">{selectedCulture.socialStructure}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold" />
                    节日与仪式 ({cultureFestivals.length})
                  </h4>
                  {cultureFestivals.length > 0 ? (
                    <div className="space-y-3">
                      {cultureFestivals.map((festival) => (
                        <Card key={festival.id}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-5 h-5 text-gold" />
                                <h5 className="text-white font-medium">{festival.name}</h5>
                                {festival.date && (
                                  <span className="px-2 py-0.5 bg-dark-bg text-gray-400 text-xs rounded">
                                    {festival.date}
                                  </span>
                                )}
                              </div>
                              {festival.purpose && (
                                <p className="text-sm text-gray-400 mb-2">{festival.purpose}</p>
                              )}
                              {festival.traditions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {festival.traditions.map((tradition, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-dark-bg text-magic-cyan text-xs rounded"
                                    >
                                      {tradition}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingFestival(festival);
                                  setShowFestivalModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gold"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFestival(festival.id)}
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
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无节日，点击上方按钮添加</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PartyPopper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>选择左侧的文化</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CultureModal
        isOpen={showCultureModal}
        onClose={() => {
          setShowCultureModal(false);
          setEditingCulture(null);
        }}
        culture={editingCulture}
        onSave={(data) => {
          if (editingCulture) {
            updateCulture(editingCulture.id, data);
          } else {
            addCulture(data);
          }
          setShowCultureModal(false);
          setEditingCulture(null);
        }}
      />

      <FestivalModal
        isOpen={showFestivalModal}
        onClose={() => {
          setShowFestivalModal(false);
          setEditingFestival(null);
        }}
        festival={editingFestival}
        cultureId={selectedCulture?.id}
        onSave={(data) => {
          if (editingFestival) {
            updateFestival(editingFestival.id, data);
          } else {
            addFestival(data);
          }
          setShowFestivalModal(false);
          setEditingFestival(null);
        }}
      />
    </div>
  );
};

const CultureModal = ({
  isOpen,
  onClose,
  culture,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  culture: Culture | null;
  onSave: (data: Omit<Culture, 'id'>) => void;
}) => {
  const [name, setName] = useState(culture?.name || '');
  const [valuesText, setValuesText] = useState(culture?.values.join('\n') || '');
  const [taboosText, setTaboosText] = useState(culture?.taboos.join('\n') || '');
  const [socialStructure, setSocialStructure] = useState(culture?.socialStructure || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={culture ? '编辑文化' : '添加文化'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              name,
              values: valuesText.split('\n').filter(v => v.trim()),
              taboos: taboosText.split('\n').filter(t => t.trim()),
              socialStructure
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
          <label className="block text-sm text-gray-400 mb-1">文化名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：精灵文化、矮人文化"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">核心价值观（每行一个）</label>
          <textarea
            value={valuesText}
            onChange={(e) => setValuesText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;尊重自然&#10;崇尚智慧"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">禁忌（每行一个）</label>
          <textarea
            value={taboosText}
            onChange={(e) => setTaboosText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;砍伐圣树&#10;亵渎神灵"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">社会结构</label>
          <textarea
            value={socialStructure}
            onChange={(e) => setSocialStructure(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个文化的社会结构、等级制度等..."
          />
        </div>
      </div>
    </Modal>
  );
};

const FestivalModal = ({
  isOpen,
  onClose,
  festival,
  cultureId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  festival: Festival | null;
  cultureId?: string;
  onSave: (data: Omit<Festival, 'id'>) => void;
}) => {
  const [name, setName] = useState(festival?.name || '');
  const [date, setDate] = useState(festival?.date || '');
  const [purpose, setPurpose] = useState(festival?.purpose || '');
  const [traditionsText, setTraditionsText] = useState(festival?.traditions.join('\n') || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={festival ? '编辑节日' : '添加节日'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              cultureId: festival?.cultureId || cultureId || '',
              name,
              date,
              purpose,
              traditions: traditionsText.split('\n').filter(t => t.trim())
            })}
            disabled={!name.trim() || !cultureId}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">节日名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：春之庆典、丰收节"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">时间</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：每年春分、每年第100天"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">节日目的</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个节日的意义和目的..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">传统习俗（每行一个）</label>
          <textarea
            value={traditionsText}
            onChange={(e) => setTraditionsText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;献祭仪式&#10;狂欢游行"
          />
        </div>
      </div>
    </Modal>
  );
};

export default Culture;
