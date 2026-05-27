import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Layers, Thermometer, Zap, Star, Plus, Check, X, AlertTriangle } from 'lucide-react';
import { projectsAPI, costsAPI } from '../services/api';

const FAILURE_TYPES = [
  { value: 'warping', label: '翘边', icon: '📏' },
  { value: 'stringing', label: '拉丝/回抽问题', icon: '🧵' },
  { value: 'layer_shift', label: '层错位', icon: '↔️' },
  { value: 'nozzle_clog', label: '喷嘴堵塞', icon: '🚫' },
  { value: 'bed_adhesion', label: '热床粘附问题', icon: '📐' },
  { value: 'under_extrusion', label: '挤出不足', icon: '📉' },
  { value: 'over_extrusion', label: '挤出过多', icon: '📈' },
  { value: 'other', label: '其他', icon: '❓' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [failures, setFailures] = useState([]);
  const [costInfo, setCostInfo] = useState(null);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureForm, setFailureForm] = useState({
    failure_type: 'warping',
    description: '',
    root_cause: '',
    solution: '',
    resolved: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projectRes, failuresRes, costRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getFailures(id),
        costsAPI.calculateProject(id),
      ]);
      setProject(projectRes.data);
      setFailures(failuresRes.data);
      setCostInfo(costRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFailure = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.createFailure(id, failureForm);
      loadData();
      setShowFailureModal(false);
      setFailureForm({
        failure_type: 'warping',
        description: '',
        root_cause: '',
        solution: '',
        resolved: false,
      });
    } catch (error) {
      console.error('Error adding failure:', error);
    }
  };

  const toggleFailureResolved = async (failure) => {
    try {
      await projectsAPI.updateFailure(failure.id, { ...failure, resolved: !failure.resolved });
      loadData();
    } catch (error) {
      console.error('Error updating failure:', error);
    }
  };

  const deleteFailure = async (failureId) => {
    if (window.confirm('确定要删除这条失败记录吗？')) {
      try {
        await projectsAPI.deleteFailure(failureId);
        loadData();
      } catch (error) {
        console.error('Error deleting failure:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">项目不存在</div>;
  }

  const getFailureLabel = (type) => {
    const ft = FAILURE_TYPES.find(f => f.value === type);
    return ft ? `${ft.icon} ${ft.label}` : type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-sm text-gray-500">打印日期：{project.print_date || project.created_at?.split('T')[0]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">项目信息</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem icon={<Layers className="w-4 h-4" />} label="打印机" value={project.printer_name || '未指定'} />
              <InfoItem icon={<Layers className="w-4 h-4" />} label="耗材" value={project.filament_brand ? `${project.filament_brand} - ${project.filament_color}` : '未指定'} />
              <InfoItem icon={<Clock className="w-4 h-4" />} label="打印时长" value={project.print_duration ? `${project.print_duration} 分钟` : '未记录'} />
              <InfoItem icon={<Layers className="w-4 h-4" />} label="耗材使用" value={`${project.filament_used || 0}g`} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">切片参数</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem icon={<Layers className="w-4 h-4" />} label="层厚" value={`${project.layer_height || '-'} mm`} />
              <InfoItem icon={<Layers className="w-4 h-4" />} label="填充率" value={`${project.infill_percentage || '-'}%`} />
              <InfoItem icon={<Thermometer className="w-4 h-4" />} label="喷嘴温度" value={`${project.nozzle_temp || '-'}°C`} />
              <InfoItem icon={<Thermometer className="w-4 h-4" />} label="热床温度" value={`${project.bed_temp || '-'}°C`} />
              <InfoItem icon={<Zap className="w-4 h-4" />} label="打印速度" value={`${project.print_speed || '-'} mm/s`} />
              <InfoItem icon={<Zap className="w-4 h-4" />} label="回抽距离" value={`${project.retraction_distance || '-'} mm`} />
              <InfoItem icon={<Layers className="w-4 h-4" />} label="支撑" value={project.support_enabled ? '启用' : '禁用'} />
              <InfoItem icon={<Star className="w-4 h-4" />} label="成功率" value={`${project.success_rate || '-'}%`} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">失败记录与解决方案</h2>
              <button
                onClick={() => setShowFailureModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加记录</span>
              </button>
            </div>
            
            {failures.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无失败记录</p>
            ) : (
              <div className="space-y-4">
                {failures.map(failure => (
                  <div key={failure.id} className={`p-4 rounded-lg border ${failure.resolved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{getFailureLabel(failure.failure_type)}</span>
                          {failure.resolved && (
                            <span className="px-2 py-0.5 bg-green-200 text-green-700 text-xs rounded-full">已解决</span>
                          )}
                        </div>
                        {failure.description && (
                          <p className="mt-2 text-sm text-gray-600">问题描述：{failure.description}</p>
                        )}
                        {failure.root_cause && (
                          <p className="mt-1 text-sm text-gray-600">根本原因：{failure.root_cause}</p>
                        )}
                        {failure.solution && (
                          <p className="mt-1 text-sm text-gray-600">解决方案：{failure.solution}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFailureResolved(failure)}
                          className={`p-1.5 rounded-lg transition-colors ${failure.resolved ? 'text-gray-400 hover:text-gray-600' : 'text-green-500 hover:text-green-600'}`}
                          title={failure.resolved ? '标记为未解决' : '标记为已解决'}
                        >
                          {failure.resolved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteFailure(failure.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {project.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">备注</h2>
              <p className="text-gray-600">{project.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">满意度评分</h2>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= project.satisfaction_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {project.satisfaction_rating}/5 星
            </p>
          </div>

          {costInfo && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">成本估算</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">耗材费用</span>
                  <span className="font-medium">¥{costInfo.breakdown.filament_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">电费</span>
                  <span className="font-medium">¥{costInfo.breakdown.electricity_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">设备磨损分摊</span>
                  <span className="font-medium">¥{costInfo.breakdown.wear_cost}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">总成本</span>
                    <span className="font-bold text-lg text-gray-800">¥{costInfo.total_cost}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">建议定价</span>
                    <span className="font-bold text-xl text-blue-600">¥{costInfo.suggested_price}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">含 {costInfo.settings_used.markup_percentage}% 利润加成</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">STL来源</h2>
            {project.stl_source ? (
              <p className="text-gray-600">{project.stl_source}</p>
            ) : (
              <p className="text-gray-500">未记录</p>
            )}
          </div>
        </div>
      </div>

      {showFailureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">添加失败记录</h2>
            </div>
            <form onSubmit={handleAddFailure} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">失败类型 *</label>
                <select
                  required
                  value={failureForm.failure_type}
                  onChange={(e) => setFailureForm({ ...failureForm, failure_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FAILURE_TYPES.map(ft => (
                    <option key={ft.value} value={ft.value}>{ft.icon} {ft.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
                <textarea
                  rows={2}
                  value={failureForm.description}
                  onChange={(e) => setFailureForm({ ...failureForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述遇到的问题..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">根本原因分析</label>
                <textarea
                  rows={2}
                  value={failureForm.root_cause}
                  onChange={(e) => setFailureForm({ ...failureForm, root_cause: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="分析问题的根本原因..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解决方案</label>
                <textarea
                  rows={2}
                  value={failureForm.solution}
                  onChange={(e) => setFailureForm({ ...failureForm, solution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="记录解决问题的方法..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="resolved"
                  checked={failureForm.resolved}
                  onChange={(e) => setFailureForm({ ...failureForm, resolved: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="resolved" className="ml-2 text-sm text-gray-700">问题已解决</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFailureModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 text-gray-500 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium text-gray-800 text-sm">{value}</p>
    </div>
  );
}