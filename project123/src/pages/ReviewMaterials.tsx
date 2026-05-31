import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs } from '@/components/common/Tabs';
import { Card, CardHeader, CardContent, EmptyState } from '@/components/common/Card';
import { Modal, ModalFooter } from '@/components/layout/Modal';
import { Input, Textarea, Select, Button, TagInput } from '@/components/common/Form';
import { Badge } from '@/components/common/Tabs';
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Users,
  MapPin,
  Save,
  ChevronDown,
  ChevronUp,
  User,
  FileText
} from 'lucide-react';
import {
  type FAQ,
  type CharacterTruth
} from '@/types';
import {
  createDefaultFAQ,
  createDefaultCharacterTruth
} from '@/utils/storage';

export function ReviewMaterials() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProjectData, loadProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!projectId) return null;

  const faqs = currentProjectData?.data.faqs || [];

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs
            tabs={[
              { id: 'dm-handbook', label: 'DM手册', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'faq', label: 'FAQ库', icon: <HelpCircle className="w-4 h-4" />, count: faqs.length },
              { id: 'truth-reveal', label: '真相揭晓', icon: <Lightbulb className="w-4 h-4" /> }
            ]}
          >
            {(activeTab) => {
              switch (activeTab) {
                case 'dm-handbook':
                  return <DMHandbookSection />;
                case 'faq':
                  return <FAQSection />;
                case 'truth-reveal':
                  return <TruthRevealSection />;
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

function DMHandbookSection() {
  const { currentProjectData, updateDMHandbook } = useProjectStore();
  const handbook = currentProjectData?.data.dmHandbook;

  if (!handbook) return null;

  const updateField = (field: any, value: any) => {
    updateDMHandbook({ [field]: value });
  };

  const addFlowStep = () => {
    updateField('flowGuide', [...(handbook.flowGuide || []), '']);
  };

  const updateFlowStep = (idx: number, value: string) => {
    const flow = [...(handbook.flowGuide || [])];
    flow[idx] = value;
    updateField('flowGuide', flow);
  };

  const removeFlowStep = (idx: number) => {
    const flow = [...(handbook.flowGuide || [])];
    flow.splice(idx, 1);
    updateField('flowGuide', flow);
  };

  const addTip = () => {
    updateField('tips', [...(handbook.tips || []), '']);
  };

  const updateTip = (idx: number, value: string) => {
    const tips = [...(handbook.tips || [])];
    tips[idx] = value;
    updateField('tips', tips);
  };

  const removeTip = (idx: number) => {
    const tips = [...(handbook.tips || [])];
    tips.splice(idx, 1);
    updateField('tips', tips);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="DM手册"
          subtitle="主持人需要了解的全部信息和引导技巧"
        />
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">剧本介绍</h4>
              <Textarea
                value={handbook.introduction}
                onChange={(v) => updateField('introduction', v)}
                placeholder="向玩家介绍剧本的基本背景和设定..."
                rows={4}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">准备工作</h4>
              <Textarea
                value={handbook.preparationGuide}
                onChange={(v) => updateField('preparationGuide', v)}
                placeholder="游戏开始前需要准备的物资和注意事项..."
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">游戏流程引导</h4>
                <Button variant="secondary" size="sm" onClick={addFlowStep}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加步骤
                </Button>
              </div>

              {(handbook.flowGuide || []).length === 0 ? (
                <p className="text-sm text-dark-muted text-center py-4">
                  暂无流程步骤，点击上方按钮添加
                </p>
              ) : (
                <div className="space-y-3">
                  {(handbook.flowGuide || []).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-300">{idx + 1}</span>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={step}
                          onChange={(v) => updateFlowStep(idx, v)}
                          placeholder={`流程步骤 ${idx + 1}...`}
                          className="flex-1"
                        />
                        <button
                          onClick={() => removeFlowStep(idx)}
                          className="p-2 rounded hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">DM技巧提示</h4>
                <Button variant="secondary" size="sm" onClick={addTip}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加技巧
                </Button>
              </div>

              {(handbook.tips || []).length === 0 ? (
                <p className="text-sm text-dark-muted text-center py-4">
                  暂无技巧提示，点击上方按钮添加
                </p>
              ) : (
                <div className="space-y-3">
                  {(handbook.tips || []).map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent-gold flex-shrink-0 mt-2" />
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          value={tip}
                          onChange={(v) => updateTip(idx, v)}
                          placeholder="技巧提示..."
                          rows={2}
                          className="flex-1"
                        />
                        <button
                          onClick={() => removeTip(idx)}
                          className="p-2 rounded hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">应急预案</h4>
              <Textarea
                value={handbook.emergencyGuide}
                onChange={(v) => updateField('emergencyGuide', v)}
                placeholder="处理突发状况的预案，如玩家情绪失控、冷场等..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="DM手册预览" />
        <CardContent>
          <div className="bg-dark-surface rounded-lg p-6">
            <h3 className="text-xl font-serif font-bold text-white mb-4">
              DM手册摘要
            </h3>
            {handbook.introduction && (
              <div className="mb-4">
                <h4 className="font-medium text-primary-300 mb-2">剧本介绍</h4>
                <p className="text-dark-text">{handbook.introduction}</p>
              </div>
            )}
            {(handbook.flowGuide || []).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-primary-300 mb-2">游戏流程</h4>
                <ol className="list-decimal list-inside space-y-1 text-dark-text">
                  {(handbook.flowGuide || []).map((step, idx) => (
                    <li key={idx}>{step || '(待填写)'}</li>
                  ))}
                </ol>
              </div>
            )}
            {(handbook.tips || []).length > 0 && (
              <div>
                <h4 className="font-medium text-primary-300 mb-2">关键技巧</h4>
                <ul className="list-disc list-inside space-y-1 text-dark-text">
                  {(handbook.tips || []).map((tip, idx) => (
                    <li key={idx}>{tip || '(待填写)'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FAQSection() {
  const { currentProjectData, addFAQ, updateFAQ, deleteFAQ } = useProjectStore();
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = currentProjectData?.data.faqs || [];

  const handleAdd = () => {
    setEditingFAQ(createDefaultFAQ());
    setShowModal(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ({ ...faq });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingFAQ) return;

    const existing = faqs.find((f) => f.id === editingFAQ.id);
    if (existing) {
      updateFAQ(editingFAQ.id, editingFAQ);
    } else {
      addFAQ(editingFAQ);
    }

    setShowModal(false);
    setEditingFAQ(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteFAQ(deleteTarget);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="常见问题库"
          subtitle={`共 ${faqs.length} 个常见问题`}
          actions={
            <Button variant="gold" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加问题
            </Button>
          }
        />
        <CardContent>
          {faqs.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="w-12 h-12" />}
              title="还没有常见问题"
              description="记录玩家经常会问的问题和标准答案"
              action={
                <Button variant="gold" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个问题
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="card animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` } as React.CSSProperties}
                  >
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="primary">{faq.category || '通用'}</Badge>
                        </div>
                        <h4 className="font-medium text-white">{faq.question}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(faq);
                          }}
                          className="p-2 rounded hover:bg-dark-card opacity-0 group-hover:opacity-100"
                        >
                          <Edit3 className="w-4 h-4 text-dark-muted" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(faq.id);
                          }}
                          className="p-2 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-dark-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-dark-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-dark-border">
                        <p className="text-dark-text">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <Card>
          <CardHeader title="问题分类统计" />
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const count = faqs.filter((f) => f.category === cat).length;
                return (
                  <Badge key={cat} variant="primary">
                    {cat || '通用'} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFAQ?.question ? '编辑问题' : '添加问题'}
        size="lg"
      >
        {editingFAQ && (
          <FAQEditor faq={editingFAQ} onChange={setEditingFAQ} categories={categories} />
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
        <p className="text-dark-muted">确定要删除此问题吗？</p>
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

interface FAQEditorProps {
  faq: FAQ;
  onChange: (faq: FAQ) => void;
  categories: string[];
}

function FAQEditor({ faq, onChange, categories }: FAQEditorProps) {
  const [customCategory, setCustomCategory] = useState('');
  const [useCustom, setUseCustom] = useState(!categories.includes(faq.category));

  const updateField = (field: keyof FAQ, value: any) => {
    onChange({ ...faq, [field]: value });
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__custom__') {
      setUseCustom(true);
    } else {
      setUseCustom(false);
      updateField('category', value);
    }
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    updateField('category', value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Select
          label="问题分类"
          value={useCustom ? '__custom__' : faq.category}
          onChange={handleCategoryChange}
          options={[
            ...categories.map((c) => ({ value: c, label: c })),
            { value: '__custom__', label: '+ 自定义分类' }
          ]}
          placeholder="选择或创建分类..."
        />
        {useCustom && (
          <Input
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder="输入新分类名称..."
            className="mt-2"
          />
        )}
      </div>

      <Textarea
        label="问题"
        value={faq.question}
        onChange={(v) => updateField('question', v)}
        placeholder="玩家可能会问的问题..."
        rows={2}
      />

      <Textarea
        label="标准答案"
        value={faq.answer}
        onChange={(v) => updateField('answer', v)}
        placeholder="给DM的参考回答..."
        rows={4}
      />
    </div>
  );
}

function TruthRevealSection() {
  const { currentProjectData, updateTruthReveal } = useProjectStore();
  const truthReveal = currentProjectData?.data.truthReveal;
  const characters = currentProjectData?.data.characters || [];
  const clues = currentProjectData?.data.clues || [];

  if (!truthReveal) return null;

  const updateField = (field: any, value: any) => {
    updateTruthReveal({ [field]: value });
  };

  const addCharacterTruth = () => {
    const availableChar = characters.find(
      (c) => !truthReveal.characterTruths.find((ct) => ct.characterId === c.id)
    );
    if (!availableChar) {
      alert('所有角色都已添加真相');
      return;
    }
    updateField('characterTruths', [
      ...truthReveal.characterTruths,
      createDefaultCharacterTruth(availableChar.id)
    ]);
  };

  const updateCharacterTruth = (idx: number, field: keyof CharacterTruth, value: any) => {
    const truths = [...truthReveal.characterTruths];
    truths[idx] = { ...truths[idx], [field]: value };
    updateField('characterTruths', truths);
  };

  const removeCharacterTruth = (idx: number) => {
    const truths = [...truthReveal.characterTruths];
    truths.splice(idx, 1);
    updateField('characterTruths', truths);
  };

  const toggleKeyClue = (clueId: string) => {
    const current = truthReveal.keyClues || [];
    const next = current.includes(clueId)
      ? current.filter((id) => id !== clueId)
      : [...current, clueId];
    updateField('keyClues', next);
  };

  const getCharacterName = (charId: string) => {
    return characters.find((c) => c.id === charId)?.name || '未知角色';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="真相揭晓材料"
          subtitle="游戏结束后向玩家揭示的完整真相"
        />
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">真相摘要</h4>
              <Textarea
                value={truthReveal.summary}
                onChange={(v) => updateField('summary', v)}
                placeholder="用简短的语言总结整个故事的真相..."
                rows={3}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">完整故事</h4>
              <Textarea
                value={truthReveal.fullStory}
                onChange={(v) => updateField('fullStory', v)}
                placeholder="详细描述完整的故事背景和真相..."
                rows={6}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">角色真相</h4>
                <Button variant="secondary" size="sm" onClick={addCharacterTruth}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加角色
                </Button>
              </div>

              {truthReveal.characterTruths.length === 0 ? (
                <p className="text-sm text-dark-muted text-center py-4">
                  暂无角色真相，点击上方按钮添加
                </p>
              ) : (
                <div className="space-y-4">
                  {truthReveal.characterTruths.map((ct, idx) => {
                    const charName = getCharacterName(ct.characterId);
                    return (
                      <div key={idx} className="p-4 bg-dark-surface rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-400" />
                            <h5 className="font-medium text-white">{charName}</h5>
                          </div>
                          <button
                            onClick={() => removeCharacterTruth(idx)}
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                          </button>
                        </div>

                        <Input
                          label="真实身份（如有）"
                          value={ct.trueIdentity || ''}
                          onChange={(v) => updateCharacterTruth(idx, 'trueIdentity', v)}
                          placeholder="角色的真实身份..."
                        />

                        <Textarea
                          label="真正动机"
                          value={ct.realMotivation}
                          onChange={(v) => updateCharacterTruth(idx, 'realMotivation', v)}
                          placeholder="角色行为背后的真正动机..."
                          rows={2}
                        />

                        <TagInput
                          label="关键行动"
                          tags={ct.keyActions}
                          onChange={(v) => updateCharacterTruth(idx, 'keyActions', v)}
                          placeholder="输入关键行动，按回车添加..."
                        />

                        <Textarea
                          label="揭晓的秘密"
                          value={ct.secretRevealed}
                          onChange={(v) => updateCharacterTruth(idx, 'secretRevealed', v)}
                          placeholder="游戏结束时需要向玩家揭示的秘密..."
                          rows={2}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">关键线索</h4>
              {clues.length === 0 ? (
                <p className="text-sm text-dark-muted">请先在"线索系统"中创建线索</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {clues.map((clue) => {
                    const selected = (truthReveal.keyClues || []).includes(clue.id);
                    return (
                      <button
                        key={clue.id}
                        onClick={() => toggleKeyClue(clue.id)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-all
                          ${selected
                            ? 'bg-accent-gold text-dark-bg'
                            : 'bg-dark-surface text-dark-muted hover:bg-dark-card'}
                        `}
                      >
                        {clue.name || '未命名线索'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="真相揭晓预览" />
        <CardContent>
          <div className="bg-dark-surface rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-serif font-bold text-accent-gold text-center mb-6">
              真相揭晓
            </h3>

            {truthReveal.summary && (
              <div className="p-4 bg-primary-600/20 rounded-lg border border-primary-500/30">
                <h4 className="font-medium text-primary-300 mb-2">故事摘要</h4>
                <p className="text-dark-text">{truthReveal.summary}</p>
              </div>
            )}

            {truthReveal.fullStory && (
              <div>
                <h4 className="font-medium text-primary-300 mb-2">完整故事</h4>
                <p className="text-dark-text whitespace-pre-line">{truthReveal.fullStory}</p>
              </div>
            )}

            {truthReveal.characterTruths.length > 0 && (
              <div>
                <h4 className="font-medium text-primary-300 mb-3">角色真相</h4>
                <div className="space-y-3">
                  {truthReveal.characterTruths.map((ct, idx) => (
                    <div key={idx} className="p-3 bg-dark-card rounded">
                      <h5 className="font-medium text-white mb-2">{getCharacterName(ct.characterId)}</h5>
                      <ul className="text-sm text-dark-text space-y-1">
                        {ct.trueIdentity && <li>• 真实身份: {ct.trueIdentity}</li>}
                        <li>• 动机: {ct.realMotivation}</li>
                        {ct.secretRevealed && <li>• 秘密: {ct.secretRevealed}</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(truthReveal.keyClues || []).length > 0 && (
              <div>
                <h4 className="font-medium text-primary-300 mb-2">关键线索</h4>
                <div className="flex flex-wrap gap-2">
                  {(truthReveal.keyClues || []).map((clueId) => {
                    const clue = clues.find((c) => c.id === clueId);
                    return clue ? (
                      <Badge key={clueId} variant="gold">
                        {clue.name || '未命名'}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
