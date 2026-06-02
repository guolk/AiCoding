import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Input, TextArea, Select } from '@/components/ui/Input.js';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Target,
  Lightbulb,
  Wrench,
  ListOrdered,
  Table,
  HelpCircle,
  Shield,
  BookMarked,
  Award
} from 'lucide-react';
import type { ExperimentTemplate, Step, DataTableColumn, Question } from '../../shared/types.js';

const steps = [
  { id: 'basic', label: '基本信息', icon: BookOpen },
  { id: 'purpose', label: '实验目的原理', icon: Target },
  { id: 'instruments', label: '仪器设备', icon: Wrench },
  { id: 'steps', label: '实验步骤', icon: ListOrdered },
  { id: 'datatable', label: '数据表格', icon: Table },
  { id: 'questions', label: '思考题', icon: HelpCircle },
  { id: 'settings', label: '安全与考核', icon: Shield }
];

const emptyTemplate: Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  courseName: '',
  purpose: '',
  principle: '',
  instruments: [],
  steps: [],
  dataTable: [],
  questions: [],
  safetyNotes: [],
  previewRequirements: [],
  assessmentPoints: []
};

export const TemplateEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { fetchTemplateById, createTemplate, updateTemplate, loading } = useStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'>>(emptyTemplate);
  const [newInstrument, setNewInstrument] = useState('');
  const [newSafetyNote, setNewSafetyNote] = useState('');
  const [newPreviewReq, setNewPreviewReq] = useState('');
  const [newAssessment, setNewAssessment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadTemplate(parseInt(id));
    }
  }, [isEdit, id]);

  const loadTemplate = async (templateId: number) => {
    const template = await fetchTemplateById(templateId);
    if (template) {
      setFormData(template);
    }
  };

  const updateForm = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addItem = (list: string[], setter: (value: string[]) => void, value: string, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setter([...list, value.trim()]);
      inputSetter('');
    }
  };

  const removeItem = (list: string[], setter: (value: string[]) => void, index: number) => {
    setter(list.filter((_, i) => i !== index));
  };

  const addStep = () => {
    const newStep: Step = {
      order: formData.steps.length + 1,
      title: '',
      description: ''
    };
    updateForm('steps', [...formData.steps, newStep]);
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    updateForm('steps', newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    updateForm('steps', newSteps);
  };

  const addDataColumn = () => {
    const newColumn: DataTableColumn = {
      name: '',
      unit: '',
      type: 'number'
    };
    updateForm('dataTable', [...formData.dataTable, newColumn]);
  };

  const updateDataColumn = (index: number, field: keyof DataTableColumn, value: string) => {
    const newColumns = [...formData.dataTable];
    newColumns[index] = { ...newColumns[index], [field]: value as any };
    updateForm('dataTable', newColumns);
  };

  const removeDataColumn = (index: number) => {
    updateForm('dataTable', formData.dataTable.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: formData.questions.length + 1,
      content: '',
      type: 'essay'
    };
    updateForm('questions', [...formData.questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value as any };
    updateForm('questions', newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, id: i + 1 }));
    updateForm('questions', newQuestions);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.courseName) {
      alert('请填写实验名称和课程名称');
      return;
    }
    
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateTemplate(parseInt(id), formData);
      } else {
        await createTemplate(formData);
      }
      navigate('/templates');
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              label="实验名称"
              value={formData.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="如：牛顿第二定律验证实验"
            />
            <Input
              label="所属课程"
              value={formData.courseName}
              onChange={(e) => updateForm('courseName', e.target.value)}
              placeholder="如：大学物理实验"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <TextArea
              label="实验目的"
              value={formData.purpose}
              onChange={(e) => updateForm('purpose', e.target.value)}
              placeholder="描述本实验要达到的学习目标..."
              rows={4}
            />
            <TextArea
              label="实验原理"
              value={formData.principle}
              onChange={(e) => updateForm('principle', e.target.value)}
              placeholder="详细描述实验的理论依据和公式推导..."
              rows={6}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入仪器名称，如：气垫导轨"
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(formData.instruments, (v) => updateForm('instruments', v), newInstrument, setNewInstrument))}
              />
              <Button onClick={() => addItem(formData.instruments, (v) => updateForm('instruments', v), newInstrument, setNewInstrument)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.instruments.map((inst, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">{inst}</span>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(formData.instruments, (v) => updateForm('instruments', v), i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.instruments.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无仪器，请添加
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" />
              添加实验步骤
            </Button>
            <div className="space-y-4">
              {formData.steps.map((step, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs mr-2">
                          {step.order}
                        </span>
                        步骤 {step.order}
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeStep(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="步骤标题"
                      value={step.title}
                      onChange={(e) => updateStep(i, 'title', e.target.value)}
                    />
                    <TextArea
                      placeholder="步骤详细描述"
                      value={step.description}
                      onChange={(e) => updateStep(i, 'description', e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              ))}
              {formData.steps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无步骤，请添加
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={addDataColumn}>
              <Plus className="w-4 h-4 mr-2" />
              添加数据列
            </Button>
            {formData.dataTable.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left text-xs font-medium text-slate-600">字段名</th>
                      <th className="p-3 text-left text-xs font-medium text-slate-600">单位</th>
                      <th className="p-3 text-left text-xs font-medium text-slate-600">类型</th>
                      <th className="p-3 text-right text-xs font-medium text-slate-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.dataTable.map((col, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="p-3">
                          <input
                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={col.name}
                            onChange={(e) => updateDataColumn(i, 'name', e.target.value)}
                            placeholder="如：时间"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={col.unit}
                            onChange={(e) => updateDataColumn(i, 'unit', e.target.value)}
                            placeholder="如：s"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                            value={col.type}
                            onChange={(e) => updateDataColumn(i, 'type', e.target.value)}
                          >
                            <option value="number">数值</option>
                            <option value="text">文本</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeDataColumn(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {formData.dataTable.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                暂无数据列，请添加
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              添加思考题
            </Button>
            <div className="space-y-4">
              {formData.questions.map((q, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs mr-2">
                          {q.id}
                        </span>
                        题目 {q.id}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <select
                          className="px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                          value={q.type}
                          onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                        >
                          <option value="essay">论述题</option>
                          <option value="calculation">计算题</option>
                        </select>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeQuestion(i)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TextArea
                      placeholder="输入题目内容..."
                      value={q.content}
                      onChange={(e) => updateQuestion(i, 'content', e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              ))}
              {formData.questions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无题目，请添加
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                安全注意事项
              </h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="输入安全注意事项"
                  value={newSafetyNote}
                  onChange={(e) => setNewSafetyNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(formData.safetyNotes, (v) => updateForm('safetyNotes', v), newSafetyNote, setNewSafetyNote))}
                />
                <Button onClick={() => addItem(formData.safetyNotes, (v) => updateForm('safetyNotes', v), newSafetyNote, setNewSafetyNote)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.safetyNotes.map((note, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-sm text-orange-800">{note}</span>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(formData.safetyNotes, (v) => updateForm('safetyNotes', v), i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                <BookMarked className="w-4 h-4 mr-2 text-primary-500" />
                预习要求
              </h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="输入预习要求"
                  value={newPreviewReq}
                  onChange={(e) => setNewPreviewReq(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(formData.previewRequirements, (v) => updateForm('previewRequirements', v), newPreviewReq, setNewPreviewReq))}
                />
                <Button onClick={() => addItem(formData.previewRequirements, (v) => updateForm('previewRequirements', v), newPreviewReq, setNewPreviewReq)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.previewRequirements.map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <span className="text-sm text-primary-800">{req}</span>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(formData.previewRequirements, (v) => updateForm('previewRequirements', v), i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                <Award className="w-4 h-4 mr-2 text-teal-500" />
                考核要点
              </h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="输入考核要点及权重，如：操作规范性（20%）"
                  value={newAssessment}
                  onChange={(e) => setNewAssessment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(formData.assessmentPoints, (v) => updateForm('assessmentPoints', v), newAssessment, setNewAssessment))}
                />
                <Button onClick={() => addItem(formData.assessmentPoints, (v) => updateForm('assessmentPoints', v), newAssessment, setNewAssessment)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.assessmentPoints.map((pt, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <span className="text-sm text-teal-800">{pt}</span>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(formData.assessmentPoints, (v) => updateForm('assessmentPoints', v), i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/templates')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {isEdit ? '编辑实验模板' : '新建实验模板'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit ? '修改现有实验模板的内容' : '创建一个新的实验课程模板'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          保存模板
        </Button>
      </div>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-8 space-y-1">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-all ${
                  currentStep === index
                    ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  currentStep === index ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > index ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
                <ChevronRight className={`w-4 h-4 ml-auto ${currentStep === index ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {React.createElement(steps[currentStep].icon, { className: 'w-5 h-5 mr-2 text-primary-600' })}
                {steps[currentStep].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && isEdit ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : (
                renderStepContent()
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              上一步
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            ) : (
              <Button onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                完成创建
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
