import { useMemo } from 'react';
import { Target, CheckCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useInspectionStore } from '@/store/inspectionStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { cn } from '@/utils/helpers';

export default function CompletionRate() {
  const tasks = useInspectionStore((s) => s.tasks);
  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
    const completionRate = totalTasks > 0
      ? ((completedTasks / totalTasks) * 100).toFixed(1)
      : '0.0';

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
    };
  }, [tasks]);

  const completionTrendData = useMemo(() => {
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const rates = [85, 92, 78, 95, 88, 72, 90];

    const today = new Date();
    const currentWeekDay = today.getDay();

    return weekDays.map((day, index) => {
      let rate = rates[index];
      if (index === currentWeekDay - 1 || (currentWeekDay === 0 && index === 6)) {
        rate = parseInt(stats.completionRate) || rate;
      }
      return {
        day,
        完成率: rate,
      };
    });
  }, [stats.completionRate]);

  const inspectorCompletionData = useMemo(() => {
    const inspectorMap = new Map<string, { total: number; completed: number }>();

    tasks.forEach((task) => {
      if (task.inspector) {
        const current = inspectorMap.get(task.inspector) || { total: 0, completed: 0 };
        current.total += 1;
        if (task.status === 'completed') {
          current.completed += 1;
        }
        inspectorMap.set(task.inspector, current);
      }
    });

    if (inspectorMap.size === 0) {
      return [
        { 人员: '张工', 完成率: 95, 任务数: 12 },
        { 人员: '王工', 完成率: 88, 任务数: 15 },
        { 人员: '李电工', 完成率: 92, 任务数: 8 },
        { 人员: '赵工', 完成率: 85, 任务数: 10 },
        { 人员: '周工', 完成率: 98, 任务数: 6 },
      ];
    }

    return Array.from(inspectorMap.entries()).map(([name, data]) => ({
      人员: name,
      完成率: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      任务数: data.total,
    }));
  }, [tasks]);

  const taskDetails = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return b.taskDate.localeCompare(a.taskDate);
      })
      .map((task) => {
        const equipment = getEquipmentById(task.equipmentId);
        return {
          ...task,
          equipmentName: equipment?.name || task.equipmentId,
        };
      });
  }, [tasks, getEquipmentById]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bgColor: 'bg-green-100', color: 'text-green-700', label: '已完成' };
      case 'pending':
        return { bgColor: 'bg-yellow-100', color: 'text-yellow-700', label: '待执行' };
      case 'overdue':
        return { bgColor: 'bg-red-100', color: 'text-red-700', label: '已逾期' };
      default:
        return { bgColor: 'bg-gray-100', color: 'text-gray-700', label: status };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">点检完成率追踪</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总任务数"
          value={stats.totalTasks}
          icon={<Target className="w-6 h-6" />}
          color="bg-blue-500"
          subtitle="全部点检任务"
        />
        <StatCard
          title="已完成"
          value={stats.completedTasks}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-green-500"
          subtitle="按时完成的任务"
        />
        <StatCard
          title="完成率"
          value={`${stats.completionRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
          subtitle="整体完成情况"
        />
        <StatCard
          title="待执行/逾期"
          value={`${stats.pendingTasks}/${stats.overdueTasks}`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-orange-500"
          subtitle="需要关注"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              周完成率趋势
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, '完成率']}
                />
                <Line
                  type="monotone"
                  dataKey="完成率"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              人员点检完成率对比
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectorCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="人员" type="category" width={60} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === '完成率' ? `${value}%` : value,
                    name,
                  ]}
                />
                <Bar dataKey="完成率" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            点检任务详情
          </h3>
        </div>
        {taskDetails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无点检任务</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">设备名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">任务日期</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">点检人员</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {taskDetails.slice(0, 10).map((task) => {
                  const statusStyle = getStatusStyle(task.status);
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">{task.equipmentName}</td>
                      <td className="py-3 px-4 text-gray-600">{task.taskDate}</td>
                      <td className="py-3 px-4 text-gray-600">{task.inspector || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                            statusStyle.bgColor,
                            statusStyle.color
                          )}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
