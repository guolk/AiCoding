import { useNavigate } from 'react-router-dom'
import { BookOpen, ShoppingCart, DollarSign, MessageSquare, Plus, TrendingUp, PenTool } from 'lucide-react'
import { useStore } from '@/store/useStore'

const categoryBadge: Record<string, string> = {
  praise: 'bg-gold-50 text-gold-700',
  criticism: 'bg-crimson/10 text-crimson',
  question: 'bg-ink-50 text-ink-500',
  suggestion: 'bg-sand text-ink-400',
}

const categoryLabel: Record<string, string> = {
  praise: '好评',
  criticism: '批评',
  question: '疑问',
  suggestion: '建议',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { publications, salesRecords, readerFeedbacks } = useStore()

  const totalSales = salesRecords.reduce((sum, r) => sum + r.quantity, 0)
  const totalRevenue = salesRecords.reduce((sum, r) => sum + r.revenue, 0)

  const stats = [
    { label: '总出版物', value: publications.length, icon: BookOpen },
    { label: '总销量', value: totalSales, icon: ShoppingCart },
    { label: '总收入', value: `¥${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: '读者互动', value: readerFeedbacks.length, icon: MessageSquare },
  ]

  const recentFeedbacks = readerFeedbacks
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((f) => ({ type: 'feedback' as const, date: f.date, data: f }))

  const recentSales = salesRecords
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((s) => ({ type: 'sale' as const, date: s.date, data: s }))

  const recentActivity = [...recentFeedbacks, ...recentSales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const quickActions = [
    { label: '添加出版物', icon: Plus, path: '/publications' },
    { label: '记录销售', icon: TrendingUp, path: '/sales' },
    { label: '回复读者', icon: MessageSquare, path: '/readers' },
    { label: '更新进度', icon: PenTool, path: '/planning' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">仪表盘</h1>
        <p className="mt-1 text-ink-300">欢迎回来，林墨白</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl shadow-sm p-6 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-ink-50 text-ink flex items-center justify-center">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-display text-gold-500 animate-count-up stagger-${i + 1}">
                  {stat.value}
                </div>
                <div className="text-sm text-ink/60">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-ink mb-6 underline decoration-gold decoration-2 underline-offset-8">
          近期动态
        </h2>
        <div className="space-y-0">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 shrink-0" />
                {i < recentActivity.length - 1 && (
                  <div className="w-px flex-1 bg-sand mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                {item.type === 'feedback' ? (
                  <div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mr-2 ${categoryBadge[item.data.category]}`}>
                      {categoryLabel[item.data.category]}
                    </span>
                    <span className="text-sm text-ink/80 truncate">
                      {item.data.content.length > 40 ? item.data.content.slice(0, 40) + '…' : item.data.content}
                    </span>
                    <div className="text-xs text-ink/40 mt-1">{item.data.date}</div>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm text-ink/80">
                      {item.data.channel} · <span className="text-gold-600">¥{item.data.revenue.toLocaleString()}</span>
                    </span>
                    <div className="text-xs text-ink/40 mt-1">{item.data.date}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-ink mb-6 underline decoration-gold decoration-2 underline-offset-8">
          快捷操作
        </h2>
        <div className="flex gap-10">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-ink text-gold flex items-center justify-center transition-all group-hover:bg-gold group-hover:text-ink">
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-ink/60 group-hover:text-ink transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
