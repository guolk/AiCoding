import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Award, BookOpen, Calendar, ChevronLeft, Edit3, Plus, Target, TrendingUp,
  User, Users, Zap, PenTool, MessageSquare, Mic, Sparkles,
} from 'lucide-react'
import {
  fetchAPI, ROLE_LABELS, PRACTICE_LABELS, PRACTICE_COLORS, TYPE_COLORS, TYPE_LABELS,
  formatDate, formatDateTime, cn, FRAMEWORK_LABELS, FRAMEWORK_COLORS,
} from '@/lib/utils'
import { PageHeader, Chip, Modal, EmptyState } from '@/components/UI'
import type { Practice, SpeechFragment } from '../../shared/types.js'

interface MemberOverview {
  id: number
  name: string
  role: string
  joinDate: string
  latestSkills: { argumentation: number; interrogation: number; speech: number; improvisation: number } | null
  avgScore: number
  practiceCount: number
  fragmentCount: number
}

export default function Training() {
  const nav = useNavigate()
  const { memberId } = useParams()
  const [team, setTeam] = useState<MemberOverview[]>([])
  const [fragments, setFragments] = useState<any[]>([])
  const [member, setMember] = useState<MemberOverview | null>(null)
  const [practices, setPractices] = useState<any[]>([])
  const [skillHistory, setSkillHistory] = useState<any[]>([])
  const [showAddPractice, setShowAddPractice] = useState(false)
  const [showAddFragment, setShowAddFragment] = useState(false)
  const [topics, setTopics] = useState<any[]>([])

  useEffect(() => {
    fetchAPI<MemberOverview[]>('/api/members/team/overview').then(setTeam)
    fetchAPI<any[]>('/api/members/fragments').then(setFragments)
    fetchAPI<any[]>('/api/topics').then(setTopics)
  }, [])

  useEffect(() => {
    if (memberId) {
      const id = Number(memberId)
      const m = team.find(t => t.id === id)
      if (m) setMember(m)
      fetchAPI<any[]>(`/api/members/${id}/practices`).then(setPractices)
      fetchAPI<any[]>(`/api/members/${id}/skills`).then(setSkillHistory)
    } else {
      setMember(null)
    }
  }, [memberId, team])

  if (member) {
    return <MemberDetail
      member={member} practices={practices} fragments={fragments.filter(f => f.memberId === member.id)}
      skillHistory={skillHistory} topics={topics}
      onBack={() => nav('/training')}
      onAddPractice={setShowAddPractice}
      onAddFragment={() => setShowAddFragment(true)}
      refreshPractices={() => fetchAPI<any[]>(`/api/members/${member.id}/practices`).then(setPractices)}
      refreshFragments={() => fetchAPI<any[]>('/api/members/fragments').then(setFragments)}
      showAddPractice={showAddPractice}
      setShowAddPractice={setShowAddPractice}
    />
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="队员训练"
        subtitle={`全队 ${team.filter(t => t.role !== 'coach').length} 名队员 · 个人能力评估与训练跟踪`}
        breadcrumb="首页 / 队员训练"
        right={
          <div className="flex items-center gap-3">
            <button className="btn-outline flex items-center gap-2" onClick={() => setShowAddFragment(true)}>
              <Edit3 size={16} /> 收录发言
            </button>
            <button className="btn-gold flex items-center gap-2" onClick={() => setShowAddPractice(true)}>
              <Plus size={18} /> 记录训练
            </button>
          </div>
        }
      />

      {/* 队伍总览 */}
      <div className="mb-10">
        <div className="section-title">队伍能力总览</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <TeamSkillCard label="立论" icon={PenTool} value={teamAvg(team, 'argumentation')} color="violet" />
          <TeamSkillCard label="盘问" icon={MessageSquare} value={teamAvg(team, 'interrogation')} color="rose" />
          <TeamSkillCard label="陈词" icon={Mic} value={teamAvg(team, 'speech')} color="indigo" />
          <TeamSkillCard label="即兴应对" icon={Zap} value={teamAvg(team, 'improvisation')} color="orange" />
        </div>

        <div className="debate-card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-gradient text-gold-400 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <div className="font-serif font-bold text-ink-900">队员列表</div>
                <div className="text-xs text-ink-900/50">点击队员卡片查看详情与训练记录</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {team.map((m, i) => (
              <div key={m.id} onClick={() => nav(`/training/${m.id}`)}
                className="debate-card p-5 cursor-pointer group animate-slide-up relative overflow-hidden"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-gold-500/5 blur-2xl group-hover:bg-gold-500/10 transition-all" />
                <div className="flex items-start gap-4 mb-4 relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 text-gold-400 flex items-center justify-center font-serif text-2xl font-black shadow-ink shrink-0">
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg font-bold text-ink-900">{m.name}</h3>
                      <Chip className={m.role === 'coach' ? 'bg-blue-100 text-blue-800' : m.role === 'captain' ? 'bg-gold-100 text-gold-800' : 'bg-ink-100 text-ink-900/70'}>
                        {ROLE_LABELS[m.role]}
                      </Chip>
                    </div>
                    <div className="text-xs text-ink-900/50 flex items-center gap-1">
                      <Calendar size={10} /> {formatDate(m.joinDate)} 入队
                    </div>
                  </div>
                  {m.latestSkills && (
                    <div className="text-right shrink-0">
                      <div className="text-xs text-ink-900/50 mb-0.5">综合</div>
                      <div className="text-2xl font-black font-serif text-gold-600 leading-none">{m.avgScore}</div>
                    </div>
                  )}
                </div>
                {m.latestSkills ? (
                  <RadarMini skills={m.latestSkills} />
                ) : (
                  <div className="text-xs text-ink-900/40 italic text-center py-6">暂无能力评估记录</div>
                )}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-100/50 text-xs text-ink-900/60">
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {m.practiceCount} 次练习</span>
                  <span className="flex items-center gap-1"><Sparkles size={11} /> {m.fragmentCount} 段发言</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 优秀发言片段库 */}
      <div>
        <div className="section-title">优秀发言片段库</div>
        {fragments.length === 0 ? <EmptyState icon={Edit3} title="暂无发言片段" description="点击「收录发言」记录精彩瞬间" />
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fragments.map((f, i) => (
                <FragmentCard key={f.id} f={f} index={i} />
              ))}
            </div>
          )}
      </div>

      <AddPracticeModal
        open={showAddPractice} onClose={() => setShowAddPractice(false)}
        members={team} topics={topics}
        onDone={async () => setShowAddPractice(false)}
      />
      <AddFragmentModal
        open={showAddFragment} onClose={() => setShowAddFragment(false)}
        members={team} topics={topics}
        onDone={async () => { setShowAddFragment(false); fetchAPI<any[]>('/api/members/fragments').then(setFragments) }}
      />
    </div>
  )
}

function teamAvg(team: MemberOverview[], key: 'argumentation' | 'interrogation' | 'speech' | 'improvisation') {
  const xs = team.filter(t => t.latestSkills).map(t => t.latestSkills![key])
  if (xs.length === 0) return 0
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length * 10) / 10
}

function TeamSkillCard({ label, icon: Icon, value, color }: { label: string; icon: any; value: number; color: string }) {
  const colors: Record<string, string> = {
    violet: 'from-violet-500 to-violet-700',
    rose: 'from-rose-500 to-rose-700',
    indigo: 'from-indigo-500 to-indigo-700',
    orange: 'from-orange-500 to-orange-700',
  }
  return (
    <div className="debate-card p-5 relative overflow-hidden">
      <div className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl', colors[color])} />
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg', colors[color])}>
          <Icon size={20} />
        </div>
        <TrendingUp size={18} className="text-emerald-600" />
      </div>
      <div className="text-xs text-ink-900/60 font-medium mb-1">{label}</div>
      <div className="text-4xl font-black font-serif text-ink-900 tracking-tight">{value}</div>
      <div className="mt-4 h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div className={cn('h-full rounded-full bg-gradient-to-r', colors[color])} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}

function RadarMini({ skills }: { skills: { argumentation: number; interrogation: number; speech: number; improvisation: number } }) {
  const labels: [string, number][] = [
    ['立论', skills.argumentation],
    ['盘问', skills.interrogation],
    ['陈词', skills.speech],
    ['即兴', skills.improvisation],
  ]
  const size = 120, cx = size / 2, cy = size / 2, R = 44
  const pts = labels.map((_, i) => {
    const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
    return [cx + Math.cos(a) * R, cy + Math.sin(a) * R] as [number, number]
  })
  const valPts = labels.map((l, i) => {
    const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
    const r = (l[1] / 10) * R
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
  })

  return (
    <div className="flex items-center justify-center py-2">
      <svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((s, i) => (
          <polygon key={i} points={pts.map(p => [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s].join(',')).join(' ')}
            fill="none" stroke="#e8dfd1" strokeWidth="1" />
        ))}
        {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#e8dfd1" strokeWidth="1" />)}
        <polygon points={valPts.map(p => p.join(',')).join(' ')}
          fill="rgba(212,168,67,0.35)" stroke="#D4A843" strokeWidth="1.5" />
        {valPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#D4A843" />)}
        {labels.map((l, i) => {
          const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
          const x = cx + Math.cos(a) * (R + 14)
          const y = cy + Math.sin(a) * (R + 14)
          return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#2D2D2D" fontWeight="600" fontFamily="'Noto Sans SC'">{l[0]} {l[1]}</text>
        })}
      </svg>
    </div>
  )
}

function FragmentCard({ f, index }: { f: SpeechFragment & any; index: number }) {
  const tags = f.tagsArray || []
  return (
    <div className="debate-card p-6 animate-slide-up group relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600" />
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-9 h-9 rounded-xl bg-ink-gradient text-gold-400 flex items-center justify-center font-serif font-bold shrink-0">
          {f.memberName?.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 text-sm">{f.memberName}</div>
          <div className="text-xs text-ink-900/50 flex items-center gap-1">
            <Calendar size={10} /> {formatDate(f.createdAt)}
            {f.topicTitle && <> · {f.topicTitle.slice(0, 12)}…</>}
          </div>
        </div>
      </div>
      <blockquote className="font-serif text-ink-900 leading-relaxed relative pl-4 border-l-2 border-gold-400/60 italic">
        &ldquo;{f.content}&rdquo;
      </blockquote>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-ink-100/50">
          {tags.map((t: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 font-medium">
              #{t}
            </span>
          ))}
        </div>
      )}
      {f.notes && (
        <div className="mt-3 text-xs text-ink-900/60 leading-relaxed bg-ink-50/50 rounded-lg p-3">
          <span className="font-bold text-ink-900/70">📝 教练点评：</span>{f.notes}
        </div>
      )}
    </div>
  )
}

function MemberDetail({ member, practices, fragments, skillHistory, topics, onBack, onAddPractice, onAddFragment, refreshPractices, refreshFragments, showAddPractice, setShowAddPractice }: {
  member: MemberOverview; practices: any[]; fragments: any[]; skillHistory: any[]; topics: any[];
  onBack: () => void; onAddPractice: (v: boolean) => void; onAddFragment: () => void;
  refreshPractices: () => void; refreshFragments: () => void;
  showAddPractice: boolean; setShowAddPractice: (v: boolean) => void;
}) {
  const weakest = useMemo(() => {
    if (!member.latestSkills) return null
    const arr = Object.entries(member.latestSkills).map(([k, v]) => [k, v] as [string, number])
    arr.sort((a, b) => a[1] - b[1])
    return arr[0]
  }, [member])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={member.name}
        subtitle={`${ROLE_LABELS[member.role]} · ${formatDate(member.joinDate)} 入队`}
        breadcrumb={`首页 / 队员训练 / ${member.name}`}
        right={
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={18} /> 返回全队
            </button>
            <button className="btn-outline flex items-center gap-2" onClick={onAddFragment}>
              <Edit3 size={16} /> 收录发言
            </button>
            <button className="btn-gold flex items-center gap-2" onClick={() => onAddPractice(true)}>
              <Plus size={18} /> 记录训练
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 能力雷达 */}
        <div className="debate-card p-6 lg:col-span-1">
          <div className="section-title !text-lg mb-4">能力雷达图</div>
          {member.latestSkills ? (
            <div className="flex items-center justify-center py-2">
              <svg width="260" height="260">
                <RadarFull skills={member.latestSkills} />
              </svg>
            </div>
          ) : <EmptyState title="暂无评估数据" />}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(['argumentation', 'interrogation', 'speech', 'improvisation'] as const).map(k => {
              const v = member.latestSkills?.[k] || 0
              const isWeaker = weakest && weakest[0] === k
              return (
                <div key={k} className={cn(
                  'p-3 rounded-xl border-2',
                  isWeaker ? 'bg-rose-50 border-rose-200' : 'bg-ink-50/50 border-ink-100',
                )}>
                  <div className="text-xs text-ink-900/50 mb-1">{PRACTICE_LABELS[k]}{isWeaker && ' 🔴'}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-serif text-ink-900">{v}</span>
                    {skillHistory.length >= 2 && (() => {
                      const prev = skillHistory[skillHistory.length - 2][k]
                      const diff = v - prev
                      if (diff === 0) return null
                      return <span className={cn('text-xs font-bold', diff > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                        {diff > 0 ? '↑' : '↓'}{Math.abs(diff)}
                      </span>
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 专项训练 + 能力趋势 */}
        <div className="space-y-6 lg:col-span-2">
          <div className="debate-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title !text-lg !mb-0">专项训练记录</div>
              <span className="chip bg-ink-100 text-ink-900/70">共 {practices.length} 次</span>
            </div>
            {practices.length === 0 ? <EmptyState title="暂无训练记录" description="点击「记录训练」添加" icon={Target} />
              : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto scrollbar-thin pr-2">
                  {practices.map((p, i) => (
                    <div key={p.id} className="p-4 rounded-xl border border-ink-100 bg-ink-50/30 hover:border-gold-400/50 transition-all animate-slide-up"
                      style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Chip className={PRACTICE_COLORS[p.type]}>{PRACTICE_LABELS[p.type]}</Chip>
                          {p.topicTitle && <Chip className="bg-ink-100 text-ink-900/70">📖 {p.topicTitle}</Chip>}
                        </div>
                        <span className="text-xs text-ink-900/50 whitespace-nowrap">{formatDate(p.date)}</span>
                      </div>
                      <div className="text-sm font-semibold text-ink-900 mb-2">{p.content}</div>
                      {p.notes && <div className="text-xs text-ink-900/60 bg-white rounded-lg px-3 py-2 border border-ink-100/60">
                        💡 {p.notes}
                      </div>}
                    </div>
                  ))}
                </div>
              )}
          </div>

          {fragments.length > 0 && (
            <div className="debate-card p-6">
              <div className="section-title !text-lg mb-4">个人精彩发言</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fragments.slice(0, 4).map((f, i) => (
                  <div key={f.id} className="p-4 rounded-xl bg-gold-50/50 border border-gold-200/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} className="text-gold-600" />
                      <span className="text-xs text-ink-900/50">{formatDate(f.createdAt)}</span>
                    </div>
                    <div className="font-serif text-sm text-ink-900 leading-relaxed line-clamp-3 italic">
                      &ldquo;{f.content}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPracticeModal
        open={showAddPractice} onClose={() => setShowAddPractice(false)}
        members={[member]} topics={topics} defaultMember={member.id}
        onDone={async () => { setShowAddPractice(false); refreshPractices() }}
      />
    </div>
  )
}

function RadarFull({ skills }: { skills: { argumentation: number; interrogation: number; speech: number; improvisation: number } }) {
  const labels: [string, number][] = [
    ['立论', skills.argumentation],
    ['盘问', skills.interrogation],
    ['即兴', skills.improvisation],
    ['陈词', skills.speech],
  ]
  const size = 260, cx = size / 2, cy = size / 2, R = 95
  const pts = labels.map((_, i) => {
    const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
    return [cx + Math.cos(a) * R, cy + Math.sin(a) * R] as [number, number]
  })
  const valPts = labels.map((l, i) => {
    const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
    const r = (l[1] / 10) * R
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
  })
  return (
    <>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A843" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#D4A843" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <polygon key={i} points={pts.map(p => [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s].join(',')).join(' ')}
          fill="none" stroke="#E8DFD1" strokeWidth="1.2" />
      ))}
      {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#E8DFD1" strokeWidth="1.2" />)}
      <polygon points={valPts.map(p => p.join(',')).join(' ')}
        fill="url(#radarFill)" stroke="#D4A843" strokeWidth="2.5" />
      {valPts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="6" fill="#1B2A4A" stroke="#D4A843" strokeWidth="2.5" />
          <text x={p[0]} y={p[1] + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#D4A843" fontWeight="700">
            {labels[i][1]}
          </text>
        </g>
      ))}
      {labels.map((l, i) => {
        const a = (Math.PI * 2 * i) / labels.length - Math.PI / 2
        const x = cx + Math.cos(a) * (R + 30)
        const y = cy + Math.sin(a) * (R + 30)
        return (
          <g key={i}>
            <rect x={x - 28} y={y - 14} width="56" height="28" rx="8" fill="#1B2A4A" />
            <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fill="#D4A843" fontWeight="700" fontFamily="'Noto Serif SC'">{l[0]}</text>
            <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill="#F8EDC8" opacity="0.8">{l[1]}/10</text>
          </g>
        )
      })}
    </>
  )
}

function AddPracticeModal({ open, onClose, members, topics, defaultMember, onDone }: {
  open: boolean; onClose: () => void; members: MemberOverview[]; topics: any[]
  defaultMember?: number; onDone: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="记录专项训练" size="lg">
      <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        try {
          await fetchAPI('/api/members/practices', {
            method: 'POST', body: JSON.stringify({
              memberId: Number(form.get('memberId')),
              type: form.get('type'),
              topicId: form.get('topicId') ? Number(form.get('topicId')) : undefined,
              content: form.get('content'),
              notes: form.get('notes'),
            }),
          }); onDone()
        } catch { alert('保存失败') }
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">队员 *</label>
            <select name="memberId" className="input-field" required defaultValue={defaultMember || ''}>
              {members.filter(m => m.role !== 'coach').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">训练类型 *</label>
            <select name="type" className="input-field" required>
              {Object.entries(PRACTICE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-field">关联辩题</label>
          <select name="topicId" className="input-field" defaultValue="">
            <option value="">无</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.title.slice(0, 30)}…</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">训练内容 *</label>
          <textarea name="content" className="textarea-field" required placeholder="详细描述训练内容，例如：AI辩题立论框架练习，构建三层论点..." />
        </div>
        <div>
          <label className="label-field">点评 / 反思</label>
          <textarea name="notes" className="textarea-field !min-h-[80px]" placeholder="教练点评或队员自我反思..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>取消</button>
          <button type="submit" className="btn-gold">保存记录</button>
        </div>
      </form>
    </Modal>
  )
}

function AddFragmentModal({ open, onClose, members, topics, onDone }: {
  open: boolean; onClose: () => void; members: MemberOverview[]; topics: any[]; onDone: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="收录优秀发言" size="lg">
      <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        try {
          await fetchAPI('/api/members/fragments', {
            method: 'POST', body: JSON.stringify({
              memberId: Number(form.get('memberId')),
              topicId: form.get('topicId') ? Number(form.get('topicId')) : undefined,
              content: form.get('content'),
              tags: form.get('tags'),
              notes: form.get('notes'),
            }),
          }); onDone()
        } catch { alert('保存失败') }
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">发言队员 *</label>
            <select name="memberId" className="input-field" required>
              {members.filter(m => m.role !== 'coach').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">关联辩题</label>
            <select name="topicId" className="input-field" defaultValue="">
              <option value="">无</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title.slice(0, 30)}…</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-field">发言原文 *</label>
          <textarea name="content" className="textarea-field min-h-[140px]" required placeholder="完整或摘录的精彩发言文本..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">标签</label>
            <input name="tags" className="input-field" placeholder="用逗号分隔，例如：开篇,升华,反问" />
          </div>
          <div>
            <label className="label-field">学习笔记</label>
            <input name="notes" className="input-field" placeholder="可学习借鉴之处..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>取消</button>
          <button type="submit" className="btn-gold">收录发言</button>
        </div>
      </form>
    </Modal>
  )
}
