import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Droplets, Save, X } from 'lucide-react';
import { useLubricationStore } from '@/store/lubricationStore';
import { useEquipmentStore } from '@/store/equipmentStore';
import { formatDate, getDaysDifference, getToday, cn, addDays } from '@/utils/helpers';
import type { LubricationPoint } from '@/types';

interface FormData {
  equipmentId: string;
  location: string;
  oilType: string;
  changeCycle: string;
  lastChangeDate: string;
  nextChangeDate: string;
  responsiblePerson: string;
}

const emptyForm: FormData = {
  equipmentId: '',
  location: '',
  oilType: '',
  changeCycle: '',
  lastChangeDate: getToday(),
  nextChangeDate: '',
  responsiblePerson: '',
};

export default function LubricationPoints() {
  const { points, addPoint, updatePoint, deletePoint, performChange, initializeData } =
    useLubricationStore();
  const { equipments, initializeData: initEquipment } = useEquipmentStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [changeOilId, setChangeOilId] = useState<string | null>(null);
  const [operator, setOperator] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    initializeData();
    initEquipment();
  }, [initializeData, initEquipment]);

  const getEquipmentName = (id: string) => equipments.find((e) => e.id === id)?.name || '未知设备';

  const getRowClass = (point: LubricationPoint) => {
    const today = getToday();
    const daysToNext = getDaysDifference(today, point.nextChangeDate);
    if (daysToNext < 0) return 'bg-red-50 hover:bg-red-100';
    if (daysToNext <= 7) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'hover:bg-gray-50';
  };

  const handleSubmit = () => {
    if (!formData.equipmentId || !formData.location || !formData.oilType || !formData.changeCycle) {
      alert('请填写必填项');
      return;
    }
    const cycle = parseInt(formData.changeCycle, 10);
    if (isNaN(cycle) || cycle <= 0) {
      alert('换油周期必须是大于0的数字');
      return;
    }
    const last = formData.lastChangeDate || getToday();
    const next = formData.nextChangeDate || addDays(last, cycle);
    const data: Omit<LubricationPoint, 'id'> = {
      equipmentId: formData.equipmentId,
      location: formData.location,
      oilType: formData.oilType,
      changeCycle: cycle,
      lastChangeDate: last,
      nextChangeDate: next,
      responsiblePerson: formData.responsiblePerson || '',
    };
    if (editingId) {
      updatePoint(editingId, data);
    } else {
      addPoint(data);
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (point: LubricationPoint) => {
    setFormData({ ...point, changeCycle: point.changeCycle.toString() });
    setEditingId(point.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该润滑点吗？')) deletePoint(id);
  };

  const handleChangeOil = () => {
    if (!changeOilId || !operator.trim()) {
      alert('请输入操作人员');
      return;
    }
    performChange(changeOilId, operator.trim(), remark.trim() || undefined);
    setChangeOilId(null);
    setOperator('');
    setRemark('');
  };

  const stats = useMemo(() => {
    const today = getToday();
    let overdue = 0, due = 0;
    points.forEach((p) => {
      const diff = getDaysDifference(today, p.nextChangeDate);
      if (diff < 0) overdue++;
      else if (diff <= 7) due++;
    });
    return { total: points.length, overdue, due };
  }, [points]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" />
          润滑点档案
        </h1>
        <button
          onClick={() => { setFormData(emptyForm); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增润滑点
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">总润滑点数</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-700">即将到期</div>
          <div className="text-2xl font-semibold text-yellow-700">{stats.due}</div>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">已过期</div>
          <div className="text-2xl font-semibold text-red-700">{stats.overdue}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">润滑部位</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">润滑油牌号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">换油周期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">上次换油</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次换油</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">负责人</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {points.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">暂无润滑点数据</td></tr>
            ) : (
              points.map((point) => (
                <tr key={point.id} className={cn(getRowClass(point))}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{getEquipmentName(point.equipmentId)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{point.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{point.oilType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{point.changeCycle}天</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(point.lastChangeDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(point.nextChangeDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{point.responsiblePerson}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setChangeOilId(point.id)} className="text-blue-600 hover:text-blue-900 p-1" title="执行换油">
                        <Droplets className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEdit(point)} className="text-gray-600 hover:text-gray-900 p-1">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(point.id)} className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? '编辑润滑点' : '新增润滑点'}</h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">设备 *</label>
                <select value={formData.equipmentId} onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择设备</option>
                  {equipments.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">润滑部位 *</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：主轴轴承、导轨" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">润滑油牌号 *</label>
                <input type="text" value={formData.oilType} onChange={(e) => setFormData({ ...formData, oilType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：锂基润滑脂 EP2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">换油周期（天）*</label>
                <input type="number" min="1" value={formData.changeCycle} onChange={(e) => setFormData({ ...formData, changeCycle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="90" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">上次换油日期</label>
                  <input type="date" value={formData.lastChangeDate} onChange={(e) => setFormData({ ...formData, lastChangeDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">下次换油日期</label>
                  <input type="date" value={formData.nextChangeDate} onChange={(e) => setFormData({ ...formData, nextChangeDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <input type="text" value={formData.responsiblePerson} onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：张工" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={closeForm} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {changeOilId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">执行换油</h3>
              <button onClick={() => { setChangeOilId(null); setOperator(''); setRemark(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作人员 *</label>
                <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入操作人员姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="选填，例如：按计划更换" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setChangeOilId(null); setOperator(''); setRemark(''); }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleChangeOil} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Droplets className="w-4 h-4" /> 确认换油
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
