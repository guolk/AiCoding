import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Target, ChevronDown, ChevronUp, Plus, Shield, Sword, Zap, TrendingUp, TrendingDown,
} from 'lucide-react'
import {
  fetchAPI, FRAMEWORK_LABELS, FRAMEWORK_COLORS, TYPE_LABELS, TYPE_COLORS, cn,
} from '@/lib/utils'
import { PageHeader, Chip, Modal, StrengthBar, EmptyState } from '@/components/UI'
import type { Argument, Topic, TopicListItem } from '../../shared/types.js'

interface FrameworksData {
  pro: Argument[]
  con: Argument[]
  byFramework: {
    value: { pro: Argument[]; con: Argument[] }
    fact: { pro: Argument[]; con: Argument[] }
    logic: { pro: Argument[]; con: Argument[] }
  }
}

export default function Arguments() {
  const { topicId } = useParams()
  const [topics, setTopics] = useState<TopicListItem[]>([])
  const [currentTopicId, setCurrentTopicId] = useState<number>(0)
  const [data, setData] = useState<FrameworksData | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ value: true, fact: true, logic: true })
  const [showAdd, setShowAdd] = useState(false)
  const [currentTopic, setCurrentTopic] = useState<TopicListItem | null>(null)

  useEffect(() => {
    fetchAPI<TopicListItem[]>('/api/topics').then(list => {
      setTopics(list)
      const id = topicId ? Number(topicId) : list[0]?.id
      if (id) {
        setCurrentTopicId(id)
      }
    })
  }, [topicId])

  useEffect(() => {
    if (!currentTopicId) return
    fetchAPI<FrameworksData>(`/api/arguments/by-topic/${currentTopicId}`).then(setData)
    setCurrentTopic(topics.find(t => t.id === currentTopicId) || null)
  }, [currentTopicId, topics])

  const submitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await fetchAPI('/api/arguments', {
        method: 'POST',
        body: JSON.stringify({
          topicId: currentTopicId,
          side: form.get('side'),
          framework: form.get('framework'),
          content: form.get('content'),
          evidence: form.get('evidence'),
          rebuttal: form.get('rebuttal'),
          response: form.get('response'),
          strength: Number(form.get('strength') || 5),
        }),
      })
      setShowAdd(false)
      fetchAPI<FrameworksData>(`/api/arguments/by-topic/${currentTopicId}`).then(setData)
    } catch {
      alert('保存失败')
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="论点整理"
        subtitle="价值判断 / 事实依据 / 逻辑推理 · 三层结构化备战"
        breadcrumb="首页 / 论点整理"
        right={
          <div className="flex items-center gap-3">
            <select
              className="input-field !w-auto !py-2 font-semibold"
              value={currentTopicId}
              onChange={e => setCurrentTopicId(Number(e.target.value))}
            >
              {topics.map(t => <option key={t.id} value={t.id}>{t.title.slice(0, 20)}…</option>)}
            </select>
            <button className="btn-gold flex items-center gap-2" onClick={() => setShowAdd(true)} disabled={!currentTopicId}>
              <Plus size={18} /> 新增论点
            </button>
          </div>
        }
      />

      {currentTopic && (
        <div className="debate-card p-5 mb-8 flex flex-wrap items-center gap-4 animate-slide-up">
          <div className="flex-1 min-w-0">
            <div className="font-serif text-xl font-bold text-ink-900 mb-1.5">{currentTopic.title}</div>
            {currentTopic.description && <p className="text-sm text-ink-900/60">{currentTopic.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Chip className={TYPE_COLORS[currentTopic.type]}>{TYPE_LABELS[currentTopic.type]}</Chip>
            <Chip className="bg-ink-100 text-ink-900/70">{currentTopic.field}</Chip>
          </div>
        </div>
      )}

      {!data ? (
        <div className="flex justify-center py-20 text-ink-900/40">加载中…</div>
      ) : (
        <>
          {/* 三层框架 */}
          <div className="space-y-5 mb-12">
            {(['value', 'fact', 'logic'] as const).map((fw, idx) => (
              <FrameworkSection
                key={fw}
                framework={fw}
                data={data.byFramework[fw]}
                index={idx}
                expanded={expanded[fw]}
                onToggle={() => setExpanded(p => ({ ...p, [fw]: !p[fw] }))}
              />
            ))}
          </div>

          {/* 正反方对照表 */}
          <div className="mb-12">
            <div className="section-title flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sword size={20} className="text-gold-600" />
                <span>正反方论点对照表</span>
              </div>
              <span className="text-sm font-sans text-ink-900/50">共 {data.pro.length + data.con.length} 个论点</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0">
              <div className="debate-card p-5 !rounded-r-none border-r-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pro-500 to-pro-500/30" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-pro-100 text-pro-600 flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-ink-900">正方论点</div>
                    <div className="text-xs text-ink-900/50">{data.pro.length} 条主张</div>
                  </div>
                </div>
                <ArgumentPairSide args={data.pro} side="pro" />
              </div>

              <div className="flex lg:flex-col items-center justify-center py-5 lg:py-0 lg:px-2 gap-2 lg:gap-4">
                <div className="w-10 h-10 rounded-full bg-ink-gradient text-gold-400 flex items-center justify-center shadow-ink z-10">
                  <Zap size={18} />
                </div>
                <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-ink-200 to-transparent" />
              </div>

              <div className="debate-card p-5 !rounded-l-none border-l-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-con-500 to-con-500/30" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-con-100 text-con-600 flex items-center justify-center">
                    <Sword size={18} />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-ink-900">反方论点</div>
                    <div className="text-xs text-ink-900/50">{data.con.length} 条主张</div>
                  </div>
                </div>
                <ArgumentPairSide args={data.con} side="con" />
              </div>
            </div>
          </div>

          {/* 强度评估热力图 */}
          <div>
            <div className="section-title flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-gold-600" />
                <span>论点强度评估矩阵</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-900/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-400" /> 弱
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400" /> 一般
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gold-500" /> 较强
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" /> 极强
                </div>
              </div>
            </div>

            <div className="debate-card p-6 overflow-x-auto">
              <HeatmapMatrix pro={data.pro} con={data.con} />
            </div>
          </div>
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增论点" size="lg">
        <form onSubmit={submitNew} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-field">立场 *</label>
              <select name="side" className="input-field" required>
                <option value="pro">正方</option>
                <option value="con">反方</option>
              </select>
            </div>
            <div>
              <label className="label-field">框架层 *</label>
              <select name="framework" className="input-field" required>
                {Object.entries(FRAMEWORK_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">强度评分 *</label>
              <input name="strength" type="number" min="1" max="10" defaultValue={5} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label-field">论点核心 *</label>
            <textarea name="content" className="textarea-field" required placeholder="用一句话清晰概括此论点的核心主张..." />
          </div>
          <div>
            <label className="label-field">主要论据</label>
            <textarea name="evidence" className="textarea-field" placeholder="数据、案例、权威出处等支持材料..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">可能的反驳</label>
              <textarea name="rebuttal" className="textarea-field !min-h-[70px]" placeholder="对方可能从哪些角度攻击此论点..." />
            </div>
            <div>
              <label className="label-field">我方回应策略</label>
              <textarea name="response" className="textarea-field !min-h-[70px]" placeholder="针对反驳的应对话术或补充论证..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>取消</button>
            <button type="submit" className="btn-gold">保存论点</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function FrameworkSection({
  framework, data, index, expanded, onToggle,
}: {
  framework: 'value' | 'fact' | 'logic';
  data: { pro: Argument[]; con: Argument[] };
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const titles = {
    value: { title: '价值判断层', desc: '辩题中的根本价值取向、道德标准、哲学立场', icon: '⚖️' },
    fact: { title: '事实依据层', desc: '可验证的数据、统计、案例、历史经验', icon: '📊' },
    logic: { title: '逻辑推理层', desc: '从前提到结论的推导链、因果关系、类比论证', icon: '🧠' },
  } as const
  const cfg = titles[framework]
  const total = data.pro.length + data.con.length
  const gapColor = { value: 'from-amber-400', fact: 'from-emerald-400', logic: 'from-sky-400' } as const

  return (
    <div className="debate-card overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <button
        onClick={onToggle}
        className={cn(
          'w-full p-5 flex items-center gap-4 text-left transition-colors hover:bg-ink-50/50',
          !expanded && 'border-b-0',
        )}
      >
        <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br', gapColor[framework], 'to-ink-900 text-white flex items-center justify-center text-2xl shadow-ink shrink-0')}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-serif text-xl font-bold text-ink-900">{cfg.title}</h3>
            <Chip className={FRAMEWORK_COLORS[framework]}>第 {index + 1} 层</Chip>
            <Chip className="bg-ink-100 text-ink-900/70">{total} 个论点</Chip>
          </div>
          <div className="text-sm text-ink-900/60">{cfg.desc}</div>
        </div>
        <div className={cn('transition-transform duration-300 text-ink-900/40', expanded && 'rotate-180')}>
          {expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </div>
      </button>

      {expanded && total === 0 && (
        <div className="p-12 text-center text-ink-900/40 text-sm border-t border-ink-100/50">
          此层框架暂无论点 · 点击右上角「新增论点」开始整理
        </div>
      )}

      {expanded && total > 0 && (
        <div className="border-t border-ink-100/50 p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-gradient-to-b from-ink-50/20 to-transparent">
          <FrameworkArgsList args={data.pro} label="正方" side="pro" />
          <FrameworkArgsList args={data.con} label="反方" side="con" />
        </div>
      )}
    </div>
  )
}

function FrameworkArgsList({ args, label, side }: { args: Argument[]; label: string; side: 'pro' | 'con' }) {
  const c = side === 'pro' ? 'pro' : 'con'
  return (
    <div>
      <div className={cn('flex items-center gap-2 mb-3 pb-3 border-b-2 border-dashed', side === 'pro' ? 'border-pro-100' : 'border-con-100')}>
        <span className={cn('font-serif font-bold', side === 'pro' ? 'text-pro-600' : 'text-con-600')}>{label}立场</span>
        <span className="text-xs text-ink-900/50">{args.length} 条</span>
      </div>
      {args.length === 0 ? (
        <div className="text-sm text-ink-900/40 py-6 text-center italic">暂未整理{label}论点</div>
      ) : (
        <div className="space-y-3">
          {args.map(a => (
            <div key={a.id} className={cn(
              'p-4 rounded-xl border transition-all hover:shadow-sm',
              side === 'pro' ? 'bg-white border-pro-100/60 hover:border-pro-300' : 'bg-white border-con-100/60 hover:border-con-300',
            )}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-medium text-ink-900 text-sm leading-relaxed flex-1">{a.content}</p>
                <span className="shrink-0 w-12"><StrengthBar value={a.strength} showLabel={false} /></span>
              </div>
              {a.evidence && (
                <div className="text-xs text-ink-900/60 leading-relaxed pl-3 border-l-2 border-ink-100">
                  {a.evidence}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ArgumentPairSide({ args, side }: { args: Argument[]; side: 'pro' | 'con' }) {
  if (args.length === 0) return <EmptyState title="暂无论点" icon={Target} />
  return (
    <div className="space-y-3">
      {args.map((a, i) => (
        <div key={a.id} className={cn(
          'p-4 rounded-xl border transition-all group animate-slide-up',
          side === 'pro' ? 'bg-pro-50/40 border-pro-100' : 'bg-con-50/40 border-con-100',
        )} style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip className={FRAMEWORK_COLORS[a.framework]}>{FRAMEWORK_LABELS[a.framework]}</Chip>
              <span className="text-[10px] text-ink-900/40">#{a.id}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {a.strength >= 7 ? <TrendingUp size={12} className="text-emerald-600" />
                : a.strength <= 4 ? <TrendingDown size={12} className="text-rose-600" /> : null}
              <span className="text-xs font-bold text-ink-900">{a.strength}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-ink-900 leading-relaxed mb-2.5">{a.content}</p>
          {a.rebuttal && (
            <div className={cn(
              'text-xs p-2.5 rounded-lg mb-1.5 border-dashed border',
              side === 'pro' ? 'bg-con-50/80 text-con-800 border-con-200/60' : 'bg-pro-50/80 text-pro-800 border-pro-200/60',
            )}>
              <span className="font-bold mr-1">💬 反驳：</span>{a.rebuttal}
            </div>
          )}
          {a.response && (
            <div className={cn(
              'text-xs p-2.5 rounded-lg border-dashed border',
              side === 'pro' ? 'bg-pro-50/80 text-pro-800 border-pro-200/60' : 'bg-con-50/80 text-con-800 border-con-200/60',
            )}>
              <span className="font-bold mr-1">🛡️ 回应：</span>{a.response}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function HeatmapMatrix({ pro, con }: { pro: Argument[]; con: Argument[] }) {
  const all = [...pro.map(a => ({ ...a, _side: 'pro' as const })), ...con.map(a => ({ ...a, _side: 'con' as const }))]
    .sort((a, b) => b.strength - a.strength)

  if (all.length === 0) return <EmptyState icon={Target} title="暂无数据" />

  const fws: Array<'value' | 'fact' | 'logic'> = ['value', 'fact', 'logic']
  const cellColor = (s: number) => {
    if (s >= 8) return 'bg-emerald-500'
    if (s >= 6) return 'bg-gold-500'
    if (s >= 4) return 'bg-amber-400'
    return 'bg-rose-400'
  }
  const cellText = (s: number) => s >= 6 ? 'text-white' : 'text-ink-900'

  return (
    <div>
      {/* 正反方总览 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <HeatSideSummary args={pro} side="pro" />
        <HeatSideSummary args={con} side="con" />
      </div>

      <div className="text-xs text-ink-900/50 mb-3 font-semibold">按三层框架 × 强度分档分布</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-ink-900/60">
            <th className="text-left p-2 font-semibold w-24">框架</th>
            <th className="text-left p-2 font-semibold">正方</th>
            <th className="text-left p-2 font-semibold">反方</th>
          </tr>
        </thead>
        <tbody>
          {fws.map(fw => {
            const proArgs = pro.filter(a => a.framework === fw)
            const conArgs = con.filter(a => a.framework === fw)
            return (
              <tr key={fw} className="border-t border-ink-100">
                <td className="p-3">
                  <Chip className={FRAMEWORK_COLORS[fw]}>{FRAMEWORK_LABELS[fw]}</Chip>
                </td>
                <td className="p-3">
                  {proArgs.length === 0 ? <span className="text-xs text-ink-900/30 italic">—</span> : (
                    <div className="flex flex-wrap gap-2">
                      {proArgs.map(a => (
                        <div key={a.id} className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm',
                          cellColor(a.strength), cellText(a.strength),
                        )} title={a.content}>
                          {a.strength} · {a.content.slice(0, 15)}{a.content.length > 15 ? '…' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {conArgs.length === 0 ? <span className="text-xs text-ink-900/30 italic">—</span> : (
                    <div className="flex flex-wrap gap-2">
                      {conArgs.map(a => (
                        <div key={a.id} className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm',
                          cellColor(a.strength), cellText(a.strength),
                        )} title={a.content}>
                          {a.strength} · {a.content.slice(0, 15)}{a.content.length > 15 ? '…' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HeatSideSummary({ args, side }: { args: Argument[]; side: 'pro' | 'con' }) {
  const avg = args.length ? Math.round(args.reduce((s, a) => s + a.strength, 0) / args.length * 10) / 10 : 0
  const max = args.length ? Math.max(...args.map(a => a.strength)) : 0
  return (
    <div className={cn(
      'p-4 rounded-xl border-2',
      side === 'pro' ? 'bg-pro-50/50 border-pro-100' : 'bg-con-50/50 border-con-100',
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold font-serif text-ink-900">{side === 'pro' ? '正方' : '反方'}综合</div>
        <Chip className={side === 'pro' ? 'bg-pro-500 text-white' : 'bg-con-500 text-white'}>{args.length} 论点</Chip>
      </div>
      <div className="flex items-end gap-6">
        <div>
          <div className="text-xs text-ink-900/50 mb-0.5">平均强度</div>
          <div className="text-3xl font-black font-serif text-ink-900">{avg || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-ink-900/50 mb-0.5">最强论点</div>
          <div className="text-3xl font-black font-serif text-emerald-600">{max || '—'}</div>
        </div>
        <div className="flex-1 min-w-[60px]">
          <div className="text-xs text-ink-900/50 mb-1.5">分布</div>
          <div className="h-20 flex items-end gap-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lv => {
              const n = args.filter(a => a.strength === lv).length
              return (
                <div key={lv} className="flex-1 flex flex-col items-center justify-end">
                  <div
                    className={cn('w-full rounded-t transition-all', lv >= 8 ? 'bg-emerald-500' : lv >= 6 ? 'bg-gold-500' : lv >= 4 ? 'bg-amber-400' : 'bg-rose-400')}
                    style={{ height: n ? `${Math.max(n * 20, 6)}%` : '0%' }}
                    title={`强度${lv}: ${n}个`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
