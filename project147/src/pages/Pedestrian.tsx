import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Users,
  Clock,
  Play,
  Pause,
  MapPin,
  Footprints,
  Coffee,
  MessageCircle,
  PersonStanding,
  Route,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { activityTypeLabels, pathTypeLabels, generateId } from '../../shared/types';
import type {
  PedestrianStudy,
  FlowCount,
  ActivityItem,
  PathItem,
  ActivityType,
} from '../../shared/types';

const activityIcons: Record<ActivityType, React.ReactNode> = {
  walk: <Footprints className="w-4 h-4" />,
  stay: <PersonStanding className="w-4 h-4" />,
  consume: <Coffee className="w-4 h-4" />,
  social: <MessageCircle className="w-4 h-4" />,
};

const COLORS = ['#ea580c', '#0d9488', '#6366f1', '#ec4899'];

export default function Pedestrian() {
  const { pedestrianStudies, projects, activeProjectId, createPedestrianStudy, updatePedestrianStudy, deletePedestrianStudy } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<PedestrianStudy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [formData, setFormData] = useState({
    location: '',
    projectId: '',
    studyDate: new Date().toISOString().slice(0, 10),
    flowCounts: [] as FlowCount[],
    activities: [] as ActivityItem[],
    paths: [] as PathItem[],
  });

  const [newFlowCount, setNewFlowCount] = useState({
    startTime: '08:00',
    endTime: '08:15',
    pedestrianCount: 0,
    bicycleCount: 0,
  });

  const [newActivity, setNewActivity] = useState({
    type: 'walk' as ActivityType,
    count: 0,
    description: '',
  });

  const [newPath, setNewPath] = useState({
    type: 'actual' as const,
    coordinates: '' as string,
  });

  const filteredStudies = activeProjectId
    ? pedestrianStudies.filter((s) => s.projectId === activeProjectId)
    : pedestrianStudies;

  const handleCreate = () => {
    setEditingStudy(null);
    setFormData({
      location: '',
      projectId: activeProjectId || (projects[0]?.id ?? ''),
      studyDate: new Date().toISOString().slice(0, 10),
      flowCounts: [],
      activities: [],
      paths: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (study: PedestrianStudy) => {
    setEditingStudy(study);
    setFormData({
      location: study.location,
      projectId: study.projectId,
      studyDate: study.studyDate.slice(0, 10),
      flowCounts: [...study.flowCounts],
      activities: [...study.activities],
      paths: [...study.paths],
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddFlowCount = () => {
    const flowCount: FlowCount = {
      id: generateId(),
      ...newFlowCount,
    };
    setFormData((prev) => ({
      ...prev,
      flowCounts: [...prev.flowCounts, flowCount],
    }));
    const [hours, minutes] = newFlowCount.startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours, minutes + 15);
    const newStartTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    const newEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes() + 15 > 59 ? (endDate.getMinutes() + 15) % 60 : endDate.getMinutes() + 15).padStart(2, '0')}`;
    setNewFlowCount({
      startTime: newStartTime,
      endTime: newEndTime,
      pedestrianCount: 0,
      bicycleCount: 0,
    });
  };

  const handleRemoveFlowCount = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      flowCounts: prev.flowCounts.filter((f) => f.id !== id),
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.count <= 0) return;
    const activity: ActivityItem = {
      id: generateId(),
      ...newActivity,
    };
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, activity],
    }));
    setNewActivity({ type: 'walk', count: 0, description: '' });
  };

  const handleRemoveActivity = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  };

  const handleAddPath = () => {
    try {
      const coordinates = JSON.parse(newPath.coordinates);
      if (!Array.isArray(coordinates)) throw new Error();
      const path: PathItem = {
        id: generateId(),
        type: newPath.type,
        coordinates,
      };
      setFormData((prev) => ({
        ...prev,
        paths: [...prev.paths, path],
      }));
      setNewPath({ type: 'actual', coordinates: '' });
    } catch {
      alert('请输入有效的坐标数组JSON格式，例如：[{"lat":31.23,"lng":121.45}]');
    }
  };

  const handleRemovePath = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      paths: prev.paths.filter((p) => p.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim() || !formData.projectId) return;

    const studyData = {
      ...formData,
      studyDate: new Date(formData.studyDate).toISOString(),
    };

    if (editingStudy) {
      await updatePedestrianStudy({
        ...editingStudy,
        ...studyData,
      });
    } else {
      await createPedestrianStudy(studyData);
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePedestrianStudy(deleteId);
      setDeleteId(null);
    }
  };

  const getTotalPedestrians = (flows: FlowCount[]) =>
    flows.reduce((sum, f) => sum + f.pedestrianCount, 0);
  const getTotalActivities = (activities: ActivityItem[]) =>
    activities.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">行人活动研究</h1>
          <p className="text-slate-500 font-sans">
            记录人流量观测、活动类型分类和行人路径追踪
          </p>
        </div>
        <button onClick={handleCreate} className="btn-secondary">
          <Plus className="w-5 h-5" />
          新建研究
        </button>
      </div>

      {filteredStudies.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-400" />}
          title="还没有行人研究"
          description="开始记录行人活动数据，包括人流量统计、活动类型和路径追踪。"
          actionLabel="新建研究"
          onAction={handleCreate}
        />
      ) : (
        <div className="space-y-6">
          {filteredStudies.map((study, index) => {
            const chartData = study.flowCounts.map((f) => ({
              time: f.startTime,
              行人: f.pedestrianCount,
              自行车: f.bicycleCount,
            }));

            const pieData = study.activities.map((a) => ({
              name: activityTypeLabels[a.type],
              value: a.count,
            }));

            return (
              <div
                key={study.id}
                className={`card p-6 animate-fade-in-up stagger-${(index % 6) + 1}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <h3 className="font-display text-lg font-semibold text-slate-800">
                        {study.location}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(study.studyDate).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {getTotalPedestrians(study.flowCounts)} 人次
                      </span>
                      <span>
                        项目：{projects.find((p) => p.id === study.projectId)?.title || '未分类'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(study)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(study.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      15分钟人流量统计
                    </h4>
                    <div className="h-56 bg-slate-50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="行人"
                            stroke="#ea580c"
                            strokeWidth={3}
                            dot={{ fill: '#ea580c', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="自行车"
                            stroke="#0d9488"
                            strokeWidth={3}
                            dot={{ fill: '#0d9488', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      活动类型分布
                    </h4>
                    <div className="h-56 bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                      {study.activities.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                fontFamily: 'Inter, sans-serif',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-slate-400 font-sans text-sm">暂无活动数据</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {study.activities.map((activity, i) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-100"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          ></div>
                          <span className="flex items-center gap-1 text-sm text-slate-600 font-sans">
                            {activityIcons[activity.type]}
                            {activityTypeLabels[activity.type]}
                          </span>
                          <span className="ml-auto font-semibold text-slate-800">{activity.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {study.paths.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      路径追踪对比
                    </h4>
                    <div className="h-64 rounded-xl overflow-hidden">
                      <MapContainer
                        center={[study.paths[0]?.coordinates[0]?.lat || 31.2304, study.paths[0]?.coordinates[0]?.lng || 121.4737]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {study.paths.map((path) => (
                          <Polyline
                            key={path.id}
                            positions={path.coordinates.map((c) => [c.lat, c.lng])}
                            color={path.type === 'actual' ? '#ea580c' : '#0d9488'}
                            weight={4}
                            opacity={0.8}
                            dashArray={path.type === 'designed' ? '10, 10' : undefined}
                          />
                        ))}
                      </MapContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-2 text-sm text-slate-600 font-sans">
                        <span className="w-6 h-1 bg-clay-500 rounded"></span>
                        实际路径
                      </span>
                      <span className="flex items-center gap-2 text-sm text-slate-600 font-sans">
                        <span className="w-6 h-1 bg-teal-600 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #0d9488, #0d9488 6px, transparent 6px, transparent 10px)' }}></span>
                        设计路径
                      </span>
                    </div>
                  </div>
                )}

                {study.flowCounts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3">观测记录明细</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-sans">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-slate-500 font-medium">时间段</th>
                            <th className="text-center py-2 px-3 text-slate-500 font-medium">行人</th>
                            <th className="text-center py-2 px-3 text-slate-500 font-medium">自行车</th>
                            <th className="text-right py-2 px-3 text-slate-500 font-medium">总计</th>
                          </tr>
                        </thead>
                        <tbody>
                          {study.flowCounts.map((flow) => (
                            <tr key={flow.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-700">
                                {flow.startTime} - {flow.endTime}
                              </td>
                              <td className="py-2 px-3 text-center text-slate-700">{flow.pedestrianCount}</td>
                              <td className="py-2 px-3 text-center text-slate-700">{flow.bicycleCount}</td>
                              <td className="py-2 px-3 text-right font-semibold text-slate-800">
                                {flow.pedestrianCount + flow.bicycleCount}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-semibold bg-slate-50">
                            <td className="py-2 px-3 text-slate-800">合计</td>
                            <td className="py-2 px-3 text-center text-slate-800">
                              {getTotalPedestrians(study.flowCounts)}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-800">
                              {study.flowCounts.reduce((sum, f) => sum + f.bicycleCount, 0)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-800">
                              {getTotalPedestrians(study.flowCounts) + study.flowCounts.reduce((sum, f) => sum + f.bicycleCount, 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-50" />
          <Dialog.Content className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl overflow-y-auto">
            <div className="bg-white min-h-full shadow-2xl p-6 animate-slide-in-right">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="font-display text-xl font-semibold text-slate-800">
                  {editingStudy ? '编辑行人研究' : '新建行人研究'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label-text">观测地点</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：南京西路/陕西北路交叉口"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label-text">所属项目</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">选择项目</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">观测日期</label>
                    <input
                      type="date"
                      value={formData.studyDate}
                      onChange={(e) => setFormData({ ...formData, studyDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-text mb-0">15分钟人流量统计</label>
                    <div className="flex items-center gap-2">
                      {timerRunning && (
                        <span className="text-sm font-mono text-clay-600 font-semibold">
                          {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!timerRunning) {
                            setTimerRunning(true);
                            const interval = setInterval(() => {
                              setTimerSeconds((s) => {
                                if (s >= 900) {
                                  clearInterval(interval);
                                  setTimerRunning(false);
                                  return 0;
                                }
                                return s + 1;
                              });
                            }, 1000);
                          } else {
                            setTimerRunning(false);
                            setTimerSeconds(0);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-sans transition-colors ${
                          timerRunning
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                        }`}
                      >
                        {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {timerRunning ? ' 停止计时' : ' 开始15分钟计时'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <input
                      type="time"
                      step="900"
                      value={newFlowCount.startTime}
                      onChange={(e) => setNewFlowCount({ ...newFlowCount, startTime: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="time"
                      step="900"
                      value={newFlowCount.endTime}
                      onChange={(e) => setNewFlowCount({ ...newFlowCount, endTime: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="行人数量"
                      value={newFlowCount.pedestrianCount}
                      onChange={(e) => setNewFlowCount({ ...newFlowCount, pedestrianCount: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="自行车"
                      value={newFlowCount.bicycleCount}
                      onChange={(e) => setNewFlowCount({ ...newFlowCount, bicycleCount: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <button type="button" onClick={handleAddFlowCount} className="btn-outline w-full mb-3">
                    <Plus className="w-4 h-4" />
                    添加时段记录
                  </button>
                  {formData.flowCounts.length > 0 && (
                    <div className="space-y-2">
                      {formData.flowCounts.map((flow) => (
                        <div
                          key={flow.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="font-sans text-sm text-slate-600">
                            {flow.startTime} - {flow.endTime}
                          </span>
                          <span className="chip">行人 {flow.pedestrianCount}</span>
                          <span className="chip">自行车 {flow.bicycleCount}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlowCount(flow.id)}
                            className="ml-auto p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-text mb-3">活动类型统计</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(Object.keys(activityTypeLabels) as ActivityType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewActivity({ ...newActivity, type })}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                          newActivity.type === type
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {activityIcons[type]}
                        <span className="text-sm font-sans">{activityTypeLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="人数"
                      value={newActivity.count}
                      onChange={(e) => setNewActivity({ ...newActivity, count: parseInt(e.target.value) || 0 })}
                      className="input-field w-24"
                    />
                    <input
                      type="text"
                      placeholder="描述（可选）"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="input-field flex-1"
                    />
                    <button type="button" onClick={handleAddActivity} className="btn-primary py-2">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.activities.length > 0 && (
                    <div className="space-y-2">
                      {formData.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="chip">
                            {activityIcons[activity.type]}
                            <span className="ml-1">{activityTypeLabels[activity.type]}</span>
                          </span>
                          <span className="font-semibold text-slate-800">{activity.count} 人</span>
                          {activity.description && (
                            <span className="text-sm text-slate-500 font-sans flex-1">
                              {activity.description}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(activity.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-text mb-3">路径追踪记录</label>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={newPath.type}
                      onChange={(e) => setNewPath({ ...newPath, type: e.target.value as 'actual' | 'designed' })}
                      className="input-field w-32"
                    >
                      <option value="actual">实际路径</option>
                      <option value="designed">设计路径</option>
                    </select>
                    <input
                      type="text"
                      placeholder='坐标数组 JSON: [{"lat":31.23,"lng":121.45}, ...]'
                      value={newPath.coordinates}
                      onChange={(e) => setNewPath({ ...newPath, coordinates: e.target.value })}
                      className="input-field flex-1"
                    />
                    <button type="button" onClick={handleAddPath} className="btn-primary py-2">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.paths.length > 0 && (
                    <div className="space-y-2">
                      {formData.paths.map((path) => (
                        <div
                          key={path.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="chip">
                            <Route className="w-3 h-3 mr-1" />
                            {pathTypeLabels[path.type]}
                          </span>
                          <span className="text-sm text-slate-500 font-sans flex-1">
                            {path.coordinates.length} 个坐标点
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePath(path.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="btn-outline text-sm py-2"
                  >
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm py-2">
                    {editingStudy ? '保存修改' : '创建研究'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除行人研究"
        description="删除此行人研究将同时删除关联的人流量统计、活动类型和路径追踪数据。此操作无法撤销。"
        confirmLabel="删除研究"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
