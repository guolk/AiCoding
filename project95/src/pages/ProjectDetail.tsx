import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Milestone, Task } from '../types';

export default function ProjectDetail() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, milestones, tasks, users, addMilestone, addTask, showToast } = useStore();
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Omit<Milestone, 'id' | 'created_at'>>({
    project_id: parseInt(projectId || '0'),
    name: '',
    description: '',
    target_date: '',
    status: 'pending',
  });
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'>>({
    project_id: parseInt(projectId || '0'),
    milestone_id: null,
    title: '',
    description: '',
    assignee_id: 0,
    priority: 'medium',
    status: 'todo',
    due_date: '',
  });

  const project = projects.find((p) => p.id === parseInt(projectId || '0'));
  const projectMilestones = milestones.filter((m) => m.project_id === parseInt(projectId || '0'));
  const projectTasks = tasks.filter((t) => t.project_id === parseInt(projectId || '0'));

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">项目不存在</p>
        <button onClick={() => navigate('/projects')} className="mt-4 btn-secondary">
          返回项目列表
        </button>
      </div>
    );
  }

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleAddMilestone = () => {
    addMilestone(newMilestone);
    showToast('里程碑创建成功', 'success');
    setShowMilestoneModal(false);
    setNewMilestone({
      project_id: parseInt(projectId || '0'),
      name: '',
      description: '',
      target_date: '',
      status: 'pending',
    });
  };

  const handleAddTask = () => {
    addTask(newTask);
    showToast('任务创建成功', 'success');
    setShowTaskModal(false);
    setNewTask({
      project_id: parseInt(projectId || '0'),
      milestone_id: null,
      title: '',
      description: '',
      assignee_id: 0,
      priority: 'medium',
      status: 'todo',
      due_date: '',
    });
  };

  const completedMilestones = projectMilestones.filter((m) => m.status === 'completed').length;
  const milestoneProgress = projectMilestones.length > 0
    ? Math.round((completedMilestones / projectMilestones.length) * 100)
    : 0;

  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const taskProgress = projectTasks.length > 0
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{project.name}</h1>
          <div className="flex items-center gap-4 mt-1">
            <StatusBadge status={project.status} />
            <span className="text-sm text-neutral-500">
              <User className="w-4 h-4 inline mr-1" />
              {getUserName(project.created_by)}
            </span>
            <span className="text-sm text-neutral-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(project.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      <p className="text-neutral-700 mb-6">{project.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">里程碑进度</h3>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              添加里程碑
            </button>
          </div>
          <div className="text-center mb-4">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#00d4aa"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${milestoneProgress * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900">{milestoneProgress}%</span>
              </div>
            </div>
            <p className="text-sm text-neutral-500 mt-2">{completedMilestones}/{projectMilestones.length} 已完成</p>
          </div>
          <div className="space-y-2">
            {projectMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{milestone.name}</p>
                  <p className="text-xs text-neutral-500">{milestone.target_date}</p>
                </div>
                {milestone.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : milestone.status === 'in_progress' ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">任务统计</h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              添加任务
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-neutral-600">整体进度</span>
                <span className="text-sm font-medium text-neutral-900">{taskProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${taskProgress}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <p className="text-xl font-bold text-neutral-900">
                  {projectTasks.filter((t) => t.status === 'todo').length}
                </p>
                <p className="text-xs text-neutral-500">待办</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {projectTasks.filter((t) => t.status === 'in_progress').length}
                </p>
                <p className="text-xs text-blue-500">进行中</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">
                  {projectTasks.filter((t) => t.status === 'done').length}
                </p>
                <p className="text-xs text-green-500">已完成</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {projectTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' : 'bg-neutral-300'
                }`}></div>
                <span className="text-sm text-neutral-700 flex-1">{task.title}</span>
                <span className="text-xs text-neutral-500">{getUserName(task.assignee_id)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">项目信息</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">状态</p>
              <StatusBadge status={project.status} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">创建时间</p>
              <p className="text-sm text-neutral-700">{new Date(project.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">更新时间</p>
              <p className="text-sm text-neutral-700">{new Date(project.updated_at).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">创建人</p>
              <p className="text-sm text-neutral-700">{getUserName(project.created_by)}</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        title="添加里程碑"
        footer={
          <>
            <button onClick={() => setShowMilestoneModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddMilestone} className="btn-primary">
              添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">里程碑名称</label>
            <input
              type="text"
              value={newMilestone.name}
              onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
              className="input-field"
              placeholder="请输入里程碑名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="input-textarea"
              rows={3}
              placeholder="请输入里程碑描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">目标日期</label>
            <input
              type="date"
              value={newMilestone.target_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, target_date: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="添加任务"
        footer={
          <>
            <button onClick={() => setShowTaskModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddTask} className="btn-primary">
              添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">任务标题</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field"
              placeholder="请输入任务标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input-textarea"
              rows={3}
              placeholder="请输入任务描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">负责人</label>
            <select
              value={newTask.assignee_id}
              onChange={(e) => setNewTask({ ...newTask, assignee_id: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value={0}>请选择负责人</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">优先级</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="input-field"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">截止日期</label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
