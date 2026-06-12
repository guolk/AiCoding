import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Settings,
  Download,
  Info,
  Plus,
  Calendar,
  Battery,
  Clock,
  Package,
} from 'lucide-react';
import { useDroneStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';

const maintenanceIcons: Record<string, React.ReactNode> = {
  propeller: <Wrench className="w-4 h-4" />,
  motor: <Settings className="w-4 h-4" />,
  firmware: <Download className="w-4 h-4" />,
  other: <Info className="w-4 h-4" />,
};

const maintenanceTypeLabels: Record<string, string> = {
  propeller: '桨叶更换',
  motor: '电机检查',
  firmware: '固件更新',
  other: '其他',
};

const missionTypeLabels: Record<string, string> = {
  aerial: '航拍',
  mapping: '测绘',
  inspection: '巡检',
  performance: '表演',
  practice: '练习',
};

function healthColor(percent: number): string {
  if (percent > 80) return 'bg-green-500';
  if (percent >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const getDroneById = useDroneStore((s) => s.getDroneById);
  const getFlightLogsByDrone = useDroneStore((s) => s.getFlightLogsByDrone);
  const getMaintenanceByDrone = useDroneStore((s) => s.getMaintenanceByDrone);

  const drone = getDroneById(id ?? '');
  const flightLogs = getFlightLogsByDrone(id ?? '');
  const maintenanceRecords = getMaintenanceByDrone(id ?? '');

  if (!drone) {
    return (
      <div className="animate-fade-in">
        <Link to="/equipment" className="inline-flex items-center gap-2 text-navy-300 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          返回设备列表
        </Link>
        <p className="text-navy-300">未找到该设备</p>
      </div>
    );
  }

  const recentFlights = [...flightLogs]
    .sort((a, b) => b.flightDate.localeCompare(a.flightDate))
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-navy-300 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回设备列表
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold">{drone.model}</h1>
        <span className="text-navy-300 text-sm">{drone.serialNumber}</span>
        <StatusBadge status={drone.status} />
      </div>

      <section className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
        <h2 className="font-display text-lg font-bold text-white mb-4">基本信息</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-500" />
            <div>
              <p className="text-navy-300 text-xs">购入日期</p>
              <p className="text-sm font-medium">{drone.purchaseDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-accent-500" />
            <div>
              <p className="text-navy-300 text-xs">电池数量</p>
              <p className="text-sm font-medium">{drone.batteryCount} 块</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-500" />
            <div>
              <p className="text-navy-300 text-xs">累计飞行时间</p>
              <p className="text-sm font-medium">{drone.totalFlightHours} 小时</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-accent-500" />
            <div>
              <p className="text-navy-300 text-xs">配件清单</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {drone.accessories.map((acc) => (
                  <span key={acc} className="bg-navy-600/50 px-2 py-1 rounded text-xs">
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
        <h2 className="font-display text-lg font-bold mb-4">飞行时长追踪</h2>
        <p className="mb-4">
          机身累计:{' '}
          <span className="font-display text-2xl font-bold text-accent-500">
            {drone.totalFlightHours}
          </span>{' '}
          小时
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drone.batteries.map((bat) => (
            <div key={bat.id} className="bg-navy-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{bat.serialNumber}</span>
                <span className="text-navy-300 text-xs">{bat.flightHours}h</span>
              </div>
              <div className="w-full bg-navy-600 h-2 rounded-full mb-1">
                <div
                  className={`h-2 rounded-full ${healthColor(bat.healthPercent)}`}
                  style={{ width: `${bat.healthPercent}%` }}
                />
              </div>
              <p className="text-navy-300 text-xs">健康度 {bat.healthPercent}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
        <h2 className="font-display text-lg font-bold text-white mb-4">维护记录时间线</h2>
        {maintenanceRecords.length > 0 ? (
          <div className="border-l-2 border-accent-500 pl-6 space-y-6 ml-2">
            {maintenanceRecords.map((record) => (
              <div key={record.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-accent-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-navy-800" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-accent-500">{maintenanceIcons[record.type]}</span>
                  <span className="font-medium text-sm">{maintenanceTypeLabels[record.type]}</span>
                  <span className="text-navy-300 text-xs">{record.maintenanceDate}</span>
                </div>
                <p className="text-navy-300 text-sm">{record.description}</p>
                {record.nextMaintenanceDate && (
                  <p className="text-xs text-accent-400 mt-1">
                    下次维护: {record.nextMaintenanceDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-navy-300 text-sm">暂无维护记录</p>
        )}
        <Link
          to={`/equipment/${drone.id}/maintenance/new`}
          className="inline-flex items-center gap-2 mt-4 bg-accent-500/20 text-accent-500 hover:bg-accent-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增维护记录
        </Link>
      </section>

      <section className="bg-navy-700/30 rounded-xl p-5 card-glow">
        <h2 className="font-display text-lg font-bold text-white mb-4">相关飞行记录</h2>
        {recentFlights.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-navy-300 text-xs border-b border-navy-600">
                  <th className="text-left py-2 pr-4">日期</th>
                  <th className="text-left py-2 pr-4">地点</th>
                  <th className="text-left py-2 pr-4">时长</th>
                  <th className="text-left py-2">类型</th>
                </tr>
              </thead>
              <tbody>
                {recentFlights.map((flight) => (
                  <tr key={flight.id} className="border-b border-navy-700/50">
                    <td className="py-2 pr-4">{flight.flightDate}</td>
                    <td className="py-2 pr-4">{flight.location}</td>
                    <td className="py-2 pr-4">{flight.duration}分钟</td>
                    <td className="py-2">{missionTypeLabels[flight.missionType] ?? flight.missionType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-navy-300 text-sm">暂无飞行记录</p>
        )}
      </section>
    </div>
  );
}
