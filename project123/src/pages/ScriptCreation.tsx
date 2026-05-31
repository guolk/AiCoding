import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs } from '@/components/common/Tabs';
import { Card, CardHeader, CardContent, EmptyState } from '@/components/common/Card';
import { Modal, ModalFooter } from '@/components/layout/Modal';
import { Input, Textarea, Select, NumberInput, TagInput, Button } from '@/components/common/Form';
import { Badge } from '@/components/common/Tabs';
import {
  ScrollText,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Save,
  User,
  MapPin
} from 'lucide-react';
import {
  DIFFICULTY_MAP,
  DIFFICULTY_COLORS,
  type Character,
  type TimelineNode,
  type ScriptInfo,
  type CharacterRelationship
} from '@/types';
import {
  createDefaultCharacter,
  createDefaultTimelineNode
} from '@/utils/storage';
import { useState } from 'react';

export function ScriptCreation() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProjectData, loadProject, updateScriptInfo } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!projectId) return null;

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs
            tabs={[
              { id: 'info', label: '基础信息', icon: <ScrollText className="w-4 h-4" /> },
              { id: 'characters', label: '角色档案', icon: <Users className="w-4 h-4" /> },
              { id: 'timeline', label: '时间线', icon: <Clock className="w-4 h-4" /> }
            ]}
          >
            {(activeTab) => {
              switch (activeTab) {
                case 'info':
                  return <ScriptInfoSection />;
                case 'characters':
                  return <CharactersSection />;
                case 'timeline':
                  return <TimelineSection />;
                default:
                  return null;
              }
            }}
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function ScriptInfoSection() {
  const { currentProjectData, updateScriptInfo } = useProjectStore();
  const info = currentProjectData?.data.scriptInfo;

  if (!info) return null;

  const handleChange = (field: keyof ScriptInfo, value: any) => {
    updateScriptInfo({ [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="剧本基础信息"
          subtitle="设置您剧本的核心属性"
          actions={
            <Button variant="secondary" size="sm">
              <Save className="w-4 h-4 mr-2" />
              已自动保存
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="剧本名称"
                value={info.title}
                onChange={(v) => handleChange('title', v)}
                placeholder="输入剧本名称..."
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="故事背景"
                value={info.background}
                onChange={(v) => handleChange('background', v)}
                placeholder="描述故事发生的背景和世界观..."
                rows={4}
              />
            </div>

            <Select
              label="时代背景"
              value={info.era}
              onChange={(v) => handleChange('era', v)}
              placeholder="选择时代..."
              options={[
                { value: '古代', label: '古代' },
                { value: '近代', label: '近代' },
                { value: '现代', label: '现代' },
                { value: '未来', label: '未来' },
                { value: '架空', label: '架空世界' },
                { value: '奇幻', label: '奇幻' },
                { value: '科幻', label: '科幻' }
              ]}
            />

            <Select
              label="难度等级"
              value={info.difficulty}
              onChange={(v) => handleChange('difficulty', v as any)}
              options={[
                { value: 'easy', label: DIFFICULTY_MAP.easy },
                { value: 'medium', label: DIFFICULTY_MAP.medium },
                { value: 'hard', label: DIFFICULTY_MAP.hard },
                { value: 'expert', label: DIFFICULTY_MAP.expert }
              ]}
            />

            <NumberInput
              label="玩家人数"
              value={info.playerCount}
              onChange={(v) => handleChange('playerCount', v)}
              min={2}
              max={20}
            />

            <NumberInput
              label="游戏时长（分钟）"
              value={info.duration}
              onChange={(v) => handleChange('duration', v)}
              min={30}
              max={480}
              step={30}
            />

            <div className="md:col-span-2">
              <TagInput
                label="主要场景"
                tags={info.scenes}
                onChange={(v) => handleChange('scenes', v)}
                placeholder="输入场景名称，按回车添加..."
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="剧本简介"
                value={info.description}
                onChange={(v) => handleChange('description', v)}
                placeholder="简要描述剧本的核心内容和亮点..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="剧本概览" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <Users className="w-8 h-8 mx-auto text-primary-400 mb-2" />
              <p className="text-2xl font-bold text-white">{info.playerCount}</p>
              <p className="text-xs text-dark-muted">玩家人数</p>
            </div>
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <Clock className="w-8 h-8 mx-auto text-accent-gold mb-2" />
              <p className="text-2xl font-bold text-white">{info.duration}</p>
              <p className="text-xs text-dark-muted">分钟</p>
            </div>
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <Badge variant={DIFFICULTY_COLORS[info.difficulty]}>
                {DIFFICULTY_MAP[info.difficulty]}
              </Badge>
              <p className="text-xs text-dark-muted mt-2">难度</p>
            </div>
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{info.scenes.length}</p>
              <p className="text-xs text-dark-muted">主要场景</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CharactersSection() {
  const { currentProjectData, addCharacter, updateCharacter, deleteCharacter } = useProjectStore();
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const characters = currentProjectData?.data.characters || [];

  const handleAdd = () => {
    setEditingCharacter(createDefaultCharacter());
    setShowModal(true);
  };

  const handleEdit = (char: Character) => {
    setEditingCharacter({ ...char });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingCharacter) return;

    const existing = characters.find((c) => c.id === editingCharacter.id);
    if (existing) {
      updateCharacter(editingCharacter.id, editingCharacter);
    } else {
      addCharacter(editingCharacter);
    }

    setShowModal(false);
    setEditingCharacter(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCharacter(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="角色档案"
          subtitle={`共 ${characters.length} 个角色`}
          actions={
            <Button variant="gold" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加角色
            </Button>
          }
        />
        <CardContent>
          {characters.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="还没有角色"
              description="创建角色来丰富您的剧本世界"
              action={
                <Button variant="gold" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个角色
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <Card key={char.id} hover className="relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(char)}
                      className="p-2 rounded bg-dark-card hover:bg-dark-surface"
                    >
                      <Edit3 className="w-4 h-4 text-dark-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(char.id)}
                      className="p-2 rounded bg-dark-card hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {char.name || '未命名角色'}
                      </h4>
                      {char.identity && (
                        <p className="text-sm text-primary-300 truncate">{char.identity}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {char.personality && (
                      <div>
                        <span className="text-xs text-dark-muted">性格</span>
                        <p className="text-sm text-dark-text line-clamp-2">{char.personality}</p>
                      </div>
                    )}
                    {char.motivation && (
                      <div>
                        <span className="text-xs text-dark-muted">动机</span>
                        <p className="text-sm text-dark-text line-clamp-2">{char.motivation}</p>
                      </div>
                    )}
                    {char.relationships && char.relationships.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {char.relationships.slice(0, 3).map((rel, idx) => {
                          const targetName = characters.find((c) => c.id === rel.targetId)?.name;
                          return (
                            <Badge key={idx} variant="primary">
                              {targetName || rel.relationshipType}
                            </Badge>
                          );
                        })}
                        {char.relationships.length > 3 && (
                          <Badge variant="primary">+{char.relationships.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCharacter?.name ? '编辑角色' : '创建角色'}
        size="xl"
      >
        {editingCharacter && (
          <CharacterEditor
            character={editingCharacter}
            onChange={setEditingCharacter}
            allCharacters={characters}
          />
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            取消
          </Button>
          <Button variant="gold" onClick={handleSave}>
            保存
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-muted">
          确定要删除此角色吗？相关的时间线和线索关联也将被移除。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

interface CharacterEditorProps {
  character: Character;
  onChange: (char: Character) => void;
  allCharacters: Character[];
}

function CharacterEditor({ character, onChange, allCharacters }: CharacterEditorProps) {
  const updateField = (field: keyof Character, value: any) => {
    onChange({ ...character, [field]: value });
  };

  const addRelationship = () => {
    const newRel: CharacterRelationship = {
      targetId: allCharacters.find((c) => c.id !== character.id)?.id || '',
      relationshipType: '',
      description: ''
    };
    onChange({
      ...character,
      relationships: [...(character.relationships || []), newRel]
    });
  };

  const updateRelationship = (idx: number, field: keyof CharacterRelationship, value: string) => {
    const rels = [...(character.relationships || [])];
    rels[idx] = { ...rels[idx], [field]: value };
    onChange({ ...character, relationships: rels });
  };

  const removeRelationship = (idx: number) => {
    const rels = [...(character.relationships || [])];
    rels.splice(idx, 1);
    onChange({ ...character, relationships: rels });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="角色名称"
          value={character.name}
          onChange={(v) => updateField('name', v)}
          placeholder="输入角色名称..."
        />
        <Input
          label="身份/职业"
          value={character.identity}
          onChange={(v) => updateField('identity', v)}
          placeholder="角色的身份或职业..."
        />
      </div>

      <Textarea
        label="性格特点"
        value={character.personality}
        onChange={(v) => updateField('personality', v)}
        placeholder="描述角色的性格特征..."
        rows={2}
      />

      <Textarea
        label="核心动机"
        value={character.motivation}
        onChange={(v) => updateField('motivation', v)}
        placeholder="角色在故事中的核心动机和目标..."
        rows={2}
      />

      <Textarea
        label="需要隐瞒的秘密"
        value={character.secrets}
        onChange={(v) => updateField('secrets', v)}
        placeholder="角色需要隐瞒的重要秘密..."
        rows={3}
      />

      <div className="border-t border-dark-border pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-dark-text">角色关系</h4>
          <Button variant="secondary" size="sm" onClick={addRelationship}>
            <Plus className="w-4 h-4 mr-1" />
            添加关系
          </Button>
        </div>

        {(character.relationships || []).length === 0 ? (
          <p className="text-sm text-dark-muted text-center py-4">
            暂无角色关系，点击上方按钮添加
          </p>
        ) : (
          <div className="space-y-3">
            {(character.relationships || []).map((rel, idx) => (
              <div key={idx} className="p-3 bg-dark-surface rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-muted">关系 #{idx + 1}</span>
                  <button
                    onClick={() => removeRelationship(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="目标角色"
                    value={rel.targetId}
                    onChange={(v) => updateRelationship(idx, 'targetId', v)}
                    options={allCharacters
                      .filter((c) => c.id !== character.id)
                      .map((c) => ({ value: c.id, label: c.name || '未命名' }))}
                    placeholder="选择目标角色..."
                  />
                  <Input
                    label="关系类型"
                    value={rel.relationshipType}
                    onChange={(v) => updateRelationship(idx, 'relationshipType', v)}
                    placeholder="如：父女、同事、仇人..."
                  />
                </div>
                <Input
                  label="关系描述"
                  value={rel.description}
                  onChange={(v) => updateRelationship(idx, 'description', v)}
                  placeholder="详细描述这个关系..."
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineSection() {
  const { currentProjectData, addTimelineNode, updateTimelineNode, deleteTimelineNode } = useProjectStore();
  const [editingNode, setEditingNode] = useState<TimelineNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const timeline = currentProjectData?.data.timeline || [];
  const characters = currentProjectData?.data.characters || [];

  const handleAdd = () => {
    setEditingNode(createDefaultTimelineNode());
    setShowModal(true);
  };

  const handleEdit = (node: TimelineNode) => {
    setEditingNode({ ...node });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingNode) return;

    const existing = timeline.find((n) => n.id === editingNode.id);
    if (existing) {
      updateTimelineNode(editingNode.id, editingNode);
    } else {
      addTimelineNode(editingNode);
    }

    setShowModal(false);
    setEditingNode(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTimelineNode(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="故事时间线"
          subtitle={`共 ${timeline.length} 个时间节点`}
          actions={
            <Button variant="gold" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加节点
            </Button>
          }
        />
        <CardContent>
          {timeline.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-12 h-12" />}
              title="还没有时间线"
              description="梳理故事发生前的完整时间线，包括所有角色的行动轨迹"
              action={
                <Button variant="gold" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个节点
                </Button>
              }
            />
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-primary-600 to-accent-gold" />
              
              <div className="space-y-6">
                {timeline.map((node, idx) => (
                  <div key={node.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="absolute left-4 w-5 h-5 rounded-full bg-primary-500 border-4 border-dark-bg -translate-x-1/2" />
                    
                    <Card hover className="group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEdit(node)}
                          className="p-2 rounded bg-dark-card hover:bg-dark-surface"
                        >
                          <Edit3 className="w-4 h-4 text-dark-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(node.id)}
                          className="p-2 rounded bg-dark-card hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-primary-600/30 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary-300" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {node.time && (
                              <Badge variant="gold">{node.time}</Badge>
                            )}
                            <h4 className="font-semibold text-white">
                              {node.title || '未命名节点'}
                            </h4>
                          </div>

                          {node.description && (
                            <p className="text-sm text-dark-text mb-3">
                              {node.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3">
                            {node.location && (
                              <div className="flex items-center gap-1 text-xs text-dark-muted">
                                <MapPin className="w-3 h-3" />
                                {node.location}
                              </div>
                            )}

                            {node.characterIds.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <Users className="w-3 h-3 text-dark-muted" />
                                {node.characterIds.map((charId) => {
                                  const char = characters.find((c) => c.id === charId);
                                  return char ? (
                                    <Badge key={charId} variant="primary">
                                      {char.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNode?.title ? '编辑时间节点' : '创建时间节点'}
        size="lg"
      >
        {editingNode && (
          <TimelineEditor
            node={editingNode}
            onChange={setEditingNode}
            characters={characters}
          />
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            取消
          </Button>
          <Button variant="gold" onClick={handleSave}>
            保存
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-muted">
          确定要删除此时间节点吗？
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

interface TimelineEditorProps {
  node: TimelineNode;
  onChange: (node: TimelineNode) => void;
  characters: Character[];
}

function TimelineEditor({ node, onChange, characters }: TimelineEditorProps) {
  const updateField = (field: keyof TimelineNode, value: any) => {
    onChange({ ...node, [field]: value });
  };

  const toggleCharacter = (charId: string) => {
    const current = node.characterIds || [];
    const next = current.includes(charId)
      ? current.filter((id) => id !== charId)
      : [...current, charId];
    onChange({ ...node, characterIds: next });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="时间点"
          value={node.time}
          onChange={(v) => updateField('time', v)}
          placeholder="如：案发前一天 20:00"
        />
        <Input
          label="地点"
          value={node.location || ''}
          onChange={(v) => updateField('location', v)}
          placeholder="事件发生的地点..."
        />
      </div>

      <Input
        label="事件标题"
        value={node.title}
        onChange={(v) => updateField('title', v)}
        placeholder="简要描述这个事件..."
      />

      <Textarea
        label="详细描述"
        value={node.description}
        onChange={(v) => updateField('description', v)}
        placeholder="详细描述发生了什么..."
        rows={4}
      />

      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          涉及的角色
        </label>
        {characters.length === 0 ? (
          <p className="text-sm text-dark-muted">请先在"角色档案"中创建角色</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => {
              const selected = (node.characterIds || []).includes(char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${selected
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-surface text-dark-muted hover:bg-dark-card'}
                  `}
                >
                  {char.name || '未命名'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
