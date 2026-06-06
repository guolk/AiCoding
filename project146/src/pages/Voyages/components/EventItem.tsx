import { Trash2, AlertTriangle, Fish, CloudLightning, Flag } from 'lucide-react';
import type { Event } from '../../../types';

export interface EventFormData {
  id: string;
  type: Event['type'];
  description: string;
  timestamp: string;
  latitude: string;
  longitude: string;
}

interface EventItemProps {
  event: EventFormData;
  onUpdate: (id: string, field: keyof EventFormData, value: string) => void;
  onDelete: (id: string) => void;
}

export default function EventItem({ event, onUpdate, onDelete }: EventItemProps) {
  const typeOptions = [
    { value: 'weather', label: '天气事件', icon: CloudLightning },
    { value: 'equipment', label: '设备故障', icon: AlertTriangle },
    { value: 'wildlife', label: '野生动物', icon: Fish },
    { value: 'other', label: '其他事件', icon: Flag },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weather': return 'bg-blue-500';
      case 'equipment': return 'bg-red-500';
      case 'wildlife': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCurrentIcon = () => {
    const opt = typeOptions.find(o => o.value === event.type);
    const Icon = opt?.icon || Flag;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="bg-ocean-50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${getTypeColor(event.type)} text-white flex items-center justify-center`}>
            {getCurrentIcon()}
          </div>
          <select
            value={event.type}
            onChange={(e) => onUpdate(event.id, 'type', e.target.value as Event['type'])}
            className="input-field py-1.5 text-sm"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button onClick={() => onDelete(event.id)} className="text-red-500 hover:text-red-700 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">时间</label>
          <input type="datetime-local" value={event.timestamp} onChange={(e) => onUpdate(event.id, 'timestamp', e.target.value)} className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">描述</label>
          <input type="text" value={event.description} onChange={(e) => onUpdate(event.id, 'description', e.target.value)} placeholder="事件描述" className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">纬度</label>
          <input type="number" step="0.0001" value={event.latitude} onChange={(e) => onUpdate(event.id, 'latitude', e.target.value)} placeholder="36.0570" className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">经度</label>
          <input type="number" step="0.0001" value={event.longitude} onChange={(e) => onUpdate(event.id, 'longitude', e.target.value)} placeholder="120.3836" className="input-field text-sm py-2" />
        </div>
      </div>
    </div>
  );
}
