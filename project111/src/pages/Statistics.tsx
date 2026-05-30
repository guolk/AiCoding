import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useUserStore } from '../stores/useUserStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useShopStore } from '../stores/useShopStore';
import { mockStats } from '../data/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Statistics() {
  const { familyMembers, currentUser } = useUserStore();
  const { tasks } = useTaskStore();
  const { history } = useShopStore();

  const memberContribution = React.useMemo(() => {
    return familyMembers.map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.assignedTo === member.id && t.status === 'completed'
      );
      return {
        name: member.roleName,
        tasks: memberTasks.length,
        coins: memberTasks.reduce((sum, t) => sum + t.coinReward, 0),
      };
    });
  }, [familyMembers, tasks]);

  const totalTasks = memberContribution.reduce((sum, m) => sum + m.tasks, 0);
  const contributionWithPercent = memberContribution.map((m) => ({
    ...m,
    percentage: totalTasks > 0 ? Math.round((m.tasks / totalTasks) * 100) : 0,
  }));

  const doughnutData = {
    labels: contributionWithPercent.map((m) => m.name),
    datasets: [
      {
        data: contributionWithPercent.map((m) => m.tasks),
        backgroundColor: [
          '#FF9F1C',
          '#2EC4B6',
          '#FF6B6B',
          '#A855F7',
          '#22C55E',
        ],
        borderWidth: 0,
      },
    ],
  };

  const weeklyData = {
    labels: mockStats.weeklyTasks.map((d) => d.day),
    datasets: [
      {
        label: '已完成',
        data: mockStats.weeklyTasks.map((d) => d.completed),
        backgroundColor: 'rgba(46, 196, 182, 0.8)',
        borderRadius: 8,
      },
      {
        label: '已分配',
        data: mockStats.weeklyTasks.map((d) => d.assigned),
        backgroundColor: 'rgba(255, 159, 28, 0.3)',
        borderRadius: 8,
      },
    ],
  };

  const spendingData = {
    labels: mockStats.spendingTrend.map((d) => d.week),
    datasets: [
      {
        label: '消费金币',
        data: mockStats.spendingTrend.map((d) => d.spent),
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: '获得金币',
        data: mockStats.spendingTrend.map((d) => d.earned),
        borderColor: '#2EC4B6',
        backgroundColor: 'rgba(46, 196, 182, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const taskTypeData = {
    labels: mockStats.taskTypes.map((t) => t.type),
    datasets: [
      {
        data: mockStats.taskTypes.map((t) => t.count),
        backgroundColor: [
          'rgba(255, 159, 28, 0.8)',
          'rgba(46, 196, 182, 0.8)',
          'rgba(255, 107, 107, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'right' as const,
      },
    },
  };

  const userHistory = history.filter((h) => h.userId === currentUser.id);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">📊 统计分析</h1>
          <p className="text-neutral-500">查看家庭家务数据和消费记录</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-display text-primary-600 mb-1">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
          <p className="text-sm text-neutral-500">总完成任务</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display text-secondary-600 mb-1">
            {familyMembers.reduce((sum, m) => sum + m.coins, 0)}
          </p>
          <p className="text-sm text-neutral-500">家庭总金币</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display text-accent-600 mb-1">
            {history.length}
          </p>
          <p className="text-sm text-neutral-500">兑换记录</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display text-purple-600 mb-1">
            {familyMembers.length}
          </p>
          <p className="text-sm text-neutral-500">家庭成员</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg text-neutral-800 mb-4">
            👥 成员贡献占比
          </h3>
          <div className="h-72">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg text-neutral-800 mb-4">
            📅 本周任务完成情况
          </h3>
          <div className="h-72">
            <Bar data={weeklyData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg text-neutral-800 mb-4">
          📈 金币收支趋势
        </h3>
        <div className="h-72">
          <Line data={spendingData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg text-neutral-800 mb-4">
            📋 任务类型分布
          </h3>
          <div className="h-64">
            <Bar data={taskTypeData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg text-neutral-800 mb-4">
            🏅 成员贡献排行
          </h3>
          <div className="space-y-3">
            {contributionWithPercent
              .sort((a, b) => b.tasks - a.tasks)
              .map((member, index) => {
                const user = familyMembers.find((m) => m.roleName === member.name);
                return (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-2xl">{user?.avatarUrl || '👤'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-neutral-800">
                          {member.name}
                        </span>
                        <span className="text-sm text-primary-600">
                          {member.tasks} 个任务
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${member.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-neutral-500 w-12 text-right">
                      {member.percentage}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg text-neutral-800 mb-4">
          📜 我的消费记录
        </h3>
        {userHistory.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <p>暂无消费记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">
                    时间
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">
                    商品
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-600">
                    花费金币
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-600">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {userHistory.map((record) => (
                  <tr key={record.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {new Date(record.redeemedAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-neutral-800">
                        {record.itemName}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-accent-600">
                        -{record.coinsSpent} 💰
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {record.status === 'completed' ? '已发放' : '待发放'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
