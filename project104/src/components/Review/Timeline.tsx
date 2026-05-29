import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { TimelineEvent } from '@/types';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar as CalendarIcon,
  Tag,
} from 'lucide-react';
import { EmptyState } from '@/components/Common/EmptyState';
import { Button } from '@/components/Common/Button';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface EditableEventProps {
  event?: TimelineEvent;
  onSave: (event: Omit<TimelineEvent, 'id'>) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

function EditableEvent({ event, onSave, onCancel, isNew = false }: EditableEventProps) {
  const [formData, setFormData] = useState({
    date: event?.date || dayjs().format('YYYY-MM-DD'),
    title: event?.title || '',
    description: event?.description || '',
    tags: event?.tags.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: formData.date,
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-warm-50 rounded-xl border border-warm-200/50 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            日期
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-warm-200
                       focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                       transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            事件标题
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：晋升、旅行、生日..."
            className="w-full px-3 py-2.5 rounded-lg border-2 border-warm-200
                       focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                       transition-all duration-200"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          详细描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="记录这个时刻的细节和感受..."
          className="w-full px-3 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200 resize-none min-h-[80px]"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
          <Tag className="w-4 h-4" />
          标签（用逗号分隔）
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="例如：工作,旅行,家庭"
          className="w-full px-3 py-2.5 rounded-lg border-2 border-warm-200
                     focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                     transition-all duration-200"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
          {isNew ? '添加事件' : '保存修改'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} leftIcon={<X className="w-4 h-4" />}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}

function TimelineItem({ event, onEdit, onDelete }: {
  event: TimelineEvent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 to-primary-100" />
      <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow-sm" />
      
      <div className="group bg-white rounded-xl p-4 border border-warm-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4" />
            {dayjs(event.date).format('YYYY年MM月DD日')}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-warm-100 text-gray-400 hover:text-secondary-500 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h4 className="font-semibold text-secondary-500 text-lg mb-2">{event.title}</h4>
        
        {event.description && (
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.description}</p>
        )}
        
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-warm-100 text-secondary-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Timeline() {
  const { data, currentYear, addTimelineEvent, updateTimelineEvent, removeTimelineEvent } = useYearlyReviewStore();
  const yearData = data[currentYear];
  const events = yearData?.review.timeline || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (eventData: Omit<TimelineEvent, 'id'>) => {
    addTimelineEvent(eventData);
    setShowAddForm(false);
  };

  const handleUpdate = (id: string, eventData: Omit<TimelineEvent, 'id'>) => {
    updateTimelineEvent(id, eventData);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-secondary-500">年度时间线</h3>
          <p className="text-gray-500 text-sm mt-1">记录这一年发生的重要时刻</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          添加事件
        </Button>
      </div>

      {showAddForm && (
        <EditableEvent
          isNew
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-16 h-16" />}
          title="还没有记录任何事件"
          description="这一年发生了什么？记录下那些重要的时刻吧。"
          action={{ label: '添加第一个事件', onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <div className="mt-6">
          {events.map((event) => (
            editingId === event.id ? (
              <div key={event.id} className="mb-6 pl-8">
                <EditableEvent
                  event={event}
                  onSave={(data) => handleUpdate(event.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <TimelineItem
                key={event.id}
                event={event}
                onEdit={() => setEditingId(event.id)}
                onDelete={() => {
                  if (confirm('确定要删除这个事件吗？')) {
                    removeTimelineEvent(event.id);
                  }
                }}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}
