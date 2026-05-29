import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Eye, Clock, User } from 'lucide-react';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { urgencyConfig, workOrderStatusConfig, formatDateTime, cn } from '@/utils/helpers';

export default function WorkOrderList() {
  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const equipments = useEquipmentStore((s) => s.equipments);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      return matchesStatus;
    }).sort((a, b) => {
      const aConfig = workOrderStatusConfig[a.status];
      const bConfig = workOrderStatusConfig[b.status];
      return aConfig.order - bConfig.order || new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
    });
  }, [workOrders, statusFilter]);

  const getEquipmentById = (id: string) => equipments.find((eq) => eq.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">全部状态</option>
            <option value="pending">待派工</option>
            <option value="assigned">已派工</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <Link
          to="/workorder/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建工单
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">故障设备</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">故障描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">紧急程度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上报人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上报时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWorkOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  暂无工单数据
                </td>
              </tr>
            ) : (
              filteredWorkOrders.map((workOrder) => {
                const equipment = getEquipmentById(workOrder.equipmentId);
                const urgencyConfigItem = urgencyConfig[workOrder.urgency];
                const statusConfigItem = workOrderStatusConfig[workOrder.status];
                return (
                  <tr key={workOrder.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {equipment?.name || '未知设备'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={workOrder.faultDesc}>
                      {workOrder.faultDesc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', urgencyConfigItem.bgColor, urgencyConfigItem.color)}>
                        {urgencyConfigItem.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {workOrder.reporter}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(workOrder.reportTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', statusConfigItem.bgColor, statusConfigItem.color)}>
                        {statusConfigItem.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/workorder/${workOrder.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 inline-flex"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">提示：</span>
          当前共 {workOrders.length} 条工单，其中待派工 {workOrders.filter(w => w.status === 'pending').length} 条，
          已派工 {workOrders.filter(w => w.status === 'assigned').length} 条，
          处理中 {workOrders.filter(w => w.status === 'processing').length} 条，
          已完成 {workOrders.filter(w => w.status === 'completed').length} 条，
          已关闭 {workOrders.filter(w => w.status === 'closed').length} 条。
        </p>
      </div>
    </div>
  );
}
