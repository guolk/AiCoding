
import { useState, useMemo, useEffect } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Character, CharacterRelation } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  User,
  Eye,
  Search,
  X,
  Heart,
  Shield,
  Skull
} from 'lucide-react';

const Characters = () => {
  const {
    worldSetting,
    characters,
    factions,
    characterRelations,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addCharacterRelation,
    updateCharacterRelation,
    deleteCharacterRelation
  } = useWorldStore();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingRelation, setEditingRelation] = useState<CharacterRelation | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const filteredCharacters = useMemo(() => {
    if (!searchTerm.trim()) return characters;
    const term = searchTerm.toLowerCase();
    return characters.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.alias.some(a => a.toLowerCase().includes(term))
    );
  }, [characters, searchTerm]);

  const getCharacterRelations = (characterId: string) => {
    return characterRelations.filter(
      r => r.characterA === characterId || r.characterB === characterId
    );
  };

  const getFactionName = (factionId: string | null) => {
    if (!factionId) return '无';
    return factions.find(f => f.id === factionId)?.name || '未知';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            人物档案
          </h1>
          <p className="text-gray-400">管理世界中的角色和他们之间的关系</p>
        </div>
        <Button
          onClick={() => {
            setEditingCharacter(null);
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加人物
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索人物名称或别名..."
            className="w-full pl-12 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <Card key={character.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-copper flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-dark-bg" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">
                      {character.name}
                    </h4>
                    {character.alias.length > 0 && (
                      <p className="text-xs text-gray-400">
                        又名: {character.alias.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">种族</span>
                  <span className="text-white">{character.race || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">阵营</span>
                  <span className="text-white">{getFactionName(character.factionId)}</span>
                </div>
                {character.birthdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">出生</span>
                    <span className="text-white">{character.birthdate}</span>
                  </div>
                )}
                {character.deathdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">逝世</span>
                    <span className="text-red-400">{character.deathdate}</span>
                  </div>
                )}
              </div>

              {character.abilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">能力</p>
                  <div className="flex flex-wrap gap-1">
                    {character.abilities.slice(0, 4).map((ability, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-magic-cyan/20 text-magic-cyan text-xs rounded"
                      >
                        {ability}
                      </span>
                    ))}
                    {character.abilities.length > 4 && (
                      <span className="px-2 py-0.5 bg-dark-bg text-gray-400 text-xs rounded">
                        +{character.abilities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-dark-border">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedCharacter(character)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  查看
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCharacter(character);
                    setShowModal(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCharacter(character.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无人物
          </h2>
          <p className="text-gray-400 mb-6">
            {searchTerm ? '没有找到匹配的人物' : '开始创建你的第一个人物角色'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingCharacter(null);
                setShowModal(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              添加人物
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name || ''}
      >
        {selectedCharacter && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-copper flex items-center justify-center">
                <User className="w-10 h-10 text-dark-bg" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedCharacter.name}
                </h3>
                {selectedCharacter.alias.length > 0 && (
                  <p className="text-gray-400">
                    别名: {selectedCharacter.alias.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">种族</p>
                <p className="text-white">{selectedCharacter.race || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">阵营</p>
                <p className="text-white">{getFactionName(selectedCharacter.factionId)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">出生日期</p>
                <p className="text-white">{selectedCharacter.birthdate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">逝世日期</p>
                <p className="text-white">{selectedCharacter.deathdate || '-'}</p>
              </div>
            </div>

            {selectedCharacter.appearance && (
              <div>
                <p className="text-sm text-gray-400 mb-1">外貌</p>
                <p className="text-white">{selectedCharacter.appearance}</p>
              </div>
            )}

            {selectedCharacter.personality && (
              <div>
                <p className="text-sm text-gray-400 mb-1">性格</p>
                <p className="text-white">{selectedCharacter.personality}</p>
              </div>
            )}

            {selectedCharacter.abilities.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">能力</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.abilities.map((ability, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-magic-cyan/20 text-magic-cyan rounded-full"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCharacter.motivations.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">动机</p>
                <ul className="space-y-1">
                  {selectedCharacter.motivations.map((m, idx) => (
                    <li key={idx} className="text-white flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCharacter.backstory && (
              <div>
                <p className="text-sm text-gray-400 mb-1">背景故事</p>
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {selectedCharacter.backstory}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">关系网络</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingRelation(null);
                    setShowRelationModal(true);
                  }}
                  icon={<Plus className="w-3 h-3" />}
                >
                  添加关系
                </Button>
              </div>
              {getCharacterRelations(selectedCharacter.id).length > 0 ? (
                <div className="space-y-2">
                  {getCharacterRelations(selectedCharacter.id).map((rel) => {
                    const otherCharacterId = rel.characterA === selectedCharacter.id
                      ? rel.characterB
                      : rel.characterA;
                    const otherCharacter = characters.find(c => c.id === otherCharacterId);
                    return (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-magic-cyan to-tech-purple flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-sm">{otherCharacter?.name || '未知'}</p>
                            <p className="text-xs text-gray-400">{rel.type}</p>
                          </div>
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
                            onClick={() => deleteCharacterRelation(rel.id)}
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
                <p className="text-gray-500 text-sm">暂无关系记录</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <CharacterModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCharacter(null);
        }}
        character={editingCharacter}
        factions={factions}
        onSave={(data) => {
          if (editingCharacter) {
            updateCharacter(editingCharacter.id, data);
          } else {
            addCharacter(data);
          }
          setShowModal(false);
          setEditingCharacter(null);
        }}
      />

      <CharacterRelationModal
        isOpen={showRelationModal}
        onClose={() => {
          setShowRelationModal(false);
          setEditingRelation(null);
        }}
        relation={editingRelation}
        characters={characters}
        currentCharacterId={selectedCharacter?.id}
        onSave={(data) => {
          if (editingRelation) {
            updateCharacterRelation(editingRelation.id, data);
          } else {
            addCharacterRelation(data);
          }
          setShowRelationModal(false);
          setEditingRelation(null);
        }}
      />
    </div>
  );
};

const CharacterModal = ({
  isOpen,
  onClose,
  character,
  factions,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  factions: { id: string; name: string }[];
  onSave: (data: Omit<Character, 'id'>) => void;
}) => {
  const [name, setName] = useState(character?.name || '');
  const [aliasText, setAliasText] = useState(character?.alias.join('\n') || '');
  const [race, setRace] = useState(character?.race || '');
  const [birthdate, setBirthdate] = useState(character?.birthdate || '');
  const [deathdate, setDeathdate] = useState(character?.deathdate || '');
  const [factionId, setFactionId] = useState(character?.factionId || '');
  const [appearance, setAppearance] = useState(character?.appearance || '');
  const [personality, setPersonality] = useState(character?.personality || '');
  const [abilitiesText, setAbilitiesText] = useState(character?.abilities.join('\n') || '');
  const [motivationsText, setMotivationsText] = useState(character?.motivations.join('\n') || '');
  const [backstory, setBackstory] = useState(character?.backstory || '');

  useEffect(() => {
    if (isOpen) {
      setName(character?.name || '');
      setAliasText(character?.alias.join('\n') || '');
      setRace(character?.race || '');
      setBirthdate(character?.birthdate || '');
      setDeathdate(character?.deathdate || '');
      setFactionId(character?.factionId || '');
      setAppearance(character?.appearance || '');
      setPersonality(character?.personality || '');
      setAbilitiesText(character?.abilities.join('\n') || '');
      setMotivationsText(character?.motivations.join('\n') || '');
      setBackstory(character?.backstory || '');
    }
  }, [isOpen, character]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={character ? '编辑人物' : '添加人物'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => onSave({
            name,
            alias: aliasText.split('\n').filter(a => a.trim()),
            race,
            birthdate,
            deathdate: deathdate || null,
            appearance,
            personality,
            abilities: abilitiesText.split('\n').filter(a => a.trim()),
            backstory,
            motivations: motivationsText.split('\n').filter(m => m.trim()),
            factionId: factionId || null
          })} disabled={!name.trim()}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">姓名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="人物姓名"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">种族</label>
            <input
              type="text"
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：人类、精灵"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">别名（每行一个）</label>
          <textarea
            value={aliasText}
            onChange={(e) => setAliasText(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">出生日期</label>
            <input
              type="text"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：纪元100年"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">逝世日期</label>
            <input
              type="text"
              value={deathdate || ''}
              onChange={(e) => setDeathdate(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="如在世可留空"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">所属阵营</label>
          <select
            value={factionId}
            onChange={(e) => setFactionId(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">无</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">外貌描述</label>
          <textarea
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">性格特点</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">能力（每行一个）</label>
          <textarea
            value={abilitiesText}
            onChange={(e) => setAbilitiesText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">动机（每行一个）</label>
          <textarea
            value={motivationsText}
            onChange={(e) => setMotivationsText(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">背景故事</label>
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

const CharacterRelationModal = ({
  isOpen,
  onClose,
  relation,
  characters,
  currentCharacterId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  relation: CharacterRelation | null;
  characters: Character[];
  currentCharacterId?: string;
  onSave: (data: Omit<CharacterRelation, 'id'>) => void;
}) => {
  const [characterA, setCharacterA] = useState(relation?.characterA || currentCharacterId || '');
  const [characterB, setCharacterB] = useState(relation?.characterB || '');
  const [type, setType] = useState(relation?.type || '');
  const [description, setDescription] = useState(relation?.description || '');

  const relationTypes = ['朋友', '敌人', '恋人', '家人', '导师', '徒弟', '同事', '竞争对手', '其他'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={relation ? '编辑关系' : '添加关系'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ characterA, characterB, type, description })}
            disabled={!characterA || !characterB || characterA === characterB}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">角色 A</label>
            <select
              value={characterA}
              onChange={(e) => setCharacterA(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="">选择角色...</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">角色 B</label>
            <select
              value={characterB}
              onChange={(e) => setCharacterB(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="">选择角色...</option>
              {characters.filter(c => c.id !== characterA).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">关系类型</label>
          <div className="flex flex-wrap gap-2">
            {relationTypes.map((t) => (
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
              placeholder="输入自定义关系类型"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">关系描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述两人之间的关系细节..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default Characters;
