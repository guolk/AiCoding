import React from 'react';
import { Filter, Search } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { useUserStore } from '../stores/useUserStore';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import DifficultyBadge from '../components/DifficultyBadge';
import TaskTypeBadge from '../components/TaskTypeBadge';
import type { TaskType, TaskDifficulty, Task } from '../types';
import { TASK_TYPE_LABELS, DIFFICULTY_LABELS } from '../types';

export default function Tasks() {
  const store = useTaskStore();
  const { getUserById } = useUserStore();

  const tasks = store.tasks;
  const filterType = store.filterType;
  const filterDifficulty = store.filterDifficulty;
  const setFilterType = store.setFilterType;
  const setFilterDifficulty = store.setFilterDifficulty;
  const completeTask = store.completeTask;
  const selectedTask = store.selectedTask;
  const setSelectedTask = store.setSelectedTask;

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const typeMatch = filterType === 'all' || task.type === filterType;
      const difficultyMatch =
        filterDifficulty === 'all' || task.difficulty === filterDifficulty;
      return typeMatch && difficultyMatch;
    });
  }, [tasks, filterType, filterDifficulty]);

  const displayTasks = React.useMemo(() => {
    return filteredTasks.filter((task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredTasks, searchQuery]);

  const taskTypes: (TaskType | 'all')[] = ['all', 'daily', 'weekly', 'monthly', 'timed'];
  const difficulties: (TaskDifficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const assignee = selectedTask ? getUserById(selectedTask.assignedTo) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">📋 任务中心</h1>
          <p className="text-neutral-500">管理和完成你的家务任务</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full md:w-64"
          />
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-600">任务类型</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {taskTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? '全部' : TASK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          <div className="md:max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-600">难度</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterDifficulty === diff
                      ? 'bg-secondary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {diff === 'all' ? '全部' : DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => handleTaskClick(task)}
            onComplete={handleCompleteTask}
          />
        ))}
      </div>

      {displayTasks.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-display text-xl text-neutral-700 mb-2">没有找到任务</h3>
          <p className="text-neutral-500">尝试调整筛选条件或搜索关键词</p>
        </div>
      )}

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="任务详情"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl p-4 bg-gradient-warm rounded-2xl">
                {selectedTask.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <TaskTypeBadge type={selectedTask.type} />
                  <DifficultyBadge difficulty={selectedTask.difficulty} />
                </div>
                <h2 className="text-2xl font-display text-neutral-800 mb-2">
                  {selectedTask.name}
                </h2>
                <p className="text-neutral-600">{selectedTask.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary-50">
                <p className="text-sm text-neutral-500 mb-1">经验值奖励</p>
                <p className="text-2xl font-display text-primary-600">
                  +{selectedTask.expReward} EXP
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary-50">
                <p className="text-sm text-neutral-500 mb-1">金币奖励</p>
                <p className="text-2xl font-display text-secondary-600">
                  +{selectedTask.coinReward} 💰
                </p>
              </div>
            </div>

            {assignee && (
              <div className="p-4 rounded-2xl bg-neutral-50">
                <p className="text-sm text-neutral-500 mb-2">分配给</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{assignee.avatarUrl}</span>
                  <div>
                    <p className="font-semibold text-neutral-800">{assignee.roleName}</p>
                    <p className="text-sm text-neutral-500">Lv.{assignee.level}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTask.deadline && (
              <div className="p-4 rounded-2xl bg-accent-50 border border-accent-200">
                <p className="text-sm text-accent-600 font-semibold">
                  ⏰ 截止时间: {new Date(selectedTask.deadline).toLocaleString('zh-CN')}
                </p>
              </div>
            )}

            {selectedTask.status !== 'completed' && (
              <button
                onClick={() => {
                  handleCompleteTask(selectedTask.id);
                  setSelectedTask(null);
                }}
                className="w-full btn-primary text-lg py-4"
              >
                ✅ 标记任务完成
              </button>
            )}

            {selectedTask.completedAt && (
              <div className="p-4 rounded-2xl bg-green-50 text-center">
                <p className="text-green-600 font-semibold">
                  ✨ 已于 {new Date(selectedTask.completedAt).toLocaleString('zh-CN')} 完成
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
