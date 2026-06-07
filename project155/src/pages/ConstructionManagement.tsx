import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { GanttChart, GanttChartDataItem, TASK_TYPE_COLORS, TASK_TYPE_NAMES } from '@/components/charts/GanttChart';
import { BarChart, BarChartDataItem } from '@/components/charts/BarChart';
import { useConstructionStore } from '@/store/useConstructionStore';
import { ConstructionTaskStatus, IssueSeverity, IssueStatus, ConstructionTaskType } from '@/types';
import { Calendar, Clock, AlertTriangle, CheckCircle, Timer, AlertCircle, XCircle, Plus } from 'lucide-react';

const STATUS_TEXT: Record<ConstructionTaskStatus, string> = {
  'pending': '待开始',
  'in-progress': '进行中',
  'completed': '已完成',
  'delayed': '已延期',
};

const STATUS_VARIANT: Record<ConstructionTaskStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  'pending': 'default',
  'in-progress': 'success',
  'completed': 'success',
  'delayed': 'danger',
};

const SEVERITY_TEXT: Record<IssueSeverity, string> = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'critical': '严重',
};

const SEVERITY_VARIANT: Record<IssueSeverity, 'default' | 'success' | 'warning' | 'danger'> = {
  'low': 'default',
  'medium': 'warning',
  'high': 'danger',
  'critical': 'danger',
};

const ISSUE_STATUS_TEXT: Record<IssueStatus, string> = {
  'open': '待处理',
  'in-progress': '处理中',
  'resolved': '已解决',
  'closed': '已关闭',
};

const ISSUE_STATUS_VARIANT: Record<IssueStatus, 'default' | 'success' | 'warning' | 'danger' | 'outline'> = {
  'open': 'warning',
  'in-progress': 'default',
  'resolved': 'success',
  'closed': 'outline',
};

const TASK_TYPE_OPTIONS: { value: ConstructionTaskType; label: string }[] = [
  { value: 'waterproof', label: '防水' },
  { value: 'electrical', label: '电路' },
  { value: 'tiling', label: '瓦工' },
  { value: 'carpentry', label: '木工' },
  { value: 'painting', label: '油漆' },
  { value: 'soft-decoration', label: '软装' },
];

export default function ConstructionManagement() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('schedule');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'waterproof' as ConstructionTaskType,
    plannedStartDate: '',
    plannedEndDate: '',
    assignee: '',
  });
  const { constructionTasks, issues, getTaskProgressByProjectId, addConstructionTask } = useConstructionStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('newTask') === 'true') {
      setIsModalOpen(true);
      params.delete('newTask');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  if (!id) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到项目ID</h2>
            <p className="text-gray-500">请从项目列表中选择一个项目查看施工进度</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const projectTasks = constructionTasks.filter(t => t.projectId === id);
  const projectIssues = issues.filter(i => i.projectId === id);

  const ganttData: GanttChartDataItem[] = projectTasks.map(task => ({
    id: task.id,
    name: task.name,
    type: task.type,
    plannedStartDate: task.plannedStartDate,
    plannedEndDate: task.plannedEndDate,
    actualStartDate: task.actualStartDate,
    actualEndDate: task.actualEndDate,
    progress: task.progress,
  }));

  const progressCompareData: BarChartDataItem[] = projectTasks.map(task => ({
    name: task.name,
    budget: task.progress,
    actual: calculateActualProgress(task),
  }));

  const overallProgress = getTaskProgressByProjectId(id);
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress').length;
  const delayedTasks = projectTasks.filter(t => t.status === 'delayed').length;
  const pendingTasks = projectTasks.filter(t => t.status === 'pending').length;

  const openIssues = projectIssues.filter(i => i.status === 'open').length;
  const inProgressIssues = projectIssues.filter(i => i.status === 'in-progress').length;
  const criticalIssues = projectIssues.filter(i => i.severity === 'critical').length;

  function calculateActualProgress(task: typeof projectTasks[0]): number {
    if (task.status === 'completed') return 100;
    if (task.status === 'pending') return 0;
    
    const today = new Date();
    const plannedStart = new Date(task.plannedStartDate);
    const plannedEnd = new Date(task.plannedEndDate);
    const plannedDuration = plannedEnd.getTime() - plannedStart.getTime();
    
    if (plannedDuration === 0) return task.progress;
    
    const elapsed = today.getTime() - plannedStart.getTime();
    const expectedProgress = Math.min(Math.max((elapsed / plannedDuration) * 100, 0), 100);
    
    return Math.round(expectedProgress);
  }

  function getDaysDiff(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getTaskDuration(task: typeof projectTasks[0]): string {
    const days = getDaysDiff(task.plannedStartDate, task.plannedEndDate) + 1;
    return `${days} 天`;
  }

  function getDelayDays(task: typeof projectTasks[0]): number | null {
    if (task.status !== 'delayed') return null;
    const today = new Date();
    const plannedEnd = new Date(task.plannedEndDate);
    if (today <= plannedEnd) return null;
    return getDaysDiff(task.plannedEndDate, today.toISOString().split('T')[0]);
  }

  function getSeverityIcon(severity: IssueSeverity) {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  }

  function handleAddTask() {
    setIsModalOpen(true);
    setFormData({
      name: '',
      type: 'waterproof',
      plannedStartDate: '',
      plannedEndDate: '',
      assignee: '',
    });
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    
    addConstructionTask({
      projectId: id,
      name: formData.name,
      type: formData.type,
      plannedStartDate: formData.plannedStartDate,
      plannedEndDate: formData.plannedEndDate,
      progress: 0,
      status: 'pending',
      dependencies: [],
      assignee: formData.assignee || undefined,
    });
    
    setIsModalOpen(false);
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">施工进度</h1>
            <p className="text-gray-500 mt-1">实时追踪项目施工进度和质量问题</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="w-20 h-20 relative mx-auto mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${overallProgress * 2.2} 220`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">总进度</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-gray-500">已完成</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                <p className="text-sm text-gray-500">进行中</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{delayedTasks}</p>
                <p className="text-sm text-gray-500">已延期</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{pendingTasks}</p>
                <p className="text-sm text-gray-500">待开始</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schedule">计划时间表</TabsTrigger>
            <TabsTrigger value="comparison">进度对比</TabsTrigger>
            <TabsTrigger value="issues">
              问题记录
              {(openIssues > 0 || inProgressIssues > 0) && (
                <Badge variant="danger" className="ml-2">
                  {openIssues + inProgressIssues}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleAddTask}>
                <Plus className="w-4 h-4 mr-2" />
                新增任务
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>施工甘特图</CardTitle>
                <CardDescription>直观展示各任务的计划与实际进度</CardDescription>
              </CardHeader>
              <CardContent>
                <GanttChart
                  data={ganttData}
                  width={900}
                  height={500}
                  showTodayLine={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>任务清单</CardTitle>
                <CardDescription>共 {projectTasks.length} 项施工任务</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>负责人</TableHead>
                      <TableHead>计划时间</TableHead>
                      <TableHead>工期</TableHead>
                      <TableHead>进度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTasks.map(task => {
                      const delayDays = getDelayDays(task);
                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: TASK_TYPE_COLORS[task.type] || '#6B7280' }}
                              />
                              {task.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {TASK_TYPE_NAMES[task.type] || task.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{task.assignee}</TableCell>
                          <TableCell className="text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {task.plannedStartDate} ~ {task.plannedEndDate}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {getTaskDuration(task)}
                            </div>
                          </TableCell>
                          <TableCell className="w-40">
                            <div className="flex items-center gap-2">
                              <Progress value={task.progress} className="flex-1" />
                              <span className="text-sm font-medium text-gray-700 w-10 text-right">
                                {task.progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[task.status]}>
                              {STATUS_TEXT[task.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {delayDays !== null && delayDays > 0 && (
                              <span className="text-sm text-red-500 flex items-center gap-1">
                                <Timer className="w-4 h-4" />
                                延期 {delayDays} 天
                              </span>
                            )}
                            {task.status === 'completed' && task.actualEndDate && (
                              <span className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {task.actualEndDate} 完成
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">计划工期</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {getDaysDiff(projectTasks[0]?.plannedStartDate || '2026-01-01', projectTasks[projectTasks.length - 1]?.plannedEndDate || '2026-12-31') + 1} 天
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {projectTasks[0]?.plannedStartDate} ~ {projectTasks[projectTasks.length - 1]?.plannedEndDate}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">已进行天数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {getDaysDiff(projectTasks[0]?.plannedStartDate || new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])} 天
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    占总工期 {((getDaysDiff(projectTasks[0]?.plannedStartDate || '2026-01-01', new Date().toISOString().split('T')[0]) / (getDaysDiff(projectTasks[0]?.plannedStartDate || '2026-01-01', projectTasks[projectTasks.length - 1]?.plannedEndDate || '2026-12-31') + 1)) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">预计剩余天数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.max(0, getDaysDiff(new Date().toISOString().split('T')[0], projectTasks[projectTasks.length - 1]?.plannedEndDate || '2026-12-31'))} 天
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    预计完成日期 {projectTasks[projectTasks.length - 1]?.plannedEndDate}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>计划进度 vs 实际进度</CardTitle>
                <CardDescription>各任务的预期进度与实际完成情况对比</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={progressCompareData.map(d => ({ ...d, name: d.name.length > 6 ? d.name.slice(0, 6) + '...' : d.name }))}
                  width={800}
                  height={400}
                  yAxisLabel="进度（%）"
                />
                <p className="text-xs text-gray-500 mt-4 text-center">
                  注：预算代表预期进度，实际代表当前完成进度。红色标记表示进度滞后。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>进度偏差分析</CardTitle>
                <CardDescription>分析各任务的进度偏差情况</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务名称</TableHead>
                      <TableHead>预期进度</TableHead>
                      <TableHead>实际进度</TableHead>
                      <TableHead>偏差</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>建议措施</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTasks.map(task => {
                      const expectedProgress = calculateActualProgress(task);
                      const actualProgress = task.progress;
                      const variance = actualProgress - expectedProgress;
                      const isBehind = variance < -5;
                      const isAhead = variance > 5;
                      
                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: TASK_TYPE_COLORS[task.type] || '#6B7280' }}
                              />
                              {task.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{expectedProgress}%</TableCell>
                          <TableCell className="font-medium">{actualProgress}%</TableCell>
                          <TableCell>
                            <span className={`font-medium ${isBehind ? 'text-red-600' : isAhead ? 'text-green-600' : 'text-gray-600'}`}>
                              {variance > 0 ? '+' : ''}{variance}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {isBehind ? (
                              <Badge variant="danger">滞后</Badge>
                            ) : isAhead ? (
                              <Badge variant="success">超前</Badge>
                            ) : (
                              <Badge variant="default">正常</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {isBehind && task.status === 'in-progress' && '增加人力投入，优化施工流程'}
                            {isBehind && task.status === 'pending' && '尽快启动，避免影响后续任务'}
                            {isAhead && '保持当前节奏，注意质量控制'}
                            {!isBehind && !isAhead && '按计划推进'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {criticalIssues > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    紧急问题
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    有 {criticalIssues} 个严重问题需要立即处理
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {projectIssues
                      .filter(i => i.severity === 'critical')
                      .map(issue => (
                        <div key={issue.id} className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                {issue.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                            </div>
                            <Badge variant="danger">严重</Badge>
                          </div>
                          <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                            <span className="font-medium">整改要求：</span>{issue.rectificationRequired || '请尽快制定整改方案'}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{projectIssues.length}</p>
                    <p className="text-sm text-gray-500 mt-1">总问题数</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{openIssues}</p>
                    <p className="text-sm text-gray-500 mt-1">待处理</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{inProgressIssues}</p>
                    <p className="text-sm text-gray-500 mt-1">处理中</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {projectIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">已解决</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>质量问题清单</CardTitle>
                <CardDescription>记录施工过程中的所有质量问题</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>严重程度</TableHead>
                      <TableHead>问题标题</TableHead>
                      <TableHead>关联任务</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>整改要求</TableHead>
                      <TableHead>上报日期</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectIssues
                      .sort((a, b) => {
                        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                        const statusOrder = { open: 0, 'in-progress': 1, resolved: 2, closed: 3 };
                        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                          return severityOrder[a.severity] - severityOrder[b.severity];
                        }
                        return statusOrder[a.status] - statusOrder[b.status];
                      })
                      .map(issue => {
                        const relatedTask = projectTasks.find(t => t.id === issue.taskId);
                        return (
                          <TableRow key={issue.id} className={issue.severity === 'critical' ? 'bg-red-50' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(issue.severity)}
                                <Badge variant={SEVERITY_VARIANT[issue.severity]}>
                                  {SEVERITY_TEXT[issue.severity]}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">{issue.title}</TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {relatedTask?.name || '-'}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={issue.description}>
                              {issue.description}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={issue.rectificationRequired}>
                              {issue.rectificationRequired || '-'}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {issue.createdAt.split('T')[0]}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ISSUE_STATUS_VARIANT[issue.status]}>
                                {ISSUE_STATUS_TEXT[issue.status]}
                              </Badge>
                              {issue.resolvedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  {issue.resolvedAt.split('T')[0]} 解决
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>问题分布统计</CardTitle>
                <CardDescription>按严重程度和状态分类统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">按严重程度</h4>
                    <div className="space-y-3">
                      {(['critical', 'high', 'medium', 'low'] as IssueSeverity[]).map(severity => {
                        const count = projectIssues.filter(i => i.severity === severity).length;
                        const percentage = projectIssues.length > 0 ? (count / projectIssues.length * 100).toFixed(1) : '0';
                        return (
                          <div key={severity}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-2">
                                {getSeverityIcon(severity)}
                                {SEVERITY_TEXT[severity]}
                              </span>
                              <span className="text-gray-600">{count} 项 ({percentage}%)</span>
                            </div>
                            <Progress 
                              value={parseFloat(percentage)} 
                              className={severity === 'critical' || severity === 'high' ? 'bg-red-200' : ''}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">按处理状态</h4>
                    <div className="space-y-3">
                      {(['open', 'in-progress', 'resolved', 'closed'] as IssueStatus[]).map(status => {
                        const count = projectIssues.filter(i => i.status === status).length;
                        const percentage = projectIssues.length > 0 ? (count / projectIssues.length * 100).toFixed(1) : '0';
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-2">
                                {status === 'resolved' || status === 'closed' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Timer className="w-4 h-4 text-yellow-500" />
                                )}
                                {ISSUE_STATUS_TEXT[status]}
                              </span>
                              <span className="text-gray-600">{count} 项 ({percentage}%)</span>
                            </div>
                            <Progress value={parseFloat(percentage)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <ModalHeader onClose={handleCloseModal}>
          <ModalTitle>新增任务</ModalTitle>
          <ModalDescription>请填写新任务的详细信息</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="请输入任务名称"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任务类型 <span className="text-red-500">*</span>
              </label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                required
              >
                {TASK_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划开始日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="plannedStartDate"
                  value={formData.plannedStartDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划结束日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="plannedEndDate"
                  value={formData.plannedEndDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                负责人
              </label>
              <Input
                name="assignee"
                value={formData.assignee}
                onChange={handleFormChange}
                placeholder="请输入负责人姓名"
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              取消
            </Button>
            <Button type="submit">
              确认添加
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </PageLayout>
  );
}
