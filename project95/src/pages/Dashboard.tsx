import { useStore } from '../store/useStore';
import { TrendingUp, FileText, Users, Calendar, ArrowRight, Circle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { projects, tasks, labRecords, literature, meetings, discussions, activities, users } = useStore();

  const projectStats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  const taskStats = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const totalTasks = taskStats.todo + taskStats.inProgress + taskStats.done;
  const taskProgress = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;

  const recentTasks = tasks.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">项目总数</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{projectStats.total}</p>
              <p className="text-xs text-neutral-500 mt-1">进行中 {projectStats.inProgress} | 已完成 {projectStats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">任务完成率</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{taskProgress}%</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${taskProgress}%` }}></div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">团队成员</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{users.length}</p>
              <p className="text-xs text-neutral-500 mt-1">管理员 1 | 组长 1 | 成员 3</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">本周活动</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{activities.length}</p>
              <p className="text-xs text-neutral-500 mt-1">实验记录 {labRecords.length} | 文献 {literature.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">待办任务</h3>
            <button className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-neutral-300'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                  <p className="text-xs text-neutral-500">截止日期: {task.due_date}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">最新动态</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Circle className="w-2 h-2 text-accent-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-neutral-700">{activity.content}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {new Date(activity.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">项目状态分布</h3>
          </div>
          <div className="space-y-4">
            {['proposed', 'in_progress', 'completed', 'published'].map((status) => {
              const count = projects.filter((p) => p.status === status).length;
              const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600">
                      {status === 'proposed' && '立项中'}
                      {status === 'in_progress' && '进行中'}
                      {status === 'completed' && '已完成'}
                      {status === 'published' && '已发表'}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      status === 'proposed' ? 'bg-yellow-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'completed' ? 'bg-green-500' : 'bg-purple-500'
                    }`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">即将进行的组会</h3>
            <button className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1">
              新建组会 <Calendar className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <div key={meeting.id} className="p-3 border border-neutral-100 rounded-lg">
                <p className="text-sm font-medium text-neutral-900">{meeting.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{meeting.date} {meeting.time} | {meeting.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
