import { useAppStore } from '../store';
import { formatDistance, formatCurrency, getDaysUntil, formatDate } from '../utils/formatters';
import { 
  Bike, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Wrench,
  Shield,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { rides, motorcycle, maintenances, reminders } = useAppStore();

  const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0);
  const totalRides = rides.length;
  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
  const avgDistancePerRide = totalRides > 0 ? totalDistance / totalRides : 0;

  const monthlyData = [
    { month: '1月', 里程: 320 },
    { month: '2月', 里程: 450 },
    { month: '3月', 里程: 580 },
    { month: '4月', 里程: 720 },
    { month: '5月', 里程: Math.round(totalDistance) },
  ];

  const nextReminders = reminders.filter(r => r.isActive && motorcycle && motorcycle.currentMileage < r.nextMileage).slice(0, 3);

  const insuranceDays = motorcycle ? getDaysUntil(motorcycle.insuranceExpiry) : 0;
  const inspectionDays = motorcycle ? getDaysUntil(motorcycle.inspectionExpiry) : 0;

  const recentRides = rides.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">仪表盘</h1>
          <p className="text-dark-300 mt-1">欢迎回来，骑行愉快！</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/rides/new" className="btn-primary flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            记录新骑行
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">总里程</p>
              <p className="stat-value text-brand-400">{formatDistance(totalDistance)}</p>
            </div>
            <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-400">+12.5%</span>
            <span className="text-dark-400">较上月</span>
          </div>
        </div>

        <div className="card card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">骑行次数</p>
              <p className="stat-value">{totalRides} <span className="text-lg text-dark-400">次</span></p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Bike className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-400">
            平均每次 <span className="text-white">{formatDistance(avgDistancePerRide)}</span>
          </div>
        </div>

        <div className="card card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">保养费用</p>
              <p className="stat-value text-green-400">{formatCurrency(totalMaintenanceCost)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-400">
            累计 {maintenances.length} 次保养
          </div>
        </div>

        <div className="card card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">当前里程</p>
              <p className="stat-value text-purple-400">{motorcycle?.currentMileage.toLocaleString()} <span className="text-lg text-dark-400">km</span></p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-400">
            {motorcycle?.brand} {motorcycle?.model}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">月度里程统计</h2>
            <Link to="/rides" className="text-brand-400 text-sm flex items-center gap-1 hover:underline">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="里程" 
                  stroke="#ff6b35" 
                  strokeWidth={3}
                  dot={{ fill: '#ff6b35', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">重要提醒</h2>
          <div className="space-y-4">
            {insuranceDays <= 30 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">保险即将到期</span>
                </div>
                <p className="text-sm text-dark-300">
                  还有 <span className="text-red-400 font-bold">{insuranceDays}</span> 天
                </p>
                <p className="text-xs text-dark-400 mt-1">{formatDate(motorcycle?.insuranceExpiry || '')}</p>
              </div>
            )}

            {inspectionDays <= 30 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">年检即将到期</span>
                </div>
                <p className="text-sm text-dark-300">
                  还有 <span className="text-yellow-400 font-bold">{inspectionDays}</span> 天
                </p>
                <p className="text-xs text-dark-400 mt-1">{formatDate(motorcycle?.inspectionExpiry || '')}</p>
              </div>
            )}

            {nextReminders.map(reminder => (
              <div key={reminder.id} className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-brand-400 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{reminder.type}</span>
                </div>
                <p className="text-sm text-dark-300">
                  剩余 <span className="text-brand-400 font-bold">
                    {(reminder.nextMileage - (motorcycle?.currentMileage || 0)).toLocaleString()}
                  </span> km
                </p>
                <p className="text-xs text-dark-400 mt-1">预计里程 {reminder.nextMileage.toLocaleString()} km</p>
              </div>
            ))}

            {insuranceDays > 30 && inspectionDays > 30 && nextReminders.length === 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <div className="text-green-400 mb-2">
                  <Shield className="w-8 h-8 mx-auto" />
                </div>
                <p className="font-medium text-green-400">车辆状态良好</p>
                <p className="text-sm text-dark-400 mt-1">暂无需要处理的提醒</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">最近骑行记录</h2>
          <Link to="/rides" className="text-brand-400 text-sm flex items-center gap-1 hover:underline">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentRides.map((ride, index) => (
            <div 
              key={ride.id} 
              className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg hover:bg-dark-900 transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{ride.routeName}</h3>
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ride.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {formatDistance(ride.distance)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(ride.duration / 60)}h {ride.duration % 60}m
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-dark-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
