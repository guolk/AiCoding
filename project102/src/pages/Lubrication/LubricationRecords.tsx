import { useState, useMemo, useEffect } from 'react';
import { Droplets, Filter } from 'lucide-react';
import { useLubricationStore } from '@/store/lubricationStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { formatDate } from '@/utils/helpers';

export default function LubricationRecords() {
  const { records, initializeData } = useLubricationStore();
  const { equipments, initializeData: initEquipment } = useEquipmentStore();
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  useEffect(() => {
    initializeData();
    initEquipment();
  }, [initializeData, initEquipment]);

  const getEquipmentName = (id: string) => equipments.find((e) => e.id === id)?.name || '未知设备';

  const sortedRecords = useMemo(() => {
    return [...records]
      .filter((r) => equipmentFilter === 'all' || r.equipmentId === equipmentFilter)
      .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
  }, [records, equipmentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" />
          换油记录
        </h1>
        <div className="relative">
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">全部设备</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">提示：</span>
          当前共 <strong>{records.length}</strong> 条换油记录
          {equipmentFilter !== 'all' && `，筛选后 <strong>${sortedRecords.length}</strong> 条`}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">润滑油牌号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">换油日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  暂无换油记录
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getEquipmentName(record.equipmentId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.oilType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(record.changeDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.operator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.remark || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
