import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Factory,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Wrench,
  Droplets,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useEquipmentStore } from '@/store/equipmentStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useLubricationStore } from '@/store/lubricationStore';
import {
  urgencyConfig,
  workOrderStatusConfig,
  formatDate,
  cn,
} from '@/utils/helpers';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

export default function Dashboard() {
  const equipments = useEquipmentStore((s) => s.equipments);
  const tasks = useInspectionStore((s) => s.tasks);
  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const spareParts = useWorkOrderStore((s) => s.sparePartUsages);
  const duePoints = useLubricationStore((s) => s.getDuePoints);
  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);

  const stats = useMemo(() => {
    const totalEquipments = equipments.length;
    const runningEquipments = equipments.filter((e) => e.status === 'running').length;
    const faultEquipments = equipments.filter((e) => e.status === 'fault').length;

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.taskDate === today);
    const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = todayTasks.filter((t) => t.status === 'pending').length;

    const pendingWorkOrders = workOrders.filter(
      (wo) => wo.status === 'pending' || wo.status === 'assigned'
    ).length;

    const totalCost = spareParts.reduce((sum, p) => sum + p.totalCost, 0);

    return {
      totalEquipments,
      runningEquipments,
      faultEquipments,
      todayTaskTotal: todayTasks.length,
      completedTasks,
      pendingTasks,
      pendingWorkOrders,
      totalCost,
    };
  }, [equipments, tasks, workOrders, spareParts]);

  const equipmentStatusData = useMemo(() => [
    { name: '运行中', value: equipments.filter((e) => e.status === 'running').length, color: '#22c55e' },
    { name: '待机', value: equipments.filter((e) => e.status === 'standby').length, color: '#3b82f6' },
    { name: '维修中', value: equipments.filter((e) => e.status === 'maintenance').length, color: '#eab308' },
    { name: '故障', value: equipments.filter((e) => e.status === 'fault').length, color: '#ef4444' },
  ], [equipments]);

  const monthlyCostData = [
    { month: '1月', 成本: 5200, 工单: 8 },
    { month: '2月', 成本: 6800, 工单: 12 },
    { month: '3月', 成本: 4500, 工单: 7 },
    { month: '4月', 成本: 7200, 工单: 10 },
    { month: '5月', 成本: stats.totalCost + 3000, 工单: 9 },
  ];

  const recentWorkOrders = workOrders
    .slice()
    .sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime())
    .slice(0, 5);

  const todayTasks = tasks
    .filter((t) => t.status === 'pending')
    .slice(0, 5);

  const dueLubrication = duePoints();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="设备总数"
          value={stats.totalEquipments}
          icon={<Factory className="w-6 h-6" />}
          color="bg-blue-500"
          subtitle={`运行中: ${stats.runningEquipments} 台`}
        />
        <StatCard
          title="今日点检"
          value={`${stats.completedTasks}/${stats.todayTaskTotal}`}
          icon={<ClipboardList className="w-6 h-6" />}
          color="bg-green-500"
          subtitle={`待执行: ${stats.pendingTasks} 项`}
        />
        <StatCard
          title="待处理工单"
          value={stats.pendingWorkOrders}
          icon={<Wrench className="w-6 h-6" />}
          color="bg-orange-500"
          subtitle="需要关注"
        />
        <StatCard
          title="本月维修成本"
          value={`¥${stats.totalCost.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
          subtitle="含备件及工时"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">设备状态分布</h3>
            <Link to="/equipment" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              查看全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">月度维修成本趋势</h3>
            <Link to="/statistics/cost" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              详细分析 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="成本" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">待处理工单</h3>
            <Link to="/workorders" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentWorkOrders.map((order) => {
              const equipment = getEquipmentById(order.equipmentId);
              const urgencyStyle = urgencyConfig[order.urgency];
              const statusStyle = workOrderStatusConfig[order.status];
              return (
                <Link
                  key={order.id}
                  to={`/workorders/${order.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{equipment?.name || order.equipmentId}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded', urgencyStyle.bgColor, urgencyStyle.color)}>
                        {urgencyStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{order.faultDesc}</p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded ml-2 whitespace-nowrap', statusStyle.bgColor, statusStyle.color)}>
                    {statusStyle.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">今日待点检</h3>
            <Link to="/inspection/tasks" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>今日点检任务已完成</p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const equipment = getEquipmentById(task.equipmentId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{equipment?.name || task.equipmentId}</p>
                        <p className="text-xs text-gray-500">待执行</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">润滑到期提醒</h3>
            <Link to="/lubrication/points" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {dueLubrication.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Droplets className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>近期无润滑到期</p>
              </div>
            ) : (
              dueLubrication.slice(0, 5).map((point) => {
                const equipment = getEquipmentById(point.equipmentId);
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = point.nextChangeDate < today;
                return (
                  <div
                    key={point.id}
                    className={cn('p-3 rounded-lg', isOverdue ? 'bg-red-50' : 'bg-yellow-50')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{equipment?.name || point.equipmentId}</p>
                        <p className="text-xs text-gray-500">{point.location}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn('text-sm font-medium', isOverdue ? 'text-red-600' : 'text-yellow-600')}
                        >
                          {formatDate(point.nextChangeDate)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {isOverdue ? '已过期' : '即将到期'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-white', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
