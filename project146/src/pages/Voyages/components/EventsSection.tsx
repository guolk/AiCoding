import { Plus, Flag } from 'lucide-react';
import EventItem, { EventFormData } from './EventItem';

interface EventsSectionProps {
  events: EventFormData[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof EventFormData, value: string) => void;
  onDelete: (id: string) => void;
}

export default function EventsSection({ events, onAdd, onUpdate, onDelete }: EventsSectionProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">特殊事件</h2>
        <button type="button" onClick={onAdd} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加事件
        </button>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-ocean-50 rounded-xl">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无特殊事件，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <EventItem key={event.id} event={event} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
