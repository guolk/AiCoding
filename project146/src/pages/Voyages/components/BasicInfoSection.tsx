import type { Boat } from '../../../types';

interface BasicInfoSectionProps {
  formData: {
    boatId: string;
    departureTime: string;
    arrivalTime: string;
    destination: string;
    startPoint: string;
    distance: string;
    duration: string;
  };
  errors: Record<string, string>;
  boats: Boat[];
  onChange: (field: string, value: string) => void;
}

export default function BasicInfoSection({ formData, errors, boats, onChange }: BasicInfoSectionProps) {
  return (
    <div className="card p-6">
      <h2 className="section-title">基本信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">船艇 <span className="text-red-500">*</span></label>
          <select
            value={formData.boatId}
            onChange={(e) => onChange('boatId', e.target.value)}
            className={`input-field ${errors.boatId ? 'border-red-500' : ''}`}
          >
            <option value="">请选择船艇</option>
            {boats.map(boat => (
              <option key={boat.id} value={boat.id}>{boat.name} ({boat.type})</option>
            ))}
          </select>
          {errors.boatId && <p className="text-red-500 text-sm mt-1">{errors.boatId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">出发时间 <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            value={formData.departureTime}
            onChange={(e) => onChange('departureTime', e.target.value)}
            className={`input-field ${errors.departureTime ? 'border-red-500' : ''}`}
          />
          {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">到达时间</label>
          <input
            type="datetime-local"
            value={formData.arrivalTime}
            onChange={(e) => onChange('arrivalTime', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">起点 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.startPoint}
            onChange={(e) => onChange('startPoint', e.target.value)}
            placeholder="如：青岛奥帆中心"
            className={`input-field ${errors.startPoint ? 'border-red-500' : ''}`}
          />
          {errors.startPoint && <p className="text-red-500 text-sm mt-1">{errors.startPoint}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目的地 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => onChange('destination', e.target.value)}
            placeholder="如：青岛金沙滩"
            className={`input-field ${errors.destination ? 'border-red-500' : ''}`}
          />
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">航行距离（海里） <span className="text-red-500">*</span></label>
          <input
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={(e) => onChange('distance', e.target.value)}
            placeholder="42.5"
            className={`input-field ${errors.distance ? 'border-red-500' : ''}`}
          />
          {errors.distance && <p className="text-red-500 text-sm mt-1">{errors.distance}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">航行时长（小时） <span className="text-red-500">*</span></label>
          <input
            type="number"
            step="0.25"
            value={formData.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            placeholder="8.5"
            className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>
      </div>
    </div>
  );
}
