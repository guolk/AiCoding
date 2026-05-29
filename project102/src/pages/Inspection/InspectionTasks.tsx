import { useState, useMemo } from 'react';
import { Play, X, Search, Filter } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { taskStatusConfig, frequencyConfig, formatDateTime, cn } from '@/utils/helpers';
import type { InspectionTask, TaskStatus } from '@/types';

interface ExecuteFormData {
  measuredValue: string;
  isNormal: boolean;
  abnormalDesc: string;
  handlingMeasures: string;
  inspector: string;
}

const defaultExecuteFormData: ExecuteFormData = {
  measuredValue: '',
  isNormal: true,
  abnormalDesc: '',
  handlingMeasures: '',
  inspector: '',
};

export default function InspectionTasks() {
  const tasks = useInspectionStore((s) => s.tasks);
  const standards = useInspectionStore((s) => s.standards);
  const completeTask = useInspectionStore((s) => s.completeTask);
  const addRecord = useInspectionStore((s) => s.addRecord);
  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [formData, setFormData] = useState<ExecuteFormData>(defaultExecuteFormData);

  const todayTasks = useMemo(() => {
    return tasks.filter((task) => {
      const standard = standards.find((s) => s.id === task.standardId);
      const equipment = task.equipmentId ? getEquipmentById(task.equipmentId) : null;
      
      const matchesSearch =
        standard?.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, standards, searchTerm, statusFilter, getEquipmentById]);

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
    };
  }, [tasks]);

  const handleExecute = (task: InspectionTask) => {
    setSelectedTask(task);
    setFormData(defaultExecuteFormData);
    setIsExecuteModalOpen(true);
  };

  const handleSubmitExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !formData.inspector) {
      alert('请填写点检人');
      return;
    }

    if (!formData.isNormal && !formData.abnormalDesc) {
      alert('请填写异常描述');
      return;
    }

    completeTask(selectedTask.id, formData.inspector);
    addRecord({
      taskId: selectedTask.id,
      equipmentId: selectedTask.equipmentId,
      standardId: selectedTask.standardId,
      measuredValue: formData.measuredValue || undefined,
      isNormal: formData.isNormal,
      abnormalDesc: formData.isNormal ? undefined : formData.abnormalDesc,
      handlingMeasures: formData.isNormal ? undefined : formData.handlingMeasures,
      inspector: formData.inspector,
      inspectionTime: new Date().toISOString(),
    });

    setIsExecuteModalOpen(false);
    setSelectedTask(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="今日任务总数" value={taskStats.total} color="blue" />
        <StatCard label="待执行" value={taskStats.pending} color="yellow" />
        <StatCard label="已完成" value={taskStats.completed} color="green" />
        <StatCard label="已逾期" value={taskStats.overdue} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索点检项目、设备..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部状态</option>
              <option value="pending">待执行</option>
              <option value="completed">已完成</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检项目</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查标准</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">频率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检人</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {todayTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  暂无点检任务
                </td>
              </tr>
            ) : (
              todayTasks.map((task) => {
                const standard = standards.find((s) => s.id === task.standardId);
                const equipment = task.equipmentId ? getEquipmentById(task.equipmentId) : null;
                const statusConfig = taskStatusConfig[task.status];
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {equipment?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {standard?.itemName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={standard?.checkStandard}>
                      {standard?.checkStandard || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {standard ? frequencyConfig[standard.frequency].label : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', statusConfig.bgColor, statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.completedAt ? formatDateTime(task.completedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.inspector || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleExecute(task)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          执行
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isExecuteModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">执行点检</h3>
              <button
                onClick={() => setIsExecuteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitExecute} className="p-6 space-y-4">
              {(() => {
                const standard = standards.find((s) => s.id === selectedTask.standardId);
                const equipment = selectedTask.equipmentId ? getEquipmentById(selectedTask.equipmentId) : null;
                return (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">设备：</span>{equipment?.name || '-'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">点检项目：</span>{standard?.itemName || '-'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">检查标准：</span>{standard?.checkStandard || '-'}
                    </p>
                    {standard?.standardValue && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">标准值：</span>
                        {standard.standardValue} {standard.unit || ''}
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    点检人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="inspector"
                    value={formData.inspector}
                    onChange={handleChange}
                    required
                    placeholder="请输入点检人姓名"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    实测值
                  </label>
                  <input
                    type="text"
                    name="measuredValue"
                    value={formData.measuredValue}
                    onChange={handleChange}
                    placeholder="请输入实测值"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNormal"
                    name="isNormal"
                    checked={formData.isNormal}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isNormal" className="text-sm text-gray-700">
                    点检结果正常
                  </label>
                </div>
                {!formData.isNormal && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        异常描述 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="abnormalDesc"
                        value={formData.abnormalDesc}
                        onChange={handleChange}
                        rows={2}
                        placeholder="请描述异常情况"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        处理措施
                      </label>
                      <textarea
                        name="handlingMeasures"
                        value={formData.handlingMeasures}
                        onChange={handleChange}
                        rows={2}
                        placeholder="请填写处理措施"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsExecuteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'blue' | 'yellow' | 'green' | 'red' }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={cn('rounded-lg border p-4', colorClasses[color])}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
