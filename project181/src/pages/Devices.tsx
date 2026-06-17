import { useState } from 'react'
import { Laptop, Monitor, Smartphone, Tablet, Plus, Edit2, Trash2, CheckCircle2, XCircle, Shield, FileText, AppWindow, ArrowRightLeft } from 'lucide-react'
import { useCyberStore } from '@/store'
import { generateId, formatDate } from '@/utils/score'
import type { Device, AppPermission, DeviceLending } from '@/types'

const tabs = [
  { key: 'inventory', label: '设备清单', icon: Monitor },
  { key: 'checklist', label: '安全检查清单', icon: FileText },
  { key: 'permissions', label: '软件权限审查', icon: AppWindow },
  { key: 'lending', label: '借出记录', icon: ArrowRightLeft },
] as const

type TabKey = (typeof tabs)[number]['key']

const deviceTypeIcon = (type: Device['type']) => {
  switch (type) {
    case 'laptop': return Laptop
    case 'desktop': return Monitor
    case 'phone': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

const deviceTypeLabel: Record<Device['type'], string> = {
  laptop: '笔记本', desktop: '台式机', phone: '手机', tablet: '平板', other: '其他',
}

const emptyDevice: Omit<Device, 'id' | 'createdAt'> = {
  name: '', type: 'laptop', osVersion: '', osUpdated: false, antivirusActive: false, screenLockEnabled: false, diskEncrypted: false,
}

const emptyPermission: Omit<AppPermission, 'id'> = {
  deviceId: '', appName: '', permission: '', isNecessary: true, riskLevel: 'low',
}

const emptyLending: Omit<DeviceLending, 'id'> = {
  deviceId: '', lentTo: '', lentDate: '', returnDate: '', returned: false, notes: '',
}

export default function Devices() {
  const { devices, appPermissions, deviceLendings, addDevice, updateDevice, deleteDevice, addAppPermission, updateAppPermission, deleteAppPermission, addDeviceLending, updateDeviceLending, deleteDeviceLending } = useCyberStore()

  const [activeTab, setActiveTab] = useState<TabKey>('inventory')
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [deviceForm, setDeviceForm] = useState(emptyDevice)
  const [selectedDeviceId, setSelectedDeviceId] = useState('')

  const [showPermModal, setShowPermModal] = useState(false)
  const [permForm, setPermForm] = useState(emptyPermission)

  const [showLendModal, setShowLendModal] = useState(false)
  const [lendForm, setLendForm] = useState(emptyLending)

  const openAddDevice = () => {
    setEditingDevice(null)
    setDeviceForm(emptyDevice)
    setShowDeviceModal(true)
  }

  const openEditDevice = (d: Device) => {
    setEditingDevice(d)
    setDeviceForm({ name: d.name, type: d.type, osVersion: d.osVersion, osUpdated: d.osUpdated, antivirusActive: d.antivirusActive, screenLockEnabled: d.screenLockEnabled, diskEncrypted: d.diskEncrypted })
    setShowDeviceModal(true)
  }

  const saveDevice = () => {
    if (!deviceForm.name.trim()) return
    if (editingDevice) {
      updateDevice(editingDevice.id, deviceForm)
    } else {
      addDevice({ ...deviceForm, id: generateId(), createdAt: new Date().toISOString() })
    }
    setShowDeviceModal(false)
  }

  const deviceScore = (d: Device) => {
    let s = 0
    if (d.osUpdated) s += 25
    if (d.antivirusActive) s += 25
    if (d.screenLockEnabled) s += 25
    if (d.diskEncrypted) s += 25
    return s
  }

  const scoreColor = (s: number) => {
    if (s >= 75) return 'text-cyber-green'
    if (s >= 50) return 'text-cyber-blue'
    if (s >= 25) return 'text-cyber-amber'
    return 'text-cyber-red'
  }

  const savePerm = () => {
    if (!permForm.deviceId || !permForm.appName.trim()) return
    addAppPermission({ ...permForm, id: generateId() })
    setShowPermModal(false)
  }

  const saveLend = () => {
    if (!lendForm.deviceId || !lendForm.lentTo.trim()) return
    addDeviceLending({ ...lendForm, id: generateId() })
    setShowLendModal(false)
  }

  const checklistItems = (d: Device) => [
    { label: '操作系统是否更新', ok: d.osUpdated },
    { label: '杀毒软件是否启用', ok: d.antivirusActive },
    { label: '屏幕锁定是否设置', ok: d.screenLockEnabled },
    { label: '全盘加密是否启用', ok: d.diskEncrypted },
  ]

  const selectedDevice = devices.find(d => d.id === selectedDeviceId)
  const devicePerms = appPermissions.filter(p => p.deviceId === selectedDeviceId)

  const riskBadge = (r: AppPermission['riskLevel']) => {
    if (r === 'low') return 'cyber-badge-green'
    if (r === 'medium') return 'cyber-badge-amber'
    return 'cyber-badge-red'
  }
  const riskLabel: Record<AppPermission['riskLevel'], string> = { low: '低', medium: '中', high: '高' }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="cyber-section-title">
          <Shield className="w-5 h-5 text-cyber-amber" />
          设备安全管理
        </h2>
      </div>

      <div className="flex gap-1 bg-cyber-surface rounded-lg p-1 border border-cyber-border">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key ? 'bg-cyber-card text-cyber-amber shadow-card' : 'text-slate-400 hover:text-slate-200'
            }`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddDevice} className="cyber-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />添加设备
            </button>
          </div>
          {devices.length === 0 ? (
            <div className="cyber-empty"><Monitor className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">暂无设备，点击上方按钮添加</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {devices.map(d => {
                const Icon = deviceTypeIcon(d.type)
                const sc = deviceScore(d)
                return (
                  <div key={d.id} className="cyber-card-glow group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyber-amber/10 border border-cyber-amber/30 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-cyber-amber" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{d.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{d.osVersion}</p>
                        </div>
                      </div>
                      <span className={`font-mono text-lg font-bold ${scoreColor(sc)}`}>{sc}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {([['OS更新', d.osUpdated], ['杀毒软件', d.antivirusActive], ['屏幕锁定', d.screenLockEnabled], ['全盘加密', d.diskEncrypted]] as const).map(([label, ok]) => (
                        <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className={`w-2 h-2 rounded-full ${ok ? 'bg-cyber-green' : 'bg-cyber-red'}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditDevice(d)} className="p-1.5 rounded-md hover:bg-cyber-surface text-slate-500 hover:text-cyber-blue transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteDevice(d.id)} className="p-1.5 rounded-md hover:bg-cyber-surface text-slate-500 hover:text-cyber-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <select value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)} className="cyber-input max-w-xs">
            <option value="">选择设备...</option>
            {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({deviceTypeLabel[d.type]})</option>)}
          </select>
          {!selectedDevice ? (
            <div className="cyber-empty"><FileText className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">请先选择一个设备</p></div>
          ) : (
            <div className="cyber-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{selectedDevice.name} - 安全检查</h3>
                <span className={`font-mono font-bold ${scoreColor(deviceScore(selectedDevice))}`}>{deviceScore(selectedDevice)}/100</span>
              </div>
              <div className="w-full bg-cyber-surface rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${deviceScore(selectedDevice)}%`, background: deviceScore(selectedDevice) >= 75 ? '#00ff88' : deviceScore(selectedDevice) >= 50 ? '#00d4ff' : deviceScore(selectedDevice) >= 25 ? '#ffb800' : '#ff3366' }} />
              </div>
              <div className="space-y-3">
                {checklistItems(selectedDevice).map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface border border-cyber-border">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    {item.ok ? (
                      <span className="flex items-center gap-1.5 text-cyber-green text-sm"><CheckCircle2 className="w-4 h-4" />通过</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-cyber-red text-sm"><XCircle className="w-4 h-4" />未通过</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)} className="cyber-input max-w-xs">
              <option value="">选择设备...</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {selectedDeviceId && (
              <button onClick={() => { setPermForm({ ...emptyPermission, deviceId: selectedDeviceId }); setShowPermModal(true) }} className="cyber-btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />添加权限
              </button>
            )}
          </div>
          {!selectedDeviceId ? (
            <div className="cyber-empty"><AppWindow className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">请先选择一个设备</p></div>
          ) : devicePerms.length === 0 ? (
            <div className="cyber-empty"><p className="text-sm">该设备暂无权限记录</p></div>
          ) : (
            <div className="cyber-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b border-cyber-border">
                  <th className="pb-3 pr-4 font-medium">应用名称</th>
                  <th className="pb-3 pr-4 font-medium">权限</th>
                  <th className="pb-3 pr-4 font-medium">是否必要</th>
                  <th className="pb-3 pr-4 font-medium">风险等级</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr></thead>
                <tbody>
                  {devicePerms.map(p => (
                    <tr key={p.id} className="border-b border-cyber-border/50 hover:bg-cyber-surface/50 transition-colors">
                      <td className="py-3 pr-4 text-slate-200">{p.appName}</td>
                      <td className="py-3 pr-4 text-slate-400">{p.permission}</td>
                      <td className="py-3 pr-4">
                        <button onClick={() => updateAppPermission(p.id, { isNecessary: !p.isNecessary })}
                          className={p.isNecessary ? 'cyber-badge-green' : 'cyber-badge-red'}>
                          {p.isNecessary ? '必要' : '不必要'}
                        </button>
                      </td>
                      <td className="py-3 pr-4"><span className={riskBadge(p.riskLevel)}>{riskLabel[p.riskLevel]}</span></td>
                      <td className="py-3">
                        <button onClick={() => deleteAppPermission(p.id)} className="p-1 rounded hover:bg-cyber-red/10 text-slate-500 hover:text-cyber-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lending' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setLendForm(emptyLending); setShowLendModal(true) }} className="cyber-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />添加借出记录
            </button>
          </div>
          {deviceLendings.length === 0 ? (
            <div className="cyber-empty"><ArrowRightLeft className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">暂无借出记录</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deviceLendings.map(l => {
                const dev = devices.find(d => d.id === l.deviceId)
                return (
                  <div key={l.id} className="cyber-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-cyber-blue" />
                        <span className="font-medium text-white text-sm">{dev?.name || '未知设备'}</span>
                      </div>
                      <span className={l.returned ? 'cyber-badge-green' : 'cyber-badge-red'}>{l.returned ? '已归还' : '未归还'}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-400 mb-3">
                      <p>借用人: <span className="text-slate-200">{l.lentTo}</span></p>
                      <p>借出日期: <span className="text-slate-200">{formatDate(l.lentDate)}</span></p>
                      <p>预计归还: <span className="text-slate-200">{formatDate(l.returnDate)}</span></p>
                      {l.notes && <p>备注: <span className="text-slate-300">{l.notes}</span></p>}
                    </div>
                    <div className="flex gap-2 justify-end">
                      {!l.returned && (
                        <button onClick={() => updateDeviceLending(l.id, { returned: true })} className="cyber-btn-primary text-xs py-1.5 px-3">标记归还</button>
                      )}
                      <button onClick={() => deleteDeviceLending(l.id)} className="cyber-btn-danger text-xs py-1.5 px-3">删除</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDeviceModal(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 w-full max-w-md shadow-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="cyber-section-title mb-4">{editingDevice ? '编辑设备' : '添加设备'}</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-500 mb-1 block">设备名称</label><input value={deviceForm.name} onChange={e => setDeviceForm(f => ({ ...f, name: e.target.value }))} className="cyber-input" placeholder="输入设备名称" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">设备类型</label><select value={deviceForm.type} onChange={e => setDeviceForm(f => ({ ...f, type: e.target.value as Device['type'] }))} className="cyber-input">{Object.entries(deviceTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="text-xs text-slate-500 mb-1 block">操作系统版本</label><input value={deviceForm.osVersion} onChange={e => setDeviceForm(f => ({ ...f, osVersion: e.target.value }))} className="cyber-input" placeholder="如 macOS 14.2" /></div>
              {([['osUpdated', '操作系统已更新'], ['antivirusActive', '杀毒软件已启用'], ['screenLockEnabled', '屏幕锁定已设置'], ['diskEncrypted', '全盘加密已启用']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-cyber-surface transition-colors">
                  <input type="checkbox" checked={deviceForm[key] as boolean} onChange={e => setDeviceForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 rounded accent-cyber-green" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowDeviceModal(false)} className="cyber-btn-secondary">取消</button>
              <button onClick={saveDevice} className="cyber-btn-primary">{editingDevice ? '保存' : '添加'}</button>
            </div>
          </div>
        </div>
      )}

      {showPermModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowPermModal(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 w-full max-w-md shadow-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="cyber-section-title mb-4">添加权限记录</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-500 mb-1 block">应用名称</label><input value={permForm.appName} onChange={e => setPermForm(f => ({ ...f, appName: e.target.value }))} className="cyber-input" placeholder="输入应用名称" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">权限</label><input value={permForm.permission} onChange={e => setPermForm(f => ({ ...f, permission: e.target.value }))} className="cyber-input" placeholder="如 相机、位置" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">风险等级</label><select value={permForm.riskLevel} onChange={e => setPermForm(f => ({ ...f, riskLevel: e.target.value as AppPermission['riskLevel'] }))} className="cyber-input"><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></div>
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-cyber-surface transition-colors">
                <input type="checkbox" checked={permForm.isNecessary} onChange={e => setPermForm(f => ({ ...f, isNecessary: e.target.checked }))} className="w-4 h-4 rounded accent-cyber-green" />
                <span className="text-sm text-slate-300">是否必要权限</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowPermModal(false)} className="cyber-btn-secondary">取消</button>
              <button onClick={savePerm} className="cyber-btn-primary">添加</button>
            </div>
          </div>
        </div>
      )}

      {showLendModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowLendModal(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 w-full max-w-md shadow-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="cyber-section-title mb-4">添加借出记录</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-500 mb-1 block">设备</label><select value={lendForm.deviceId} onChange={e => setLendForm(f => ({ ...f, deviceId: e.target.value }))} className="cyber-input"><option value="">选择设备...</option>{devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div><label className="text-xs text-slate-500 mb-1 block">借用人</label><input value={lendForm.lentTo} onChange={e => setLendForm(f => ({ ...f, lentTo: e.target.value }))} className="cyber-input" placeholder="输入借用人姓名" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">借出日期</label><input type="date" value={lendForm.lentDate} onChange={e => setLendForm(f => ({ ...f, lentDate: e.target.value }))} className="cyber-input" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">预计归还日期</label><input type="date" value={lendForm.returnDate} onChange={e => setLendForm(f => ({ ...f, returnDate: e.target.value }))} className="cyber-input" /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">备注</label><input value={lendForm.notes} onChange={e => setLendForm(f => ({ ...f, notes: e.target.value }))} className="cyber-input" placeholder="可选备注" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowLendModal(false)} className="cyber-btn-secondary">取消</button>
              <button onClick={saveLend} className="cyber-btn-primary">添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
