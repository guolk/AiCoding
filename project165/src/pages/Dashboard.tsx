import { Link } from 'react-router-dom';
import { Navigation, Clock, Cpu, Film, MapPin, Timer, Route } from 'lucide-react';
import { useDroneStore } from '@/store';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

function getBatteryColor(percent: number): string {
  if (percent > 80) return 'bg-emerald-500';
  if (percent >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function Dashboard() {
  const { flightLogs, drones, projects, certificates, pilots } = useDroneStore();

  const totalDuration = flightLogs.reduce((sum, fl) => sum + fl.duration, 0);
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const recentFlights = [...flightLogs]
    .sort((a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime())
    .slice(0, 5);

  const alertCertificates = certificates.filter(
    (c) => c.status === 'expiring_soon' || c.status === 'expired'
  );

  const getPilotName = (pilotId: string) =>
    pilots.find((p) => p.id === pilotId)?.name ?? '未知';

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}` : `${mins}min`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">仪表盘</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div style={{ animationDelay: '0ms' }}>
          <StatCard
            title="总飞行次数"
            value={flightLogs.length}
            icon={<Navigation className="h-5 w-5" />}
          />
        </div>
        <div style={{ animationDelay: '80ms' }}>
          <StatCard
            title="总飞行时长"
            value={formatDuration(totalDuration)}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
        <div style={{ animationDelay: '160ms' }}>
          <StatCard
            title="设备数量"
            value={drones.length}
            icon={<Cpu className="h-5 w-5" />}
          />
        </div>
        <div style={{ animationDelay: '240ms' }}>
          <StatCard
            title="活跃项目"
            value={activeProjects.length}
            icon={<Film className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">最近飞行</h2>
          {recentFlights.length === 0 ? (
            <Empty message="暂无飞行记录" />
          ) : (
            <div className="space-y-3">
              {recentFlights.map((flight, i) => (
                <Link
                  key={flight.id}
                  to={`/flights/${flight.id}`}
                  className="card-glow block rounded-lg bg-navy-700/50 p-4 transition-all duration-200 hover:bg-navy-700/80 hover:shadow-lg hover:shadow-navy-900/50"
                  style={{ animationDelay: `${(i + 4) * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/20">
                        <Navigation className="h-4 w-4 text-accent-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{flight.location}</p>
                        <p className="text-xs text-navy-300">{flight.flightDate}</p>
                      </div>
                    </div>
                    <StatusBadge status={flight.missionType} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-5 text-xs text-navy-300">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      {formatDuration(flight.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Route className="h-3.5 w-3.5" />
                      {flight.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {flight.maxAltitude} m
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">设备状态</h2>
          <div className="space-y-4">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className="rounded-lg bg-navy-700/50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{drone.model}</span>
                  <StatusBadge status={drone.status} size="sm" />
                </div>
                <div className="space-y-2">
                  {drone.batteries.map((bat) => (
                    <div key={bat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-navy-300">
                        <span>{bat.serialNumber}</span>
                        <span>{bat.healthPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-navy-800">
                        <div
                          className={`h-full rounded-full transition-all ${getBatteryColor(bat.healthPercent)}`}
                          style={{ width: `${bat.healthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">合规提醒</h2>
        {alertCertificates.length === 0 ? (
          <Empty message="暂无合规提醒" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alertCertificates.map((cert) => (
              <div
                key={cert.id}
                className={`rounded-lg border p-4 ${
                  cert.status === 'expired'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {getPilotName(cert.pilotId)}
                  </span>
                  <StatusBadge status={cert.status} size="sm" />
                </div>
                <p className="text-xs text-navy-300">{cert.type}</p>
                <p className="mt-1 text-xs text-navy-400">
                  到期日期：{cert.expiryDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
