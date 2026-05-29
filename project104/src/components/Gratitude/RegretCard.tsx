import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { EmptyState } from '@/components/Common/EmptyState';
import { Button } from '@/components/Common/Button';

export function RegretCard() {
  const { data, currentYear, addRegret, updateRegret, removeRegret } = useYearlyReviewStore();
  const yearData = data[currentYear];
  const regrets = yearData?.gratitude.regrets || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-secondary-500 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary-500" />
            遗憾与教训
          </h3>
          <p className="text-gray-500 text-sm mt-1">从经历中学习，让遗憾变成成长</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          添加
        </Button>
      </div>

      {showAddForm && (
        <RegretForm
          onSave={(data) => {
            addRegret(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {regrets.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-16 h-16" />}
          title="还没有记录任何遗憾"
          description="正视遗憾是成长的开始。记录下来，并从中吸取教训。"
          action={{ label: '开始记录', onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {regrets.map((regret) => (
            editingId === regret.id ? (
              <RegretForm
                key={regret.id}
                regret={regret}
                onSave={(data) => {
                  updateRegret(regret.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={regret.id}
                className="group bg-white rounded-xl p-5 border border-secondary-100/50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-50 text-secondary-500 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-500 mb-1">情况</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{regret.situation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(regret.id)}
                      className="p-1.5 rounded-lg hover:bg-warm-50 text-gray-400 hover:text-secondary-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除吗？')) {
                          removeRegret(regret.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="ml-13 mt-4 p-4 bg-green-50 rounded-lg border border-green-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700 text-sm">学到的教训</span>
                  </div>
                  <p className="text-green-800 text-sm leading-relaxed">{regret.lesson}</p>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

interface RegretFormProps {
  regret?: { situation: string; lesson: string };
  onSave: (data: { situation: string; lesson: string }) => void;
  onCancel: () => void;
}

function RegretForm({ regret, onSave, onCancel }: RegretFormProps) {
  const [formData, setFormData] = useState({
    situation: regret?.situation || '',
    lesson: regret?.lesson || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.situation.trim() && formData.lesson.trim()) {
      onSave({
        situation: formData.situation.trim(),
        lesson: formData.lesson.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-warm-50 rounded-xl border border-warm-200/50 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          发生了什么？
        </label>
        <textarea
          value={formData.situation}
          onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
          placeholder="描述这个遗憾的情况..."
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[80px]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          从中学到了什么？
        </label>
        <textarea
          value={formData.lesson}
          onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
          placeholder="这个经历给你带来了什么教训？下次会怎么做？"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[80px]"
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
          保存
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} leftIcon={<X className="w-4 h-4" />}>
          取消
        </Button>
      </div>
    </form>
  );
}
