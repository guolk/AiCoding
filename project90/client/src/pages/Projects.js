import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Clock, CheckCircle, XCircle, Play, Star } from 'lucide-react';
import { projectsAPI, printersAPI, filamentsAPI } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stl_source: '',
    printer_id: '',
    filament_id: '',
    filament_used: '',
    print_duration: '',
    layer_height: '0.2',
    infill_percentage: '20',
    nozzle_temp: '200',
    bed_temp: '60',
    print_speed: '60',
    retraction_distance: '2',
    support_enabled: false,
    status: 'completed',
    success_rate: '100',
    satisfaction_rating: '5',
    notes: '',
    print_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, printersRes, filamentsRes] = await Promise.all([
        projectsAPI.getAll(),
        printersAPI.getAll(),
        filamentsAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setPrinters(printersRes.data);
      setFilaments(filamentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        printer_id: formData.printer_id || null,
        filament_id: formData.filament_id || null,
        filament_used: parseFloat(formData.filament_used) || 0,
        print_duration: parseFloat(formData.print_duration) || 0,
        layer_height: parseFloat(formData.layer_height),
        infill_percentage: parseFloat(formData.infill_percentage),
        nozzle_temp: parseFloat(formData.nozzle_temp),
        bed_temp: parseFloat(formData.bed_temp),
        print_speed: parseFloat(formData.print_speed),
        retraction_distance: parseFloat(formData.retraction_distance),
        success_rate: parseFloat(formData.success_rate),
        satisfaction_rating: parseInt(formData.satisfaction_rating),
      };

      if (editingProject) {
        await projectsAPI.update(editingProject.id, data);
      } else {
        await projectsAPI.create(data);
      }
      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      stl_source: project.stl_source || '',
      printer_id: project.printer_id || '',
      filament_id: project.filament_id || '',
      filament_used: project.filament_used || '',
      print_duration: project.print_duration || '',
      layer_height: project.layer_height || '0.2',
      infill_percentage: project.infill_percentage || '20',
      nozzle_temp: project.nozzle_temp || '200',
      bed_temp: project.bed_temp || '60',
      print_speed: project.print_speed || '60',
      retraction_distance: project.retraction_distance || '2',
      support_enabled: project.support_enabled ? true : false,
      status: project.status,
      success_rate: project.success_rate || '100',
      satisfaction_rating: project.satisfaction_rating || '5',
      notes: project.notes || '',
      print_date: project.print_date || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个打印项目吗？')) {
      try {
        await projectsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      stl_source: '',
      printer_id: '',
      filament_id: '',
      filament_used: '',
      print_duration: '',
      layer_height: '0.2',
      infill_percentage: '20',
      nozzle_temp: '200',
      bed_temp: '60',
      print_speed: '60',
      retraction_distance: '2',
      support_enabled: false,
      status: 'completed',
      success_rate: '100',
      satisfaction_rating: '5',
      notes: '',
      print_date: new Date().toISOString().split('T')[0],
    });
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">打印项目管理</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新建项目</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="all">全部状态</option>
            <option value="pending">待打印</option>
            <option value="printing">打印中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-gray-500">暂无打印项目</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            创建第一个打印项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                  </Link>
                  <StatusBadge status={project.status} />
                </div>
                
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>打印机：</span>
                    <span className="font-medium">{project.printer_name || '未指定'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>耗材：</span>
                    <span className="font-medium">
                      {project.filament_brand ? `${project.filament_brand} ${project.filament_color}` : '未指定'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{project.print_duration ? `${project.print_duration} 分钟` : '未记录'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>耗材使用：</span>
                    <span className="font-medium">{project.filament_used || 0}g</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= project.satisfaction_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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
                {editingProject ? '编辑打印项目' : '新建打印项目'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">STL来源</label>
                  <input
                    type="text"
                    value={formData.stl_source}
                    onChange={(e) => setFormData({ ...formData, stl_source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Thingiverse, Cults, 自制等"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">打印日期</label>
                  <input
                    type="date"
                    value={formData.print_date}
                    onChange={(e) => setFormData({ ...formData, print_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">打印机</label>
                  <select
                    value={formData.printer_id}
                    onChange={(e) => setFormData({ ...formData, printer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择打印机</option>
                    {printers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">耗材</label>
                  <select
                    value={formData.filament_id}
                    onChange={(e) => setFormData({ ...formData, filament_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择耗材</option>
                    {filaments.map(f => (
                      <option key={f.id} value={f.id}>{f.brand} {f.model} - {f.color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">耗材使用 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.filament_used}
                    onChange={(e) => setFormData({ ...formData, filament_used: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">打印时长 (分钟)</label>
                  <input
                    type="number"
                    value={formData.print_duration}
                    onChange={(e) => setFormData({ ...formData, print_duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">待打印</option>
                    <option value="printing">打印中</option>
                    <option value="completed">已完成</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">成功率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.success_rate}
                    onChange={(e) => setFormData({ ...formData, success_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">层厚 (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.layer_height}
                    onChange={(e) => setFormData({ ...formData, layer_height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">填充率 (%)</label>
                  <input
                    type="number"
                    value={formData.infill_percentage}
                    onChange={(e) => setFormData({ ...formData, infill_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">喷嘴温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.nozzle_temp}
                    onChange={(e) => setFormData({ ...formData, nozzle_temp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">热床温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.bed_temp}
                    onChange={(e) => setFormData({ ...formData, bed_temp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">打印速度 (mm/s)</label>
                  <input
                    type="number"
                    value={formData.print_speed}
                    onChange={(e) => setFormData({ ...formData, print_speed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">回抽距离 (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.retraction_distance}
                    onChange={(e) => setFormData({ ...formData, retraction_distance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">满意度</label>
                  <select
                    value={formData.satisfaction_rating}
                    onChange={(e) => setFormData({ ...formData, satisfaction_rating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.support_enabled}
                    onChange={(e) => setFormData({ ...formData, support_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">启用支撑</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="记录打印过程中的注意事项..."
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? '保存修改' : '创建项目'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    printing: 'bg-blue-100 text-blue-700',
    pending: 'bg-gray-100 text-gray-700',
  };

  const icons = {
    completed: <CheckCircle className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    printing: <Play className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
  };

  const labels = {
    completed: '已完成',
    failed: '失败',
    printing: '打印中',
    pending: '待打印',
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {icons[status]}
      <span>{labels[status] || status}</span>
    </span>
  );
}