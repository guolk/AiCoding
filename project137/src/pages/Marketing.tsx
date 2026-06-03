import { useState } from 'react'
import { BookOpen, Mic, StarIcon, Plus, Eye, ExternalLink, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Excerpt, MediaInterview, BookReview } from '@/types'

const tabs = [
  { key: 'excerpts', label: '书摘发布', icon: BookOpen },
  { key: 'interviews', label: '媒体采访', icon: Mic },
  { key: 'reviews', label: '书评收集', icon: StarIcon },
] as const

type TabKey = (typeof tabs)[number]['key']

const platformPill: Record<string, string> = {
  '微信公众号': 'bg-green-100 text-green-700',
  '知乎': 'bg-blue-100 text-blue-700',
  '少数派': 'bg-amber-100 text-amber-700',
  '掘金': 'bg-purple-100 text-purple-700',
}

const sentimentBadge: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
}

const sentimentLabel: Record<string, string> = {
  positive: '正面', neutral: '中性', negative: '负面',
}

const sentimentFilters = [
  { key: 'all', label: '全部' },
  { key: 'positive', label: '正面' },
  { key: 'neutral', label: '中性' },
  { key: 'negative', label: '负面' },
]

function formatViews(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n)
}

export default function Marketing() {
  const { publications, excerpts, mediaInterviews, bookReviews, addExcerpt, addInterview, addBookReview } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('excerpts')
  const [showAddExcerpt, setShowAddExcerpt] = useState(false)
  const [showAddInterview, setShowAddInterview] = useState(false)
  const [showAddReview, setShowAddReview] = useState(false)
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [newExcerpt, setNewExcerpt] = useState({ publicationId: '', title: '', content: '', platform: '', views: 0 })
  const [newInterview, setNewInterview] = useState({ title: '', mediaName: '', date: '', url: '', influenceRating: 5 })
  const [newReview, setNewReview] = useState({ publicationId: '', source: '', rating: 5, content: '', sentiment: 'neutral' as BookReview['sentiment'] })

  const getPubTitle = (id: string) => publications.find(p => p.id === id)?.title ?? '未知出版物'

  const filteredReviews = sentimentFilter === 'all'
    ? bookReviews
    : bookReviews.filter(r => r.sentiment === sentimentFilter)

  const handleAddExcerpt = () => {
    if (!newExcerpt.title.trim() || !newExcerpt.content.trim()) return
    addExcerpt({ id: String(Date.now()), ...newExcerpt, publishDate: new Date().toISOString().slice(0, 10) })
    setNewExcerpt({ publicationId: '', title: '', content: '', platform: '', views: 0 })
    setShowAddExcerpt(false)
  }

  const handleAddInterview = () => {
    if (!newInterview.title.trim() || !newInterview.mediaName.trim()) return
    addInterview({ id: String(Date.now()), ...newInterview })
    setNewInterview({ title: '', mediaName: '', date: '', url: '', influenceRating: 5 })
    setShowAddInterview(false)
  }

  const handleAddReview = () => {
    if (!newReview.content.trim()) return
    addBookReview({ id: String(Date.now()), ...newReview, date: new Date().toISOString().slice(0, 10) })
    setNewReview({ publicationId: '', source: '', rating: 5, content: '', sentiment: 'neutral' })
    setShowAddReview(false)
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">内容营销</h1>

      <div className="flex gap-1 bg-ivory rounded-lg p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-ink text-gold shadow-sm' : 'text-ink/60 hover:text-ink'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'excerpts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddExcerpt(!showAddExcerpt)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加书摘
            </button>
          </div>

          {showAddExcerpt && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <select value={newExcerpt.publicationId} onChange={e => setNewExcerpt(p => ({ ...p, publicationId: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold">
                <option value="">选择出版物</option>
                {publications.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <input value={newExcerpt.title} onChange={e => setNewExcerpt(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold" placeholder="书摘标题" />
              <textarea value={newExcerpt.content} onChange={e => setNewExcerpt(p => ({ ...p, content: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={3} placeholder="书摘内容" />
              <div className="flex gap-3">
                <input value={newExcerpt.platform} onChange={e => setNewExcerpt(p => ({ ...p, platform: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold" placeholder="平台" />
                <input type="number" value={newExcerpt.views} onChange={e => setNewExcerpt(p => ({ ...p, views: Number(e.target.value) }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold w-28" placeholder="阅读量" />
                <button onClick={handleAddExcerpt} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {excerpts.map(ex => (
              <div key={ex.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-sand/50">
                <div className="text-xs text-ink/50 mb-1">{getPubTitle(ex.publicationId)}</div>
                <h3 className="font-display text-lg font-semibold text-ink">{ex.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {ex.platform && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${platformPill[ex.platform] ?? 'bg-sand text-ink/60'}`}>{ex.platform}</span>
                  )}
                  <span className="text-xs text-ink/40">{ex.publishDate}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-ink/50">
                  <Eye className="w-3.5 h-3.5" />{formatViews(ex.views)}
                </div>
                <p className="mt-2 text-sm text-ink/70 line-clamp-3">{ex.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddInterview(!showAddInterview)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加采访
            </button>
          </div>

          {showAddInterview && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <input value={newInterview.title} onChange={e => setNewInterview(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold" placeholder="采访标题" />
              <input value={newInterview.mediaName} onChange={e => setNewInterview(p => ({ ...p, mediaName: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold" placeholder="媒体名称" />
              <div className="flex gap-3">
                <input type="date" value={newInterview.date} onChange={e => setNewInterview(p => ({ ...p, date: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold" />
                <input value={newInterview.url} onChange={e => setNewInterview(p => ({ ...p, url: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="链接URL" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-ink/60">影响力</label>
                <input type="range" min={1} max={10} value={newInterview.influenceRating}
                  onChange={e => setNewInterview(p => ({ ...p, influenceRating: Number(e.target.value) }))}
                  className="flex-1 accent-gold" />
                <span className="text-sm font-medium text-ink w-6 text-center">{newInterview.influenceRating}</span>
                <button onClick={handleAddInterview} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
              </div>
            </div>
          )}

          <div className="relative space-y-0">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-sand" />
            {mediaInterviews.map(iv => (
              <div key={iv.id} className="relative pl-8 pb-6">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-gold border-2 border-ivory" />
                <div className="border-l-4 border-gold bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-xs text-ink/40 mb-1">{iv.mediaName}</div>
                  <h3 className="font-display text-lg font-semibold text-ink">{iv.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink/50">
                    <span>{iv.date}</span>
                    {iv.url && (
                      <a href={iv.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gold hover:text-gold/70 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />链接
                      </a>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-ink/50 mb-1">
                      <span>影响力</span><span>{iv.influenceRating}/10</span>
                    </div>
                    <div className="h-2 rounded-full bg-sand overflow-hidden">
                      <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${iv.influenceRating * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {sentimentFilters.map(f => (
                <button key={f.key} onClick={() => setSentimentFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${sentimentFilter === f.key ? 'bg-ink text-gold' : 'bg-sand text-ink/60 hover:text-ink'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddReview(!showAddReview)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加书评
            </button>
          </div>

          {showAddReview && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <select value={newReview.publicationId} onChange={e => setNewReview(p => ({ ...p, publicationId: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold">
                <option value="">选择出版物</option>
                {publications.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <div className="flex gap-3">
                <input value={newReview.source} onChange={e => setNewReview(p => ({ ...p, source: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold flex-1" placeholder="来源" />
                <input type="number" min={1} max={5} value={newReview.rating}
                  onChange={e => setNewReview(p => ({ ...p, rating: Number(e.target.value) }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold w-20" placeholder="评分" />
                <select value={newReview.sentiment} onChange={e => setNewReview(p => ({ ...p, sentiment: e.target.value as BookReview['sentiment'] }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold">
                  <option value="positive">正面</option><option value="neutral">中性</option><option value="negative">负面</option>
                </select>
              </div>
              <textarea value={newReview.content} onChange={e => setNewReview(p => ({ ...p, content: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={3} placeholder="书评内容" />
              <button onClick={handleAddReview} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {filteredReviews.map(rv => (
              <div key={rv.id} className="bg-white rounded-xl p-5 shadow-sm border border-sand/50 w-full md:w-[calc(50%-0.5rem)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink/50">{getPubTitle(rv.publicationId)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sentimentBadge[rv.sentiment]}`}>{sentimentLabel[rv.sentiment]}</span>
                </div>
                <div className="text-xs text-ink/40 mb-2">{rv.source}</div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rv.rating ? 'fill-gold text-gold' : 'fill-sand text-sand'}`} />
                  ))}
                </div>
                <p className="text-sm text-ink/70 mb-2">{rv.content}</p>
                <div className="text-xs text-ink/40">{rv.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
