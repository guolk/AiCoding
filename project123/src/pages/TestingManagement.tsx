import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs } from '@/components/common/Tabs';
import { Card, CardHeader, CardContent, EmptyState } from '@/components/common/Card';
import { Modal, ModalFooter } from '@/components/layout/Modal';
import { Input, Textarea, Select, NumberInput, TagInput, Button } from '@/components/common/Form';
import { Badge } from '@/components/common/Tabs';
import {
  TestTube,
  MessageSquare,
  History,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import {
  FEEDBACK_CATEGORY_MAP,
  SEVERITY_MAP,
  type PlaytestRecord,
  type PlayerFeedback,
  type Version,
  type PlayerInfo
} from '@/types';
import {
  createDefaultPlaytestRecord,
  createDefaultFeedback
} from '@/utils/storage';
import { formatDate, formatDateTime } from '@/utils';

export function TestingManagement() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProjectData, loadProject, addPlaytestRecord, updatePlaytestRecord, deletePlaytestRecord } = useProjectStore();

  const [editingRecord, setEditingRecord] = useState<PlaytestRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!projectId) return null;

  const playtests = currentProjectData?.data.playtestRecords || [];
  const feedbacks = currentProjectData?.data.feedbacks || [];
  const versions = currentProjectData?.data.versions || [];
  const characters = currentProjectData?.data.characters || [];

  const handleAddRecord = () => {
    setEditingRecord(createDefaultPlaytestRecord());
    setShowModal(true);
  };

  const handleEditRecord = (record: PlaytestRecord) => {
    setEditingRecord({ ...record });
    setShowModal(true);
  };

  const handleSaveRecord = () => {
    if (!editingRecord) return;

    const existing = playtests.find((r) => r.id === editingRecord.id);
    if (existing) {
      updatePlaytestRecord(editingRecord.id, editingRecord);
    } else {
      addPlaytestRecord(editingRecord);
    }

    setShowModal(false);
    setEditingRecord(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDeleteRecord = () => {
    if (deleteTarget) {
      deletePlaytestRecord(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs
            tabs={[
              { id: 'playtests', label: '试玩记录', icon: <TestTube className="w-4 h-4" />, count: playtests.length },
              { id: 'feedback', label: '玩家反馈', icon: <MessageSquare className="w-4 h-4" />, count: feedbacks.length },
              { id: 'versions', label: '版本管理', icon: <History className="w-4 h-4" />, count: versions.length }
            ]}
          >
            {(activeTab) => {
              switch (activeTab) {
                case 'playtests':
                  return (
                    <PlaytestsSection
                      playtests={playtests}
                      characters={characters}
                      editingRecord={editingRecord}
                      showModal={showModal}
                      showDeleteModal={showDeleteModal}
                      deleteTarget={deleteTarget}
                      onAdd={handleAddRecord}
                      onEdit={handleEditRecord}
                      onSave={handleSaveRecord}
                      onDeleteClick={handleDeleteClick}
                      onDelete={handleDeleteRecord}
                      onCloseModal={() => setShowModal(false)}
                      onCloseDeleteModal={() => setShowDeleteModal(false)}
                      onEditingRecordChange={setEditingRecord}
                    />
                  );
                case 'feedback':
                  return <FeedbackSection feedbacks={feedbacks} playtests={playtests} />;
                case 'versions':
                  return <VersionsSection versions={versions} />;
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

interface PlaytestsSectionProps {
  playtests: PlaytestRecord[];
  characters: any[];
  editingRecord: PlaytestRecord | null;
  showModal: boolean;
  showDeleteModal: boolean;
  deleteTarget: string | null;
  onAdd: () => void;
  onEdit: (record: PlaytestRecord) => void;
  onSave: () => void;
  onDeleteClick: (id: string) => void;
  onDelete: () => void;
  onCloseModal: () => void;
  onCloseDeleteModal: () => void;
  onEditingRecordChange: (record: PlaytestRecord | null) => void;
}

function PlaytestsSection({
  playtests,
  characters,
  editingRecord,
  showModal,
  showDeleteModal,
  deleteTarget,
  onAdd,
  onEdit,
  onSave,
  onDeleteClick,
  onDelete,
  onCloseModal,
  onCloseDeleteModal,
  onEditingRecordChange
}: PlaytestsSectionProps) {

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="试玩记录"
          subtitle={`共 ${playtests.length} 次试玩`}
          actions={
            <Button variant="gold" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加记录
            </Button>
          }
        />
        <CardContent>
          {playtests.length === 0 ? (
            <EmptyState
              icon={<TestTube className="w-12 h-12" />}
              title="还没有试玩记录"
              description="记录您的剧本测试过程，帮助改进剧本质量"
              action={
                <Button variant="gold" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  记录第一次试玩
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {playtests.map((record) => (
                <Card key={record.id} className="group relative">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <button
                      onClick={() => onEdit(record)}
                      className="p-2 rounded bg-dark-card hover:bg-dark-surface"
                    >
                      <Edit3 className="w-4 h-4 text-dark-muted" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(record.id)}
                      className="p-2 rounded bg-dark-card hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary-300" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-muted">日期</p>
                        <p className="font-medium text-white">{formatDate(record.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-gold/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-muted">玩家数</p>
                        <p className="font-medium text-white">{record.players.length} 人</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-muted">时长</p>
                        <p className="font-medium text-white">{record.duration} 分钟</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-muted">正确率</p>
                        <p className={`font-medium ${record.correctRate >= 60 ? 'text-green-400' : record.correctRate >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {record.correctRate}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {record.finalConclusion && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <p className="text-sm text-dark-muted mb-1">最终推理结果</p>
                      <p className="text-dark-text">{record.finalConclusion}</p>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-dark-muted mb-1">备注</p>
                      <p className="text-dark-text">{record.notes}</p>
                    </div>
                  )}

                  {record.players.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-dark-muted mb-2">玩家构成</p>
                      <div className="flex flex-wrap gap-2">
                        {record.players.map((player, idx) => {
                          const char = characters.find((c) => c.id === player.characterId);
                          return (
                            <Badge key={idx} variant="primary">
                              {player.name} → {char?.name || '未知角色'}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={onCloseModal}
        title={editingRecord?.players?.length > 0 ? '编辑试玩记录' : '创建试玩记录'}
        size="xl"
      >
        {editingRecord && (
          <PlaytestEditor
            record={editingRecord}
            onChange={(record) => onEditingRecordChange(record)}
            characters={characters}
          />
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={onCloseModal}>
            取消
          </Button>
          <Button variant="gold" onClick={onSave}>
            保存
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={onCloseDeleteModal}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-muted">
          确定要删除此试玩记录吗？相关的反馈也将被移除。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={onCloseDeleteModal}>
            取消
          </Button>
          <Button variant="danger" onClick={onDelete}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

interface PlaytestEditorProps {
  record: PlaytestRecord;
  onChange: (record: PlaytestRecord) => void;
  characters: any[];
}

function PlaytestEditor({ record, onChange, characters }: PlaytestEditorProps) {
  const updateField = (field: keyof PlaytestRecord, value: any) => {
    onChange({ ...record, [field]: value });
  };

  const addPlayer = () => {
    const newPlayer: PlayerInfo = {
      name: '',
      characterId: characters[0]?.id || '',
      role: '玩家'
    };
    onChange({ ...record, players: [...record.players, newPlayer] });
  };

  const updatePlayer = (idx: number, field: keyof PlayerInfo, value: string) => {
    const players = [...record.players];
    players[idx] = { ...players[idx], [field]: value };
    onChange({ ...record, players });
  };

  const removePlayer = (idx: number) => {
    const players = [...record.players];
    players.splice(idx, 1);
    onChange({ ...record, players });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="试玩日期"
          value={record.date.split('T')[0]}
          onChange={(v) => {
            const newDate = new Date(v);
            if (!isNaN(newDate.getTime())) {
              updateField('date', newDate.toISOString());
            }
          }}
        />
        <NumberInput
          label="游戏时长（分钟）"
          value={record.duration}
          onChange={(v) => updateField('duration', v)}
          min={0}
          max={480}
        />
      </div>

      <NumberInput
        label="推理正确率 (%)"
        value={record.correctRate}
        onChange={(v) => updateField('correctRate', Math.min(100, Math.max(0, v)))}
        min={0}
        max={100}
      />

      <Textarea
        label="最终推理结果"
        value={record.finalConclusion}
        onChange={(v) => updateField('finalConclusion', v)}
        placeholder="玩家最终得出的结论..."
        rows={2}
      />

      <Textarea
        label="备注"
        value={record.notes}
        onChange={(v) => updateField('notes', v)}
        placeholder="其他需要记录的信息..."
        rows={2}
      />

      <div className="border-t border-dark-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-dark-text">玩家列表</h4>
          <Button variant="secondary" size="sm" onClick={addPlayer}>
            <Plus className="w-4 h-4 mr-1" />
            添加玩家
          </Button>
        </div>

        {record.players.length === 0 ? (
          <p className="text-sm text-dark-muted text-center py-4">
            暂无玩家，点击上方按钮添加
          </p>
        ) : (
          <div className="space-y-3">
            {record.players.map((player, idx) => (
              <div key={idx} className="p-3 bg-dark-surface rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-muted">玩家 #{idx + 1}</span>
                  <button
                    onClick={() => removePlayer(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="玩家昵称"
                    value={player.name}
                    onChange={(v) => updatePlayer(idx, 'name', v)}
                    placeholder="玩家昵称..."
                  />
                  <Select
                    label="扮演角色"
                    value={player.characterId}
                    onChange={(v) => updatePlayer(idx, 'characterId', v)}
                    options={characters.map((c) => ({
                      value: c.id,
                      label: c.name || '未命名'
                    }))}
                    placeholder="选择角色..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FeedbackSectionProps {
  feedbacks: PlayerFeedback[];
  playtests: PlaytestRecord[];
}

function FeedbackSection({ feedbacks, playtests }: FeedbackSectionProps) {
  const [editingFeedback, setEditingFeedback] = useState<PlayerFeedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedPlaytest, setSelectedPlaytest] = useState<string>('');

  const { addFeedback, updateFeedback, deleteFeedback } = useProjectStore();

  const categoryStats = {
    clue_obvious: feedbacks.filter((f) => f.category === 'clue_obvious').length,
    clue_obscure: feedbacks.filter((f) => f.category === 'clue_obscure').length,
    character_boring: feedbacks.filter((f) => f.category === 'character_boring').length,
    timeline_confusing: feedbacks.filter((f) => f.category === 'timeline_confusing').length,
    other: feedbacks.filter((f) => f.category === 'other').length
  };

  const handleAdd = () => {
    if (playtests.length === 0) {
      alert('请先创建试玩记录');
      return;
    }
    const defaultPlaytestId = selectedPlaytest || playtests[0]?.id;
    if (!defaultPlaytestId) return;
    setEditingFeedback(createDefaultFeedback(defaultPlaytestId));
    setShowModal(true);
  };

  const handleEdit = (feedback: PlayerFeedback) => {
    setEditingFeedback({ ...feedback });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingFeedback) return;

    const existing = feedbacks.find((f) => f.id === editingFeedback.id);
    if (existing) {
      updateFeedback(editingFeedback.id, editingFeedback);
    } else {
      addFeedback(editingFeedback);
    }

    setShowModal(false);
    setEditingFeedback(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteFeedback(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'primary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="玩家反馈统计"
          subtitle="快速了解玩家反馈分布"
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(categoryStats).map(([key, count]) => (
              <div key={key} className="p-4 bg-dark-surface rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-dark-muted">{FEEDBACK_CATEGORY_MAP[key as keyof typeof FEEDBACK_CATEGORY_MAP]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="玩家反馈详情"
          subtitle={`共 ${feedbacks.length} 条反馈`}
          actions={
            <div className="flex items-center gap-3">
              {playtests.length > 0 && (
                <Select
                  value={selectedPlaytest}
                  onChange={setSelectedPlaytest}
                  options={[
                    { value: '', label: '全部试玩' },
                    ...playtests.map((p) => ({
                      value: p.id,
                      label: `${formatDate(p.date)} - ${p.players.length}人`
                    }))
                  ]}
                />
              )}
              <Button variant="gold" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                添加反馈
              </Button>
            </div>
          }
        />
        <CardContent>
          {feedbacks.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-12 h-12" />}
              title="还没有玩家反馈"
              description="收集玩家反馈，帮助改进剧本"
              action={
                <Button variant="gold" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  记录第一条反馈
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {feedbacks
                .filter((f) => !selectedPlaytest || f.playtestId === selectedPlaytest)
                .map((feedback) => {
                  const playtest = playtests.find((p) => p.id === feedback.playtestId);
                  return (
                    <Card key={feedback.id} className="group relative">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="p-2 rounded bg-dark-card hover:bg-dark-surface"
                        >
                          <Edit3 className="w-4 h-4 text-dark-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(feedback.id)}
                          className="p-2 rounded bg-dark-card hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {feedback.severity === 'high' && (
                            <AlertCircle className="w-6 h-6 text-red-400" />
                          )}
                          {feedback.severity === 'medium' && (
                            <AlertCircle className="w-6 h-6 text-yellow-400" />
                          )}
                          {feedback.severity === 'low' && (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="primary">
                              {FEEDBACK_CATEGORY_MAP[feedback.category]}
                            </Badge>
                            <Badge variant={getSeverityColor(feedback.severity)}>
                              {SEVERITY_MAP[feedback.severity]}
                            </Badge>
                            {playtest && (
                              <span className="text-xs text-dark-muted">
                                {formatDateTime(feedback.createdAt)}
                              </span>
                            )}
                          </div>

                          <p className="text-dark-text">{feedback.content}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFeedback?.content ? '编辑反馈' : '添加反馈'}
        size="lg"
      >
        {editingFeedback && (
          <FeedbackEditor
            feedback={editingFeedback}
            onChange={setEditingFeedback}
            playtests={playtests}
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
        <p className="text-dark-muted">确定要删除此反馈吗？</p>
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

interface FeedbackEditorProps {
  feedback: PlayerFeedback;
  onChange: (feedback: PlayerFeedback) => void;
  playtests: PlaytestRecord[];
}

function FeedbackEditor({ feedback, onChange, playtests }: FeedbackEditorProps) {
  const updateField = (field: keyof PlayerFeedback, value: any) => {
    onChange({ ...feedback, [field]: value });
  };

  return (
    <div className="space-y-4">
      <Select
        label="关联试玩"
        value={feedback.playtestId}
        onChange={(v) => updateField('playtestId', v)}
        options={playtests.map((p) => ({
          value: p.id,
          label: `${formatDate(p.date)} - ${p.players.length}人`
        }))}
      />

      <Select
        label="反馈分类"
        value={feedback.category}
        onChange={(v) => updateField('category', v as any)}
        options={Object.entries(FEEDBACK_CATEGORY_MAP).map(([value, label]) => ({ value, label }))}
      />

      <Select
        label="严重程度"
        value={feedback.severity}
        onChange={(v) => updateField('severity', v as any)}
        options={[
          { value: 'low', label: '低 - 建议性意见' },
          { value: 'medium', label: '中 - 需要改进' },
          { value: 'high', label: '高 - 必须修复' }
        ]}
      />

      <Textarea
        label="反馈内容"
        value={feedback.content}
        onChange={(v) => updateField('content', v)}
        placeholder="详细描述玩家的反馈..."
        rows={4}
      />
    </div>
  );
}

interface VersionsSectionProps {
  versions: Version[];
}

function VersionsSection({ versions }: VersionsSectionProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionChanges, setVersionChanges] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

  const { currentProjectData, saveVersion, restoreVersion } = useProjectStore();

  const handleSaveVersion = () => {
    if (!versionChanges.trim()) {
      alert('请填写版本变更说明');
      return;
    }
    saveVersion(versionChanges.trim());
    setShowSaveModal(false);
    setVersionChanges('');
  };

  const handleRestoreClick = (versionId: string) => {
    setRestoreTarget(versionId);
    setShowRestoreConfirm(true);
  };

  const handleRestore = () => {
    if (restoreTarget) {
      restoreVersion(restoreTarget);
    }
    setShowRestoreConfirm(false);
    setRestoreTarget(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="版本管理"
          subtitle={`当前版本: ${currentProjectData?.currentVersion || 'v1.0.0'}`}
          actions={
            <Button variant="gold" onClick={() => setShowSaveModal(true)}>
              <Save className="w-4 h-4 mr-2" />
              保存版本
            </Button>
          }
        />
        <CardContent>
          {versions.length === 0 ? (
            <EmptyState
              icon={<History className="w-12 h-12" />}
              title="还没有版本历史"
              description="保存版本快照，记录您的修改历史"
              action={
                <Button variant="gold" onClick={() => setShowSaveModal(true)}>
                  <Save className="w-4 h-4 mr-2" />
                  保存第一个版本
                </Button>
              }
            />
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-gold via-primary-500 to-primary-700" />

              <div className="space-y-6">
                {[...versions].reverse().map((version, idx) => (
                  <div key={version.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="absolute left-4 w-5 h-5 rounded-full bg-accent-gold border-4 border-dark-bg -translate-x-1/2" />

                    <Card className="group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestoreClick(version.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="text-sm">恢复此版本</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-gold/30 to-accent-gold/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-accent-gold">
                            {version.versionNumber.split('.')[1]}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-white">
                              {version.versionNumber}
                            </h4>
                            <span className="text-sm text-dark-muted">
                              {formatDateTime(version.timestamp)}
                            </span>
                          </div>

                          {version.changes && (
                            <p className="text-dark-text">{version.changes}</p>
                          )}
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

      <Card>
        <CardHeader title="版本统计" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{versions.length}</p>
              <p className="text-xs text-dark-muted">总版本数</p>
            </div>
            <div className="p-4 bg-dark-surface rounded-lg text-center">
              <p className="text-2xl font-bold text-white">
                {currentProjectData?.currentVersion || 'v1.0.0'}
              </p>
              <p className="text-xs text-dark-muted">当前版本</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="保存新版本"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-dark-surface rounded-lg">
            <p className="text-sm text-dark-muted">当前版本</p>
            <p className="text-xl font-bold text-white">
              {currentProjectData?.currentVersion || 'v1.0.0'}
            </p>
            <p className="text-sm text-dark-muted mt-2">将创建新版本</p>
          </div>

          <Textarea
            label="版本变更说明"
            value={versionChanges}
            onChange={setVersionChanges}
            placeholder="描述此版本的主要变更..."
            rows={4}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            取消
          </Button>
          <Button variant="gold" onClick={handleSaveVersion}>
            保存版本
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        title="确认恢复"
        size="sm"
      >
        <p className="text-dark-muted">
          确定要恢复此版本吗？当前的所有修改将被替换为该版本的快照。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowRestoreConfirm(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleRestore}>
            恢复
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
