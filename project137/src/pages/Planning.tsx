import { useState } from 'react'
import { FileText, PenTool, Users, Plus, ChevronDown, ChevronUp, Mail, Phone, Circle, Clock, CheckCircle, X, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { CreativeProject, Chapter, Partner } from '@/types'

const tabs = [
  { key: 'docs', label: '策划文档', icon: FileText },
  { key: 'progress', label: '写作进度', icon: PenTool },
  { key: 'partners', label: '合作方联系', icon: Users },
] as const

type TabKey = (typeof tabs)[number]['key']

const statusBadge: Record<CreativeProject['status'], string> = {
  planning: 'bg-amber-100 text-amber-700',
  writing: 'bg-blue-100 text-blue-700',
  editing: 'bg-purple-100 text-purple-700',
  published: 'bg-green-100 text-green-700',
}
const statusLabel: Record<CreativeProject['status'], string> = {
  planning: '策划中', writing: '写作中', editing: '编辑中', published: '已出版',
}

const partnerStatusBadge: Record<Partner['status'], string> = {
  negotiating: 'bg-amber-100 text-amber-700',
  contracted: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
}
const partnerStatusLabel: Record<Partner['status'], string> = {
  negotiating: '洽谈中', contracted: '已签约', completed: '已完结',
}

const chapterStatusIcon = { todo: Circle, writing: Clock, editing: Clock, done: CheckCircle }
const chapterStatusStyle: Record<Chapter['status'], string> = {
  todo: 'text-ink/30', writing: 'text-gold', editing: 'text-gold', done: 'text-green-500',
}
const chapterStatusLabel: Record<Chapter['status'], string> = {
  todo: '待写', writing: '写作中', editing: '编辑中', done: '已完成',
}

const nextStatus: Record<Chapter['status'], Chapter['status']> = {
  todo: 'writing', writing: 'done', done: 'todo', editing: 'done',
}

function daysRemaining(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export default function Planning() {
  const { creativeProjects, partners, addProject, updateProject, addPartner } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('docs')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({ title: '', targetDate: '', targetAudience: '', outline: '' })
  const [newPartner, setNewPartner] = useState({ name: '', company: '', role: '', email: '', phone: '', notes: '' })
  const [successMessage, setSuccessMessage] = useState('')

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleAddProject = () => {
    if (!newProject.title.trim()) return
    addProject({
      id: String(Date.now()), title: newProject.title, status: 'planning',
      targetDate: newProject.targetDate || new Date().toISOString().slice(0, 10),
      progress: 0, outline: newProject.outline, targetAudience: newProject.targetAudience,
      marketResearch: '', chapters: [],
    })
    setNewProject({ title: '', targetDate: '', targetAudience: '', outline: '' })
    setShowAddProject(false)
    showSuccess('项目添加成功！')
  }

  const handleAddPartner = () => {
    if (!newPartner.name.trim()) return
    addPartner({ id: String(Date.now()), ...newPartner, status: 'negotiating' })
    setNewPartner({ name: '', company: '', role: '', email: '', phone: '', notes: '' })
    setShowAddPartner(false)
    showSuccess('合作方添加成功！')
  }

  const toggleChapter = (projId: string, chId: string) => {
    const proj = creativeProjects.find(p => p.id === projId)
    if (!proj) return
    const chapters = proj.chapters.map(c => c.id === chId ? { ...c, status: nextStatus[c.status] } : c)
    const doneCount = chapters.filter(c => c.status === 'done').length
    updateProject(projId, { chapters, progress: chapters.length ? Math.round(doneCount / chapters.length * 100) : 0 })
  }

  const circumference = 2 * Math.PI * 36

  return (
    <div className="p-8 space-y-6 relative">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
          <Check className="w-4 h-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}
      <h1 className="font-display text-3xl font-bold text-ink">创作计划</h1>

      <div className="flex gap-1 bg-ivory rounded-lg p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-ink text-gold shadow-sm' : 'text-ink/60 hover:text-ink'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddProject(!showAddProject)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加项目
            </button>
          </div>

          {showAddProject && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold" placeholder="项目标题" />
              <div className="flex gap-3">
                <input type="date" value={newProject.targetDate} onChange={e => setNewProject(p => ({ ...p, targetDate: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold" />
                <input value={newProject.targetAudience} onChange={e => setNewProject(p => ({ ...p, targetAudience: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="目标读者" />
              </div>
              <textarea value={newProject.outline} onChange={e => setNewProject(p => ({ ...p, outline: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={3} placeholder="内容提纲" />
              <button onClick={handleAddProject} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
            </div>
          )}

          {creativeProjects.map(proj => {
            const days = daysRemaining(proj.targetDate)
            const isExp = expanded === proj.id
            return (
              <div key={proj.id} className="bg-white rounded-xl shadow-sm border border-sand/50 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-ink">{proj.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusBadge[proj.status]}`}>{statusLabel[proj.status]}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-ink/50">
                    <span>目标日期: {proj.targetDate}</span>
                    <span className={days < 0 ? 'text-crimson font-medium' : ''}>
                      {days < 0 ? '已过期' : `剩余 ${days} 天`}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-ink/50 mb-1">
                      <span>进度</span><span>{proj.progress}%</span>
                    </div>
                    <div className="h-2 bg-sand rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                  <button onClick={() => setExpanded(isExp ? null : proj.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-ink/40 hover:text-ink transition-colors">
                    {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExp ? '收起详情' : '展开详情'}
                  </button>
                </div>
                {isExp && (
                  <div className="px-5 pb-5 border-t border-sand/50 space-y-3 pt-3">
                    {proj.targetAudience && (
                      <div><span className="text-xs font-medium text-ink/60">目标读者：</span><span className="text-sm text-ink/80">{proj.targetAudience}</span></div>
                    )}
                    {proj.marketResearch && (
                      <div><span className="text-xs font-medium text-ink/60">市场调研：</span><span className="text-sm text-ink/80">{proj.marketResearch}</span></div>
                    )}
                    {proj.outline && (
                      <div>
                        <span className="text-xs font-medium text-ink/60">内容提纲：</span>
                        <ul className="mt-1 space-y-0.5">
                          {proj.outline.split('\n').filter(Boolean).map((line, i) => (
                            <li key={i} className="text-sm text-ink/80 flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />{line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          {creativeProjects.map(proj => (
            <div key={proj.id} className="bg-white rounded-xl shadow-sm p-5 border border-sand/50">
              <h3 className="font-display text-lg font-semibold text-ink mb-4">{proj.title}</h3>
              <div className="flex items-center gap-6 mb-4">
                <svg width="90" height="90" className="shrink-0">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#E8E0D0" strokeWidth="6" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#D4A853" strokeWidth="6"
                    strokeDasharray={circumference} strokeDashoffset={circumference - (proj.progress / 100) * circumference}
                    strokeLinecap="round" transform="rotate(-90 45 45)" className="transition-all duration-500" />
                  <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
                    className="fill-ink font-display text-lg font-bold">{proj.progress}%</text>
                </svg>
                <div className="flex-1 space-y-1.5">
                  {proj.chapters.map(ch => {
                    const Icon = chapterStatusIcon[ch.status]
                    return (
                      <button key={ch.id} onClick={() => toggleChapter(proj.id, ch.id)}
                        className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-ivory transition-colors text-left">
                        <Icon className={`w-4 h-4 shrink-0 ${chapterStatusStyle[ch.status]}`} />
                        <span className="text-sm text-ink flex-1">{ch.title}</span>
                        <span className="text-xs text-ink/40">{ch.wordCount > 0 ? `${ch.wordCount}字` : '-'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ch.status === 'done' ? 'bg-green-100 text-green-700' : ch.status === 'writing' ? 'bg-gold-50 text-gold-700' : 'bg-sand text-ink/50'}`}>
                          {chapterStatusLabel[ch.status]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddPartner(!showAddPartner)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加合作方
            </button>
          </div>

          {showAddPartner && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <div className="flex gap-3">
                <input value={newPartner.name} onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="姓名" />
                <input value={newPartner.company} onChange={e => setNewPartner(p => ({ ...p, company: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="公司" />
                <input value={newPartner.role} onChange={e => setNewPartner(p => ({ ...p, role: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="职位" />
              </div>
              <div className="flex gap-3">
                <input value={newPartner.email} onChange={e => setNewPartner(p => ({ ...p, email: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="邮箱" />
                <input value={newPartner.phone} onChange={e => setNewPartner(p => ({ ...p, phone: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="电话" />
              </div>
              <textarea value={newPartner.notes} onChange={e => setNewPartner(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={2} placeholder="备注" />
              <button onClick={handleAddPartner} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map(p => {
              const isExp = expandedPartner === p.id
              return (
                <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-sand/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{p.name}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${partnerStatusBadge[p.status]}`}>{partnerStatusLabel[p.status]}</span>
                  </div>
                  <div className="text-sm text-ink/50 mt-0.5">{p.company} · {p.role}</div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-ink/70"><Mail className="w-3.5 h-3.5 text-ink/40" />{p.email}</div>
                    <div className="flex items-center gap-2 text-sm text-ink/70"><Phone className="w-3.5 h-3.5 text-ink/40" />{p.phone}</div>
                  </div>
                  {p.notes && (
                    <button onClick={() => setExpandedPartner(isExp ? null : p.id)}
                      className="mt-3 flex items-center gap-1 text-xs text-ink/40 hover:text-ink transition-colors">
                      {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isExp ? '收起备注' : '查看备注'}
                    </button>
                  )}
                  {isExp && <p className="mt-2 text-sm text-ink/60 border-t border-sand/50 pt-2">{p.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
