import { useState } from 'react'
import { Bug, Fish, KeyRound, Database, HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, X, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import { useCyberStore } from '@/store'
import { generateId, formatDate } from '@/utils/score'
import type { SecurityIncident } from '@/types'

const TYPE_ICONS: Record<SecurityIncident['type'], typeof Bug> = {
  malware: Bug, phishing: Fish, account_hacked: KeyRound, data_breach: Database, other: HelpCircle,
}
const TYPE_LABELS: Record<SecurityIncident['type'], string> = {
  account_hacked: '账号被盗', data_breach: '信息泄露', phishing: '钓鱼攻击', malware: '恶意软件', other: '其他',
}
const SEVERITY_LABELS: Record<SecurityIncident['severity'], string> = {
  low: '低危', medium: '中危', high: '高危', critical: '严重',
}
const SEVERITY_BADGE: Record<SecurityIncident['severity'], string> = {
  low: 'cyber-badge-green', medium: 'cyber-badge-blue', high: 'cyber-badge-amber', critical: 'cyber-badge-red',
}

const defaultForm = { type: 'other' as SecurityIncident['type'], severity: 'low' as SecurityIncident['severity'], description: '', occurredDate: '' }

export default function Incidents() {
  const { securityIncidents, addSecurityIncident, updateSecurityIncident, deleteSecurityIncident } = useCyberStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editResolution, setEditResolution] = useState('')
  const [editLessons, setEditLessons] = useState('')
  const [newMeasure, setNewMeasure] = useState('')

  const total = securityIncidents.length
  const ongoing = securityIncidents.filter((i) => i.status === 'ongoing').length
  const resolved = securityIncidents.filter((i) => i.status === 'resolved').length
  const highRisk = securityIncidents.filter((i) => i.severity === 'high' || i.severity === 'critical').length

  const sorted = [...securityIncidents].sort((a, b) => new Date(b.occurredDate).getTime() - new Date(a.occurredDate).getTime())

  const handleAdd = () => {
    if (!form.description.trim() || !form.occurredDate) return
    addSecurityIncident({
      id: generateId(), type: form.type, severity: form.severity,
      description: form.description.trim(), occurredDate: form.occurredDate,
      resolution: '', lessons: '', followUpMeasures: [], status: 'ongoing',
    })
    setForm(defaultForm)
    setShowModal(false)
  }

  const handleExpand = (inc: SecurityIncident) => {
    if (expandedId === inc.id) { setExpandedId(null); return }
    setExpandedId(inc.id)
    setEditResolution(inc.resolution)
    setEditLessons(inc.lessons)
    setNewMeasure('')
  }

  const handleSave = (id: string) => {
    updateSecurityIncident(id, { resolution: editResolution, lessons: editLessons })
  }

  const handleToggleStatus = (inc: SecurityIncident) => {
    updateSecurityIncident(inc.id, { status: inc.status === 'ongoing' ? 'resolved' : 'ongoing' })
  }

  const handleAddMeasure = (inc: SecurityIncident) => {
    if (!newMeasure.trim()) return
    updateSecurityIncident(inc.id, { followUpMeasures: [...inc.followUpMeasures, newMeasure.trim()] })
    setNewMeasure('')
  }

  const handleDeleteMeasure = (inc: SecurityIncident, idx: number) => {
    updateSecurityIncident(inc.id, { followUpMeasures: inc.followUpMeasures.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="cyber-section-title font-mono text-xl font-bold">事件记录</h2>
        <button onClick={() => setShowModal(true)} className="cyber-btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono">
          <Plus className="w-4 h-4" /> 记录事件
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总事件数', value: total, icon: AlertTriangle, color: 'text-cyber-blue' },
          { label: '进行中', value: ongoing, icon: Clock, color: 'text-cyber-red' },
          { label: '已解决', value: resolved, icon: CheckCircle2, color: 'text-cyber-green' },
          { label: '高危事件', value: highRisk, icon: ShieldAlert, color: 'text-cyber-amber' },
        ].map((s) => (
          <div key={s.label} className="cyber-card bg-cyber-card border border-cyber-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-500 font-mono">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="cyber-empty flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertTriangle className="w-12 h-12 mb-3 text-cyber-border" />
          <p className="font-mono text-sm">暂无安全事件记录</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-cyber-border" />
          {sorted.map((inc) => {
            const Icon = TYPE_ICONS[inc.type]
            const isExpanded = expandedId === inc.id
            return (
              <div key={inc.id} className="relative pl-12 pb-4">
                <div className="absolute left-3 top-3 w-5 h-5 rounded-full bg-cyber-surface border-2 border-cyber-border flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${inc.status === 'resolved' ? 'bg-cyber-green' : 'bg-cyber-red'}`} />
                </div>
                <div className="cyber-card bg-cyber-card border border-cyber-border rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => handleExpand(inc)}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${inc.status === 'resolved' ? 'bg-cyber-green/10' : 'bg-cyber-red/10'}`}>
                      <Icon className={`w-4 h-4 ${inc.status === 'resolved' ? 'text-cyber-green' : 'text-cyber-red'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono font-medium text-white">{TYPE_LABELS[inc.type]}</span>
                        <span className={`${SEVERITY_BADGE[inc.severity]} px-2 py-0.5 rounded text-xs font-mono`}>{SEVERITY_LABELS[inc.severity]}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${inc.status === 'resolved' ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-red/10 text-cyber-red'}`}>
                          {inc.status === 'resolved' ? '已解决' : '进行中'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">{formatDate(inc.occurredDate)}</p>
                      <p className="text-sm text-slate-400 mt-1 truncate">{inc.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); deleteSecurityIncident(inc.id) }} className="p-1.5 rounded-lg text-slate-500 hover:text-cyber-red hover:bg-cyber-red/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-cyber-border p-4 space-y-4 animate-fade-in">
                      <div>
                        <p className="text-xs text-slate-500 font-mono mb-1">事件详情</p>
                        <p className="text-sm text-slate-300">{inc.description}</p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">处理过程</label>
                        <textarea
                          value={editResolution}
                          onChange={(e) => setEditResolution(e.target.value)}
                          className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-cyber-green/50"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">经验教训</label>
                        <textarea
                          value={editLessons}
                          onChange={(e) => setEditLessons(e.target.value)}
                          className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-cyber-green/50"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-2">后续加强措施</label>
                        <div className="space-y-2 mb-2">
                          {inc.followUpMeasures.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2">
                              <span className="text-xs text-cyber-green font-mono">#{idx + 1}</span>
                              <span className="flex-1 text-sm text-slate-300">{m}</span>
                              <button onClick={() => handleDeleteMeasure(inc, idx)} className="text-slate-500 hover:text-cyber-red transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={newMeasure}
                            onChange={(e) => setNewMeasure(e.target.value)}
                            placeholder="添加新措施..."
                            className="cyber-input flex-1 bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyber-green/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMeasure(inc)}
                          />
                          <button onClick={() => handleAddMeasure(inc)} className="cyber-btn-secondary px-3 py-2 rounded-lg text-sm font-mono">添加</button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => handleToggleStatus(inc)} className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${inc.status === 'ongoing' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/20' : 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30 hover:bg-cyber-red/20'}`}>
                          {inc.status === 'ongoing' ? '标记为已解决' : '标记为进行中'}
                        </button>
                        <button onClick={() => handleSave(inc.id)} className="cyber-btn-primary px-4 py-2 rounded-lg text-sm font-mono">保存</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="cyber-card bg-cyber-card border border-cyber-border rounded-xl w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-cyber-border">
              <h3 className="font-mono font-bold text-white">记录安全事件</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-mono block mb-1">事件类型</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SecurityIncident['type'] })} className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyber-green/50">
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-mono block mb-1">严重程度</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as SecurityIncident['severity'] })} className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyber-green/50">
                  {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-mono block mb-1">事件描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-cyber-green/50" rows={3} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-mono block mb-1">发生日期</label>
                <input type="date" value={form.occurredDate} onChange={(e) => setForm({ ...form, occurredDate: e.target.value })} className="cyber-input w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyber-green/50" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-cyber-border">
              <button onClick={() => setShowModal(false)} className="cyber-btn-secondary px-4 py-2 rounded-lg text-sm font-mono">取消</button>
              <button onClick={handleAdd} className="cyber-btn-primary px-4 py-2 rounded-lg text-sm font-mono">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
