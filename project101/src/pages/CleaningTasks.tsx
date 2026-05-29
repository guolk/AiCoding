import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { CleaningTaskStatus } from '@/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  Sparkles, Plus, Play, Check, Trash2, UserPlus, Calendar, Clock,
  FileText, DollarSign, Users, AlertCircle, X
} from 'lucide-react';

type TabType = 'pending' | 'in-progress' | 'completed';

const statusMap: Record<TabType, CleaningTaskStatus[]> = {
  'pending': ['pending', 'assigned'],
  'in-progress': ['in-progress'],
  'completed': ['completed']
};

const statusLabels: Record<CleaningTaskStatus, string> = {
  pending: '待分配',
  assigned: '已分配',
  'in-progress': '进行中',
  completed: '已完成'
};

const statusStyles: Record<CleaningTaskStatus, string> = {
  pending: 'bg-orange-100 text-orange-700',
  assigned: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700'
};

export default function CleaningTasks() {
  const {
    cleaningTasks,
    properties,
    addCleaningTask,
    updateCleaningTask,
    completeCleaningTask,
    deleteCleaningTask
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');

  const [newTask, setNewTask] = useState({
    propertyId: '',
    scheduledAt: '',
    cost: 100,
    notes: ''
  });

  const filteredTasks = cleaningTasks.filter(task =>
    statusMap[activeTab].includes(task.status)
  );

  const stats = {
    pending: cleaningTasks.filter(t => ['pending', 'assigned'].includes(t.status)).length,
    'in-progress': cleaningTasks.filter(t => t.status === 'in-progress').length,
    completed: cleaningTasks.filter(t => t.status === 'completed').length
  };

  const tabLabels: Record<TabType, string> = {
    pending: `待分配 (${stats.pending})`,
    'in-progress': `进行中 (${stats['in-progress']})`,
    completed: `已完成 (${stats.completed})`
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || '未知房源';
  };

  const handleAddTask = () => {
    if (!newTask.propertyId || !newTask.scheduledAt) return;
    addCleaningTask({
      propertyId: newTask.propertyId,
      status: 'pending',
      scheduledAt: newTask.scheduledAt,
      cost: newTask.cost,
      notes: newTask.notes || undefined
    });
    setShowAddModal(false);
    setNewTask({ propertyId: '', scheduledAt: '', cost: 100, notes: '' });
  };

  const handleAssignTask = () => {
    if (!selectedTaskId || !assigneeName.trim()) return;
    updateCleaningTask(selectedTaskId, {
      assignee: assigneeName.trim(),
      status: 'assigned'
    });
    setShowAssignModal(false);
    setSelectedTaskId(null);
    setAssigneeName('');
  };

  const handleStartTask = (taskId: string) => {
    updateCleaningTask(taskId, { status: 'in-progress' });
  };

  const handleCompleteTask = (taskId: string) => {
    completeCleaningTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个保洁任务吗？')) {
      deleteCleaningTask(taskId);
    }
  };

  const openAssignModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = cleaningTasks.find(t => t.id === taskId);
    setAssigneeName(task?.assignee || '');
    setShowAssignModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">保洁任务管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理所有保洁任务，确保客房整洁有序
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              添加新任务
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">进行中</p>
              <p className="text-2xl font-bold text-gray-900">{stats['in-progress']}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['pending', 'in-progress', 'completed'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 px-6 py-4 text-sm font-medium transition-colors relative',
                  activeTab === tab
                    ? 'text-emerald-800'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                {tabLabels[tab]}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
                <p className="text-gray-500">当前没有{activeTab === 'pending' ? '待分配' : activeTab === 'in-progress' ? '进行中' : '已完成'}的保洁任务</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-5 rounded-xl border transition-all duration-200 hover:shadow-md',
                      task.status === 'in-progress'
                        ? 'border-amber-200 bg-amber-50/30'
                        : task.status === 'completed'
                        ? 'border-gray-100 bg-gray-50/50'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-amber-50">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{getPropertyName(task.propertyId)}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusStyles[task.status])}>
                                {statusLabels[task.status]}
                              </span>
                              {task.assignee && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users className="w-3 h-3" />
                                  {task.assignee}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{formatDate(task.scheduledAt)}</span>
                          </div>
                          {task.completedAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>完成于 {formatDate(task.completedAt)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>{formatCurrency(task.cost)}</span>
                          </div>
                          {task.notes && (
                            <div className="flex items-center gap-2 text-gray-600 col-span-2 lg:col-span-1">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{task.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:flex-shrink-0">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => openAssignModal(task.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            分配
                          </button>
                        )}
                        {(task.status === 'assigned' || task.status === 'pending') && task.assignee && (
                          <>
                            <button
                              onClick={() => openAssignModal(task.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              重新分配
                            </button>
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              开始
                            </button>
                          </>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            完成
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">添加保洁任务</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择房源</label>
                <select
                  value={newTask.propertyId}
                  onChange={(e) => setNewTask({ ...newTask, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="">请选择房源</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预计日期</label>
                <input
                  type="date"
                  value={newTask.scheduledAt}
                  onChange={(e) => setNewTask({ ...newTask, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">保洁费用 (元)</label>
                <input
                  type="number"
                  value={newTask.cost}
                  onChange={(e) => setNewTask({ ...newTask, cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  rows={3}
                  placeholder="可选备注信息..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.propertyId || !newTask.scheduledAt}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">分配保洁人员</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">保洁人员姓名</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="请输入保洁人员姓名"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAssignTask}
                disabled={!assigneeName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认分配
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
