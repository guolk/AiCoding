import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import type { UrgencyLevel, WorkOrderStatus } from '@/types';

export default function WorkOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const getWorkOrderById = useWorkOrderStore((s) => s.getWorkOrderById);
  const addWorkOrder = useWorkOrderStore((s) => s.addWorkOrder);
  const updateWorkOrder = useWorkOrderStore((s) => s.updateWorkOrder);
  const equipments = useEquipmentStore((s) => s.equipments);

  const [formData, setFormData] = useState({
    equipmentId: '',
    faultDesc: '',
    urgency: 'medium' as UrgencyLevel,
    reporter: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const workOrder = getWorkOrderById(id);
      if (workOrder) {
        setFormData({
          equipmentId: workOrder.equipmentId,
          faultDesc: workOrder.faultDesc,
          urgency: workOrder.urgency,
          reporter: workOrder.reporter,
        });
      }
    }
  }, [isEdit, id, getWorkOrderById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateWorkOrder(id, formData);
      navigate(`/workorder/${id}`);
    } else {
      addWorkOrder({
        ...formData,
        reportTime: new Date().toISOString(),
        status: 'pending' as WorkOrderStatus,
      });
      navigate('/workorder');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/workorder')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? '编辑工单' : '新建工单'}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                故障设备 <span className="text-red-500">*</span>
              </label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">请选择设备</option>
                {equipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                故障描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="faultDesc"
                value={formData.faultDesc}
                onChange={handleChange}
                required
                rows={4}
                placeholder="请详细描述故障现象..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                紧急程度 <span className="text-red-500">*</span>
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                上报人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reporter"
                value={formData.reporter}
                onChange={handleChange}
                required
                placeholder="请输入上报人姓名"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/workorder')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
