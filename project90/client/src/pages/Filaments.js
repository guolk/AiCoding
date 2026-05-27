import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Package, AlertTriangle } from 'lucide-react';
import { filamentsAPI } from '../services/api';

const FILAMENT_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', '尼龙', '其他'];

export default function Filaments() {
  const [filaments, setFilaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFilament, setEditingFilament] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: 'PLA',
    color: '',
    color_hex: '#ffffff',
    diameter: '1.75',
    initial_weight: '1000',
    current_weight: '1000',
    price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_link: '',
    adhesion_rating: '3',
    strength_rating: '3',
    warping_rating: '3',
    quality_rating: '3',
    review: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await filamentsAPI.getAll();
      setFilaments(res.data);
    } catch (error) {
      console.error('Error loading filaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async (id) => {
    try {
      const res = await filamentsAPI.getUsageHistory(id);
      setUsageHistory(res.data);
      setShowHistory(id);
    } catch (error) {
      console.error('Error loading usage history:', error);
    }
  };

  const filteredFilaments = filaments.filter(filament => {
    const matchesSearch = filament.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          filament.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          filament.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || filament.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || filament.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        diameter: parseFloat(formData.diameter),
        initial_weight: parseFloat(formData.initial_weight),
        current_weight: parseFloat(formData.current_weight),
        price: parseFloat(formData.price) || null,
        adhesion_rating: parseInt(formData.adhesion_rating),
        strength_rating: parseInt(formData.strength_rating),
        warping_rating: parseInt(formData.warping_rating),
        quality_rating: parseInt(formData.quality_rating),
      };

      if (editingFilament) {
        await filamentsAPI.update(editingFilament.id, data);
      } else {
        await filamentsAPI.create(data);
      }
      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving filament:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (filament) => {
    setEditingFilament(filament);
    setFormData({
      brand: filament.brand,
      model: filament.model,
      type: filament.type,
      color: filament.color,
      color_hex: filament.color_hex || '#ffffff',
      diameter: filament.diameter || '1.75',
      initial_weight: filament.initial_weight || '1000',
      current_weight: filament.current_weight || '1000',
      price: filament.price || '',
      purchase_date: filament.purchase_date || new Date().toISOString().split('T')[0],
      purchase_link: filament.purchase_link || '',
      adhesion_rating: filament.adhesion_rating || '3',
      strength_rating: filament.strength_rating || '3',
      warping_rating: filament.warping_rating || '3',
      quality_rating: filament.quality_rating || '3',
      review: filament.review || '',
      status: filament.status || 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个耗材吗？')) {
      try {
        await filamentsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting filament:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingFilament(null);
    setFormData({
      brand: '',
      model: '',
      type: 'PLA',
      color: '',
      color_hex: '#ffffff',
      diameter: '1.75',
      initial_weight: '1000',
      current_weight: '1000',
      price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_link: '',
      adhesion_rating: '3',
      strength_rating: '3',
      warping_rating: '3',
      quality_rating: '3',
      review: '',
      status: 'active',
    });
  };

  const getRemainingPercentage = (filament) => {
    return Math.round((filament.current_weight / filament.initial_weight) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAvgRating = (filament) => {
    const ratings = [filament.adhesion_rating, filament.strength_rating, filament.warping_rating, filament.quality_rating];
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">耗材管理</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加耗材</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索耗材..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">全部类型</option>
          {FILAMENT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">全部状态</option>
          <option value="active">使用中</option>
          <option value="empty">已用完</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      {filteredFilaments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无耗材记录</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            添加第一个耗材
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFilaments.map(filament => (
            <div key={filament.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2" style={{ backgroundColor: filament.color_hex || '#ccc' }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{filament.brand}</h3>
                    <p className="text-sm text-gray-500">{filament.model} - {filament.color}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    filament.status === 'active' ? 'bg-green-100 text-green-700' :
                    filament.status === 'empty' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {filament.status === 'active' ? '使用中' :
                     filament.status === 'empty' ? '已用完' : '已归档'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">剩余</span>
                    <span className="font-medium">
                      {filament.current_weight}g / {filament.initial_weight}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStatusColor(getRemainingPercentage(filament))}`}
                      style={{ width: `${getRemainingPercentage(filament)}%` }}
                    />
                  </div>
                  {getRemainingPercentage(filament) < 20 && (
                    <div className="flex items-center space-x-1 mt-2 text-orange-600 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>库存不足</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-600">{getAvgRating(filament)}</span>
                  </div>
                  <span className="text-gray-500">{filament.type}</span>
                  {filament.price && (
                    <span className="text-gray-600">¥{filament.price}/卷</span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <button
                    onClick={() => loadUsageHistory(filament.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    使用记录
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(filament)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(filament.id)}
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingFilament ? '编辑耗材' : '添加耗材'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌 *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Creality, eSun..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型号 *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. PLA+, Hyper PLA..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {FILAMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">颜色 *</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. 白色, 黑色..."
                    />
                    <input
                      type="color"
                      value={formData.color_hex}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">直径 (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.diameter}
                    onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">初始重量 (g)</label>
                  <input
                    type="number"
                    value={formData.initial_weight}
                    onChange={(e) => setFormData({ ...formData, initial_weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前重量 (g)</label>
                  <input
                    type="number"
                    value={formData.current_weight}
                    onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 (¥)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="单价"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">使用中</option>
                    <option value="empty">已用完</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">购买链接</label>
                <input
                  type="url"
                  value={formData.purchase_link}
                  onChange={(e) => setFormData({ ...formData, purchase_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="淘宝/京东链接..."
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">打印效果评价</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <RatingInput
                    label="附着力"
                    value={formData.adhesion_rating}
                    onChange={(v) => setFormData({ ...formData, adhesion_rating: v })}
                  />
                  <RatingInput
                    label="强度"
                    value={formData.strength_rating}
                    onChange={(v) => setFormData({ ...formData, strength_rating: v })}
                  />
                  <RatingInput
                    label="抗翘边"
                    value={formData.warping_rating}
                    onChange={(v) => setFormData({ ...formData, warping_rating: v })}
                  />
                  <RatingInput
                    label="打印质量"
                    value={formData.quality_rating}
                    onChange={(v) => setFormData({ ...formData, quality_rating: v })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用评价</label>
                <textarea
                  rows={3}
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="记录使用感受、适合的场景、注意事项..."
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingFilament ? '保存修改' : '添加耗材'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">耗材使用记录</h2>
              <button
                onClick={() => { setShowHistory(null); setUsageHistory([]); }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {usageHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无使用记录</p>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map(record => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{record.name}</span>
                        <span className="text-sm text-gray-500">
                          {record.print_date || record.created_at?.split('T')[0]}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        使用 {record.filament_used}g · 耗时 {record.print_duration}分钟
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star.toString())}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}