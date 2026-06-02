import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Filter, CheckCircle, Clock, AlertTriangle, Circle, BarChart3, TrendingUp, Users, Edit2, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useProjectStore } from '../../store/useProjectStore';
import type { Milestone, MilestoneStatus, KPIRecord } from '../../types';
import { MILESTONE_STATUS_OPTIONS } from '../../utils/constants';
import { getStatusLabel, getStatusColor, formatDate, calculateMilestoneCompletionRate } from '../../utils/helpers';

export default function MilestoneList() {
  const { projectId } = useParams<{ projectId: string }>();
  const projects = useProjectStore((s) => s.projects);
  const addMilestone = useProjectStore((s) => s.addMilestone);
  const updateMilestone = useProjectStore((s) => s.updateMilestone);
  const deleteMilestone = useProjectStore((s) => s.deleteMilestone);
  const addKPIRecord = useProjectStore((s) => s.addKPIRecord);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>(projectId || 'all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ projectId: string; milestoneId: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'milestones' | 'kpi'>('milestones');

  const [milestoneForm, setMilestoneForm] = useState({
    projectId: projectFilter === 'all' ? projects[0]?.id || '' : projectFilter,
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    status: 'pending' as MilestoneStatus,
  });

  const [kpiForm, setKpiForm] = useState({
    projectId: projectFilter === 'all' ? projects[0]?.id || '' : projectFilter,
    date: new Date().toISOString().split('T')[0],
    userCount: 0,
    revenue: 0,
    financingProgress: 0,
  });

  const allMilestones = projects.flatMap((p) =>
    p.milestones.map((m) => ({ ...m, projectName: p.name }))
  );

  const filteredMilestones = allMilestones.filter((m) => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchProject = projectFilter === 'all' || m.projectId === projectFilter;
    return matchStatus && matchProject;
  });

  const selectedProject = projects.find((p) => p.id === projectFilter);
  const kpiRecords = selectedProject?.kpiRecords || [];
  const allKpiRecords = projects.flatMap((p) =>
    p.kpiRecords.map((k) => ({ ...k, projectName: p.name }))
  );

  const kpiChartData = kpiRecords.map((k) => ({
    date: formatDate(k.date),
    用户数: k.userCount,
    收入: k.revenue / 1000,
    融资进度: k.financingProgress,
  }));

  const handleAddMilestone = () => {
    if (!milestoneForm.title.trim()) return;
    addMilestone(milestoneForm.projectId, {
      projectId: milestoneForm.projectId,
      title: milestoneForm.title,
      description: milestoneForm.description,
      targetDate: milestoneForm.targetDate,
      status: milestoneForm.status,
    });
    setIsAddModalOpen(false);
    setMilestoneForm({
      projectId: projectFilter === 'all' ? projects[0]?.id || '' : projectFilter,
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
  };

  const handleAddKPI = () => {
    addKPIRecord(kpiForm.projectId, {
      projectId: kpiForm.projectId,
      date: kpiForm.date,
      userCount: kpiForm.userCount,
      revenue: kpiForm.revenue,
      financingProgress: kpiForm.financingProgress,
    });
    setIsKPIModalOpen(false);
  };

  const handleStatusChange = (projectId: string, milestoneId: string, status: MilestoneStatus) => {
    const updates: Partial<Milestone> = { status };
    if (status === 'completed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    updateMilestone(projectId, milestoneId, updates);
  };

  const statusIcons: Record<string, React.ElementType> = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle,
    delayed: AlertTriangle,
  };

  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter((m) => m.status === 'completed').length;
  const inProgressMilestones = allMilestones.filter((m) => m.status === 'in_progress').length;
  const delayedMilestones = allMilestones.filter((m) => m.status === 'delayed').length;

  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">里程碑和目标管理</h1>
          <p className="text-slate-500 mt-1">追踪项目里程碑进度和KPI指标</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'milestones' ? (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增里程碑
            </Button>
          ) : (
            <Button onClick={() => setIsKPIModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              记录KPI
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalMilestones}</p>
                <p className="text-sm text-slate-500">总里程碑</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedMilestones}</p>
                <p className="text-sm text-slate-500">已完成</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{inProgressMilestones}</p>
                <p className="text-sm text-slate-500">进行中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
                <p className="text-sm text-slate-500">完成率</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {[
          { key: 'milestones', label: '里程碑管理', icon: CheckCircle },
          { key: 'kpi', label: 'KPI指标', icon: BarChart3 },
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

      {activeTab === 'milestones' ? (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <Select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    options={[
                      { value: 'all', label: '全部项目' },
                      ...projects.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: '全部状态' },
                      ...MILESTONE_STATUS_OPTIONS,
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredMilestones.map((milestone) => {
              const StatusIcon = statusIcons[milestone.status];
              const statusColor = getStatusColor(milestone.status, MILESTONE_STATUS_OPTIONS);
              const statusLabel = getStatusLabel(milestone.status, MILESTONE_STATUS_OPTIONS);

              return (
                <Card key={milestone.id} hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            milestone.status === 'completed'
                              ? 'bg-green-100'
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-100'
                              : milestone.status === 'delayed'
                              ? 'bg-red-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          <StatusIcon
                            className={`w-5 h-5 ${
                              milestone.status === 'completed'
                                ? 'text-green-600'
                                : milestone.status === 'in_progress'
                                ? 'text-blue-600'
                                : milestone.status === 'delayed'
                                ? 'text-red-600'
                                : 'text-slate-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                            <Badge variant="info">{milestone.projectName}</Badge>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>目标日期：{formatDate(milestone.targetDate)}</span>
                            {milestone.completedDate && (
                              <span className="text-green-600">
                                完成日期：{formatDate(milestone.completedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={milestone.status}
                          onChange={(e) =>
                            handleStatusChange(milestone.projectId, milestone.id, e.target.value as MilestoneStatus)
                          }
                          options={MILESTONE_STATUS_OPTIONS}
                          className="w-28 !py-1.5 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirm({
                              projectId: milestone.projectId,
                              milestoneId: milestone.id,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredMilestones.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-slate-400 mb-2">
                    <CheckCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-slate-500">暂无里程碑记录</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <>
          {projectFilter !== 'all' ? (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedProject?.name} - KPI趋势
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpiChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="用户数"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="收入"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="融资进度"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">KPI记录历史</h3>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">日期</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">用户数</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">收入(元)</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">融资进度(%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiRecords.map((record) => (
                          <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-700">{formatDate(record.date)}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{record.userCount}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">¥{record.revenue.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    style={{ width: `${record.financingProgress}%` }}
                                  />
                                </div>
                                <span className="text-slate-700">{record.financingProgress}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {kpiRecords.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">
                              暂无KPI记录
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 mb-2">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-slate-500">请选择一个项目查看KPI数据</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增里程碑"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddMilestone}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="所属项目"
            value={milestoneForm.projectId}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, projectId: e.target.value })}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="里程碑名称"
            placeholder="请输入里程碑名称"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="目标日期"
              type="date"
              value={milestoneForm.targetDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
            />
            <Select
              label="状态"
              value={milestoneForm.status}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value as MilestoneStatus })}
              options={MILESTONE_STATUS_OPTIONS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="请输入里程碑描述..."
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isKPIModalOpen}
        onClose={() => setIsKPIModalOpen(false)}
        title="记录KPI数据"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsKPIModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddKPI}>确认记录</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="所属项目"
            value={kpiForm.projectId}
            onChange={(e) => setKpiForm({ ...kpiForm, projectId: e.target.value })}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="记录日期"
            type="date"
            value={kpiForm.date}
            onChange={(e) => setKpiForm({ ...kpiForm, date: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="用户数"
              type="number"
              value={kpiForm.userCount}
              onChange={(e) => setKpiForm({ ...kpiForm, userCount: Number(e.target.value) })}
            />
            <Input
              label="收入(元)"
              type="number"
              value={kpiForm.revenue}
              onChange={(e) => setKpiForm({ ...kpiForm, revenue: Number(e.target.value) })}
            />
            <Input
              label="融资进度(%)"
              type="number"
              min={0}
              max={100}
              value={kpiForm.financingProgress}
              onChange={(e) => setKpiForm({ ...kpiForm, financingProgress: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) {
                  deleteMilestone(deleteConfirm.projectId, deleteConfirm.milestoneId);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该里程碑吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
