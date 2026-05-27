import { useEffect, useState } from 'react'
import { api } from '../api'
import Card from '../components/Card'

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [activePromotions, setActivePromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('active')
  const [formData, setFormData] = useState({
    vendor: '',
    wineName: '',
    winery: '',
    vintage: new Date().getFullYear(),
    price: '',
    originalPrice: '',
    validUntil: '',
    url: '',
    notes: '',
    isActive: true
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [all, active] = await Promise.all([
        api.promotions.getAll(),
        api.promotions.getActive()
      ])
      setPromotions(all)
      setActivePromotions(active)
    } catch (error) {
      console.error('Failed to load promotions', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.promotions.create({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        vintage: formData.vintage ? parseInt(formData.vintage.toString()) : null
      })
      setShowModal(false)
      setFormData({
        vendor: '',
        wineName: '',
        winery: '',
        vintage: new Date().getFullYear(),
        price: '',
        originalPrice: '',
        validUntil: '',
        url: '',
        notes: '',
        isActive: true
      })
      loadData()
    } catch (error) {
      console.error('Failed to create promotion', error)
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await api.promotions.update(id, { isActive: !currentStatus })
      loadData()
    } catch (error) {
      console.error('Failed to update promotion', error)
    }
  }

  function getDiscountPercent(price: number, originalPrice: number | null) {
    if (!originalPrice || originalPrice <= price) return null
    return Math.round((1 - price / originalPrice) * 100)
  }

  const displayPromotions = activeTab === 'active' ? activePromotions : promotions

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">促销机会</h2>
          <p className="text-gray-500">{activePromotions.length} 个有效促销</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 flex items-center gap-2"
        >
          <span>🎁</span> 记录促销
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'active'
              ? 'bg-wine-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          有效促销 ({activePromotions.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'all'
              ? 'bg-wine-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部 ({promotions.length})
        </button>
      </div>

      {displayPromotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPromotions.map((promo) => {
            const discount = getDiscountPercent(promo.price, promo.originalPrice)
            return (
              <Card key={promo.id} className={!promo.isActive ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{promo.wineName}</h3>
                    <p className="text-sm text-gray-600">{promo.winery}</p>
                    {promo.vintage && <p className="text-xs text-gray-500">{promo.vintage}</p>}
                  </div>
                  {discount && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500">促销价</span>
                    <span className="text-2xl font-bold text-wine-600">¥{promo.price}</span>
                  </div>
                  {promo.originalPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">原价</span>
                      <span className="text-gray-400 line-through">¥{promo.originalPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">商家</span>
                    <span className="text-gray-700">{promo.vendor}</span>
                  </div>
                  {promo.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">有效期至</span>
                      <span className="text-gray-700">
                        {new Date(promo.validUntil).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  )}
                </div>

                {promo.notes && (
                  <p className="text-sm text-gray-600 mb-4 pt-3 border-t border-gray-100">
                    {promo.notes}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {promo.url && (
                    <a
                      href={promo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-wine-600 text-white rounded-lg text-sm hover:bg-wine-700"
                    >
                      去购买
                    </a>
                  )}
                  <button
                    onClick={() => toggleActive(promo.id, promo.isActive)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      promo.isActive
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {promo.isActive ? '标记过期' : '重新激活'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无促销记录</h3>
            <p className="text-gray-500">记录发现的好价葡萄酒</p>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">记录促销机会</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">酒款名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.wineName}
                  onChange={(e) => setFormData(prev => ({ ...prev, wineName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">酒庄 *</label>
                  <input
                    type="text"
                    required
                    value={formData.winery}
                    onChange={(e) => setFormData(prev => ({ ...prev, winery: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <input
                    type="number"
                    value={formData.vintage}
                    onChange={(e) => setFormData(prev => ({ ...prev, vintage: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">促销价 (¥) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原价 (¥)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商家 *</label>
                  <input
                    type="text"
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">购买链接</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
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
