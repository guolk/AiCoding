import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Calendar, MapPin, Trophy, Award, Plus, ChevronLeft,
  Clock, Users, CheckCircle, AlertTriangle, CheckSquare, Square, ChevronRight,
} from 'lucide-react'
import {
  fetchAPI, formatDate, formatDateTime, daysUntil, TYPE_COLORS, TYPE_LABELS, cn,
  FRAMEWORK_COLORS, FRAMEWORK_LABELS,
} from '@/lib/utils'
import { PageHeader, Chip, Modal, EmptyState } from '@/components/UI'
import type { Argument, Match, TopicListItem } from '../../shared/types.js'

interface EnrichedMatch extends Match {
  topicTitle: string
  topicType?: string
  review?: any
  keyArguments?: number[]
}

interface ReviewData {
  id: number
  matchId: number
  notes: string
  effectiveArguments: number[]
  failedArguments: number[]
}

export default function Matches() {
  const nav = useNavigate()
  const { id, review } = useParams()
  const [list, setList] = useState<EnrichedMatch[]>([])
  const [topics, setTopics] = useState<TopicListItem[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [showNew, setShowNew] = useState(false)
  const [current, setCurrent] = useState<EnrichedMatch | null>(null)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [argumentsData, setArgumentsData] = useState<Argument[]>([])

  const load = () => {
    fetchAPI<EnrichedMatch[]>('/api/matches').then(setList)
    fetchAPI<TopicListItem[]>('/api/topics').then(setTopics)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (id) {
      const m = list.find(x => x.id === Number(id))
      if (m) setCurrent(m)
    } else setCurrent(null)
  }, [id, list])

  useEffect(() => {
    if (current && review === 'review') {
      fetchAPI<ReviewData>(`/api/matches/${current.id}/review`).then(setReviewData)
      fetchAPI<Argument[]>(`/api/arguments?topicId=${current.topicId}`).then(setArgumentsData)
    }
  }, [current, review])

  const filtered = useMemo(() =>
    list.filter(m => filter === 'all' ? true : m.status === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [list, filter])

  const submitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await fetchAPI('/api/matches', {
        method: 'POST',
        body: JSON.stringify({
          topicId: Number(form.get('topicId')),
          date: new Date(String(form.get('date'))).toISOString(),
          venue: form.get('venue'),
          teamA: form.get('teamA'),
          teamB: form.get('teamB'),
        }),
      })
      setShowNew(false); load()
    } catch { alert('保存失败') }
  }

  if (current && review === 'review') {
    return <MatchReviewPage
      match={current}
      reviewData={reviewData}
      args={argumentsData}
      onBack={() => nav('/matches')}
      onSave={async (d: any) => {
        await fetchAPI(`/api/matches/${current.id}/review`, {
          method: 'POST', body: JSON.stringify(d),
        })
        alert('复盘已保存')
        nav('/matches')
      }}
    />
  }

  if (current) {
    return <MatchDetail match={current} onBack={() => nav('/matches')}
      onStartResult={() => nav(`/matches/${current.id}/review`)} />
  }

  // 日历数据
  const calendarDays = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear(), month = today.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    while (days.length % 7 !== 0) days.push(null)
    return { year, month, days }
  }, [])

  const matchByDate = useMemo(() => {
    const m: Record<string, EnrichedMatch[]> = {}
    filtered.forEach(x => {
      const k = formatDate(x.date)
      if (!m[k]) m[k] = []
      m[k].push(x)
    })
    return m
  }, [filtered])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="比赛管理"
        subtitle={`共 ${list.length} 场比赛 · ${list.filter(m => m.status === 'upcoming').length} 场待开赛`}
        breadcrumb="首页 / 比赛管理"
        right={
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white p-1 border border-ink-100 shadow-card">
              {(['list', 'calendar'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  view === v ? 'bg-ink-900 text-gold-100 shadow' : 'text-ink-900/60 hover:text-ink-900',
                )}>
                  {v === 'list' ? '📋 列表' : '🗓️ 日历'}
                </button>
              ))}
            </div>
            <button className="btn-gold flex items-center gap-2" onClick={() => setShowNew(true)}>
              <Plus size={18} /> 新建赛事
            </button>
          </div>
        }
      />

      <div className="flex gap-2 mb-6">
        {([
          { k: 'all', l: '全部', c: list.length },
          { k: 'upcoming', l: '待开赛', c: list.filter(m => m.status === 'upcoming').length },
          { k: 'completed', l: '已完赛', c: list.filter(m => m.status === 'completed').length },
        ] as const).map(f => (
          <button key={f.k} onClick={() => setFilter(f.k as any)} className={cn(
            'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
            filter === f.k ? 'bg-ink-900 text-gold-100 shadow-ink' : 'bg-white text-ink-900/70 border border-ink-100 hover:text-ink-900',
          )}>
            {f.l} <span className="ml-1.5 opacity-70">({f.c})</span>
          </button>
        ))}
      </div>

      {view === 'list' ? (
        filtered.length === 0 ? <EmptyState icon={Calendar} title="暂无比赛" description="点击「新建赛事」创建第一场比赛" />
          : (
            <div className="space-y-4">
              {filtered.map((m, i) => (
                <MatchCard key={m.id} match={m} index={i} onClick={() => nav(`/matches/${m.id}`)} />
              ))}
            </div>
          )
      ) : (
        <div className="debate-card p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="font-serif text-xl font-bold text-ink-900">
              {calendarDays.year} 年 {calendarDays.month + 1} 月
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-ink-900/50 pb-2 border-b border-ink-100">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.days.map((d, idx) => {
              const today = new Date(); const isToday = d && d.toDateString() === today.toDateString()
              const key = d ? formatDate(d.toISOString()) : ''
              const matches = d ? (matchByDate[key] || []) : []
              return (
                <div key={idx} className={cn(
                  'min-h-[96px] rounded-lg p-1.5 relative transition-colors',
                  d ? 'bg-ink-50/30 hover:bg-ink-50' : '',
                  isToday && 'ring-2 ring-gold-500 bg-gold-50/30',
                )}>
                  {d && (
                    <>
                      <div className={cn(
                        'text-xs font-bold mb-1',
                        isToday ? 'text-gold-600' : 'text-ink-900/60',
                      )}>{d.getDate()}</div>
                      <div className="space-y-1">
                        {matches.slice(0, 2).map(m => (
                          <div
                            key={m.id}
                            onClick={() => nav(`/matches/${m.id}`)}
                            className={cn(
                              'text-[10px] px-1.5 py-1 rounded cursor-pointer truncate font-semibold leading-tight',
                              m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gold-100 text-gold-800',
                            )}
                          >
                            {m.teamA.slice(0, 4)} vs {m.teamB.slice(0, 4)}
                          </div>
                        ))}
                        {matches.length > 2 && (
                          <div className="text-[10px] text-ink-900/40 text-center">+{matches.length - 2}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建赛事" size="lg">
        <form onSubmit={submitNew} className="space-y-4">
          <div>
            <label className="label-field">对阵辩题 *</label>
            <select name="topicId" className="input-field" required>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">比赛时间 *</label>
              <input name="date" type="datetime-local" className="input-field" required />
            </div>
            <div>
              <label className="label-field">比赛场地</label>
              <input name="venue" className="input-field" placeholder="学术报告厅A / 主楼301..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">正方队伍 *</label>
              <input name="teamA" className="input-field" required placeholder="晨曦辩论社" />
            </div>
            <div>
              <label className="label-field">反方队伍 *</label>
              <input name="teamB" className="input-field" required placeholder="星辰辩论队" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setShowNew(false)}>取消</button>
            <button type="submit" className="btn-gold">创建赛事</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MatchCard({ match, index, onClick }: { match: EnrichedMatch; index: number; onClick: () => void }) {
  return (
    <div className="debate-card p-5 cursor-pointer group animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onClick}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gold-500/5 blur-3xl group-hover:bg-gold-500/10 transition-all" />
      <div className="flex items-start gap-5">
        <div className="shrink-0 w-16 text-center">
          <div className={cn(
            'rounded-xl py-3 text-white shadow-ink font-serif',
            match.status === 'completed' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-gold-500 to-gold-700',
          )}>
            <div className="text-2xl font-black leading-none">{new Date(match.date).getDate()}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 mt-1">{new Date(match.date).toLocaleString('zh-CN', { month: 'short' })}</div>
          </div>
          <div className="mt-2 text-[10px] text-ink-900/50 font-medium">{daysUntil(match.date)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <Chip className="bg-ink-100 text-ink-900/70">
              <Calendar size={11} /> {formatDateTime(match.date)}
            </Chip>
            {match.venue && (
              <Chip className="bg-blue-100 text-blue-800">
                <MapPin size={11} /> {match.venue}
              </Chip>
            )}
            <Chip className={match.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gold-100 text-gold-800'}>
              {match.status === 'completed' ? <CheckCircle size={11} /> : <Clock size={11} />}
              {match.status === 'completed' ? '已完赛' : '待开赛'}
            </Chip>
          </div>
          <h3 className="font-serif text-lg font-bold text-ink-900 mb-4 line-clamp-1 group-hover:text-ink-950">
            {match.topicTitle}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn(
              'px-4 py-2 rounded-lg font-bold text-sm transition-all',
              match.winner === match.teamA ? 'bg-pro-100 text-pro-600 ring-2 ring-pro-500/30' : 'bg-pro-50 text-pro-500/80',
            )}>
              {match.teamA}
              {match.winner === match.teamA && <Trophy size={13} className="inline ml-1.5 -mt-0.5" />}
            </span>
            <span className="text-ink-900/30 font-black text-lg px-1">VS</span>
            <span className={cn(
              'px-4 py-2 rounded-lg font-bold text-sm transition-all',
              match.winner === match.teamB ? 'bg-con-100 text-con-600 ring-2 ring-con-500/30' : 'bg-con-50 text-con-500/80',
            )}>
              {match.teamB}
              {match.winner === match.teamB && <Trophy size={13} className="inline ml-1.5 -mt-0.5" />}
            </span>
            <div className="ml-auto flex items-center gap-3 text-xs text-ink-900/50">
              {match.bestSpeaker && (
                <span className="flex items-center gap-1 text-gold-700 font-semibold">
                  <Award size={13} /> 最佳辩手 {match.bestSpeaker}
                </span>
              )}
              <ChevronRight size={16} className="text-ink-900/30 group-hover:text-ink-900/60 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchDetail({ match, onBack, onStartResult }: {
  match: EnrichedMatch; onBack: () => void; onStartResult: () => void
}) {
  const [showResult, setShowResult] = useState(false)
  const topicType = ''

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${match.teamA} vs ${match.teamB}`}
        subtitle={match.topicTitle}
        breadcrumb={`首页 / 比赛管理 / #${match.id}`}
        right={<button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ChevronLeft size={18} /> 返回列表
        </button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="debate-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-ink-100/50">
            <div className="flex items-center gap-3 flex-wrap">
              <Chip className="bg-ink-100 text-ink-900/70"><Calendar size={12} /> {formatDateTime(match.date)}</Chip>
              {match.venue && <Chip className="bg-blue-100 text-blue-800"><MapPin size={12} /> {match.venue}</Chip>}
              <Chip className={match.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gold-100 text-gold-800'}>
                {match.status === 'completed' ? '已完赛' : '待开赛'}
              </Chip>
            </div>
            {match.status !== 'completed' && (
              <button className="btn-gold" onClick={() => setShowResult(true)}>录入赛果</button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 items-center">
            <TeamDisplay name={match.teamA} side="正方" win={match.winner === match.teamA} />
            <div className="text-center">
              <div className="text-5xl font-black font-serif text-ink-900/10 mb-1">VS</div>
              <div className="text-xs text-ink-900/40 uppercase tracking-widest">对阵</div>
            </div>
            <TeamDisplay name={match.teamB} side="反方" win={match.winner === match.teamB} />
          </div>

          {match.status === 'completed' && (
            <div className="mt-8 pt-6 border-t-2 border-ink-100/50 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-gold-50/70 border border-gold-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={20} className="text-gold-600" />
                  <span className="font-serif font-bold text-ink-900">胜方</span>
                </div>
                <div className="text-2xl font-black font-serif text-gold-700">{match.winner}</div>
              </div>
              <div className="p-5 rounded-xl bg-ink-gradient text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gold-500/20 blur-2xl" />
                <div className="flex items-center gap-2 mb-3 relative">
                  <Award size={20} className="text-gold-400" />
                  <span className="font-serif font-bold text-gold-100">最佳辩手</span>
                </div>
                <div className="text-2xl font-black font-serif text-gold-400 relative">{match.bestSpeaker || '未评选'}</div>
              </div>
              <div className="md:col-span-2 flex justify-center pt-2">
                <button className="btn-primary flex items-center gap-2" onClick={onStartResult}>
                  <CheckSquare size={18} /> {match.review ? '查看 / 编辑赛后复盘' : '开始赛后复盘'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="debate-card p-5">
            <div className="section-title !text-lg">辩题信息</div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-ink-900/50 mb-1">标题</div>
                <div className="font-serif font-semibold text-ink-900 leading-relaxed">{match.topicTitle}</div>
              </div>
              {match.topicType && (
                <div className="flex items-center gap-2">
                  <Chip className={TYPE_COLORS[match.topicType as 'policy']}>{TYPE_LABELS[match.topicType as 'policy']}</Chip>
                </div>
              )}
            </div>
          </div>
          <div className="debate-card p-5">
            <div className="section-title !text-lg">赛会提醒</div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2"><AlertTriangle size={15} className="text-gold-600 shrink-0 mt-0.5" /><span className="text-ink-900/80">赛前48小时完成论点整理</span></div>
              <div className="flex items-start gap-2"><Users size={15} className="text-blue-600 shrink-0 mt-0.5" /><span className="text-ink-900/80">赛前24小时确认队员分工</span></div>
              <div className="flex items-start gap-2"><Clock size={15} className="text-emerald-600 shrink-0 mt-0.5" /><span className="text-ink-900/80">赛后48小时内完成复盘</span></div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={showResult} onClose={() => setShowResult(false)} title="录入赛果">
        <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          try {
            await fetchAPI(`/api/matches/${match.id}/result`, {
              method: 'POST', body: JSON.stringify({
                winner: form.get('winner'), bestSpeaker: form.get('bestSpeaker'),
              }),
            })
            setShowResult(false); location.reload()
          } catch { alert('保存失败') }
        }} className="space-y-4">
          <div>
            <label className="label-field">获胜方 *</label>
            <select name="winner" className="input-field" required>
              <option value={match.teamA}>{match.teamA} (正方)</option>
              <option value={match.teamB}>{match.teamB} (反方)</option>
            </select>
          </div>
          <div>
            <label className="label-field">最佳辩手</label>
            <input name="bestSpeaker" className="input-field" placeholder="输入姓名" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setShowResult(false)}>取消</button>
            <button type="submit" className="btn-gold">保存赛果</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function TeamDisplay({ name, side, win }: { name: string; side: string; win?: boolean }) {
  return (
    <div className={cn(
      'rounded-2xl p-5 text-center transition-all relative overflow-hidden',
      side === '正方'
        ? (win ? 'bg-pro-100/80 border-2 border-pro-400 shadow-ink' : 'bg-pro-50 border border-pro-100')
        : (win ? 'bg-con-100/80 border-2 border-con-400 shadow-ink' : 'bg-con-50 border border-con-100'),
    )}>
      {win && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-lg animate-pulse">
          <Trophy size={15} />
        </div>
      )}
      <div className={cn(
        'text-xs font-bold mb-2 inline-block px-3 py-1 rounded-full',
        side === '正方' ? 'bg-pro-500 text-white' : 'bg-con-500 text-white',
      )}>{side}</div>
      <div className={cn(
        'font-serif text-xl font-black',
        side === '正方' ? 'text-pro-700' : 'text-con-700',
      )}>{name}</div>
      {win && <div className="mt-3 text-xs font-bold text-gold-700">🏆 获胜</div>}
    </div>
  )
}

function MatchReviewPage({ match, reviewData, args, onBack, onSave }: {
  match: EnrichedMatch
  reviewData: ReviewData | null
  args: Argument[]
  onBack: () => void
  onSave: (d: any) => Promise<void>
}) {
  const [effective, setEffective] = useState<number[]>(reviewData?.effectiveArguments || [])
  const [failed, setFailed] = useState<number[]>(reviewData?.failedArguments || [])
  const [notes, setNotes] = useState<string>(reviewData?.notes || '')

  const toggle = (id: number, list: number[], setList: any, other: number[], setOther: any) => {
    setOther(other.filter(x => x !== id))
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="赛后复盘"
        subtitle={`${match.teamA} vs ${match.teamB} · ${match.topicTitle}`}
        breadcrumb={`首页 / 比赛管理 / #${match.id} / 复盘`}
        right={<button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ChevronLeft size={18} /> 返回
        </button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ReviewBox
          title="✨ 表现优秀的论点"
          subtitle="比赛中起了关键作用、评委好评的论点"
          color="emerald"
          args={args}
          selected={effective}
          onToggle={(id) => toggle(id, effective, setEffective, failed, setFailed)}
        />
        <ReviewBox
          title="⚠️ 应对失误的论点"
          subtitle="被对方攻破、我方回应不足的论点"
          color="rose"
          args={args}
          selected={failed}
          onToggle={(id) => toggle(id, failed, setFailed, effective, setEffective)}
        />
      </div>

      <div className="debate-card p-6 mb-6">
        <div className="section-title">复盘总结</div>
        <textarea
          className="textarea-field min-h-[160px]"
          placeholder="请详细复盘本场比赛的得失：哪些论点准备充分、哪些环节应对不足、下次需要改进的方面..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-outline" onClick={onBack}>取消</button>
        <button className="btn-gold" onClick={() => onSave({ effectiveArguments: effective, failedArguments: failed, notes })}>
          保存复盘报告
        </button>
      </div>
    </div>
  )
}

function ReviewBox({ title, subtitle, color, args, selected, onToggle }: {
  title: string; subtitle: string; color: 'emerald' | 'rose'
  args: Argument[]; selected: number[]; onToggle: (id: number) => void
}) {
  const ring = color === 'emerald' ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
  const headBg = color === 'emerald' ? 'from-emerald-500 to-emerald-700' : 'from-rose-500 to-rose-700'
  const argBg = color === 'emerald' ? 'border-emerald-400/50 bg-emerald-50' : 'border-rose-400/50 bg-rose-50'
  return (
    <div className="debate-card overflow-hidden">
      <div className={`bg-gradient-to-r ${headBg} text-white p-5`}>
        <div className="font-serif text-lg font-bold">{title}</div>
        <div className="text-xs opacity-80 mt-1">{subtitle} · 已选 {selected.length}</div>
      </div>
      <div className="p-4 max-h-[480px] overflow-y-auto scrollbar-thin space-y-2.5">
        {args.length === 0 && <EmptyState title="暂无论点数据" />}
        {args.map(a => (
          <button
            key={a.id}
            onClick={() => onToggle(a.id)}
            className={cn(
              'w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3',
              selected.includes(a.id) ? ring + ' shadow-md' : 'border-ink-100 bg-white hover:border-ink-200',
            )}
          >
            <div className="shrink-0 mt-0.5">
              {selected.includes(a.id)
                ? <CheckSquare size={18} className={color === 'emerald' ? 'text-emerald-600' : 'text-rose-600'} />
                : <Square size={18} className="text-ink-900/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Chip className={cn(FRAMEWORK_COLORS[a.framework], '!text-[10px]')}>{FRAMEWORK_LABELS[a.framework]}</Chip>
                <Chip className={a.side === 'pro' ? 'bg-pro-100 text-pro-700 !text-[10px]' : 'bg-con-100 text-con-700 !text-[10px]'}>
                  {a.side === 'pro' ? '正方' : '反方'}
                </Chip>
                <span className="text-xs text-ink-900/50">强度 {a.strength}</span>
              </div>
              <div className="text-sm font-semibold text-ink-900 leading-relaxed line-clamp-2">{a.content}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
