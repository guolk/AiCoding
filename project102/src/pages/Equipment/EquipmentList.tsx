import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { useEquipmentStore } from '@/store/equipmentStore';
import { equipmentStatusConfig, formatDate, cn } from '@/utils/helpers';

export default function EquipmentList() {
  const equipments = useEquipmentStore((s) => s.equipments);
  const deleteEquipment = useEquipmentStore((s) => s.deleteEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [equipments, searchTerm, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除设备"${name}"吗？此操作不可恢复。`)) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索设备名称、编号、型号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部状态</option>
              <option value="running">运行中</option>
              <option value="standby">待机</option>
              <option value="maintenance">维修中</option>
              <option value="fault">故障</option>
            </select>
          </div>
        </div>
        <Link
          to="/equipment/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增设备
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">型号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">安装位置</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投用日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  暂无设备数据
                </td>
              </tr>
            ) : (
              filteredEquipments.map((equipment) => {
                const statusConfig = equipmentStatusConfig[equipment.status];
                return (
                  <tr key={equipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {equipment.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {equipment.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {equipment.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {equipment.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(equipment.commissioningDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', statusConfig.bgColor, statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/equipment/${equipment.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/equipment/${equipment.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(equipment.id, equipment.name)}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">提示：</span>
          当前共 {equipments.length} 台设备，其中运行中 {equipments.filter(e => e.status === 'running').length} 台，
          待机 {equipments.filter(e => e.status === 'standby').length} 台，
          维修中 {equipments.filter(e => e.status === 'maintenance').length} 台，
          故障 {equipments.filter(e => e.status === 'fault').length} 台。
        </p>
      </div>
    </div>
  );
}
