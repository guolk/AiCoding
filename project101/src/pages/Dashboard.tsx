import { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Home, Wallet,
  Sparkles, Wrench, Package, CalendarDays, MapPin, Clock,
  AlertCircle, XCircle, BedDouble, Building2
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { BOOKING_STATUS_LABELS, BookingStatus, Property } from '@/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const styles: Record<BookingStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-emerald-100 text-emerald-800',
    'checked-out': 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
};

const PropertyStatusBadge = ({ status }: { status: Property['status'] }) => {
  const config: Record<Property['status'], { label: string; className: string }> = {
    available: { label: '可订', className: 'bg-green-100 text-green-800' },
    occupied: { label: '已占用', className: 'bg-amber-100 text-amber-800' },
    maintenance: { label: '维修中', className: 'bg-red-100 text-red-800' },
  };
  const { label, className } = config[status];
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  colorClass: string;
}

const StatCard = ({ title, value, icon, trend, colorClass }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={cn('font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs 上月</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorClass)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const {
    properties,
    bookings,
    getFinanceSummary,
    getMonthlyRevenue,
    getLowStockItems,
    getPendingTasks,
  } = useAppStore();

  const { currentYear, currentMonth } = useMemo(() => {
    const now = new Date();
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
    };
  }, []);

  const thisMonthSummary = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    return getFinanceSummary(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, [currentYear, currentMonth, getFinanceSummary]);

  const lastMonthSummary = useMemo(() => {
    const start = new Date(currentYear, currentMonth - 1, 1);
    const end = new Date(currentYear, currentMonth, 0);
    return getFinanceSummary(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, [currentYear, currentMonth, getFinanceSummary]);

  const monthlyData = useMemo(() => {
    const data = getMonthlyRevenue(currentYear);
    return data.map(d => ({
      ...d,
      month: `${d.month.split('-')[1]}月`,
    }));
  }, [currentYear, getMonthlyRevenue]);

  const pendingTasks = useMemo(() => getPendingTasks(), [getPendingTasks]);
  const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return bookings
      .filter(b => {
        const checkIn = new Date(b.checkIn);
        return checkIn >= today && checkIn <= sevenDaysLater && b.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .slice(0, 5);
  }, [bookings]);

  const revenueTrend = lastMonthSummary.totalRevenue > 0
    ? ((thisMonthSummary.totalRevenue - lastMonthSummary.totalRevenue) / lastMonthSummary.totalRevenue) * 100
    : 0;

  const avgPriceTrend = lastMonthSummary.avgDailyRate > 0
    ? ((thisMonthSummary.avgDailyRate - lastMonthSummary.avgDailyRate) / lastMonthSummary.avgDailyRate) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，查看您的民宿业务概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本月总收入"
          value={formatCurrency(thisMonthSummary.totalRevenue)}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          trend={revenueTrend}
          colorClass="bg-amber-50"
        />
        <StatCard
          title="入住率"
          value={`${thisMonthSummary.occupancyRate.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5 text-emerald-700" />}
          colorClass="bg-emerald-50"
        />
        <StatCard
          title="平均客单价"
          value={formatCurrency(thisMonthSummary.avgDailyRate)}
          icon={<Home className="w-5 h-5 text-blue-600" />}
          trend={avgPriceTrend}
          colorClass="bg-blue-50"
        />
        <StatCard
          title="净收入"
          value={formatCurrency(thisMonthSummary.netRevenue)}
          icon={<Wallet className="w-5 h-5 text-teal-600" />}
          colorClass="bg-teal-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">今日任务</h2>
            <span className="text-xs text-gray-500">
              {pendingTasks.cleaning.length + pendingTasks.maintenance.length + lowStockItems.length} 项待处理
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-medium text-gray-700">待处理保洁</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-1.5 py-0.5 rounded">
                  {pendingTasks.cleaning.length}
                </span>
              </div>
              {pendingTasks.cleaning.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">暂无待处理保洁任务</div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.cleaning.slice(0, 3).map(task => {
                    const property = properties.find(p => p.id === task.propertyId);
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{property?.name || '未知房源'}</p>
                          <p className="text-xs text-gray-500">{formatDate(task.scheduledAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-medium text-gray-700">待处理维修</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded">
                  {pendingTasks.maintenance.length}
                </span>
              </div>
              {pendingTasks.maintenance.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">暂无待处理维修任务</div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.maintenance.slice(0, 3).map(task => {
                    const property = properties.find(p => p.id === task.propertyId);
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">{property?.name || '未知房源'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-medium text-gray-700">低库存耗材</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-1.5 py-0.5 rounded">
                  {lowStockItems.length}
                </span>
              </div>
              {lowStockItems.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">库存充足</div>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">当前 {item.quantity}{item.unit} / 最低 {item.minStock}{item.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">近期预订</h2>
            <span className="text-xs text-gray-500">未来 7 天</span>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-2" />
              <p className="text-sm">暂无近期预订</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(booking => {
                const property = properties.find(p => p.id === booking.propertyId);
                return (
                  <div key={booking.id} className="p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{booking.customerName}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{property?.name || '未知房源'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" />
                        <span>{booking.nights}晚</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">房源状态</h2>
            <span className="text-xs text-gray-500">共 {properties.length} 套</span>
          </div>

          <div className="space-y-3">
            {properties.map(property => (
              <div key={property.id} className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{property.name}</p>
                      <p className="text-xs text-gray-500">
                        {property.layout.bedrooms}室{property.layout.livingRooms}厅 · {property.maxGuests}人
                      </p>
                    </div>
                  </div>
                  <PropertyStatusBadge status={property.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-green-50">
              <p className="text-lg font-bold text-green-700">
                {properties.filter(p => p.status === 'available').length}
              </p>
              <p className="text-xs text-green-600">可订</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50">
              <p className="text-lg font-bold text-amber-700">
                {properties.filter(p => p.status === 'occupied').length}
              </p>
              <p className="text-xs text-amber-600">已占用</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50">
              <p className="text-lg font-bold text-red-700">
                {properties.filter(p => p.status === 'maintenance').length}
              </p>
              <p className="text-xs text-red-600">维修中</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">月度收入趋势</h2>
          <span className="text-sm text-gray-500">{currentYear}年</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => value >= 1000 ? `¥${(value / 1000).toFixed(0)}k` : `¥${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [formatCurrency(value), '收入']}
                cursor={{ fill: '#fef3c7' }}
              />
              <Bar
                dataKey="revenue"
                fill="#F59E0B"
                radius={[6, 6, 0, 0]}
                barSize={32}
                name="收入"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '总入住晚数', value: thisMonthSummary.totalNights, suffix: '晚' },
            { label: '平台佣金', value: formatCurrency(thisMonthSummary.totalCommission) },
            { label: '月均入住率', value: `${thisMonthSummary.occupancyRate.toFixed(1)}%` },
            { label: '净收入率', value: `${thisMonthSummary.totalRevenue > 0 ? ((thisMonthSummary.netRevenue / thisMonthSummary.totalRevenue) * 100).toFixed(1) : 0}%` },
          ].map((item, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {item.value}{item.suffix || ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
