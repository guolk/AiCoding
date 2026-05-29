import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { formatDateTime, cn } from '@/utils/helpers';

export default function InspectionRecords() {
  const records = useInspectionStore((s) => s.records);
  const standards = useInspectionStore((s) => s.standards);
  const equipments = useEquipmentStore((s) => s.equipments);
  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);

  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const standard = standards.find((s) => s.id === record.standardId);
      const equipment = record.equipmentId ? getEquipmentById(record.equipmentId) : null;
      
      const matchesSearch =
        record.measuredValue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        standard?.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEquipment = equipmentFilter === 'all' || record.equipmentId === equipmentFilter;
      
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && record.inspectionTime >= startDate + 'T00:00:00';
      }
      if (endDate) {
        matchesDate = matchesDate && record.inspectionTime <= endDate + 'T23:59:59';
      }
      
      return matchesSearch && matchesEquipment && matchesDate;
    }).sort((a, b) => new Date(b.inspectionTime).getTime() - new Date(a.inspectionTime).getTime());
  }, [records, standards, searchTerm, equipmentFilter, startDate, endDate, getEquipmentById]);

  const stats = useMemo(() => {
    const total = records.length;
    const normal = records.filter((r) => r.isNormal).length;
    const abnormal = records.filter((r) => !r.isNormal).length;
    return { total, normal, abnormal };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">记录总数</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
          <p className="text-sm text-gray-600">正常</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.normal}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
          <p className="text-sm text-gray-600">异常</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.abnormal}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索点检项目、实测值、设备..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <label className="block text-sm text-gray-600 mb-1">设备筛选</label>
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">全部设备</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full lg:w-40">
            <label className="block text-sm text-gray-600 mb-1">开始日期</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full lg:w-40">
            <label className="block text-sm text-gray-600 mb-1">结束日期</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检项目</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实测值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否正常</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处理措施</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点检人</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  暂无点检记录
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const standard = standards.find((s) => s.id === record.standardId);
                const equipment = record.equipmentId ? getEquipmentById(record.equipmentId) : null;
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(record.inspectionTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {equipment?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {standard?.itemName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.measuredValue || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded',
                        record.isNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {record.isNormal ? (
                          <><CheckCircle className="w-3 h-3" /> 正常</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> 异常</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {record.abnormalDesc || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {record.handlingMeasures || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.inspector}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
