import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDroneStore } from '@/store';
import type { MaintenanceRecord } from '@/types';

export default function MaintenanceNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addMaintenanceRecord = useDroneStore((s) => s.addMaintenanceRecord);

  const [type, setType] = useState<MaintenanceRecord['type']>('propeller');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [description, setDescription] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      droneId: id ?? '',
      type,
      maintenanceDate,
      description,
      ...(nextMaintenanceDate ? { nextMaintenanceDate } : {}),
    };
    addMaintenanceRecord(record);
    navigate(`/equipment/${id}`);
  };

  return (
    <div className="animate-fade-in">
      <Link
        to={`/equipment/${id}`}
        className="inline-flex items-center gap-2 text-navy-300 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回设备详情
      </Link>

      <h1 className="font-display text-2xl font-bold text-white mb-8">新增维护记录</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">维护类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MaintenanceRecord['type'])}
            className="w-full bg-navy-700/50 border border-navy-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors"
          >
            <option value="propeller">桨叶更换</option>
            <option value="motor">电机检查</option>
            <option value="firmware">固件更新</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">维护日期</label>
          <input
            type="date"
            value={maintenanceDate}
            onChange={(e) => setMaintenanceDate(e.target.value)}
            required
            className="w-full bg-navy-700/50 border border-navy-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">维护描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full bg-navy-700/50 border border-navy-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">下次维护日期（可选）</label>
          <input
            type="date"
            value={nextMaintenanceDate}
            onChange={(e) => setNextMaintenanceDate(e.target.value)}
            className="w-full bg-navy-700/50 border border-navy-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          保存记录
        </button>
      </form>
    </div>
  );
}
