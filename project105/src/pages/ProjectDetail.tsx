import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Clock, Calendar, AlertTriangle, Camera, Play, CheckCircle2, Circle, Package, Download, Upload } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/common/StatusBadge';
import { formatHours, formatDate, exportToCSV } from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    deleteProject,
    updateProject,
    getProjectSteps,
    updateProjectStep,
    getBOMItems,
    getMissingParts,
    sets,
    addWork,
  } = useAppStore();

  const project = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<'steps' | 'bom' | 'docs'>('steps');

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Clock size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-500 mb-2">项目不存在</h3>
        <button
          onClick={() => navigate('/projects')}
          className="brick-btn-outline"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  const steps = getProjectSteps(project.id);
  const bomItems = getBOMItems(project.id);
  const missingParts = getMissingParts(project.id);
  const completedSteps = steps.filter((s) => s.is_completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const relatedSet = project.related_set_id
    ? sets.find((s) => s.id === project.related_set_id)
    : null;

  const handleStepToggle = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const now = new Date().toISOString();
    updateProjectStep(stepId, {
      is_completed: !step.is_completed,
      completed_at: !step.is_completed ? now : undefined,
    });
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个项目吗？所有步骤和用料清单都将被删除。')) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleCompleteProject = () => {
    if (window.confirm('确定要标记这个项目为已完成吗？')) {
      const now = new Date().toISOString();
      updateProject(project.id, {
        status: 'completed',
        completed_at: now,
      });
    }
  };

  const handleExportBOM = () => {
    const csvData = bomItems.map((item) => ({
      '零件编号': item.part_num,
      '零件名称': item.part_name,
      '颜色': item.color_name,
      '需要数量': item.required_quantity,
      '可用数量': item.available_quantity,
      '缺少数量': Math.max(0, item.required_quantity - item.available_quantity),
    }));
    exportToCSV(csvData, `${project.name}-用料清单`);
  };

  const handleCreateWork = () => {
    const workName = prompt('请输入作品名称:', project.name);
    if (workName) {
      addWork({
        project_id: project.id,
        title: workName,
        description: project.description,
        difficulty_rating: 3,
        satisfaction_rating: 4,
        is_public: false,
      });
      alert('作品已创建！可以在作品展示页面查看和编辑。');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-100 rounded-brick transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} type="project" />
            {relatedSet && (
              <span
                className="text-sm text-lego-blue cursor-pointer hover:underline"
                onClick={() => navigate(`/collection/${relatedSet.id}`)}
              >
                基于 {relatedSet.set_num}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-lego-dark mt-1">
            {project.name}
          </h1>
          <p className="text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.status !== 'completed' && (
            <button
              onClick={handleCompleteProject}
              className="brick-btn-secondary flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>完成项目</span>
            </button>
          )}
          {project.status === 'completed' && (
            <button
              onClick={handleCreateWork}
              className="brick-btn-primary flex items-center gap-2"
            >
              <Camera size={16} />
              <span>发布作品</span>
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-brick transition-colors">
            <Edit2 size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-lego-red rounded-brick transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">进度</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {Math.round(progress)}%
              </h3>
            </div>
            <div className="p-3 rounded-brick bg-lego-blue/10 text-lego-blue">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成步骤</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {completedSteps}/{steps.length}
              </h3>
            </div>
            <div className="p-3 rounded-brick bg-emerald-100 text-emerald-600">
              <Play size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已花费时间</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {formatHours(project.total_hours)}
              </h3>
            </div>
            <div className="p-3 rounded-brick bg-lego-yellow/20 text-amber-700">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">缺件数量</p>
              <h3
                className={`text-2xl font-display font-bold ${
                  missingParts.length > 0 ? 'text-lego-red' : 'text-emerald-600'
                }`}
              >
                {missingParts.length}
              </h3>
            </div>
            <div
              className={`p-3 rounded-brick ${
                missingParts.length > 0
                  ? 'bg-lego-red/10 text-lego-red'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <Package size={24} />
            </div>
          </div>
        </div>
      </div>

      {missingParts.length > 0 && (
        <div className="brick-card p-4 border-lego-yellow/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              <h3 className="font-display font-semibold text-lego-dark">缺件提醒</h3>
            </div>
            <button
              onClick={handleExportBOM}
              className="text-sm text-lego-blue hover:underline"
            >
              导出清单
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingParts.map((part, index) => (
              <div
                key={index}
                className="p-3 bg-amber-50 rounded-brick flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-brick border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: part.color_rgb }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-lego-dark truncate">
                    {part.part_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {part.color_name} · 缺 {part.missing} 个
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="brick-card">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'steps'
                  ? 'text-lego-blue border-b-2 border-lego-blue'
                  : 'text-gray-500 hover:text-lego-dark'
              }`}
            >
              搭建步骤
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'bom'
                  ? 'text-lego-blue border-b-2 border-lego-blue'
                  : 'text-gray-500 hover:text-lego-dark'
              }`}
            >
              用料清单
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'text-lego-blue border-b-2 border-lego-blue'
                  : 'text-gray-500 hover:text-lego-dark'
              }`}
            >
              设计文档
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-brick border-2 transition-all ${
                    step.is_completed
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-gray-100 hover:border-lego-blue/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleStepToggle(step.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        step.is_completed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-lego-blue/20 hover:text-lego-blue'
                      }`}
                    >
                      {step.is_completed ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium ${
                            step.is_completed
                              ? 'text-gray-400 line-through'
                              : 'text-lego-dark'
                          }`}
                        >
                          步骤 {step.step_number}: {step.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            预计: {formatHours(step.estimated_hours)}
                          </span>
                          {step.is_completed && (
                            <span className="text-emerald-600">
                              实际: {formatHours(step.actual_hours)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      {step.photo_url && (
                        <div className="mt-3 w-32 h-24 rounded-brick overflow-hidden">
                          <img
                            src={step.photo_url}
                            alt={step.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {step.completed_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          完成于 {formatDate(step.completed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="text-center py-12">
                  <Clock size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">还没有搭建步骤</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bom' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lego-dark">用料清单</h3>
                <button
                  onClick={handleExportBOM}
                  className="brick-btn-secondary flex items-center gap-2"
                >
                  <Download size={16} />
                  <span>导出CSV</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        零件
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        颜色
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        需要
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        可用
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bomItems.map((item) => {
                      const missing = Math.max(
                        0,
                        item.required_quantity - item.available_quantity
                      );
                      const isOk = missing === 0;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-brick border border-gray-200"
                                style={{ backgroundColor: item.color_rgb }}
                              />
                              <div>
                                <p className="font-medium text-lego-dark">
                                  {item.part_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.part_num}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.color_name}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {item.required_quantity}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={isOk ? 'text-emerald-600' : 'text-lego-red'}
                            >
                              {item.available_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isOk ? (
                              <span className="status-badge bg-emerald-100 text-emerald-700">
                                充足
                              </span>
                            ) : (
                              <span className="status-badge bg-lego-red/10 text-lego-red">
                                缺 {missing}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {bomItems.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">还没有用料清单</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.design_documents.map((doc, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-100 rounded-brick flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 truncate px-2">
                      文档 {index + 1}
                    </span>
                  </div>
                ))}
                <div className="aspect-video border-2 border-dashed border-gray-300 rounded-brick flex flex-col items-center justify-center cursor-pointer hover:border-lego-blue hover:bg-lego-blue/5 transition-all">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">上传文档</span>
                </div>
              </div>
              {project.design_documents.length === 0 && (
                <div className="text-center py-12">
                  <Upload size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">还没有上传设计文档</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
