import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { DashboardStats, Activity } from '@/types';

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTable({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">最近活动</h3>
      </div>
      <Table>
        <TableHeader>
          <TableHeaderCell>操作</TableHeaderCell>
          <TableHeaderCell>用户</TableHeaderCell>
          <TableHeaderCell>时间</TableHeaderCell>
          <TableHeaderCell>状态</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableEmpty colSpan={4} message="暂无活动记录" />
          ) : (
            activities.map((activity) => (
              <TableRow key={activity.id} row={activity}>
                <TableCell>{activity.action}</TableCell>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{activity.time}</TableCell>
                <TableCell>
                  <StatusBadge status={activity.status === 'success' ? 'active' : 'inactive'} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: api.getDashboardStats,
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: queryKeys.dashboard.activities,
    queryFn: api.getActivities,
  });

  const isLoading = isLoadingStats || isLoadingActivities;

  if (isLoading) {
    return (
      <Layout>
        <Loading text="加载中..." />
      </Layout>
    );
  }

  const statsData: DashboardStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    pendingRequests: 0,
  };

  const activitiesData: Activity[] = activities || [];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎使用用户管理系统</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总用户数"
            value={statsData.totalUsers}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="活跃用户"
            value={statsData.activeUsers}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="角色数量"
            value={statsData.totalRoles}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          />
          <StatCard
            title="待处理请求"
            value={statsData.pendingRequests}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        <ActivityTable activities={activitiesData} />
      </div>
    </Layout>
  );
}

export default DashboardPage;
