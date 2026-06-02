import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { useProjectStore } from '../../store/useProjectStore';
import type { BusinessCanvas } from '../../types';
import { BUSINESS_CANVAS_FIELDS } from '../../utils/constants';

interface Props {
  projectId: string;
  canvas: BusinessCanvas;
}

const fieldColors: Record<string, string> = {
  customers: 'from-blue-50 to-blue-100 border-blue-200',
  valueProposition: 'from-purple-50 to-purple-100 border-purple-200',
  channels: 'from-green-50 to-green-100 border-green-200',
  customerRelationships: 'from-yellow-50 to-yellow-100 border-yellow-200',
  revenueStreams: 'from-emerald-50 to-emerald-100 border-emerald-200',
  keyResources: 'from-pink-50 to-pink-100 border-pink-200',
  keyActivities: 'from-orange-50 to-orange-100 border-orange-200',
  keyPartnerships: 'from-cyan-50 to-cyan-100 border-cyan-200',
  costStructure: 'from-red-50 to-red-100 border-red-200',
};

const fieldIcons: Record<string, string> = {
  customers: '👥',
  valueProposition: '💎',
  channels: '📣',
  customerRelationships: '🤝',
  revenueStreams: '💰',
  keyResources: '🏗️',
  keyActivities: '⚡',
  keyPartnerships: '🤝',
  costStructure: '💸',
};

export default function BusinessCanvasEditor({ projectId, canvas }: Props) {
  const updateBusinessCanvas = useProjectStore((s) => s.updateBusinessCanvas);
  const [isEditing, setIsEditing] = useState(false);
  const [editCanvas, setEditCanvas] = useState<BusinessCanvas>(canvas);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleSave = () => {
    updateBusinessCanvas(projectId, editCanvas);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditCanvas(canvas);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleFieldUpdate = (key: string, value: string) => {
    setEditCanvas({ ...editCanvas, [key]: value });
  };

  const topRow = ['keyPartnerships', 'keyActivities', 'keyResources', 'valueProposition', 'customerRelationships', 'channels', 'customers'];
  const bottomRow = ['costStructure', 'revenueStreams'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">商业模式画布</h2>
          <p className="text-sm text-slate-500 mt-1">填写商业模式的九个核心模块</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                保存全部
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-1" />
              编辑画布
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-7 gap-3 mb-3">
          {topRow.map((key) => {
            const field = BUSINESS_CANVAS_FIELDS.find((f) => f.key === key)!;
            const colorClass = fieldColors[key];
            const isEditingThis = isEditing && editingField === key;
            const value = editCanvas[key as keyof BusinessCanvas];

            return (
              <div
                key={key}
                className={`rounded-xl border-2 bg-gradient-to-br ${colorClass} p-4 transition-all duration-300 min-h-[200px] flex flex-col ${
                  isEditingThis ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xl">{fieldIcons[key]}</span>
                    <h4 className="font-semibold text-slate-800 text-sm mt-1">{field.label}</h4>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setEditingField(editingField === key ? null : key)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">{field.description}</p>
                {isEditingThis ? (
                  <Textarea
                    value={value}
                    onChange={(e) => handleFieldUpdate(key, e.target.value)}
                    placeholder="请输入内容..."
                    rows={4}
                    className="flex-1 text-sm bg-white/80"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {value || <span className="text-slate-400 italic">未填写</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bottomRow.map((key) => {
            const field = BUSINESS_CANVAS_FIELDS.find((f) => f.key === key)!;
            const colorClass = fieldColors[key];
            const isEditingThis = isEditing && editingField === key;
            const value = editCanvas[key as keyof BusinessCanvas];

            return (
              <div
                key={key}
                className={`rounded-xl border-2 bg-gradient-to-br ${colorClass} p-4 transition-all duration-300 min-h-[150px] flex flex-col ${
                  isEditingThis ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xl">{fieldIcons[key]}</span>
                    <h4 className="font-semibold text-slate-800 text-sm mt-1">{field.label}</h4>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setEditingField(editingField === key ? null : key)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">{field.description}</p>
                {isEditingThis ? (
                  <Textarea
                    value={value}
                    onChange={(e) => handleFieldUpdate(key, e.target.value)}
                    placeholder="请输入内容..."
                    rows={3}
                    className="flex-1 text-sm bg-white/80"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {value || <span className="text-slate-400 italic">未填写</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-medium text-slate-900">使用提示</h4>
              <p className="text-sm text-slate-600 mt-1">
                商业模式画布是一种可视化的商业思维工具，通过九个模块系统性地描述、设计、挑战和更新你的商业模式。
                点击"编辑画布"按钮开始填写，每个模块可以单独编辑。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
