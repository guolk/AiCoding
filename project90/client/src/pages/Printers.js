import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Printer as PrinterIcon, Clock, Settings, Wrench, AlertCircle } from 'lucide-react';
import { printersAPI } from '../services/api';

export default function Printers() {
  const [printers, setPrinters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    bed_size: '',
    nozzle_diameter: '0.4',
    max_nozzle_temp: '260',
    max_bed_temp: '120',
    total_print_hours: '0',
    purchase_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await printersAPI.getAll();
      setPrinters(res.data);
    } catch (error) {
      console.error('Error loading printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        nozzle_diameter: parseFloat(formData.nozzle_diameter),
        max_nozzle_temp: parseFloat(formData.max_nozzle_temp),
        max_bed_temp: parseFloat(formData.max_bed_temp),
        total_print_hours: parseFloat(formData.total_print_hours),
      };

      if (editingPrinter) {
        await printersAPI.update(editingPrinter.id, data);
      } else {
        await printersAPI.create(data);
      }
      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving printer:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      model: printer.model || '',
      bed_size: printer.bed_size || '',
      nozzle_diameter: printer.nozzle_diameter || '0.4',
      max_nozzle_temp: printer.max_nozzle_temp || '260',
      max_bed_temp: printer.max_bed_temp || '120',
      total_print_hours: printer.total_print_hours || '0',
      purchase_date: printer.purchase_date || '',
      notes: printer.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这台打印机吗？')) {
      try {
        await printersAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting printer:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingPrinter(null);
    setFormData({
      name: '',
      model: '',
      bed_size: '',
      nozzle_diameter: '0.4',
      max_nozzle_temp: '260',
      max_bed_temp: '120',
      total_print_hours: '0',
      purchase_date: '',
      notes: '',
    });
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">打印机管理</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加打印机</span>
        </button>
      </div>

      {printers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <PrinterIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无打印机</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            添加第一台打印机
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map(printer => (
            <div key={printer.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <PrinterIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{printer.name}</h3>
                      <p className="text-sm text-gray-500">{printer.model || '未指定型号'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>热床尺寸</span>
                    <span className="font-medium">{printer.bed_size || '未设置'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>喷嘴直径</span>
                    <span className="font-medium">{printer.nozzle_diameter}mm</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>最高温度</span>
                    <span className="font-medium">{printer.max_nozzle_temp}°C / {printer.max_bed_temp}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{printer.total_print_hours || 0} 小时</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <Link
                    to={`/printers/${printer.id}`}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    查看详情
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(printer)}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(printer.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPrinter ? '编辑打印机' : '添加打印机'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">打印机名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Ender 3 V2 #1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">型号</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Creality Ender 3 V2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">热床尺寸</label>
                  <input
                    type="text"
                    value={formData.bed_size}
                    onChange={(e) => setFormData({ ...formData, bed_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 220x220x250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">喷嘴直径 (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.nozzle_diameter}
                    onChange={(e) => setFormData({ ...formData, nozzle_diameter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最高喷嘴温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.max_nozzle_temp}
                    onChange={(e) => setFormData({ ...formData, max_nozzle_temp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最高热床温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.max_bed_temp}
                    onChange={(e) => setFormData({ ...formData, max_bed_temp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总打印时长 (小时)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.total_print_hours}
                    onChange={(e) => setFormData({ ...formData, total_print_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="记录打印机的特殊设置、改装情况等..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingPrinter ? '保存修改' : '添加打印机'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}