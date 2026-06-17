import { useState } from 'react'
import { Shield, Bug, BookOpen, Plus, Trash2, Flame, CheckCircle2, Circle, X } from 'lucide-react'
import { useCyberStore } from '@/store'
import { generateId, formatDate } from '@/utils/score'
import type { SecurityHabit, Vulnerability, LearningRecord } from '@/types'

type TabKey = 'habits' | 'vulns' | 'learning'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'habits', label: '习惯自检', icon: <Shield size={16} /> },
  { key: 'vulns', label: '漏洞追踪', icon: <Bug size={16} /> },
  { key: 'learning', label: '学习记录', icon: <BookOpen size={16} /> },
]

const freqMap: Record<string, string> = { daily: '日常', weekly: '每周', monthly: '每月', quarterly: '每季度' }
const severityMap: Record<string, string> = { low: '低危', medium: '中危', high: '高危', critical: '严重' }
const statusMap: Record<string, string> = { discovered: '发现', investigating: '调查中', fixing: '修复中', fixed: '已修复' }
const severityBadge: Record<string, string> = { low: 'cyber-badge-green', medium: 'cyber-badge-blue', high: 'cyber-badge-amber', critical: 'cyber-badge-red' }

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 w-full max-w-md shadow-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-cyber-green text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-cyber-red transition"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Habits() {
  const [activeTab, setActiveTab] = useState<TabKey>('habits')
  const { securityHabits, vulnerabilities, learningRecords, addSecurityHabit, updateSecurityHabit, deleteSecurityHabit, addVulnerability, updateVulnerability, deleteVulnerability, addLearningRecord, deleteLearningRecord } = useCyberStore()

  const [habitModal, setHabitModal] = useState(false)
  const [vulnModal, setVulnModal] = useState(false)
  const [learnModal, setLearnModal] = useState(false)

  const [hName, setHName] = useState('')
  const [hCategory, setHCategory] = useState('')
  const [hFreq, setHFreq] = useState<SecurityHabit['frequency']>('daily')

  const [vTitle, setVTitle] = useState('')
  const [vSeverity, setVSeverity] = useState<Vulnerability['severity']>('medium')
  const [vDesc, setVDesc] = useState('')
  const [vStatus, setVStatus] = useState<Vulnerability['status']>('discovered')
  const [vDate, setVDate] = useState('')

  const [lTitle, setLTitle] = useState('')
  const [lCategory, setLCategory] = useState('')
  const [lContent, setLContent] = useState('')
  const [lDate, setLDate] = useState('')
  const [lSource, setLSource] = useState('')

  const resetHabit = () => { setHName(''); setHCategory(''); setHFreq('daily') }
  const resetVuln = () => { setVTitle(''); setVSeverity('medium'); setVDesc(''); setVStatus('discovered'); setVDate('') }
  const resetLearn = () => { setLTitle(''); setLCategory(''); setLContent(''); setLDate(''); setLSource('') }

  const handleAddHabit = () => {
    if (!hName.trim()) return
    addSecurityHabit({ id: generateId(), name: hName.trim(), category: hCategory.trim(), frequency: hFreq, lastChecked: '', isCompleted: false, streak: 0 })
    resetHabit(); setHabitModal(false)
  }

  const handleToggleHabit = (h: SecurityHabit) => {
    const now = new Date().toISOString()
    if (h.isCompleted) {
      updateSecurityHabit(h.id, { isCompleted: false, streak: 0, lastChecked: h.lastChecked })
    } else {
      updateSecurityHabit(h.id, { isCompleted: true, streak: h.streak + 1, lastChecked: now })
    }
  }

  const handleAddVuln = () => {
    if (!vTitle.trim()) return
    addVulnerability({ id: generateId(), title: vTitle.trim(), severity: vSeverity, description: vDesc.trim(), status: vStatus, discoveredDate: vDate || new Date().toISOString(), fixedDate: '' })
    resetVuln(); setVulnModal(false)
  }

  const handleVulnStatus = (v: Vulnerability, status: Vulnerability['status']) => {
    const update: Partial<Vulnerability> = { status }
    if (status === 'fixed') update.fixedDate = new Date().toISOString()
    updateVulnerability(v.id, update)
  }

  const handleAddLearn = () => {
    if (!lTitle.trim()) return
    addLearningRecord({ id: generateId(), title: lTitle.trim(), category: lCategory.trim(), content: lContent.trim(), learnedDate: lDate || new Date().toISOString(), source: lSource.trim() })
    resetLearn(); setLearnModal(false)
  }

  const fixedCount = vulnerabilities.filter((v) => v.status === 'fixed').length
  const fixedPct = vulnerabilities.length > 0 ? Math.round((fixedCount / vulnerabilities.length) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-mono text-2xl text-cyber-green cyber-section-title">网络安全习惯追踪</h1>

      <div className="flex gap-2 border-b border-cyber-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-mono transition border-b-2 ${activeTab === t.key ? 'border-cyber-green text-cyber-green' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'habits' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setHabitModal(true)} className="cyber-btn-primary flex items-center gap-1 text-sm"><Plus size={16} />添加习惯</button>
          </div>
          {securityHabits.length === 0 ? (
            <div className="cyber-empty text-gray-500 py-12 text-center">暂无安全习惯，点击添加</div>
          ) : (
            <div className="grid gap-3">
              {securityHabits.map((h) => (
                <div key={h.id} className="cyber-card flex items-center gap-4 p-4">
                  <button onClick={() => handleToggleHabit(h)} className="shrink-0">
                    {h.isCompleted ? <CheckCircle2 className="text-cyber-green" size={22} /> : <Circle className="text-gray-500" size={22} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono ${h.isCompleted ? 'text-cyber-green line-through' : 'text-gray-200'}`}>{h.name}</span>
                      {h.category && <span className="cyber-badge-blue text-xs px-2 py-0.5 rounded">{h.category}</span>}
                      <span className="cyber-badge-amber text-xs px-2 py-0.5 rounded">{freqMap[h.frequency]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Flame size={14} className="text-orange-400" />{h.streak}</span>
                      <span>上次检查: {formatDate(h.lastChecked)}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteSecurityHabit(h.id)} className="text-gray-500 hover:text-cyber-red transition shrink-0"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vulns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="h-2 flex-1 bg-cyber-surface rounded-full overflow-hidden">
                <div className="h-full bg-cyber-green rounded-full transition-all" style={{ width: `${fixedPct}%` }} />
              </div>
              <span className="text-xs text-gray-400 font-mono">{fixedPct}% 已修复</span>
            </div>
            <button onClick={() => setVulnModal(true)} className="cyber-btn-primary flex items-center gap-1 text-sm"><Plus size={16} />添加漏洞</button>
          </div>
          {vulnerabilities.length === 0 ? (
            <div className="cyber-empty text-gray-500 py-12 text-center">暂无漏洞记录</div>
          ) : (
            <div className="grid gap-3">
              {vulnerabilities.map((v) => (
                <div key={v.id} className="cyber-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-gray-200">{v.title}</span>
                      <span className={`${severityBadge[v.severity]} text-xs px-2 py-0.5 rounded`}>{severityMap[v.severity]}</span>
                    </div>
                    <button onClick={() => deleteVulnerability(v.id)} className="text-gray-500 hover:text-cyber-red transition shrink-0"><Trash2 size={16} /></button>
                  </div>
                  {v.description && <p className="text-sm text-gray-400">{v.description}</p>}
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
                    <select value={v.status} onChange={(e) => handleVulnStatus(v, e.target.value as Vulnerability['status'])}
                      className="cyber-input text-xs py-0.5 px-2 rounded bg-cyber-surface text-gray-300 border border-cyber-border">
                      {Object.entries(statusMap).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    <span>发现: {formatDate(v.discoveredDate)}</span>
                    {v.fixedDate && <span>修复: {formatDate(v.fixedDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setLearnModal(true)} className="cyber-btn-primary flex items-center gap-1 text-sm"><Plus size={16} />添加记录</button>
          </div>
          {learningRecords.length === 0 ? (
            <div className="cyber-empty text-gray-500 py-12 text-center">暂无学习记录</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {learningRecords.map((r) => (
                <div key={r.id} className="cyber-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-gray-200">{r.title}</span>
                      {r.category && <span className="cyber-badge-blue text-xs px-2 py-0.5 rounded">{r.category}</span>}
                    </div>
                    <button onClick={() => deleteLearningRecord(r.id)} className="text-gray-500 hover:text-cyber-red transition shrink-0"><Trash2 size={16} /></button>
                  </div>
                  {r.content && <p className="text-sm text-gray-400 line-clamp-3">{r.content}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatDate(r.learnedDate)}</span>
                    {r.source && <span>来源: {r.source}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={habitModal} onClose={() => { resetHabit(); setHabitModal(false) }} title="添加安全习惯">
        <div className="space-y-3">
          <input value={hName} onChange={(e) => setHName(e.target.value)} placeholder="习惯名称" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <input value={hCategory} onChange={(e) => setHCategory(e.target.value)} placeholder="分类 (可选)" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <select value={hFreq} onChange={(e) => setHFreq(e.target.value as SecurityHabit['frequency'])} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border">
            {Object.entries(freqMap).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <button onClick={handleAddHabit} className="cyber-btn-primary w-full py-2 rounded">确认添加</button>
        </div>
      </Modal>

      <Modal open={vulnModal} onClose={() => { resetVuln(); setVulnModal(false) }} title="添加漏洞">
        <div className="space-y-3">
          <input value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="漏洞标题" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <select value={vSeverity} onChange={(e) => setVSeverity(e.target.value as Vulnerability['severity'])} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border">
            {Object.entries(severityMap).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <textarea value={vDesc} onChange={(e) => setVDesc(e.target.value)} placeholder="描述 (可选)" rows={3} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border resize-none" />
          <select value={vStatus} onChange={(e) => setVStatus(e.target.value as Vulnerability['status'])} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border">
            {Object.entries(statusMap).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <input type="date" value={vDate ? new Date(vDate).toISOString().slice(0, 10) : ''} onChange={(e) => setVDate(e.target.value ? new Date(e.target.value).toISOString() : '')} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <button onClick={handleAddVuln} className="cyber-btn-primary w-full py-2 rounded">确认添加</button>
        </div>
      </Modal>

      <Modal open={learnModal} onClose={() => { resetLearn(); setLearnModal(false) }} title="添加学习记录">
        <div className="space-y-3">
          <input value={lTitle} onChange={(e) => setLTitle(e.target.value)} placeholder="标题" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <input value={lCategory} onChange={(e) => setLCategory(e.target.value)} placeholder="分类 (可选)" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <textarea value={lContent} onChange={(e) => setLContent(e.target.value)} placeholder="内容" rows={3} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border resize-none" />
          <input type="date" value={lDate ? new Date(lDate).toISOString().slice(0, 10) : ''} onChange={(e) => setLDate(e.target.value ? new Date(e.target.value).toISOString() : '')} className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <input value={lSource} onChange={(e) => setLSource(e.target.value)} placeholder="来源 (可选)" className="cyber-input w-full p-2 rounded bg-cyber-surface text-gray-200 border border-cyber-border" />
          <button onClick={handleAddLearn} className="cyber-btn-primary w-full py-2 rounded">确认添加</button>
        </div>
      </Modal>
    </div>
  )
}
