import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import {
  Plus,
  Heart,
  Trash2,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { EmptyState } from '@/components/Common/EmptyState';
import { Button } from '@/components/Common/Button';

export function GratitudeList() {
  const { data, currentYear, addGratitudeItem, updateGratitudeItem, removeGratitudeItem } = useYearlyReviewStore();
  const yearData = data[currentYear];
  const items = yearData?.gratitude.gratitudeItems || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-secondary-500 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-500" />
            感恩清单
          </h3>
          <p className="text-gray-500 text-sm mt-1">今年最值得感激的三件事</p>
        </div>
        {items.length < 3 && (
          <Button
            onClick={() => setShowAddForm(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            添加
          </Button>
        )}
      </div>

      {showAddForm && (
        <GratitudeForm
          onSave={(data) => {
            addGratitudeItem(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-16 h-16" />}
          title="还没有记录感恩事项"
          description="想想今年有什么让你心存感激的事情？家人的陪伴？朋友的支持？还是自己的坚持？"
          action={{ label: '添加第一件感恩之事', onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            editingId === item.id ? (
              <GratitudeForm
                key={item.id}
                item={item}
                onSave={(data) => {
                  updateGratitudeItem(item.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-primary-50/50 to-warm-50 rounded-xl p-6 border border-primary-100/50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-secondary-500 text-lg">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-secondary-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除吗？')) {
                          removeGratitudeItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed pl-11">{item.reason}</p>
              </div>
            )
          ))}
        </div>
      )}

      {items.length > 0 && items.length < 3 && (
        <p className="text-sm text-gray-400 text-center italic">
          你还可以添加 {3 - items.length} 件感恩之事
        </p>
      )}
    </div>
  );
}

interface GratitudeFormProps {
  item?: { title: string; reason: string };
  onSave: (data: { title: string; reason: string }) => void;
  onCancel: () => void;
}

function GratitudeForm({ item, onSave, onCancel }: GratitudeFormProps) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    reason: item?.reason || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.reason.trim()) {
      onSave({
        title: formData.title.trim(),
        reason: formData.reason.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border-2 border-primary-200 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          感恩之事
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="例如：家人的健康"
          className="w-full px-4 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          为什么感激？
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="详细描述这件事给你带来的影响和感受..."
          className="w-full px-4 py-3 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[100px]"
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
