import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Search, Plus, Filter, X, ChevronLeft, Edit3, Trash2,
  History, ThumbsUp, ThumbsDown, Award, Target,
} from 'lucide-react'
import {
  fetchAPI, TYPE_LABELS, TYPE_COLORS, FRAMEWORK_LABELS, FRAMEWORK_COLORS,
  formatDate, formatDateTime, daysUntil, cn,
} from '@/lib/utils'
import { PageHeader, Stars, StrengthBar, Chip, Modal, EmptyState } from '@/components/UI'
import type { TopicListItem, TopicDetail, TopicType, Argument } from '../../shared/types.js'

export default function TopicsList() {
  const nav = useNavigate()
  const { id } = useParams()
  const [list, setList] = useState<TopicListItem[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TopicType | 'all'>('all')
  const [filterField, setFilterField] = useState<string>('all')
  const [filterDiff, setFilterDiff] = useState<number | 'all'>('all')
  const [showNew, setShowNew] = useState(false)
  const [detail, setDetail] = useState<TopicDetail | null>(null)

  const load = () => {
    const params = new URLSearchParams()
    if (filterType !== 'all') params.set('type', filterType)
    if (filterDiff !== 'all') params.set('difficulty', String(filterDiff))
    if (filterField !== 'all') params.set('field', filterField)
    if (search) params.set('search', search)
    fetchAPI<TopicListItem[]>('/api/topics?' + params.toString()).then(setList)
  }

  useEffect(() => { load() }, [filterType, filterField, filterDiff, search])
  useEffect(() => { fetchAPI<string[]>('/api/topics/fields').then(setFields) }, [])

  useEffect(() => {
    if (id) {
      fetchAPI<TopicDetail>('/api/topics/' + id).then(d => setDetail(d))
    } else {
      setDetail(null)
    }
  }, [id])

  const filtered = useMemo(() => list, [list])

  const submitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await fetchAPI('/api/topics', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          type: form.get('type'),
          difficulty: Number(form.get('difficulty')),
          field: form.get('field'),
          description: form.get('description'),
        }),
      })
      setShowNew(false)
      load()
    } catch {
      alert('保存失败')
    }
  }

  if (detail) {
    return <TopicDetailView detail={detail} onBack={() => nav('/topics')} />
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="辩题库"
        subtitle={`共 ${filtered.length} 道辩题 · 按类型、难度、领域分类管理`}
        breadcrumb="首页 / 辩题库"
        right={<button className="btn-gold flex items-center gap-2" onClick={() => setShowNew(true)}>
          <Plus size={18} /> 新增辩题
        </button>}
      />

      {/* 筛选栏 */}
      <div className="debate-card p-5 mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/40" size={18} />
          <input
            className="input-field !pl-11"
            placeholder="搜索辩题标题或描述…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-900/40 hover:text-ink-900">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="h-8 w-px bg-ink-100 hidden md:block" />
        <Filter size={16} className="text-ink-900/50 hidden md:block" />
        <select className="input-field !w-auto !py-2" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
          <option value="all">全部类型</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input-field !w-auto !py-2" value={filterDiff} onChange={e => setFilterDiff(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">全部难度</option>
          {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>难度 {d} ★</option>)}
        </select>
        <select className="input-field !w-auto !py-2" value={filterField} onChange={e => setFilterField(e.target.value)}>
          <option value="all">全部领域</option>
          {fields.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="没有找到符合条件的辩题" description="试试调整筛选条件或添加新的辩题" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t, i) => (
            <div
              key={t.id}
              className="debate-card p-6 flex flex-col group cursor-pointer animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => nav(`/topics/${t.id}`)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gold-500/5 blur-2xl group-hover:bg-gold-500/10 transition-all" />
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip className={TYPE_COLORS[t.type]}>{TYPE_LABELS[t.type]}</Chip>
                  <Chip className="bg-ink-100 text-ink-900/70">{t.field}</Chip>
                </div>
                <Stars value={t.difficulty} size={13} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900 leading-relaxed mb-3 line-clamp-2 group-hover:text-ink-950 min-h-[3.5rem]">
                {t.title}
              </h3>
              {t.description && (
                <p className="text-sm text-ink-900/60 leading-relaxed line-clamp-2 mb-4 flex-1">{t.description}</p>
              )}
              <div className="flex items-center justify-between pt-4 mt-auto border-t border-ink-100/50 text-xs text-ink-900/60">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Target size={12} className="text-gold-600" />
                    {t.argumentCount} 论点
                  </span>
                  <span className="flex items-center gap-1">
                    <History size={12} className="text-blue-600" />
                    {t.matchCount} 场
                  </span>
                </div>
                <span>{formatDate(t.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="新增辩题">
        <form onSubmit={submitNew} className="space-y-4">
          <div>
            <label className="label-field">辩题标题 *</label>
            <input name="title" className="input-field" required placeholder="例如：人工智能应该取代人类的大部分工作" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">辩题类型 *</label>
              <select name="type" className="input-field" required>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">难度等级 *</label>
              <select name="difficulty" className="input-field" required defaultValue={3}>
                {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>★{d} - {['入门', '简单', '中等', '困难', '极难'][d - 1]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">话题领域 *</label>
            <input name="field" className="input-field" required placeholder="科技伦理 / 教育 / 社会 / 文化..." />
          </div>
          <div>
            <label className="label-field">背景描述</label>
            <textarea name="description" className="textarea-field min-h-[80px]" placeholder="简要描述辩题的讨论背景和核心争议点..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setShowNew(false)}>取消</button>
            <button type="submit" className="btn-gold">保存辩题</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function TopicDetailView({ detail, onBack }: { detail: TopicDetail; onBack: () => void }) {
  const [tab, setTab] = useState<'pro' | 'con' | 'history'>('pro')

  const winRate = (() => {
    const total = detail.matchHistory.filter(m => m.status === 'completed').length
    if (total === 0) return null
    const proWin = detail.matchHistory.filter(m => m.status === 'completed' && m.winner === m.teamA).length
    return Math.round(proWin / total * 100)
  })()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={detail.title}
        subtitle={detail.description}
        breadcrumb={`首页 / 辩题库 / 辩题 #${detail.id}`}
        right={<button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ChevronLeft size={18} /> 返回列表
        </button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Chip className={TYPE_COLORS[detail.type]}>{TYPE_LABELS[detail.type]}</Chip>
        <Chip className="bg-ink-100 text-ink-900/70">{detail.field}</Chip>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-900/60">难度：</span>
          <Stars value={detail.difficulty} />
        </div>
        <div className="h-5 w-px bg-ink-100" />
        <span className="text-sm text-ink-900/60 flex items-center gap-1">
          <Target size={14} />
          共 {detail.proArguments.length + detail.conArguments.length} 个论点
        </span>
        {winRate !== null && (
          <span className="text-sm text-ink-900/60 flex items-center gap-1">
            <Award size={14} />
            正方胜率 {winRate}%
          </span>
        )}
      </div>

      {/* 论点强度总览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <StrengthOverviewCard title="正方论点强度" icon={ThumbsUp} args={detail.proArguments} color="pro" />
        <StrengthOverviewCard title="反方论点强度" icon={ThumbsDown} args={detail.conArguments} color="con" />
      </div>

      {/* Tab 切换 */}
      <div className="debate-card overflow-hidden">
        <div className="flex border-b-2 border-ink-100 p-2 gap-2">
          <TabBtn active={tab === 'pro'} onClick={() => setTab('pro')} color="pro">
            <ThumbsUp size={15} /> 正方论点 ({detail.proArguments.length})
          </TabBtn>
          <TabBtn active={tab === 'con'} onClick={() => setTab('con')} color="con">
            <ThumbsDown size={15} /> 反方论点 ({detail.conArguments.length})
          </TabBtn>
          <TabBtn active={tab === 'history'} onClick={() => setTab('history')}>
            <History size={15} /> 历史比赛 ({detail.matchHistory.length})
          </TabBtn>
        </div>

        <div className="p-6">
          {tab !== 'history' ? (
            <ArgumentList args={tab === 'pro' ? detail.proArguments : detail.conArguments} />
          ) : (
            <HistoryList matches={detail.matchHistory} />
          )}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: 'pro' | 'con' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
        active && color === 'pro' && 'bg-pro-50 text-pro-600 shadow-sm',
        active && color === 'con' && 'bg-con-50 text-con-600 shadow-sm',
        active && !color && 'bg-ink-900 text-gold-100 shadow-ink',
        !active && 'text-ink-900/60 hover:bg-ink-50 hover:text-ink-900',
      )}
    >{children}</button>
  )
}

function StrengthOverviewCard({ title, icon: Icon, args, color }: { title: string; icon: any; args: Argument[]; color: 'pro' | 'con' }) {
  const avg = args.length ? Math.round(args.reduce((s, a) => s + a.strength, 0) / args.length * 10) / 10 : 0
  const strong = args.filter(a => a.strength >= 8).length
  const weak = args.filter(a => a.strength <= 4).length
  return (
    <div className={cn(
      'debate-card p-6 relative overflow-hidden',
      color === 'pro' ? 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-pro-500'
                     : 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-con-500',
    )}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            color === 'pro' ? 'bg-pro-100 text-pro-500' : 'bg-con-100 text-con-500',
          )}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-ink-900">{title}</h3>
            <div className="text-xs text-ink-900/50">{args.length} 个论点 · 平均强度 {avg}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black font-serif text-ink-900">{args.length}</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-900/60 w-20 shrink-0">强论点 ({strong})</span>
          <StrengthBar value={args.length ? (strong / args.length * 10) : 0} showLabel={false} />
          <span className="text-xs font-bold text-emerald-600 w-12 text-right">{strong}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-900/60 w-20 shrink-0">中论点 ({args.length - strong - weak})</span>
          <StrengthBar value={args.length ? ((args.length - strong - weak) / args.length * 10) : 0} showLabel={false} />
          <span className="text-xs font-bold text-gold-600 w-12 text-right">{args.length - strong - weak}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-900/60 w-20 shrink-0">弱论点 ({weak})</span>
          <StrengthBar value={args.length ? (weak / args.length * 10) : 0} showLabel={false} />
          <span className="text-xs font-bold text-rose-600 w-12 text-right">{weak}</span>
        </div>
      </div>
    </div>
  )
}

function ArgumentList({ args }: { args: Argument[] }) {
  if (args.length === 0) return <EmptyState icon={Target} title="暂无论点" description="前往「论点整理」模块添加论点" />
  return (
    <div className="space-y-4">
      {args.map((a, i) => (
        <div key={a.id} className="border border-ink-100 rounded-xl p-5 hover:border-gold-400/50 hover:shadow-card transition-all animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip className={FRAMEWORK_COLORS[a.framework]}>{FRAMEWORK_LABELS[a.framework]}</Chip>
              <span className="text-xs text-ink-900/50">强度 {a.strength}/10</span>
            </div>
            <div className="w-32 shrink-0"><StrengthBar value={a.strength} showLabel={false} /></div>
          </div>
          <p className="font-serif text-lg font-semibold text-ink-900 leading-relaxed mb-3">{a.content}</p>
          {a.evidence && (
            <div className="bg-ink-50 rounded-lg px-4 py-3 text-sm text-ink-900/75 leading-relaxed border-l-3 border-gold-500">
              <span className="font-semibold text-ink-900">📚 论据：</span>{a.evidence}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-900/50">
            {a.rebuttal && <span className="flex items-start gap-1"><span className="font-bold text-con-600">反驳：</span>{a.rebuttal}</span>}
            {a.response && <span className="flex items-start gap-1"><span className="font-bold text-pro-600">回应：</span>{a.response}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function HistoryList({ matches }: { matches: any[] }) {
  if (matches.length === 0) return <EmptyState icon={History} title="暂无比赛记录" description="这道辩题还没有用于正式比赛" />
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-ink-100" />
      {matches.map((m, i) => (
        <div key={m.id} className="relative mb-6 last:mb-0 animate-slide-right" style={{ animationDelay: `${i * 50}ms` }}>
          <div className={cn(
            'absolute -left-[18px] top-6 w-4 h-4 rounded-full border-4 border-ink-50',
            m.status === 'completed' ? 'bg-gold-500' : 'bg-ink-200',
          )} />
          <div className="debate-card p-5 !shadow-none">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Chip className={m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}>
                {m.status === 'completed' ? '已完赛' : '待开赛'}
              </Chip>
              <span className="text-sm text-ink-900/60">{formatDateTime(m.date)} · {m.venue || '场地待定'}</span>
            </div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={cn('px-4 py-2 rounded-lg font-bold text-sm', m.winner === m.teamA ? 'bg-pro-100 text-pro-600 ring-2 ring-pro-500/30' : 'bg-pro-50 text-pro-500/70')}>
                {m.teamA} (正方)
              </span>
              <span className="text-ink-900/30 font-bold">VS</span>
              <span className={cn('px-4 py-2 rounded-lg font-bold text-sm', m.winner === m.teamB ? 'bg-con-100 text-con-600 ring-2 ring-con-500/30' : 'bg-con-50 text-con-500/70')}>
                {m.teamB} (反方)
              </span>
              {m.winner && (
                <div className="ml-auto flex items-center gap-2 text-gold-600 font-bold">
                  <Award size={16} /> 胜：{m.winner}
                </div>
              )}
            </div>
            {m.status !== 'completed' && (
              <div className="text-sm text-ink-900/50 pt-2 border-t border-ink-100/50 flex items-center gap-2">
                <span className="chip bg-blue-100 text-blue-800">{daysUntil(m.date)}</span>
              </div>
            )}
            {m.bestSpeaker && (
              <div className="text-sm text-ink-900/60 pt-2 border-t border-ink-100/50 flex items-center gap-2 mt-2">
                <Edit3 size={13} className="text-gold-600" />
                最佳辩手：<span className="font-semibold text-ink-900">{m.bestSpeaker}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
