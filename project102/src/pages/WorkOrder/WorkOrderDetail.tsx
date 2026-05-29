import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Clock, Package, CheckCircle, Plus, Trash2, Send, Play, Archive } from 'lucide-react';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { urgencyConfig, workOrderStatusConfig, formatDateTime, cn } from '@/utils/helpers';
import type { SparePartUsage } from '@/types';

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useWorkOrderStore();
  const equipStore = useEquipmentStore();
  const workOrder = id ? store.getWorkOrderById(id) : undefined;
  const equipment = workOrder ? equipStore.getEquipmentById(workOrder.equipmentId) : undefined;
  const spareParts = id ? store.getSparePartsByWorkOrder(id) : [];

  const [assignee, setAssignee] = useState('');
  const [repairContent, setRepairContent] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [newPart, setNewPart] = useState({ partCode: '', partName: '', quantity: '', unitPrice: '' });

  if (!workOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">工单不存在</p>
        <button onClick={() => navigate('/workorder')} className="mt-4 text-blue-600 hover:text-blue-700">返回列表</button>
      </div>
    );
  }

  const urgencyItem = urgencyConfig[workOrder.urgency];
  const statusItem = workOrderStatusConfig[workOrder.status];
  const totalCost = spareParts.reduce((sum, p) => sum + p.totalCost, 0);
  const canEditPart = ['assigned', 'processing'].includes(workOrder.status);

  const handleAssign = () => { if (id && assignee.trim()) { store.assignWorkOrder(id, assignee.trim()); setAssignee(''); } };
  const handleStart = () => { if (id) store.startWorkOrder(id); };
  const handleComplete = () => {
    if (id && repairContent.trim() && workHours) {
      store.completeWorkOrder(id, repairContent.trim(), parseFloat(workHours));
      setRepairContent(''); setWorkHours('');
    }
  };
  const handleClose = () => { if (id && window.confirm('确定要关闭此工单吗？')) store.closeWorkOrder(id); };
  const handleAddPart = () => {
    if (id && newPart.partCode && newPart.partName && newPart.quantity && newPart.unitPrice) {
      const qty = parseInt(newPart.quantity), price = parseFloat(newPart.unitPrice);
      store.addSparePart({ workOrderId: id, ...newPart, quantity: qty, unitPrice: price, totalCost: qty * price } as Omit<SparePartUsage, 'id'>);
      setNewPart({ partCode: '', partName: '', quantity: '', unitPrice: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/workorder')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />返回列表
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">工单详情</h2>
            <p className="text-sm text-gray-500">{workOrder.id}</p>
          </div>
          <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', statusItem.bgColor, statusItem.color)}>{statusItem.label}</span>
          <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', urgencyItem.bgColor, urgencyItem.color)}>{urgencyItem.label}</span>
        </div>
        {workOrder.status === 'pending' && (
          <button onClick={() => navigate(`/workorder/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Edit className="w-4 h-4" />编辑
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" />故障信息</h3>
          <div className="space-y-4">
            <DetailItem label="故障设备" value={equipment?.name || '未知设备'} />
            <DetailItem label="故障描述" value={workOrder.faultDesc} />
            <DetailItem label="上报人" value={workOrder.reporter} icon={<User className="w-4 h-4" />} />
            <DetailItem label="上报时间" value={formatDateTime(workOrder.reportTime)} icon={<Clock className="w-4 h-4" />} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-green-600" />派工信息</h3>
          <div className="space-y-4">
            <DetailItem label="维修人" value={workOrder.assignee || '-'} />
            <DetailItem label="开始时间" value={workOrder.startTime ? formatDateTime(workOrder.startTime) : '-'} />
            <DetailItem label="完成时间" value={workOrder.endTime ? formatDateTime(workOrder.endTime) : '-'} />
            <DetailItem label="工时" value={workOrder.workHours ? `${workOrder.workHours} 小时` : '-'} />
          </div>
          {workOrder.repairContent && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">维修内容</h4>
              <p className="text-sm text-gray-600">{workOrder.repairContent}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />备件使用
          <span className="text-sm font-normal text-gray-500">({spareParts.length} 项，总计 ¥{totalCost.toFixed(2)})</span>
        </h3>

        {canEditPart && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input type="text" placeholder="备件编号" value={newPart.partCode} onChange={(e) => setNewPart({ ...newPart, partCode: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="备件名称" value={newPart.partName} onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="数量" min="1" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="单价" min="0" step="0.01" value={newPart.unitPrice} onChange={(e) => setNewPart({ ...newPart, unitPrice: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleAddPart} className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>
        )}

        {spareParts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无备件使用记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">编号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">单价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">总价</th>
                  {canEditPart && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {spareParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{part.partCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{part.partName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{part.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">¥{part.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">¥{part.totalCost.toFixed(2)}</td>
                    {canEditPart && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => store.deleteSparePart(part.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-medium text-gray-800 mb-4">状态流转</h3>
        <div className="flex flex-wrap gap-3">
          {workOrder.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <input type="text" placeholder="输入维修人姓名" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleAssign} disabled={!assignee.trim()} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"><Send className="w-4 h-4" />派工</button>
            </div>
          )}
          {workOrder.status === 'assigned' && (
            <button onClick={handleStart} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Play className="w-4 h-4" />开始维修</button>
          )}
          {workOrder.status === 'processing' && (
            <div className="flex flex-col gap-3 flex-1">
              <textarea placeholder="输入维修内容" value={repairContent} onChange={(e) => setRepairContent(e.target.value)} rows={3} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <input type="number" placeholder="工时(小时)" min="0" step="0.5" value={workHours} onChange={(e) => setWorkHours(e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleComplete} disabled={!repairContent.trim() || !workHours} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"><CheckCircle className="w-4 h-4" />完成维修</button>
              </div>
            </div>
          )}
          {workOrder.status === 'completed' && (
            <button onClick={handleClose} className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"><Archive className="w-4 h-4" />关闭工单</button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      {icon && <span className="text-gray-400 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <span className="text-sm text-gray-500 block mb-1">{label}</span>
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );
}
