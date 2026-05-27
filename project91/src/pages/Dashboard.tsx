import { useStore } from '@/store/useStore';
import { Users, Calendar, Clock, Award, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import StatusBadge from '@/components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { volunteers, activities, organization, serviceDemands } = useStore();

  const totalVolunteers = volunteers.length;
  const totalActivities = activities.length;
  const totalHours = volunteers.reduce((sum, v) => sum + v.totalHours, 0);
  const completedActivities = activities.filter((a) => a.status === 'completed').length;

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const recentAnnouncements = [...organization.announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const topVolunteers = [...volunteers]
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 3);

  const monthlyData = [
    { month: '1月', 活动数: 3, 志愿者数: 45 },
    { month: '2月', 活动数: 4, 志愿者数: 52 },
    { month: '3月', 活动数: 6, 志愿者数: 68 },
    { month: '4月', 活动数: 5, 志愿者数: 58 },
    { month: '5月', 活动数: 7, 志愿者数: 72 },
    { month: '6月', 活动数: 4, 志愿者数: 48 },
  ];

  const activityTypeData = [
    { name: '关爱老人', value: 25 },
    { name: '医疗服务', value: 20 },
    { name: '环保活动', value: 30 },
    { name: '教育辅导', value: 15 },
    { name: '其他', value: 10 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">注册志愿者</p>
              <p className="text-2xl font-bold text-gray-900">{totalVolunteers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">志愿活动</p>
              <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">累计服务时长</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours} 小时</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">已完成活动</p>
              <p className="text-2xl font-bold text-gray-900">{completedActivities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月度活动统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="活动数" fill="#22c55e" />
                <Bar dataKey="志愿者数" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">活动类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {activityTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">近期活动</h3>
            <Link to="/activities" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{activity.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')} · {activity.location}
                  </p>
                </div>
                <StatusBadge status={activity.status} type="activity" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最新公告</h3>
            <Link to="/organization" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{announcement.title}</span>
                  <StatusBadge status={announcement.priority} type="priority" />
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {announcement.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(announcement.createdAt), 'yyyy-MM-dd')} · {announcement.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Volunteers */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">服务时长排行</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topVolunteers.map((volunteer, index) => (
            <div
              key={volunteer.id}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="relative">
                <img
                  src={volunteer.avatar}
                  alt={volunteer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">{volunteer.name}</p>
                <p className="text-sm text-primary-600">{volunteer.totalHours} 小时</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
