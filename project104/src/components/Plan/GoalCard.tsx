import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { Category, CATEGORY_INFO, Priority } from '@/types';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Target,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Heart,
  BookOpen,
  Users,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { EmptyState } from '@/components/Common/EmptyState';
import { Button } from '@/components/Common/Button';
import { cn } from '@/lib/utils';

const iconMap: Record<Category, React.ComponentType<{ className?: string }>> = {
  work: Briefcase,
  health: Heart,
  learning: BookOpen,
  relationship: Users,
  finance: Wallet,
  growth: TrendingUp,
};

const categories: Category[] = ['work', 'health', 'learning', 'relationship', 'finance', 'growth'];

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: '高优先级', color: 'bg-red-100 text-red-700' },
  medium: { label: '中优先级', color: 'bg-amber-100 text-amber-700' },
  low: { label: '低优先级', color: 'bg-green-100 text-green-700' },
};

interface GoalCardProps {
  targetYear?: number;
}

export function GoalCard({ targetYear }: GoalCardProps) {
  const { data, currentYear, addGoal, updateGoal, removeGoal } = useYearlyReviewStore();
  const effectiveYear = targetYear ?? currentYear;
  const yearData = data[effectiveYear];
  const goals = yearData?.plan.goals || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  const filteredGoals = filterCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-secondary-500 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            新年目标
          </h3>
          <p className="text-gray-500 text-sm mt-1">分领域设定来年目标</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          添加目标
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            filterCategory === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-warm-50 text-gray-600 hover:bg-warm-100'
          )}
        >
          全部 ({goals.length})
        </button>
        {categories.map((category) => {
          const Icon = iconMap[category];
          const info = CATEGORY_INFO[category];
          const count = goals.filter(g => g.category === category).length;
          
          return (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                filterCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-50 text-gray-600 hover:bg-warm-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {info.name} ({count})
            </button>
          );
        })}
      </div>

      {showAddForm && (
        <GoalForm
          onSave={(data) => {
            addGoal(data, effectiveYear);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-16 h-16" />}
          title="还没有设定任何目标"
          description="新的一年，你想要在哪些方面取得进步？设定具体的目标吧！"
          action={{ label: '设定第一个目标', onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const Icon = iconMap[goal.category];
            const info = CATEGORY_INFO[goal.category];
            const priority = priorityConfig[goal.priority];
            
            return editingId === goal.id ? (
              <GoalForm
                key={goal.id}
                goal={goal}
                onSave={(data) => {
                  updateGoal(goal.id, data, effectiveYear);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={goal.id}
                className="group bg-white rounded-xl p-5 border border-warm-200/50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', info.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-500 text-lg">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priority.color)}>
                          {priority.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-warm-50 text-gray-400 hover:text-secondary-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这个目标吗？')) {
                          removeGoal(goal.id, effectiveYear);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.actionPlan.length > 0 && (
                  <div className="mt-4 ml-13">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">行动计划</span>
                    </div>
                    <ul className="space-y-1">
                      {goal.actionPlan.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-primary-500 mt-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {goal.metrics && (
                  <div className="mt-4 ml-13 p-3 bg-warm-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">衡量标准</span>
                    </div>
                    <p className="text-sm text-gray-600">{goal.metrics}</p>
                  </div>
                )}

                {goal.obstacles.length > 0 && (
                  <div className="mt-4 ml-13">
                    <p className="text-xs text-gray-400">
                      已预判 {goal.obstacles.length} 个潜在障碍
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface GoalFormProps {
  goal?: {
    category: Category;
    title: string;
    priority: Priority;
    actionPlan: string[];
    metrics: string;
  };
  onSave: (data: {
    category: Category;
    title: string;
    priority: Priority;
    actionPlan: string[];
    metrics: string;
    obstacles: [];
  }) => void;
  onCancel: () => void;
}

function GoalForm({ goal, onSave, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    category: goal?.category || 'work' as Category,
    title: goal?.title || '',
    priority: goal?.priority || 'medium' as Priority,
    actionPlan: goal?.actionPlan || [''],
    metrics: goal?.metrics || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        category: formData.category,
        title: formData.title.trim(),
        priority: formData.priority,
        actionPlan: formData.actionPlan.filter(a => a.trim()),
        metrics: formData.metrics.trim(),
        obstacles: [],
      });
    }
  };

  const addActionItem = () => {
    setFormData({ ...formData, actionPlan: [...formData.actionPlan, ''] });
  };

  const updateActionItem = (index: number, value: string) => {
    const updated = [...formData.actionPlan];
    updated[index] = value;
    setFormData({ ...formData, actionPlan: updated });
  };

  const removeActionItem = (index: number) => {
    if (formData.actionPlan.length > 1) {
      setFormData({ 
        ...formData, 
        actionPlan: formData.actionPlan.filter((_, i) => i !== index) 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-warm-50 rounded-xl border border-warm-200/50 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            目标领域
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                       focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                       transition-all duration-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_INFO[category].name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            优先级
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                       focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                       transition-all duration-200"
          >
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {priorityConfig[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          目标内容
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="例如：每月阅读两本书"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          行动计划（具体步骤）
        </label>
        <div className="space-y-2">
          {formData.actionPlan.map((action, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={action}
                onChange={(e) => updateActionItem(idx, e.target.value)}
                placeholder={`步骤 ${idx + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-warm-200
                           focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                           transition-all duration-200"
              />
              {formData.actionPlan.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeActionItem(idx)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addActionItem}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            + 添加步骤
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          衡量标准（SMART 原则）
        </label>
        <textarea
          value={formData.metrics}
          onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
          placeholder="如何知道目标达成了？例如：每月读完两本书，共24本"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[80px]"
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
