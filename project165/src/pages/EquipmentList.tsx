import { Link } from 'react-router-dom';
import { Cpu, Plus } from 'lucide-react';
import { useDroneStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

export default function EquipmentList() {
  const drones = useDroneStore((s) => s.drones);

  if (drones.length === 0) {
    return <Empty />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-white">设备管理</h1>
        <Link
          to="/equipment/new"
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加设备
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drones.map((drone, index) => (
          <Link
            key={drone.id}
            to={`/equipment/${drone.id}`}
            className="bg-navy-700/50 rounded-xl p-5 card-glow hover:shadow-lg hover:shadow-accent-500/5 transition block"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-accent-500" />
                <span className="font-display text-xl font-bold">{drone.model}</span>
              </div>
              <StatusBadge status={drone.status} />
            </div>

            <p className="text-navy-300 text-sm mb-1">序列号: {drone.serialNumber}</p>
            <p className="text-navy-300 text-sm mb-3">购入日期: {drone.purchaseDate}</p>

            <div className="flex items-center gap-4 text-sm mb-3">
              <span>飞行{drone.totalFlightHours}h</span>
              <span>{drone.batteryCount}块电池</span>
            </div>

            {drone.accessories.length > 0 && (
              <p className="text-navy-300 text-xs mb-4">
                {drone.accessories.join('、')}
              </p>
            )}

            <span className="text-accent-500 hover:text-accent-400 text-sm font-medium transition-colors">
              查看详情 →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
