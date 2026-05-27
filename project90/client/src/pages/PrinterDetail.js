import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Wrench, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { printersAPI } from '../services/api';

const MAINTENANCE_TYPES = [
  '喷嘴更换',
  '热床调平',
  '皮带紧张度调整',
  '齿轮润滑',
  '风扇检查',
  '皮带更换',
  '喷嘴清理',
  '其他维护',
];

const MILESTONE_TEMPLATES = [
  { name: '风扇检查', interval_hours: 500 },
  { name: '喷嘴更换', interval_hours: 200 },
  { name: '热床调平', interval_hours: 100 },
  { name: '皮带张力检查', interval_hours: 300 },
  { name: '全面清洁保养', interval_hours: 1000 },
];

export default function PrinterDetail() {
  const { id } = useParams();
  const [printer, setPrinter] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [troubleshooting, setTroubleshooting] = useState([]);
  const [activeTab, setActiveTab] = useState('maintenance');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTroubleshootingModal, setShowTroubleshootingModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: '',
    description: '',
    parts_replaced: '',
    cost: '',
    performed_at: new Date().toISOString().split('T')[0],
    print_hours_at_time: '',
    notes: '',
  });
  const [milestoneForm, setMilestoneForm] = useState({
    milestone_name: '',
    interval_hours: '',
    last_completed_hours: '0',
  });
  const [troubleshootingForm, setTroubleshootingForm] = useState({
    title: '',
    problem_description: '',
    troubleshooting_steps: '',
    solution: '',
    status: 'open',
    occurred_at: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [printerRes, maintenanceRes, milestonesRes, troubleshootingRes] = await Promise.all([
        printersAPI.getById(id),
        printersAPI.getMaintenance(id),
        printersAPI.getMilestones(id),
        printersAPI.getTroubleshooting(id),
      ]);
      setPrinter(printerRes.data);
      setMaintenance(maintenanceRes.data);
      setMilestones(milestonesRes.data);
      setTroubleshooting(troubleshootingRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...maintenanceForm,
        cost: parseFloat(maintenanceForm.cost) || 0,
        print_hours_at_time: parseFloat(maintenanceForm.print_hours_at_time) || 0,
      };
      await printersAPI.createMaintenance(id, data);
      loadData();
      setShowMaintenanceModal(false);
      setMaintenanceForm({
        maintenance_type: '',
        description: '',
        parts_replaced: '',
        cost: '',
        performed_at: new Date().toISOString().split('T')[0],
        print_hours_at_time: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding maintenance:', error);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...milestoneForm,
        interval_hours: parseFloat(milestoneForm.interval_hours),
        last_completed_hours: parseFloat(milestoneForm.last_completed_hours) || 0,
      };
      await printersAPI.createMilestone(id, data);
      loadData();
      setShowMilestoneModal(false);
      setMilestoneForm({
        milestone_name: '',
        interval_hours: '',
        last_completed_hours: '0',
      });
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleAddTroubleshooting = async (e) => {
    e.preventDefault();
    try {
      await printersAPI.createTroubleshooting(id, troubleshootingForm);
      loadData();
      setShowTroubleshootingModal(false);
      setTroubleshootingForm({
        title: '',
        problem_description: '',
        troubleshooting_steps: '',
        solution: '',
        status: 'open',
        occurred_at: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding troubleshooting:', error);
    }
  };

  const toggleTroubleshootingStatus = async (log) => {
    try {
      const newStatus = log.status === 'open' ? 'resolved' : 'open';
      await printersAPI.updateTroubleshooting(log.id, {
        ...log,
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : null,
      });
      loadData();
    } catch (error) {
      console.error('Error updating troubleshooting:', error);
    }
  };

  const deleteMaintenance = async (maintenanceId) => {
    if (window.confirm('确定要删除这条维护记录吗？')) {
      try {
        await printersAPI.deleteMaintenance(maintenanceId);
        loadData();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
      }
    }
  };

  const deleteMilestone = async (milestoneId) => {
    if (window.confirm('确定要删除这个维护里程碑吗？')) {
      try {
        await printersAPI.deleteMilestone(milestoneId);
        loadData();
      } catch (error) {
        console.error('Error deleting milestone:', error);
      }
    }
  };

  const deleteTroubleshooting = async (logId) => {
    if (window.confirm('确定要删除这条故障记录吗？')) {
      try {
        await printersAPI.deleteTroubleshooting(logId);
        loadData();
      } catch (error) {
        console.error('Error deleting troubleshooting:', error);
      }
    }
  };

  const getMilestoneStatus = (milestone) => {
    if (!printer) return { status: 'normal', message: '' };
    const hoursSinceLast = printer.total_print_hours - (milestone.last_completed_hours || 0);
    const progress = (hoursSinceLast / milestone.interval_hours) * 100;
    
    if (progress >= 100) {
      return { status: 'overdue', message: '已超期', progress: 100 };
    } else if (progress >= 80) {
      return { status: 'warning', message: '即将到期', progress };
    }
    return { status: 'normal', message: '正常', progress };
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!printer) {
    return <div className="text-center py-12">打印机不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/printers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{printer.name}</h1>
          <p className="text-sm text-gray-500">{printer.model || '未指定型号'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="热床尺寸" value={printer.bed_size || '未设置'} />
          <StatItem label="喷嘴直径" value={`${printer.nozzle_diameter}mm`} />
          <StatItem label="最高温度" value={`${printer.max_nozzle_temp}°C / ${printer.max_bed_temp}°C`} />
          <StatItem label="总打印时长" value={`${printer.total_print_hours || 0} 小时`} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex">
            <TabButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')}>
              <Wrench className="w-4 h-4" />
              维护记录
            </TabButton>
            <TabButton active={activeTab === 'milestones'} onClick={() => setActiveTab('milestones')}>
              <Calendar className="w-4 h-4" />
              维护里程碑
            </TabButton>
            <TabButton active={activeTab === 'troubleshooting'} onClick={() => setActiveTab('troubleshooting')}>
              <AlertTriangle className="w-4 h-4" />
              故障排查
            </TabButton>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'maintenance' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">维护记录</h2>
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加记录</span>
                </button>
              </div>
              {maintenance.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无维护记录</p>
              ) : (
                <div className="space-y-3">
                  {maintenance.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{record.maintenance_type}</span>
                          <span className="text-sm text-gray-500">{record.performed_at}</span>
                        </div>
                        {record.description && (
                          <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                        )}
                        {record.cost > 0 && (
                          <p className="text-sm text-gray-500 mt-1">费用: ¥{record.cost}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMaintenance(record.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">维护里程碑</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                    onChange={(e) => {
                      if (e.target.value) {
                        const template = MILESTONE_TEMPLATES.find(t => t.name === e.target.value);
                        if (template) {
                          setMilestoneForm({
                            milestone_name: template.name,
                            interval_hours: template.interval_hours.toString(),
                            last_completed_hours: printer.total_print_hours?.toString() || '0',
                          });
                          setShowMilestoneModal(true);
                        }
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">+ 快速添加模板</option>
                    {MILESTONE_TEMPLATES.map(t => (
                      <option key={t.name} value={t.name}>{t.name} (每{t.interval_hours}小时)</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowMilestoneModal(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>自定义</span>
                  </button>
                </div>
              </div>
              {milestones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无维护里程碑</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map(milestone => {
                    const status = getMilestoneStatus(milestone);
                    return (
                      <div key={milestone.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{milestone.milestone_name}</span>
                            {status.status === 'overdue' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">超期</span>
                            )}
                            {status.status === 'warning' && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">即将到期</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">每 {milestone.interval_hours} 小时</span>
                            <button
                              onClick={() => deleteMilestone(milestone.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status.status === 'overdue' ? 'bg-red-500' :
                              status.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(status.progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>上次: {milestone.last_completed_hours || 0}h</span>
                          <span>下次: {milestone.next_due_hours || milestone.interval_hours}h</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">故障排查日记</h2>
                <button
                  onClick={() => setShowTroubleshootingModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>记录故障</span>
                </button>
              </div>
              {troubleshooting.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无故障记录</p>
              ) : (
                <div className="space-y-3">
                  {troubleshooting.map(log => (
                    <div key={log.id} className={`p-4 rounded-lg border ${
                      log.status === 'resolved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{log.title}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              log.status === 'resolved' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                            }`}>
                              {log.status === 'resolved' ? '已解决' : '待解决'}
                            </span>
                            <span className="text-sm text-gray-500">{log.occurred_at}</span>
                          </div>
                          {log.problem_description && (
                            <p className="text-sm text-gray-600 mt-2"><strong>问题:</strong> {log.problem_description}</p>
                          )}
                          {log.troubleshooting_steps && (
                            <p className="text-sm text-gray-600 mt-1"><strong>排查步骤:</strong> {log.troubleshooting_steps}</p>
                          )}
                          {log.solution && (
                            <p className="text-sm text-gray-600 mt-1"><strong>解决方案:</strong> {log.solution}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleTroubleshootingStatus(log)}
                            className={`p-1.5 rounded-lg ${
                              log.status === 'resolved' ? 'text-gray-400 hover:text-gray-600' : 'text-green-500 hover:text-green-600'
                            }`}
                            title={log.status === 'resolved' ? '标记为未解决' : '标记为已解决'}
                          >
                            {log.status === 'resolved' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteTroubleshooting(log.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showMaintenanceModal && (
        <Modal title="添加维护记录" onClose={() => setShowMaintenanceModal(false)}>
          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">维护类型 *</label>
              <select
                required
                value={maintenanceForm.maintenance_type}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">选择维护类型</option>
                {MAINTENANCE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={maintenanceForm.performed_at}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当时打印时长 (小时)</label>
                <input
                  type="number"
                  value={maintenanceForm.print_hours_at_time}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, print_hours_at_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                rows={2}
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">更换的零件</label>
              <input
                type="text"
                value={maintenanceForm.parts_replaced}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, parts_replaced: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 喷嘴, 皮带..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">费用 (¥)</label>
              <input
                type="number"
                step="0.01"
                value={maintenanceForm.cost}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">保存</button>
            </div>
          </form>
        </Modal>
      )}

      {showMilestoneModal && (
        <Modal title="添加维护里程碑" onClose={() => setShowMilestoneModal(false)}>
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">里程碑名称 *</label>
              <input
                type="text"
                required
                value={milestoneForm.milestone_name}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 风扇检查"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">间隔时长 (小时) *</label>
              <input
                type="number"
                required
                value={milestoneForm.interval_hours}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, interval_hours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">上次完成时的打印时长 (小时)</label>
              <input
                type="number"
                value={milestoneForm.last_completed_hours}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, last_completed_hours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setShowMilestoneModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">保存</button>
            </div>
          </form>
        </Modal>
      )}

      {showTroubleshootingModal && (
        <Modal title="记录故障" onClose={() => setShowTroubleshootingModal(false)}>
          <form onSubmit={handleAddTroubleshooting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input
                type="text"
                required
                value={troubleshootingForm.title}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 打印时出现层错位"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">发生日期</label>
              <input
                type="date"
                value={troubleshootingForm.occurred_at}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, occurred_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
              <textarea
                rows={2}
                value={troubleshootingForm.problem_description}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, problem_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排查步骤</label>
              <textarea
                rows={2}
                value={troubleshootingForm.troubleshooting_steps}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, troubleshooting_steps: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">解决方案</label>
              <textarea
                rows={2}
                value={troubleshootingForm.solution}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, solution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={troubleshootingForm.status}
                onChange={(e) => setTroubleshootingForm({ ...troubleshootingForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="open">待解决</option>
                <option value="resolved">已解决</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setShowTroubleshootingModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">保存</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
        active
          ? 'border-purple-600 text-purple-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}