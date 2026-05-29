import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { frequencyConfig } from '@/utils/helpers';
import type { InspectionStandard, InspectionFrequency } from '@/types';

interface FormData {
  equipmentId: string;
  itemName: string;
  checkStandard: string;
  standardValue: string;
  unit: string;
  frequency: InspectionFrequency;
  responsiblePerson: string;
}

const defaultFormData: FormData = {
  equipmentId: '',
  itemName: '',
  checkStandard: '',
  standardValue: '',
  unit: '',
  frequency: 'daily',
  responsiblePerson: '',
};

export default function InspectionStandards() {
  const standards = useInspectionStore((s) => s.standards);
  const addStandard = useInspectionStore((s) => s.addStandard);
  const updateStandard = useInspectionStore((s) => s.updateStandard);
  const deleteStandard = useInspectionStore((s) => s.deleteStandard);
  const equipments = useEquipmentStore((s) => s.equipments);
  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);

  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<InspectionStandard | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const filteredStandards = useMemo(() => {
    return standards.filter((std) => {
      const equipment = getEquipmentById(std.equipmentId);
      const matchesSearch =
        std.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.checkStandard.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment && equipment.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesEquipment = equipmentFilter === 'all' || std.equipmentId === equipmentFilter;
      return matchesSearch && matchesEquipment;
    });
  }, [standards, searchTerm, equipmentFilter, getEquipmentById]);

  const handleAdd = () => {
    setEditingStandard(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (standard: InspectionStandard) => {
    setEditingStandard(standard);
    setFormData({
      equipmentId: standard.equipmentId,
      itemName: standard.itemName,
      checkStandard: standard.checkStandard,
      standardValue: standard.standardValue || '',
      unit: standard.unit || '',
      frequency: standard.frequency,
      responsiblePerson: standard.responsiblePerson,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`确定要删除点检标准"${itemName}"吗？此操作不可恢复。`)) {
      deleteStandard(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.itemName || !formData.checkStandard || !formData.responsiblePerson) {
      alert('请填写必填项');
      return;
    }

    const standardData = {
      equipmentId: formData.equipmentId,
      itemName: formData.itemName,
      checkStandard: formData.checkStandard,
      standardValue: formData.standardValue || undefined,
      unit: formData.unit || undefined,
      frequency: formData.frequency,
      responsiblePerson: formData.responsiblePerson,
    };

    if (editingStandard) {
      updateStandard(editingStandard.id, standardData);
    } else {
      addStandard(standardData);
    }
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索点检项目、检查标准、设备..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部设备</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增标准
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检项目</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查标准</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标准值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">频率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStandards.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  暂无点检标准
                </td>
              </tr>
            ) : (
              filteredStandards.map((standard) => {
                const equipment = getEquipmentById(standard.equipmentId);
                return (
                  <tr key={standard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {equipment?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {standard.itemName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={standard.checkStandard}>
                      {standard.checkStandard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {standard.standardValue ? `${standard.standardValue} ${standard.unit || ''}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {frequencyConfig[standard.frequency].label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {standard.responsiblePerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(standard)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(standard.id, standard.itemName)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingStandard ? '编辑点检标准' : '新增点检标准'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    设备 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">请选择设备</option>
                    {equipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    点检项目 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                    placeholder="如：主轴振动检查"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    负责人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={handleChange}
                    required
                    placeholder="如：张工"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    检查标准 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="checkStandard"
                    value={formData.checkStandard}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="如：振动值不超过2.5mm/s"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标准值
                  </label>
                  <input
                    type="text"
                    name="standardValue"
                    value={formData.standardValue}
                    onChange={handleChange}
                    placeholder="如：2.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    单位
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="如：mm/s"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    点检频率
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季度</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
