import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, Users, Calendar, Tag, Phone, FileText, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useProjectStore } from '../../store/useProjectStore';
import type { ProjectStage } from '../../types';
import { STAGE_OPTIONS, TRACK_OPTIONS } from '../../utils/constants';
import { getStatusLabel, getStatusColor, formatDate, calculateMilestoneCompletionRate } from '../../utils/helpers';
import BusinessCanvasEditor from './BusinessCanvasEditor';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useProjectStore((s) => s.getProjectById(id || ''));
  const updateProject = useProjectStore((s) => s.updateProject);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(project);
  const [activeTab, setActiveTab] = useState<'info' | 'canvas' | 'stage'>('info');
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">项目不存在</p>
        <Link to="/projects" className="text-blue-600 hover:underline mt-2 inline-block">
          返回项目列表
        </Link>
      </div>
    );
  }

  const stageLabel = getStatusLabel(project.stage, STAGE_OPTIONS);
  const stageColor = getStatusColor(project.stage, STAGE_OPTIONS);
  const completionRate = calculateMilestoneCompletionRate(project.milestones);

  const handleSave = () => {
    if (editData) {
      updateProject(project.id, editData);
      setIsEditing(false);
    }
  };

  const handleStageChange = (newStage: ProjectStage) => {
    updateProject(project.id, { stage: newStage });
    setIsStageModalOpen(false);
  };

  const stages = [
    { key: 'idea', label: '创意阶段', icon: '💡', desc: '概念验证阶段' },
    { key: 'validation', label: '验证阶段', icon: '🔬', desc: '市场验证阶段' },
    { key: 'development', label: '产品开发', icon: '🔧', desc: '产品研发阶段' },
    { key: 'launch', label: '上市阶段', icon: '🚀', desc: '产品发布阶段' },
    { key: 'growth', label: '增长阶段', icon: '📈', desc: '规模化增长' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === project.stage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${stageColor}`}>
                {stageLabel}
              </span>
              <Badge variant="info">{project.track}</Badge>
            </div>
            <p className="text-slate-500 mt-1">入孵时间：{formatDate(project.joinDate)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                保存
              </Button>
            </>
          ) : (
            <Button onClick={() => { setEditData(project); setIsEditing(true); }}>
              <Edit2 className="w-4 h-4 mr-1" />
              编辑
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {[
          { key: 'info', label: '基本信息', icon: FileText },
          { key: 'canvas', label: '商业模式画布', icon: Target },
          { key: 'stage', label: '发展阶段', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">项目信息</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <Input
                    label="项目名称"
                    value={editData?.name || ''}
                    onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="所属赛道"
                      value={editData?.track || ''}
                      onChange={(e) => setEditData({ ...editData!, track: e.target.value })}
                      options={TRACK_OPTIONS.map((t) => ({ value: t, label: t }))}
                    />
                    <Select
                      label="发展阶段"
                      value={editData?.stage || ''}
                      onChange={(e) => setEditData({ ...editData!, stage: e.target.value as ProjectStage })}
                      options={STAGE_OPTIONS}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="联系方式"
                      value={editData?.contact || ''}
                      onChange={(e) => setEditData({ ...editData!, contact: e.target.value })}
                    />
                    <Input
                      label="入孵时间"
                      type="date"
                      value={editData?.joinDate || ''}
                      onChange={(e) => setEditData({ ...editData!, joinDate: e.target.value })}
                    />
                  </div>
                  <Textarea
                    label="项目简介"
                    rows={4}
                    value={editData?.description || ''}
                    onChange={(e) => setEditData({ ...editData!, description: e.target.value })}
                  />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">赛道</p>
                        <p className="font-medium text-slate-900">{project.track}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">联系方式</p>
                        <p className="font-medium text-slate-900">{project.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">项目简介</p>
                        <p className="font-medium text-slate-700 leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">创始团队</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.foundingTeam.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">进度概览</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${completionRate * 2.51} 251`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-900">{completionRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">里程碑完成率</p>
                </div>
                <Button variant="secondary" className="w-full" onClick={() => navigate(`/milestones/${project.id}`)}>
                  <Target className="w-4 h-4 mr-1" />
                  查看里程碑
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'canvas' && (
        <BusinessCanvasEditor projectId={project.id} canvas={project.businessCanvas} />
      )}

      {activeTab === 'stage' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">发展阶段追踪</h3>
            <Button size="sm" onClick={() => setIsStageModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-1" />
              更新阶段
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {stages.map((stage, index) => {
                  const isActive = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  return (
                    <div key={stage.key} className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10 transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                      >
                        {stage.icon}
                      </div>
                      <div className="mt-4 text-center">
                        <p className={`font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                          {stage.label}
                        </p>
                        <p className={`text-xs mt-1 ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{stages[currentStageIndex].icon}</div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    当前阶段：{stages[currentStageIndex].label}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {stages[currentStageIndex].desc}。请持续推进项目发展，完成本阶段目标后可进入下一阶段。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        title="更新发展阶段"
        size="md"
      >
        <div className="space-y-3">
          {stages.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleStageChange(stage.key as ProjectStage)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                project.stage === stage.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stage.icon}</span>
                <div>
                  <p className="font-medium text-slate-900">{stage.label}</p>
                  <p className="text-sm text-slate-500">{stage.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
