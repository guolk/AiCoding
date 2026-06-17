import { useState } from 'react'
import { useCyberStore } from '@/store'
import { generateId, formatDate, formatDateTime, daysBetween } from '@/utils/score'
import type { Account, LoginAnomaly, AccountDeletion } from '@/types'
import {
  Key, ShieldCheck, AlertTriangle, Trash2, Plus, X, Check, ChevronRight,
  User, Lock, Smartphone, Mail, Clock, MapPin, Monitor, Edit3
} from 'lucide-react'

const TABS = [
  { key: 'list', label: '账号清单', icon: Key },
  { key: 'check', label: '安全设置检查', icon: ShieldCheck },
  { key: 'anomaly', label: '异常登录记录', icon: AlertTriangle },
  { key: 'deletion', label: '注销追踪', icon: Trash2 },
] as const

type TabKey = (typeof TABS)[number]['key']

const statusBadge: Record<Account['status'], string> = {
  active: 'cyber-badge-green',
  inactive: 'cyber-badge-amber',
  pending_deletion: 'cyber-badge-red',
  deleted: 'cyber-badge-blue',
}
const statusLabel: Record<Account['status'], string> = {
  active: '活跃', inactive: '未激活', pending_deletion: '待注销', deleted: '已注销',
}
const pwBadge: Record<Account['passwordStrength'], string> = {
  weak: 'cyber-badge-red', medium: 'cyber-badge-amber', strong: 'cyber-badge-green',
}
const pwLabel: Record<Account['passwordStrength'], string> = {
  weak: '弱', medium: '中', strong: '强',
}
const riskBadge: Record<LoginAnomaly['riskLevel'], string> = {
  low: 'cyber-badge-green', medium: 'cyber-badge-amber', high: 'cyber-badge-red',
}
const riskLabel: Record<LoginAnomaly['riskLevel'], string> = {
  low: '低', medium: '中', high: '高',
}
const deletionLabel: Record<AccountDeletion['status'], string> = {
  pending: '待注销', in_progress: '进行中', completed: '已完成',
}

const emptyAccount: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', platform: '', twoFactorEnabled: false, passwordStrength: 'medium',
  lastPasswordChange: new Date().toISOString().slice(0, 10), phoneValid: false, emailValid: false, status: 'active',
}

export default function Accounts() {
  const { accounts, loginAnomalies, accountDeletions, addAccount, updateAccount, deleteAccount, addLoginAnomaly, deleteLoginAnomaly, addAccountDeletion, updateAccountDeletion, deleteAccountDeletion } = useCyberStore()
  const [activeTab, setActiveTab] = useState<TabKey>('list')
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [accountForm, setAccountForm] = useState(emptyAccount)
  const [selectedCheckId, setSelectedCheckId] = useState<string>('')
  const [showAnomalyModal, setShowAnomalyModal] = useState(false)
  const [anomalyForm, setAnomalyForm] = useState({ accountId: '', time: '', location: '', device: '', riskLevel: 'low' as LoginAnomaly['riskLevel'], description: '' })
  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [deletionForm, setDeletionForm] = useState({ accountId: '', notes: '' })

  const openAddAccount = () => { setEditAccount(null); setAccountForm(emptyAccount); setShowAccountModal(true) }
  const openEditAccount = (a: Account) => { setEditAccount(a); setAccountForm({ name: a.name, platform: a.platform, twoFactorEnabled: a.twoFactorEnabled, passwordStrength: a.passwordStrength, lastPasswordChange: a.lastPasswordChange, phoneValid: a.phoneValid, emailValid: a.emailValid, status: a.status }); setShowAccountModal(true) }
  const saveAccount = () => {
    if (!accountForm.name || !accountForm.platform) return
    if (editAccount) {
      updateAccount(editAccount.id, accountForm)
    } else {
      addAccount({ id: generateId(), ...accountForm, lastPasswordChange: accountForm.lastPasswordChange, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    setShowAccountModal(false)
  }

  const saveAnomaly = () => {
    if (!anomalyForm.accountId || !anomalyForm.time) return
    addLoginAnomaly({ id: generateId(), ...anomalyForm })
    setShowAnomalyModal(false)
    setAnomalyForm({ accountId: '', time: '', location: '', device: '', riskLevel: 'low', description: '' })
  }

  const saveDeletion = () => {
    if (!deletionForm.accountId) return
    addAccountDeletion({ id: generateId(), accountId: deletionForm.accountId, status: 'pending', requestDate: new Date().toISOString(), completionDate: '', notes: deletionForm.notes })
    updateAccount(deletionForm.accountId, { status: 'pending_deletion' })
    setShowDeletionModal(false)
    setDeletionForm({ accountId: '', notes: '' })
  }

  const accountsEligibleForDeletion = accounts.filter((a) =>
    a.status !== 'deleted' && !accountDeletions.some((d) => d.accountId === a.id && d.status !== 'completed')
  )

  const checkedAccount = accounts.find((a) => a.id === selectedCheckId)
  const checkItems = checkedAccount ? [
    { label: '双因素认证', pass: checkedAccount.twoFactorEnabled, icon: Lock },
    { label: '密码强度', pass: checkedAccount.passwordStrength === 'strong', icon: Key },
    { label: '密码更新（90天内）', pass: daysBetween(checkedAccount.lastPasswordChange) < 90, icon: Clock },
    { label: '手机绑定有效', pass: checkedAccount.phoneValid, icon: Smartphone },
    { label: '邮箱绑定有效', pass: checkedAccount.emailValid, icon: Mail },
  ] : []
  const passCount = checkItems.filter((c) => c.pass).length

  const columns: { status: AccountDeletion['status']; label: string; color: string }[] = [
    { status: 'pending', label: '待注销', color: 'border-cyber-amber' },
    { status: 'in_progress', label: '进行中', color: 'border-cyber-blue' },
    { status: 'completed', label: '已完成', color: 'border-cyber-green' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="cyber-section-title">账号安全审计</h2>

      <div className="flex gap-1 bg-cyber-card rounded-lg p-1 border border-cyber-border overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-cyber-surface text-cyber-blue border border-cyber-border' : 'text-slate-400 hover:text-white'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddAccount} className="cyber-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />添加账号
            </button>
          </div>
          {accounts.length === 0 ? (
            <div className="cyber-empty">暂无账号数据，点击添加账号开始审计</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {accounts.map((a) => (
                <div key={a.id} className="cyber-card-glow p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-cyber-blue" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-white">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.platform}</p>
                      </div>
                    </div>
                    <span className={statusBadge[a.status]}>{statusLabel[a.status]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {a.twoFactorEnabled ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <X className="w-3.5 h-3.5 text-cyber-red" />}
                      <span className="text-slate-400">2FA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span className={pwBadge[a.passwordStrength]}>{pwLabel[a.passwordStrength]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`${daysBetween(a.lastPasswordChange) > 90 ? 'text-cyber-red' : 'text-slate-400'}`}>{daysBetween(a.lastPasswordChange)}天前更新</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {a.phoneValid ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <X className="w-3.5 h-3.5 text-cyber-red" />}
                      <span className="text-slate-400">手机</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {a.emailValid ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <X className="w-3.5 h-3.5 text-cyber-red" />}
                      <span className="text-slate-400">邮箱</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-cyber-border">
                    <button onClick={() => openEditAccount(a)} className="flex items-center gap-1 text-xs text-cyber-blue hover:text-cyber-blue/80"><Edit3 className="w-3 h-3" />编辑</button>
                    <button onClick={() => deleteAccount(a.id)} className="flex items-center gap-1 text-xs text-cyber-red hover:text-cyber-red/80"><Trash2 className="w-3 h-3" />删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'check' && (
        <div className="space-y-4">
          <select value={selectedCheckId} onChange={(e) => setSelectedCheckId(e.target.value)}
            className="cyber-input w-full max-w-xs">
            <option value="">选择账号...</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.platform})</option>)}
          </select>
          {!checkedAccount ? (
            <div className="cyber-empty">请选择一个账号查看安全设置</div>
          ) : (
            <div className="cyber-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-semibold text-white">{checkedAccount.name} - 安全检查</h3>
                <span className="text-sm text-slate-400">{passCount}/{checkItems.length} 通过</span>
              </div>
              <div className="w-full h-2 bg-cyber-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(passCount / checkItems.length) * 100}%`, backgroundColor: passCount >= 4 ? '#00ff88' : passCount >= 2 ? '#ffb800' : '#ff3366' }} />
              </div>
              <div className="space-y-3">
                {checkItems.map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg border ${item.pass ? 'bg-cyber-green/5 border-cyber-green/20' : 'bg-cyber-red/5 border-cyber-red/20'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.pass ? 'text-cyber-green' : 'text-cyber-red'}`} />
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    {item.pass ? <Check className="w-5 h-5 text-cyber-green" /> : <X className="w-5 h-5 text-cyber-red" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'anomaly' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAnomalyModal(true)} className="cyber-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />添加异常记录
            </button>
          </div>
          {loginAnomalies.length === 0 ? (
            <div className="cyber-empty">暂无异常登录记录</div>
          ) : (
            <div className="space-y-3">
              {loginAnomalies.map((an) => {
                const acc = accounts.find((a) => a.id === an.accountId)
                return (
                  <div key={an.id} className="cyber-card p-4 flex items-start gap-4">
                    <div className="w-2 h-full min-h-[60px] rounded-full bg-cyber-blue/30 shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-white">{acc?.name ?? '未知账号'}</span>
                          <span className={riskBadge[an.riskLevel]}>{riskLabel[an.riskLevel]}</span>
                        </div>
                        <button onClick={() => deleteLoginAnomaly(an.id)} className="text-cyber-red hover:text-cyber-red/80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-sm text-slate-300">{an.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(an.time)}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{an.location}</span>
                        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{an.device}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'deletion' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowDeletionModal(true)} className="cyber-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />添加注销请求
            </button>
          </div>
          {accountDeletions.length === 0 && accounts.length > 0 ? (
            <div className="cyber-empty">暂无注销追踪记录</div>
          ) : accounts.length === 0 ? (
            <div className="cyber-empty">请先添加账号</div>
          ) : null}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.status} className={`rounded-lg border-t-2 ${col.color} bg-cyber-card border border-cyber-border`}>
                <div className="p-3 border-b border-cyber-border flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-white">{col.label}</span>
                  <span className="text-xs text-slate-500">{accountDeletions.filter((d) => d.status === col.status).length}</span>
                </div>
                <div className="p-3 space-y-3 min-h-[120px]">
                  {accountDeletions.filter((d) => d.status === col.status).map((d) => {
                    const acc = accounts.find((a) => a.id === d.accountId)
                    const nextStatus = d.status === 'pending' ? 'in_progress' : d.status === 'in_progress' ? 'completed' : null
                    return (
                      <div key={d.id} className="cyber-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-white">{acc?.name ?? '未知'}</span>
                          <button onClick={() => {
                            deleteAccountDeletion(d.id)
                            if (d.status !== 'completed') {
                              updateAccount(d.accountId, { status: 'active' })
                            }
                          }} className="text-cyber-red hover:text-cyber-red/80"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-xs text-slate-500">申请: {formatDate(d.requestDate)}</p>
                        {d.notes && <p className="text-xs text-slate-400">{d.notes}</p>}
                        {d.completionDate && <p className="text-xs text-slate-500">完成: {formatDate(d.completionDate)}</p>}
                        {nextStatus && (
                          <button onClick={() => {
                            const updates: Partial<AccountDeletion> = {
                              status: nextStatus,
                              completionDate: nextStatus === 'completed' ? new Date().toISOString() : d.completionDate,
                            }
                            updateAccountDeletion(d.id, updates)
                            if (nextStatus === 'completed') {
                              updateAccount(d.accountId, { status: 'deleted' })
                            } else if (nextStatus === 'in_progress') {
                              updateAccount(d.accountId, { status: 'pending_deletion' })
                            }
                          }} className="flex items-center gap-1 text-xs text-cyber-blue hover:text-cyber-blue/80">
                            <ChevronRight className="w-3 h-3" />{deletionLabel[nextStatus]}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAccountModal(false)}>
          <div className="cyber-card-glow w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-semibold text-white">{editAccount ? '编辑账号' : '添加账号'}</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <input placeholder="账号名称" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} className="cyber-input w-full" />
            <input placeholder="平台" value={accountForm.platform} onChange={(e) => setAccountForm({ ...accountForm, platform: e.target.value })} className="cyber-input w-full" />
            <select value={accountForm.passwordStrength} onChange={(e) => setAccountForm({ ...accountForm, passwordStrength: e.target.value as Account['passwordStrength'] })} className="cyber-input w-full">
              <option value="weak">密码强度: 弱</option><option value="medium">密码强度: 中</option><option value="strong">密码强度: 强</option>
            </select>
            <input type="date" value={accountForm.lastPasswordChange.slice(0, 10)} onChange={(e) => setAccountForm({ ...accountForm, lastPasswordChange: e.target.value })} className="cyber-input w-full" />
            <div className="space-y-2">
              {([['twoFactorEnabled', '双因素认证'], ['phoneValid', '手机绑定'], ['emailValid', '邮箱绑定']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={accountForm[key] as boolean} onChange={(e) => setAccountForm({ ...accountForm, [key]: e.target.checked })} className="accent-cyber-green w-4 h-4" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
            {editAccount && (
              <select value={accountForm.status} onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as Account['status'] })} className="cyber-input w-full">
                <option value="active">活跃</option><option value="inactive">未激活</option><option value="pending_deletion">待注销</option><option value="deleted">已注销</option>
              </select>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={saveAccount} className="cyber-btn-primary flex-1">{editAccount ? '保存' : '添加'}</button>
              <button onClick={() => setShowAccountModal(false)} className="cyber-btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {showAnomalyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAnomalyModal(false)}>
          <div className="cyber-card-glow w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-semibold text-white">添加异常登录记录</h3>
              <button onClick={() => setShowAnomalyModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <select value={anomalyForm.accountId} onChange={(e) => setAnomalyForm({ ...anomalyForm, accountId: e.target.value })} className="cyber-input w-full">
              <option value="">选择账号...</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.platform})</option>)}
            </select>
            <input type="datetime-local" value={anomalyForm.time} onChange={(e) => setAnomalyForm({ ...anomalyForm, time: e.target.value })} className="cyber-input w-full" />
            <input placeholder="地点" value={anomalyForm.location} onChange={(e) => setAnomalyForm({ ...anomalyForm, location: e.target.value })} className="cyber-input w-full" />
            <input placeholder="设备" value={anomalyForm.device} onChange={(e) => setAnomalyForm({ ...anomalyForm, device: e.target.value })} className="cyber-input w-full" />
            <select value={anomalyForm.riskLevel} onChange={(e) => setAnomalyForm({ ...anomalyForm, riskLevel: e.target.value as LoginAnomaly['riskLevel'] })} className="cyber-input w-full">
              <option value="low">风险: 低</option><option value="medium">风险: 中</option><option value="high">风险: 高</option>
            </select>
            <textarea placeholder="描述" value={anomalyForm.description} onChange={(e) => setAnomalyForm({ ...anomalyForm, description: e.target.value })} className="cyber-input w-full h-20 resize-none" />
            <div className="flex gap-3 pt-2">
              <button onClick={saveAnomaly} className="cyber-btn-primary flex-1">添加</button>
              <button onClick={() => setShowAnomalyModal(false)} className="cyber-btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {showDeletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeletionModal(false)}>
          <div className="cyber-card-glow w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-semibold text-white">添加注销请求</h3>
              <button onClick={() => setShowDeletionModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <select value={deletionForm.accountId} onChange={(e) => setDeletionForm({ ...deletionForm, accountId: e.target.value })} className="cyber-input w-full">
              <option value="">选择账号...</option>
              {accountsEligibleForDeletion.length === 0 && <option value="" disabled>没有可注销的账号</option>}
              {accountsEligibleForDeletion.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.platform}) - {statusLabel[a.status]}</option>)}
            </select>
            <textarea placeholder="备注" value={deletionForm.notes} onChange={(e) => setDeletionForm({ ...deletionForm, notes: e.target.value })} className="cyber-input w-full h-20 resize-none" />
            <div className="flex gap-3 pt-2">
              <button onClick={saveDeletion} className="cyber-btn-primary flex-1">添加</button>
              <button onClick={() => setShowDeletionModal(false)} className="cyber-btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
