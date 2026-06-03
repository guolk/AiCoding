import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

const typeLabel: Record<string, string> = { book: '书籍', ebook: '电子书', column: '专栏', report: '报告' }
const typeBadge: Record<string, string> = { book: 'bg-ink text-ivory', ebook: 'bg-gold text-ink', column: 'bg-ink-300 text-ivory', report: 'bg-crimson text-ivory' }
const statusBadge: Record<string, string> = { active: 'bg-green-100 text-green-700', expired: 'bg-crimson/10 text-crimson', negotiating: 'bg-gold-50 text-gold-700' }
const statusLabel: Record<string, string> = { active: '生效中', expired: '已过期', negotiating: '谈判中' }

export default function PublicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { publications, copyrightContracts, salesRecords } = useStore()

  const pub = publications.find(p => p.id === id)
  if (!pub) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-300 text-lg">未找到该出版物</p>
        <button onClick={() => navigate('/publications')} className="mt-4 text-gold-600 hover:underline text-sm">返回出版物列表</button>
      </div>
    )
  }

  const contract = copyrightContracts.find(c => c.publicationId === pub.id)
  const sales = salesRecords.filter(s => s.publicationId === pub.id)
  const totalQty = sales.reduce((sum, s) => sum + s.quantity, 0)
  const totalRev = sales.reduce((sum, s) => sum + s.revenue, 0)

  return (
    <div className="p-8 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-300 hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回</span>
      </button>

      <div className="bg-gradient-to-br from-ink to-ink-600 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[pub.type]}`}>{typeLabel[pub.type]}</span>
          <span className="text-ivory/60 text-sm">{pub.publishDate}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gold">{pub.title}</h1>
        <div className="mt-4 text-2xl font-display text-gold-300">¥{pub.price.toFixed(2)}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-3">简介</h2>
        <p className="text-ink-300 leading-relaxed">{pub.description}</p>
      </div>

      {contract && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">合同信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-ink-300 mb-1">出版商</div>
              <div className="text-ink font-medium">{contract.publisher}</div>
            </div>
            <div>
              <div className="text-xs text-ink-300 mb-1">版税率</div>
              <div className="text-ink font-medium">{(contract.royaltyRate * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-ink-300 mb-1">合同期限</div>
              <div className="text-ink font-medium">{contract.startDate} ~ {contract.endDate}</div>
            </div>
            <div>
              <div className="text-xs text-ink-300 mb-1">合同状态</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[contract.status]}`}>{statusLabel[contract.status]}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">销售概况</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-display text-gold-500">{totalQty.toLocaleString()}</div>
            <div className="text-sm text-ink-300 mt-1">总销量</div>
          </div>
          <div>
            <div className="text-3xl font-display text-gold-500">¥{totalRev.toLocaleString()}</div>
            <div className="text-sm text-ink-300 mt-1">总收入</div>
          </div>
        </div>
      </div>
    </div>
  )
}
