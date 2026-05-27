import { useEffect, useState } from 'react'
import { api } from '../api'
import Card from '../components/Card'
import StatCard from '../components/StatCard'

export default function Purchases() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    vendor: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    status: 'RECEIVED',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [p, s] = await Promise.all([
        api.purchases.getAll(),
        api.purchases.getStatistics()
      ])
      setPurchases(p)
      setStatistics(s)
    } catch (error) {
      console.error('Failed to load purchases', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.purchases.create({
        ...formData,
        totalAmount: parseFloat(formData.totalAmount)
      })
      setShowModal(false)
      setFormData({
        vendor: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        totalAmount: '',
        status: 'RECEIVED',
        notes: ''
      })
      loadData()
    } catch (error) {
      console.error('Failed to create purchase', error)
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, { label: string; color: string }> = {
      PLANNED: { label: '计划中', color: 'bg-blue-100 text-blue-800' },
      ORDERED: { label: '已下单', color: 'bg-yellow-100 text-yellow-800' },
      RECEIVED: { label: '已收货', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800' }
    }
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">采购管理</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 flex items-center gap-2"
        >
          <span>📝</span> 记录采购
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="本月支出"
          value={`¥${statistics?.thisMonthTotal?.toLocaleString() || 0}`}
          icon="📅"
        />
        <StatCard
          title="今年支出"
          value={`¥${statistics?.thisYearTotal?.toLocaleString() || 0}`}
          icon="🗓️"
        />
        <StatCard
          title="去年支出"
          value={`¥${statistics?.lastYearTotal?.toLocaleString() || 0}`}
          icon="📆"
          trend={statistics?.yearlyComparison?.toFixed(1) + '%'}
          trendUp={(statistics?.yearlyComparison || 0) >= 0}
        />
        <StatCard
          title="平均单笔"
          value={`¥${Math.round(statistics?.averagePurchase || 0).toLocaleString()}`}
          icon="📊"
        />
      </div>

      <Card title="采购记录">
        {purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">供应商</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">日期</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">备注</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{purchase.vendor}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(purchase.purchaseDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-wine-600">
                      ¥{purchase.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(purchase.status).color}`}>
                        {getStatusLabel(purchase.status).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">{purchase.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无采购记录</h3>
            <p className="text-gray-500">记录您的第一笔采购</p>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">记录采购</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">供应商 *</label>
                <input
                  type="text"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="如：酒庄名、电商平台等"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总金额 (¥) *</label>
                  <input
                    type="number"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                >
                  <option value="PLANNED">计划中</option>
                  <option value="ORDERED">已下单</option>
                  <option value="RECEIVED">已收货</option>
                  <option value="CANCELLED">已取消</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
