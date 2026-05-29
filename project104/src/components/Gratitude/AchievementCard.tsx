import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import {
  Plus,
  Star,
  Trash2,
  Edit2,
  Save,
  X,
  Award,
} from 'lucide-react';
import { EmptyState } from '@/components/Common/EmptyState';
import { Button } from '@/components/Common/Button';
import { cn } from '@/lib/utils';

export function AchievementCard() {
  const { data, currentYear, addAchievement, updateAchievement, removeAchievement } = useYearlyReviewStore();
  const yearData = data[currentYear];
  const achievements = yearData?.gratitude.achievements || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const highlights = achievements.filter(a => a.isHighlight);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-secondary-500 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-500" />
            年度成就
          </h3>
          <p className="text-gray-500 text-sm mt-1">记录你引以为傲的成就和突破</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          添加成就
        </Button>
      </div>

      {highlights.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-primary-50 to-warm-50 rounded-xl border border-primary-100/50">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-primary-500 fill-primary-500" />
            <span className="font-semibold text-secondary-500">年度亮点</span>
          </div>
          <div className="space-y-2">
            {highlights.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {a.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <AchievementForm
          onSave={(data) => {
            addAchievement(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {achievements.length === 0 ? (
        <EmptyState
          icon={<Award className="w-16 h-16" />}
          title="还没有记录任何成就"
          description="今年你取得了哪些值得骄傲的成就？不论大小，都值得被记录。"
          action={{ label: '记录第一个成就', onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            editingId === achievement.id ? (
              <AchievementForm
                key={achievement.id}
                achievement={achievement}
                onSave={(data) => {
                  updateAchievement(achievement.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={achievement.id}
                className={cn(
                  "group relative bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-200",
                  achievement.isHighlight 
                    ? "border-primary-300 ring-2 ring-primary-100" 
                    : "border-warm-200/50"
                )}
              >
                {achievement.isHighlight && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-secondary-500 pr-8">{achievement.title}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(achievement.id)}
                      className="p-1.5 rounded-lg hover:bg-warm-50 text-gray-400 hover:text-secondary-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除吗？')) {
                          removeAchievement(achievement.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {achievement.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{achievement.description}</p>
                )}
                
                {achievement.impact && (
                  <div className="text-sm text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                    <span className="font-medium">影响：</span>{achievement.impact}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

interface AchievementFormProps {
  achievement?: { title: string; description: string; impact: string; isHighlight: boolean };
  onSave: (data: { title: string; description: string; impact: string; isHighlight: boolean }) => void;
  onCancel: () => void;
}

function AchievementForm({ achievement, onSave, onCancel }: AchievementFormProps) {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    impact: achievement?.impact || '',
    isHighlight: achievement?.isHighlight || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        title: formData.title.trim(),
        description: formData.description.trim(),
        impact: formData.impact.trim(),
        isHighlight: formData.isHighlight,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-warm-50 rounded-xl border border-warm-200/50 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          成就标题
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="例如：完成了一个重要的项目"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          详细描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="描述这个成就的具体内容..."
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[80px]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          带来的影响
        </label>
        <textarea
          value={formData.impact}
          onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
          placeholder="这个成就对你或他人产生了什么影响？"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[60px]"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isHighlight}
          onChange={(e) => setFormData({ ...formData, isHighlight: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-600">标记为年度亮点</span>
      </label>
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
