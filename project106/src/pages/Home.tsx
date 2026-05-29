import { useEffect } from 'react';
import { useStore } from '../store';
import StatCard from '../components/StatCard';
import { Map, Sprout, Users, Package, Calendar, MessageSquare, Leaf, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { fetchAllData, plots, plantingLogs, tasks, posts, sharingPosts, tools, inventory, currentUser, loading } = useStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const adoptedCount = plots.filter(p => p.status === 'adopted').length;
  const availableCount = plots.filter(p => p.status === 'available').length;
  const pendingCount = plots.filter(p => p.status === 'pending').length;
  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.lowThreshold).length;
  const totalHarvests = plantingLogs.reduce((sum, log) => sum + log.harvests.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="已认养地块"
          value={`${adoptedCount}/${plots.length}`}
          icon={<Map className="w-6 h-6" />}
          color="green"
          trend="up"
          trendValue="+2 本月"
        />
        <StatCard
          title="种植记录"
          value={plantingLogs.length}
          icon={<Sprout className="w-6 h-6" />}
          color="blue"
          trend="up"
          trendValue={`${totalHarvests} 次收获`}
        />
        <StatCard
          title="待办任务"
          value={activeTasks}
          icon={<Calendar className="w-6 h-6" />}
          color="amber"
          trend="neutral"
          trendValue="需要关注"
        />
        <StatCard
          title="低库存预警"
          value={lowStockItems}
          icon={<Package className="w-6 h-6" />}
          color={lowStockItems > 0 ? 'red' : 'green'}
          trendValue={lowStockItems > 0 ? '需要补充' : '库存充足'}
          trend={lowStockItems > 0 ? 'down' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-gray-800">地块状态分布</h3>
              <Link to="/plots" className="text-sm text-garden-600 hover:text-garden-700 flex items-center gap-1">
                查看详情 <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-garden-600 transition-all duration-500"
                  style={{ width: `${(adoptedCount / plots.length) * 100}%` }}
                  title="已认养"
                />
                <div
                  className="h-full bg-garden-300 transition-all duration-500"
                  style={{ width: `${(availableCount / plots.length) * 100}%` }}
                  title="空闲"
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(pendingCount / plots.length) * 100}%` }}
                  title="待审批"
                />
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-garden-600" />
                <span className="text-sm text-gray-600">已认养 ({adoptedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-garden-300" />
                <span className="text-sm text-gray-600">空闲 ({availableCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm text-gray-600">待审批 ({pendingCount})</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-gray-800">待办志愿任务</h3>
              <Link to="/collaboration" className="text-sm text-garden-600 hover:text-garden-700">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-garden-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    task.type === 'lawn_maint' ? 'bg-green-100 text-green-600' :
                    task.type === 'watering' ? 'bg-blue-100 text-blue-600' :
                    task.type === 'cleanup' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.type === 'lawn_maint' && <Leaf className="w-5 h-5" />}
                    {task.type === 'watering' && <Sprout className="w-5 h-5" />}
                    {task.type === 'cleanup' && <Users className="w-5 h-5" />}
                    {task.type === 'other' && <Calendar className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800 truncate">{task.title}</h4>
                      <span className={`status-badge ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status === 'pending' ? '待开始' : task.status === 'in_progress' ? '进行中' : '已完成'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {task.assignedTo.length > 0 ? `${task.assignedTo.length}人已报名` : '等待报名'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-gray-800">最新经验分享</h3>
              <Link to="/collaboration/forum" className="text-sm text-garden-600 hover:text-garden-700">
                更多 →
              </Link>
            </div>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="p-3 rounded-lg bg-gray-50 hover:bg-garden-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-garden-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{post.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{post.author}</span>
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-gray-800">作物共享</h3>
              <Link to="/collaboration/sharing" className="text-sm text-garden-600 hover:text-garden-700">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {sharingPosts.filter(s => s.status === 'available').slice(0, 3).map((post) => (
                <div key={post.id} className="p-3 rounded-lg bg-gradient-to-r from-garden-50 to-amber-50 border border-garden-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-garden-800">{post.crop}</h4>
                      <p className="text-sm text-gray-600">{post.quantity} {post.unit}</p>
                    </div>
                    <span className="status-badge bg-green-100 text-green-700">可领取</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">提供者: {post.author}</p>
                </div>
              ))}
              {sharingPosts.filter(s => s.status === 'available').length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">暂无可分享的作物</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-gray-800 mb-4">我的信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-garden-50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-garden-400 to-garden-600 flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{currentUser.name}</p>
                  <p className="text-sm text-garden-600">社区成员</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <p className="text-gray-500">认养地块</p>
                  <p className="font-bold text-garden-700">{plots.filter(p => p.adopter?.name === currentUser.name).length}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <p className="text-gray-500">参与任务</p>
                  <p className="font-bold text-garden-700">{tasks.filter(t => t.assignedTo.includes(currentUser.name)).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
