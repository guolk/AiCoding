import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store/useStore'

const typeLabel: Record<string, string> = { book: '书籍', ebook: '电子书', column: '专栏', report: '报告' }
const typeBadge: Record<string, string> = { book: 'bg-ink text-ivory', ebook: 'bg-gold text-ink', column: 'bg-ink-300 text-ivory', report: 'bg-crimson text-ivory' }
const statusBadge: Record<string, string> = { active: 'bg-green-100 text-green-700', expired: 'bg-crimson/10 text-crimson', negotiating: 'bg-gold-50 text-gold-700' }
const statusLabel: Record<string, string> = { active: '生效中', expired: '已过期', negotiating: '谈判中' }

export default function Publications() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  const { publications, copyrightContracts } = useStore()

  const tabs = ['出版物列表', '出版时间线', '版权与版税']
  const filterTypes = ['all', 'book', 'ebook', 'column', 'report']
  const filterLabels = ['全部', '书籍', '电子书', '专栏', '报告']

  const filtered = publications.filter(p => {
    const matchSearch = p.title.includes(search)
    const matchType = filter === 'all' || p.type === filter
    return matchSearch && matchType
  })

  const sorted = [...publications].sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())

  const isExpiringSoon = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">出版物档案</h1>

      <div className="flex gap-2 border-b border-sand">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${tab === i ? 'text-ink border-b-2 border-gold' : 'text-ink-300 hover:text-ink'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="搜索出版物..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-sand bg-white text-sm focus:outline-none focus:border-ink-300" />
            </div>
            <div className="flex gap-2">
              {filterTypes.map((t, i) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === t ? 'bg-ink text-ivory' : 'bg-sand text-ink-300 hover:bg-ink-50'}`}>
                  {filterLabels[i]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-ink-300">暂无匹配的出版物</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <div key={p.id} onClick={() => navigate(`/publications/${p.id}`)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="bg-gradient-to-br from-ink-400 to-ink h-48 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gold" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[p.type]}`}>{typeLabel[p.type]}</span>
                      <span className="text-xs text-ink-300">{p.publishDate}</span>
                    </div>
                    <div className="text-gold-600 font-medium">¥{p.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 1 && (
        <div className="relative max-w-3xl mx-auto">
          {sorted.map((p, i) => (
            <div key={p.id} className={`flex mb-8 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="hidden md:block flex-1" />
              <div className="relative flex flex-col items-center px-4">
                <div className="w-3.5 h-3.5 rounded-full bg-ink border-2 border-gold shrink-0 z-10" />
                {i < sorted.length - 1 && <div className="w-0.5 flex-1 bg-gold/40" />}
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-display font-semibold text-ink">{p.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[p.type]}`}>{typeLabel[p.type]}</span>
                  <span className="text-xs text-ink-300">{p.publishDate}</span>
                </div>
                <p className="text-sm text-ink-300 mt-2 line-clamp-2">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand bg-ivory">
                <th className="text-left p-4 font-medium text-ink-300">出版物名称</th>
                <th className="text-left p-4 font-medium text-ink-300">出版商</th>
                <th className="text-left p-4 font-medium text-ink-300">版税率</th>
                <th className="text-left p-4 font-medium text-ink-300">合同状态</th>
                <th className="text-left p-4 font-medium text-ink-300">开始日期</th>
                <th className="text-left p-4 font-medium text-ink-300">结束日期</th>
              </tr>
            </thead>
            <tbody>
              {copyrightContracts.map(c => {
                const pub = publications.find(p => p.id === c.publicationId)
                return (
                  <tr key={c.id} className="border-b border-sand/60 hover:bg-ivory/50">
                    <td className="p-4 font-medium text-ink">{pub?.title ?? '-'}</td>
                    <td className="p-4 text-ink-300">{c.publisher}</td>
                    <td className="p-4 text-ink-300">{(c.royaltyRate * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}>
                        {statusLabel[c.status]}
                        {c.status === 'active' && isExpiringSoon(c.endDate) && <AlertTriangle className="w-3 h-3" />}
                      </span>
                    </td>
                    <td className="p-4 text-ink-300">{c.startDate}</td>
                    <td className="p-4 text-ink-300">{c.endDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
