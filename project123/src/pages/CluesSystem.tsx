import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs } from '@/components/common/Tabs';
import { Card, CardHeader, CardContent, EmptyState } from '@/components/common/Card';
import { Modal, ModalFooter } from '@/components/layout/Modal';
import { Input, Textarea, Select, NumberInput, Button } from '@/components/common/Form';
import { Badge } from '@/components/common/Tabs';
import {
  Search,
  Eye,
  EyeOff,
  Package,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Users,
  MapPin,
  Link2,
  Lightbulb
} from 'lucide-react';
import {
  CLUE_TYPE_MAP,
  CLUE_TYPE_COLORS,
  type Clue,
  type TruthNode
} from '@/types';
import {
  createDefaultClue,
  createDefaultTruthNode
} from '@/utils/storage';

export function CluesSystem() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProjectData, loadProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!projectId) return null;

  const clues = currentProjectData?.data.clues || [];
  const publicClues = clues.filter((c) => c.type === 'public');
  const hiddenClues = clues.filter((c) => c.type === 'hidden');
  const evidenceClues = clues.filter((c) => c.type === 'evidence');

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs
            tabs={[
              { id: 'layers', label: '线索分层', icon: <Search className="w-4 h-4" />, count: clues.length },
              { id: 'relations', label: '关联图', icon: <Link2 className="w-4 h-4" /> },
              { id: 'timing', label: '发放时机', icon: <Clock className="w-4 h-4" /> }
            ]}
          >
            {(activeTab) => {
              switch (activeTab) {
                case 'layers':
                  return <ClueLayersSection
                    publicClues={publicClues}
                    hiddenClues={hiddenClues}
                    evidenceClues={evidenceClues}
                  />;
                case 'relations':
                  return <ClueRelationsSection />;
                case 'timing':
                  return <ClueTimingSection clues={clues} />;
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

interface ClueLayersProps {
  publicClues: Clue[];
  hiddenClues: Clue[];
  evidenceClues: Clue[];
}

function ClueLayersSection({ publicClues, hiddenClues, evidenceClues }: ClueLayersProps) {
  const [editingClue, setEditingClue] = useState<Clue | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { currentProjectData, addClue, updateClue, deleteClue } = useProjectStore();
  const characters = currentProjectData?.data.characters || [];
  const truthNodes = currentProjectData?.data.truthNodes || [];

  const handleAdd = (type: 'public' | 'hidden' | 'evidence') => {
    const clue = createDefaultClue();
    clue.type = type;
    setEditingClue(clue);
    setShowModal(true);
  };

  const handleEdit = (clue: Clue) => {
    setEditingClue({ ...clue });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingClue) return;

    const existing = [...publicClues, ...hiddenClues, ...evidenceClues].find((c) => c.id === editingClue.id);
    if (existing) {
      updateClue(editingClue.id, editingClue);
    } else {
      addClue(editingClue);
    }

    setShowModal(false);
    setEditingClue(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteClue(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const ClueCard = ({ clue }: { clue: Clue }) => (
    <Card key={clue.id} hover className="group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button
          onClick={() => handleEdit(clue)}
          className="p-2 rounded bg-dark-card hover:bg-dark-surface"
        >
          <Edit3 className="w-4 h-4 text-dark-muted" />
        </button>
        <button
          onClick={() => handleDeleteClick(clue.id)}
          className="p-2 rounded bg-dark-card hover:bg-red-500/20"
        >
          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${clue.type === 'public' ? 'bg-accent-gold/20' : ''}
          ${clue.type === 'hidden' ? 'bg-primary-600/20' : ''}
          ${clue.type === 'evidence' ? 'bg-green-500/20' : ''}
        `}>
          {clue.type === 'public' && <Eye className="w-5 h-5 text-accent-gold" />}
          {clue.type === 'hidden' && <EyeOff className="w-5 h-5 text-primary-300" />}
          {clue.type === 'evidence' && <Package className="w-5 h-5 text-green-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">
            {clue.name || '未命名线索'}
          </h4>
          {clue.description && (
            <p className="text-sm text-dark-text mt-1 line-clamp-2">
              {clue.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={CLUE_TYPE_COLORS[clue.type]}>
          {CLUE_TYPE_MAP[clue.type]}
        </Badge>
        <Badge variant="primary">
          第{clue.round}轮
        </Badge>
        {clue.location && (
          <div className="flex items-center gap-1 text-xs text-dark-muted">
            <MapPin className="w-3 h-3" />
            {clue.location}
          </div>
        )}
      </div>

      {clue.relatedCharacterIds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-dark-muted" />
            <div className="flex flex-wrap gap-1">
              {clue.relatedCharacterIds.map((charId) => {
                const char = characters.find((c) => c.id === charId);
                return char ? (
                  <span key={charId} className="text-xs text-dark-muted">
                    {char.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      {clue.relatedTruthIds.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Lightbulb className="w-3 h-3 text-accent-gold" />
          <span className="text-xs text-accent-gold">
            关联 {clue.relatedTruthIds.length} 个真相节点
          </span>
        </div>
      )}
    </Card>
  );

  const ClueSection = ({ title, clues, type, icon: Icon }: {
    title: string;
    clues: Clue[];
    type: 'public' | 'hidden' | 'evidence';
    icon: any;
  }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant={CLUE_TYPE_COLORS[type]}>
            {clues.length}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => handleAdd(type)}>
          <Plus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </div>

      {clues.length === 0 ? (
        <Card>
          <EmptyState
            title={`暂无${title}`}
            description="点击上方按钮添加"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clues.map((clue) => <ClueCard key={clue.id} clue={clue} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <ClueSection
        title="公开线索"
        clues={publicClues}
        type="public"
        icon={Eye}
      />
      <ClueSection
        title="隐藏线索"
        clues={hiddenClues}
        type="hidden"
        icon={EyeOff}
      />
      <ClueSection
        title="证据物件"
        clues={evidenceClues}
        type="evidence"
        icon={Package}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClue?.name ? '编辑线索' : '创建线索'}
        size="xl"
      >
        {editingClue && (
          <ClueEditor
            clue={editingClue}
            onChange={setEditingClue}
            characters={characters}
            truthNodes={truthNodes}
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
        <p className="text-dark-muted">确定要删除此线索吗？</p>
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

interface ClueEditorProps {
  clue: Clue;
  onChange: (clue: Clue) => void;
  characters: any[];
  truthNodes: TruthNode[];
}

function ClueEditor({ clue, onChange, characters, truthNodes }: ClueEditorProps) {
  const updateField = (field: keyof Clue, value: any) => {
    onChange({ ...clue, [field]: value });
  };

  const toggleCharacter = (charId: string) => {
    const current = clue.relatedCharacterIds || [];
    const next = current.includes(charId)
      ? current.filter((id) => id !== charId)
      : [...current, charId];
    onChange({ ...clue, relatedCharacterIds: next });
  };

  const toggleTruth = (truthId: string) => {
    const current = clue.relatedTruthIds || [];
    const next = current.includes(truthId)
      ? current.filter((id) => id !== truthId)
      : [...current, truthId];
    onChange({ ...clue, relatedTruthIds: next });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="线索类型"
          value={clue.type}
          onChange={(v) => updateField('type', v as any)}
          options={[
            { value: 'public', label: CLUE_TYPE_MAP.public },
            { value: 'hidden', label: CLUE_TYPE_MAP.hidden },
            { value: 'evidence', label: CLUE_TYPE_MAP.evidence }
          ]}
        />
        <NumberInput
          label="发放轮次"
          value={clue.round}
          onChange={(v) => updateField('round', v)}
          min={1}
          max={10}
        />
      </div>

      <Input
        label="线索名称"
        value={clue.name}
        onChange={(v) => updateField('name', v)}
        placeholder="输入线索名称..."
      />

      <Textarea
        label="线索描述"
        value={clue.description}
        onChange={(v) => updateField('description', v)}
        placeholder="详细描述这条线索..."
        rows={3}
      />

      <Input
        label="发现地点"
        value={clue.location || ''}
        onChange={(v) => updateField('location', v)}
        placeholder="线索被发现的地点..."
      />

      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          关联角色
        </label>
        {characters.length === 0 ? (
          <p className="text-sm text-dark-muted">请先在"角色档案"中创建角色</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => {
              const selected = (clue.relatedCharacterIds || []).includes(char.id);
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

      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          关联真相节点
        </label>
        {truthNodes.length === 0 ? (
          <p className="text-sm text-dark-muted">
            请在下方"线索关联图"中创建真相节点
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {truthNodes.map((truth) => {
              const selected = (clue.relatedTruthIds || []).includes(truth.id);
              return (
                <button
                  key={truth.id}
                  onClick={() => toggleTruth(truth.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${selected
                      ? 'bg-accent-gold text-dark-bg'
                      : 'bg-dark-surface text-dark-muted hover:bg-dark-card'}
                  `}
                >
                  {truth.title || '未命名'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ClueRelationsSection() {
  const { currentProjectData, addTruthNode, updateTruthNode, deleteTruthNode } = useProjectStore();
  const [editingTruth, setEditingTruth] = useState<TruthNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const truthNodes = currentProjectData?.data.truthNodes || [];
  const clues = currentProjectData?.data.clues || [];

  const handleAdd = () => {
    setEditingTruth(createDefaultTruthNode());
    setShowModal(true);
  };

  const handleEdit = (truth: TruthNode) => {
    setEditingTruth({ ...truth });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingTruth) return;

    const existing = truthNodes.find((n) => n.id === editingTruth.id);
    if (existing) {
      updateTruthNode(editingTruth.id, editingTruth);
    } else {
      addTruthNode(editingTruth);
    }

    setShowModal(false);
    setEditingTruth(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTruthNode(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // 构建关联关系
  const truthWithClues = truthNodes.map((truth) => ({
    ...truth,
    relatedClues: clues.filter((clue) => clue.relatedTruthIds.includes(truth.id))
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="真相节点"
          subtitle={`共 ${truthNodes.length} 个真相节点`}
          actions={
            <Button variant="gold" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加真相
            </Button>
          }
        />
        <CardContent>
          {truthNodes.length === 0 ? (
            <EmptyState
              icon={<Lightbulb className="w-12 h-12" />}
              title="还没有真相节点"
              description="创建真相节点来构建线索与真相之间的关联"
              action={
                <Button variant="gold" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个真相
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {truthWithClues.map((truth) => (
                <Card key={truth.id} className="group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(truth)}
                      className="p-2 rounded bg-dark-card hover:bg-dark-surface"
                    >
                      <Edit3 className="w-4 h-4 text-dark-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(truth.id)}
                      className="p-2 rounded bg-dark-card hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-gold/30 to-accent-gold/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-accent-gold" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {truth.title || '未命名真相'}
                        </h4>
                        <Badge variant="gold">
                          重要性: {truth.importance}/10
                        </Badge>
                      </div>

                      {truth.description && (
                        <p className="text-sm text-dark-text mb-3">
                          {truth.description}
                        </p>
                      )}

                      {truth.relatedClues.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-dark-muted">关联线索：</p>
                          <div className="flex flex-wrap gap-2">
                            {truth.relatedClues.map((clue) => (
                              <Badge key={clue.id} variant={CLUE_TYPE_COLORS[clue.type]}>
                                {clue.name || '未命名线索'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-dark-muted">
                          暂无线索关联此真相，请在线索编辑中关联
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="线索-真相关系预览" />
        <CardContent>
          {clues.length === 0 || truthNodes.length === 0 ? (
            <EmptyState
              icon={<Link2 className="w-12 h-12" />}
              title="关联关系不足"
              description="需要同时创建线索和真相节点才能建立关联"
            />
          ) : (
            <div className="bg-dark-surface rounded-lg p-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-dark-muted mb-4">线索</h4>
                  <div className="space-y-2">
                    {clues.slice(0, 5).map((clue) => (
                      <div
                        key={clue.id}
                        className="p-2 bg-dark-card rounded text-sm text-dark-text truncate"
                      >
                        <Badge variant={CLUE_TYPE_COLORS[clue.type]} className="mr-2">
                          {CLUE_TYPE_MAP[clue.type]}
                        </Badge>
                        {clue.name || '未命名'}
                      </div>
                    ))}
                    {clues.length > 5 && (
                      <p className="text-xs text-dark-muted text-center">
                        +{clues.length - 5} 更多...
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-dark-muted mb-4">真相</h4>
                  <div className="space-y-2">
                    {truthNodes.slice(0, 5).map((truth) => (
                      <div
                        key={truth.id}
                        className="p-2 bg-dark-card rounded text-sm text-dark-text truncate"
                      >
                        <Badge variant="gold" className="mr-2">
                          重要{truth.importance}
                        </Badge>
                        {truth.title || '未命名'}
                      </div>
                    ))}
                    {truthNodes.length > 5 && (
                      <p className="text-xs text-dark-muted text-center">
                        +{truthNodes.length - 5} 更多...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTruth?.title ? '编辑真相' : '创建真相'}
        size="lg"
      >
        {editingTruth && (
          <TruthEditor
            truth={editingTruth}
            onChange={setEditingTruth}
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
          确定要删除此真相节点吗？相关的线索关联也将被移除。
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

interface TruthEditorProps {
  truth: TruthNode;
  onChange: (truth: TruthNode) => void;
}

function TruthEditor({ truth, onChange }: TruthEditorProps) {
  return (
    <div className="space-y-4">
      <Input
        label="真相标题"
        value={truth.title}
        onChange={(v) => onChange({ ...truth, title: v })}
        placeholder="简要描述这个真相..."
      />

      <Textarea
        label="详细描述"
        value={truth.description}
        onChange={(v) => onChange({ ...truth, description: v })}
        placeholder="详细描述这个真相..."
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          重要性: {truth.importance}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={truth.importance}
          onChange={(e) => onChange({ ...truth, importance: Number(e.target.value) })}
          className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-dark-muted mt-1">
          <span>次要</span>
          <span>核心</span>
        </div>
      </div>
    </div>
  );
}

interface ClueTimingProps {
  clues: Clue[];
}

function ClueTimingSection({ clues }: ClueTimingProps) {
  const rounds = Array.from(new Set(clues.map((c) => c.round))).sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 1;
  const allRounds = Array.from({ length: Math.max(maxRound, 3) }, (_, i) => i + 1);

  const getCluesByRound = (round: number) => clues.filter((c) => c.round === round);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="线索发放时机"
          subtitle="规划每一轮需要发放的线索"
        />
        <CardContent>
          {clues.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-12 h-12" />}
              title="还没有线索"
              description="请先在'线索分层'中创建线索"
            />
          ) : (
            <div className="space-y-6">
              {allRounds.map((round) => {
                const roundClues = getCluesByRound(round);
                return (
                  <div key={round} className="flex gap-4">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="w-14 h-14 mx-auto rounded-full bg-primary-600/30 flex items-center justify-center border-2 border-primary-500">
                        <span className="text-xl font-bold text-primary-300">
                          {round}
                        </span>
                      </div>
                      <p className="text-sm text-dark-muted mt-2">第{round}轮</p>
                    </div>

                    <div className="flex-1">
                      {roundClues.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-dark-border rounded-lg text-center">
                          <p className="text-dark-muted">此轮暂无线索</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {roundClues.map((clue) => (
                            <div
                              key={clue.id}
                              className="card flex items-center gap-3"
                            >
                              <Badge variant={CLUE_TYPE_COLORS[clue.type]}>
                                {CLUE_TYPE_MAP[clue.type]}
                              </Badge>
                              <span className="text-dark-text truncate flex-1">
                                {clue.name || '未命名线索'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="统计概览" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allRounds.slice(0, 4).map((round) => {
              const count = getCluesByRound(round).length;
              return (
                <div key={round} className="p-4 bg-dark-surface rounded-lg text-center">
                  <p className="text-3xl font-bold text-white">{count}</p>
                  <p className="text-xs text-dark-muted">第{round}轮线索</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
