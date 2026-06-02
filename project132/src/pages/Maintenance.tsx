import { useState } from 'react';
import { useAppStore } from '../store';
import { formatDate, formatCurrency, getMaintenanceTypeLabel } from '../utils/formatters';
import { 
  Wrench, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Droplets,
  Disc,
  Link,
  Settings,
  X,
  Check,
  Clock
} from 'lucide-react';

const maintenanceIcons: Record<string, any> = {
  oil: Droplets,
  brake: Disc,
  tire: Settings,
  chain: Link,
  other: Wrench
};

export default function Maintenance() {
  const { maintenances, reminders, faults, motorcycle, addMaintenance, addReminder, addFault } = useAppStore();
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddFault, setShowAddFault] = useState(false);
  
  const [newMaintenance, setNewMaintenance] = useState({
    type: 'oil' as const,
    date: new Date().toISOString().split('T')[0],
    mileage: motorcycle?.currentMileage || 0,
    description: '',
    cost: 0,
    notes: ''
  });

  const [newReminder, setNewReminder] = useState({
    type: '',
    nextMileage: 0,
    isActive: true
  });

  const [newFault, setNewFault] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    solution: '',
    cost: 0
  });

  const handleAddMaintenance = () => {
    addMaintenance(newMaintenance);
    setShowAddMaintenance(false);
    setNewMaintenance({
      type: 'oil',
      date: new Date().toISOString().split('T')[0],
      mileage: motorcycle?.currentMileage || 0,
      description: '',
      cost: 0,
      notes: ''
    });
  };

  const handleAddReminder = () => {
    addReminder(newReminder);
    setShowAddReminder(false);
    setNewReminder({ type: '', nextMileage: 0, isActive: true });
  };

  const handleAddFault = () => {
    addFault(newFault);
    setShowAddFault(false);
    setNewFault({
      description: '',
      date: new Date().toISOString().split('T')[0],
      solution: '',
      cost: 0
    });
  };

  const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0) + faults.reduce((sum, f) => sum + f.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">维护保养</h1>
          <p className="text-dark-300 mt-1">追踪保养记录和故障处理</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{maintenances.length}</p>
              <p className="text-sm text-dark-400">保养次数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
              <p className="text-sm text-dark-400">总花费</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{reminders.filter(r => r.isActive).length}</p>
              <p className="text-sm text-dark-400">待办提醒</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faults.length}</p>
              <p className="text-sm text-dark-400">故障记录</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-400" />
                保养记录
              </h2>
              <button 
                onClick={() => setShowAddMaintenance(true)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {showAddMaintenance && (
              <div className="mb-6 p-4 bg-dark-900/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">保养类型</label>
                    <select
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="oil">机油更换</option>
                      <option value="brake">刹车片更换</option>
                      <option value="tire">轮胎更换</option>
                      <option value="chain">链条保养</option>
                      <option value="other">其他保养</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">日期</label>
                    <input
                      type="date"
                      value={newMaintenance.date}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">里程 (km)</label>
                    <input
                      type="number"
                      value={newMaintenance.mileage}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, mileage: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">费用 (元)</label>
                    <input
                      type="number"
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">描述</label>
                  <input
                    type="text"
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    placeholder="保养内容描述"
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddMaintenance} className="btn-primary">
                    保存
                  </button>
                  <button 
                    onClick={() => setShowAddMaintenance(false)}
                    className="btn-secondary"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {maintenances.map((maintenance, index) => {
                const Icon = maintenanceIcons[maintenance.type] || Wrench;
                return (
                  <div 
                    key={maintenance.id} 
                    className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {maintenance.description || getMaintenanceTypeLabel(maintenance.type)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-dark-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(maintenance.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {maintenance.mileage.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-400 font-mono font-bold">{formatCurrency(maintenance.cost)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                故障记录
              </h2>
              <button 
                onClick={() => setShowAddFault(true)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加故障
              </button>
            </div>

            {showAddFault && (
              <div className="mb-6 p-4 bg-dark-900/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">故障日期</label>
                    <input
                      type="date"
                      value={newFault.date}
                      onChange={(e) => setNewFault({ ...newFault, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">维修费用 (元)</label>
                    <input
                      type="number"
                      value={newFault.cost}
                      onChange={(e) => setNewFault({ ...newFault, cost: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">故障描述</label>
                  <textarea
                    value={newFault.description}
                    onChange={(e) => setNewFault({ ...newFault, description: e.target.value })}
                    placeholder="描述故障现象"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="label">解决方案</label>
                  <textarea
                    value={newFault.solution}
                    onChange={(e) => setNewFault({ ...newFault, solution: e.target.value })}
                    placeholder="如何解决的"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddFault} className="btn-primary">
                    保存
                  </button>
                  <button 
                    onClick={() => setShowAddFault(false)}
                    className="btn-secondary"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {faults.map((fault, index) => (
                <div 
                  key={fault.id} 
                  className="p-4 bg-dark-900/50 rounded-lg border-l-4 border-yellow-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          故障
                        </span>
                        <span className="text-dark-400 text-sm">{formatDate(fault.date)}</span>
                      </div>
                      <p className="text-white font-medium">{fault.description}</p>
                      {fault.solution && (
                        <div className="mt-2 flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-dark-300 text-sm">{fault.solution}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-brand-400 font-mono font-bold">{formatCurrency(fault.cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-400" />
                保养提醒
              </h2>
              <button 
                onClick={() => setShowAddReminder(true)}
                className="p-2 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddReminder && (
              <div className="mb-4 p-4 bg-dark-900/50 rounded-lg">
                <div className="mb-3">
                  <label className="label">提醒内容</label>
                  <input
                    type="text"
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                    placeholder="如：机油保养"
                    className="input-field"
                  />
                </div>
                <div className="mb-3">
                  <label className="label">提醒里程 (km)</label>
                  <input
                    type="number"
                    value={newReminder.nextMileage}
                    onChange={(e) => setNewReminder({ ...newReminder, nextMileage: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddReminder} className="btn-primary text-sm">
                    添加
                  </button>
                  <button 
                    onClick={() => setShowAddReminder(false)}
                    className="btn-secondary text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {reminders.map((reminder) => {
                const remaining = reminder.nextMileage - (motorcycle?.currentMileage || 0);
                const isUrgent = remaining <= 1000;
                return (
                  <div 
                    key={reminder.id} 
                    className={`p-4 rounded-lg ${isUrgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-dark-900/50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-medium ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                        {reminder.type}
                      </p>
                      <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">
                        剩余 <span className={`font-mono font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                          {remaining.toLocaleString()}
                        </span> km
                      </span>
                      <span className="text-dark-500">
                        {reminder.nextMileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isUrgent ? 'bg-red-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(100, ((motorcycle?.currentMileage || 0) / reminder.nextMileage) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
