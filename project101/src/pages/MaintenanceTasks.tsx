import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { MaintenanceStatus, MaintenancePriority, MAINTENANCE_PRIORITY_LABELS } from '@/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  Wrench, Plus, Play, Check, Trash2, Edit2, Calendar, Clock,
  FileText, DollarSign, Users, AlertCircle, X, Building2
} from 'lucide-react';

type TabType = MaintenanceStatus;

const statusLabels: Record<MaintenanceStatus, string> = {
  pending: '待处理',
  'in-progress': '进行中',
  completed: '已完成'
};

const statusStyles: Record<MaintenanceStatus, string> = {
  pending: 'bg-orange-100 text-orange-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700'
};

const priorityStyles: Record<MaintenancePriority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200'
};

const priorityDotColors: Record<MaintenancePriority, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const priorityBorderColors: Record<MaintenancePriority, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500'
};

export default function MaintenanceTasks() {
  const {
    maintenanceTasks,
    properties,
    addMaintenanceTask,
    updateMaintenanceTask,
    completeMaintenanceTask,
    deleteMaintenanceTask
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium' as MaintenancePriority,
    assignee: '',
    cost: 0,
    notes: ''
  });

  const [editTask, setEditTask] = useState({
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium' as MaintenancePriority,
    status: 'pending' as MaintenanceStatus,
    assignee: '',
    cost: 0,
    notes: ''
  });

  const filteredTasks = maintenanceTasks.filter(task => task.status === activeTab);

  const stats = {
    pending: maintenanceTasks.filter(t => t.status === 'pending').length,
    'in-progress': maintenanceTasks.filter(t => t.status === 'in-progress').length,
    completed: maintenanceTasks.filter(t => t.status === 'completed').length,
    urgent: maintenanceTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
  };

  const tabLabels: Record<TabType, string> = {
    pending: `待处理 (${stats.pending})`,
    'in-progress': `进行中 (${stats['in-progress']})`,
    completed: `已完成 (${stats.completed})`
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || '未知房源';
  };

  const handleAddTask = () => {
    if (!newTask.propertyId || !newTask.title.trim() || !newTask.description.trim()) return;
    addMaintenanceTask({
      propertyId: newTask.propertyId,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      status: 'pending',
      assignee: newTask.assignee.trim() || undefined,
      cost: newTask.cost,
      notes: newTask.notes || undefined
    });
    setShowAddModal(false);
    setNewTask({
      propertyId: '',
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      cost: 0,
      notes: ''
    });
  };

  const openEditModal = (taskId: string) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (!task) return;
    setEditTask({
      propertyId: task.propertyId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee || '',
      cost: task.cost,
      notes: task.notes || ''
    });
    setSelectedTaskId(taskId);
    setShowEditModal(true);
  };

  const handleEditTask = () => {
    if (!selectedTaskId || !editTask.title.trim() || !editTask.description.trim()) return;
    updateMaintenanceTask(selectedTaskId, {
      propertyId: editTask.propertyId,
      title: editTask.title.trim(),
      description: editTask.description.trim(),
      priority: editTask.priority,
      status: editTask.status,
      assignee: editTask.assignee.trim() || undefined,
      cost: editTask.cost,
      notes: editTask.notes || undefined
    });
    setShowEditModal(false);
    setSelectedTaskId(null);
  };

  const handleStartTask = (taskId: string) => {
    updateMaintenanceTask(taskId, { status: 'in-progress' });
  };

  const handleCompleteTask = (taskId: string) => {
    completeMaintenanceTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个维修任务吗？')) {
      deleteMaintenanceTask(taskId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">维修任务管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理所有维修任务，确保设施正常运行
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
        {stats.urgent > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">紧急维修提醒</h3>
                <p className="text-sm text-red-600 mt-1">
                  有 <span className="font-semibold">{stats.urgent}</span> 项紧急维修任务需要立即处理
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-50">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">待处理</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">进行中</p>
                <p className="text-xl font-bold text-gray-900">{stats['in-progress']}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">已完成</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">紧急</p>
                <p className="text-xl font-bold text-red-600">{stats.urgent}</p>
              </div>
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
                  <Wrench className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
                <p className="text-gray-500">当前没有{statusLabels[activeTab]}的维修任务</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-5 rounded-xl border-l-4 border border-gray-100 transition-all duration-200 hover:shadow-md bg-white',
                      priorityBorderColors[task.priority],
                      task.priority === 'urgent' && 'border-red-300 bg-red-50/30'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={cn(
                            'p-2 rounded-lg flex-shrink-0',
                            task.priority === 'urgent' ? 'bg-red-100' :
                            task.priority === 'high' ? 'bg-orange-100' :
                            task.priority === 'medium' ? 'bg-blue-100' : 'bg-gray-100'
                          )}>
                            <Wrench className={cn(
                              'w-5 h-5',
                              task.priority === 'urgent' ? 'text-red-600' :
                              task.priority === 'high' ? 'text-orange-600' :
                              task.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
                            )} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{task.title}</h3>
                              <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                                priorityStyles[task.priority]
                              )}>
                                <span className={cn('w-1.5 h-1.5 rounded-full', priorityDotColors[task.priority])} />
                                {MAINTENANCE_PRIORITY_LABELS[task.priority]}
                              </span>
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusStyles[task.status])}>
                                {statusLabels[task.status]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{getPropertyName(task.propertyId)}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>创建于 {formatDate(task.createdAt)}</span>
                          </div>
                          {task.completedAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>完成于 {formatDate(task.completedAt)}</span>
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{task.assignee}</span>
                            </div>
                          )}
                          {task.cost > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <span>{formatCurrency(task.cost)}</span>
                            </div>
                          )}
                          {task.notes && (
                            <div className="flex items-center gap-2 text-gray-600 col-span-2">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{task.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:flex-shrink-0">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            开始处理
                          </button>
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
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => openEditModal(task.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            编辑
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
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">添加维修任务</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="例如：空调维修"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  placeholder="详细描述维修内容..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">紧急程度</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as MaintenancePriority })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {(Object.keys(MAINTENANCE_PRIORITY_LABELS) as MaintenancePriority[]).map((p) => (
                      <option key={p} value={p}>{MAINTENANCE_PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">负责人 (可选)</label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    placeholder="维修人员姓名"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预估费用 (元)</label>
                <input
                  type="number"
                  value={newTask.cost}
                  onChange={(e) => setNewTask({ ...newTask, cost: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  rows={2}
                  placeholder="其他备注信息..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.propertyId || !newTask.title.trim() || !newTask.description.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">编辑维修任务</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择房源</label>
                <select
                  value={editTask.propertyId}
                  onChange={(e) => setEditTask({ ...editTask, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="">请选择房源</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">紧急程度</label>
                  <select
                    value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as MaintenancePriority })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {(Object.keys(MAINTENANCE_PRIORITY_LABELS) as MaintenancePriority[]).map((p) => (
                      <option key={p} value={p}>{MAINTENANCE_PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务状态</label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value as MaintenanceStatus })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {(Object.keys(statusLabels) as MaintenanceStatus[]).map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">负责人 (可选)</label>
                  <input
                    type="text"
                    value={editTask.assignee}
                    onChange={(e) => setEditTask({ ...editTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">维修费用 (元)</label>
                  <input
                    type="number"
                    value={editTask.cost}
                    onChange={(e) => setEditTask({ ...editTask, cost: Number(e.target.value) })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                <textarea
                  value={editTask.notes}
                  onChange={(e) => setEditTask({ ...editTask, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleEditTask}
                disabled={!editTask.title.trim() || !editTask.description.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
