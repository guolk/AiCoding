import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LibraryBig, MessageSquareText, Trophy, Users, Calendar, Clock,
  CheckCircle2, Circle, ChevronRight, Plus, AlertCircle
} from 'lucide-react'
import { fetchAPI, formatDateTime, daysUntil, TYPE_COLORS, TYPE_LABELS, PRIORITY_COLORS, cn, ROLE_LABELS } from '@/lib/utils'
import { StatCard, PageHeader, Chip } from '@/components/UI'
import type { DashboardStats, TopicListItem } from '../../shared/types.js'

export default function Dashboard() {
  const nav = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTopics, setRecentTopics] = useState<TopicListItem[]>([])

  useEffect(() => {
    fetchAPI<DashboardStats>('/api/dashboard/stats').then(setStats).catch(() => {})
    fetchAPI<TopicListItem[]>('/api/topics').then(d => setRecentTopics(d.slice(0, 5))).catch(() => {})
  }, [])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="指挥台"
        subtitle="晨曦辩论社 · 备战状态总览"
        right={
          <div className="flex items-center gap-3">
            <span className="chip bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              赛季进行中
            </span>
            <span className="chip bg-ink-100 text-ink-900">
              2026 春季联赛
            </span>
          </div>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={LibraryBig} label="在库辩题" value={stats?.topicCount ?? 0} sub="覆盖 6 大话题领域" delay={0} />
        <StatCard icon={MessageSquareText} label="整理论点" value={stats?.argumentCount ?? 0} sub="正/反方结构化备战" delay={80} />
        <StatCard icon={Trophy} label="比赛场次" value={stats?.matchCount ?? 0} sub="已完赛 / 待开赛" delay={160} />
        <StatCard icon={Users} label="队员平均能力" value={stats?.avgSkill ?? 0} sub={`${stats?.memberCount ?? 0} 名队员综合评估`} delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 近期赛事 */}
        <div className="lg:col-span-2">
          <div className="section-title">近期赛事</div>
          {stats?.upcomingMatches.length === 0 ? (
            <div className="debate-card p-8 text-center text-ink-900/50">暂无近期赛事安排</div>
          ) : (
            <div className="space-y-4">
              {stats?.upcomingMatches.map((m, i) => (
                <div
                  key={m.id}
                  className="debate-card p-5 animate-slide-up cursor-pointer group"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => nav('/matches')}
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 text-center w-16">
                      <div className="text-xs text-ink-900/50 mb-1 font-medium">{daysUntil(m.date)}</div>
                      <div className="bg-ink-gradient rounded-xl py-3 text-white shadow-ink">
                        <div className="text-2xl font-black font-serif leading-none">{new Date(m.date).getDate()}</div>
                        <div className="text-[10px] text-gold-400 mt-1 uppercase tracking-wider">{new Date(m.date).toLocaleString('zh-CN', { month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Chip className="bg-amber-100 text-amber-800">
                          <Calendar size={11} />
                          {formatDateTime(m.date)}
                        </Chip>
                        {m.venue && (
                          <Chip className="bg-ink-100 text-ink-900/70">
                            <Clock size={11} />
                            {m.venue}
                          </Chip>
                        )}
                      </div>
                      <div className="font-serif text-lg font-bold text-ink-900 mb-3 line-clamp-1 group-hover:text-ink-950">
                        {m.topicTitle}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-3">
                          <span className="px-3 py-1.5 rounded-lg bg-pro-50 text-pro-500 font-bold text-sm border border-pro-100">{m.teamA}</span>
                          <span className="text-ink-900/30 font-bold">VS</span>
                          <span className="px-3 py-1.5 rounded-lg bg-con-50 text-con-500 font-bold text-sm border border-con-100">{m.teamB}</span>
                        </div>
                        <button className="shrink-0 btn-ghost !p-2 !rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 近期辩题 */}
          <div className="mt-10">
            <div className="flex items-end justify-between mb-4">
              <div className="section-title !mb-0">辩题速览</div>
              <button onClick={() => nav('/topics')} className="btn-ghost text-sm font-semibold flex items-center gap-1">
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            <div className="debate-card divide-y divide-ink-100 overflow-hidden">
              {recentTopics.map((t, i) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center gap-4 hover:bg-ink-50/50 transition-colors cursor-pointer"
                  onClick={() => nav(`/topics/${t.id}`)}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-ink-gradient text-gold-400 flex items-center justify-center shrink-0 font-serif font-black">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{t.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Chip className={TYPE_COLORS[t.type]}>{TYPE_LABELS[t.type]}</Chip>
                      <span className="text-xs text-ink-900/50">{t.field}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-ink-900/50">论点</div>
                    <div className="font-bold text-ink-900">{t.argumentCount}</div>
                  </div>
                  <div className="text-right shrink-0 pl-3 border-l border-ink-100">
                    <div className="text-xs text-ink-900/50">比赛</div>
                    <div className="font-bold text-ink-900">{t.matchCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：待办 + 教练寄语 */}
        <div className="space-y-6">
          <div className="section-title">待办事项</div>
          <div className="debate-card overflow-hidden">
            <div className="p-4 border-b border-ink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-gold-600" />
                <span className="text-sm font-semibold text-ink-900">本周重点</span>
              </div>
              <button className="btn-ghost !p-1.5 !rounded-lg">
                <Plus size={16} />
              </button>
            </div>
            <div className="divide-y divide-ink-100">
              {stats?.pendingTodos.slice(0, 6).map((t, i) => (
                <div
                  key={t.id}
                  className="p-4 flex items-start gap-3 hover:bg-ink-50/50 transition-colors group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button className="mt-0.5 shrink-0 text-ink-900/30 group-hover:text-pro-500 transition-colors">
                    <Circle size={18} fill="white" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-ink-900 flex items-center gap-2">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_COLORS[t.priority])} />
                      {t.title}
                    </div>
                    {t.dueDate && (
                      <div className="text-xs text-ink-900/50 mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        {daysUntil(t.dueDate)} 截止
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {stats?.pendingTodos.length === 0 && (
                <div className="p-8 text-center text-ink-900/50 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={32} className="text-pro-500" />
                  所有任务已完成！
                </div>
              )}
            </div>
          </div>

          {/* 教练寄语卡 */}
          <div className="relative overflow-hidden rounded-2xl p-6 bg-ink-gradient shadow-ink text-white">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gold-500/10 blur-3xl -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 blur-2xl translate-y-10 -translate-x-5" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 backdrop-blur flex items-center justify-center text-gold-400 font-serif font-black text-xl">
                  刘
                </div>
                <div>
                  <div className="font-bold text-gold-50">刘老师</div>
                  <div className="text-xs text-gold-100/60">{ROLE_LABELS.coach}</div>
                </div>
              </div>
              <div className="font-serif text-gold-50 leading-relaxed text-sm">
                &ldquo;准备辩题就像打磨宝剑，三层框架是刃，论据是钢。下周一的 AI 辩题，重点准备价值层——人类劳动的意义，是我们打动评委的关键。&rdquo;
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-gold-100/50">— 每周教练寄语</div>
                <div className="text-gold-400 font-serif italic text-2xl leading-none">&rdquo;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
