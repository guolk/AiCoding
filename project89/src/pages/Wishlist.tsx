import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    wineId: '',
    priority: 3,
    budget: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [w, winesData] = await Promise.all([
        api.wishlist.getAll(),
        api.wines.getAll()
      ])
      setWishlist(w)
      setWines(winesData)
    } catch (error) {
      console.error('Failed to load wishlist', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.wineId) {
      alert('请选择酒款')
      return
    }
    try {
      await api.wishlist.create({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null
      })
      setShowModal(false)
      setFormData({
        wineId: '',
        priority: 3,
        budget: '',
        notes: ''
      })
      loadData()
    } catch (error) {
      console.error('Failed to add to wishlist', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('确定要从愿望清单中移除吗？')) {
      try {
        await api.wishlist.delete(id)
        loadData()
      } catch (error) {
        console.error('Failed to delete wishlist item', error)
      }
    }
  }

  function getPriorityLabel(priority: number) {
    const labels: Record<number, { label: string; color: string }> = {
      1: { label: '最高', color: 'bg-red-100 text-red-800' },
      2: { label: '高', color: 'bg-orange-100 text-orange-800' },
      3: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
      4: { label: '低', color: 'bg-green-100 text-green-800' },
      5: { label: '最低', color: 'bg-gray-100 text-gray-800' }
    }
    return labels[priority] || { label: priority.toString(), color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">愿望清单</h2>
          <p className="text-gray-500">共 {wishlist.length} 款想购入的酒</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 flex items-center gap-2"
        >
          <span>⭐</span> 添加愿望
        </button>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-wine-100 rounded-xl flex items-center justify-center text-xl">
                    🍷
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.wine?.winery}</h3>
                    <p className="text-sm text-gray-600">{item.wine?.name}</p>
                    <p className="text-xs text-gray-500">{item.wine?.vintage}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityLabel(item.priority).color}`}>
                  {getPriorityLabel(item.priority).label}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {item.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">预算</span>
                    <span className="font-medium">¥{item.budget}</span>
                  </div>
                )}
                {item.wine?.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">产区</span>
                    <span className="text-gray-700">{item.wine.region}</span>
                  </div>
                )}
              </div>

              {item.notes && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                  {item.notes}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/wines/${item.wineId}`}
                  className="flex-1 text-center px-3 py-2 text-wine-600 hover:bg-wine-50 rounded-lg text-sm"
                >
                  查看详情
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  移除
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">愿望清单是空的</h3>
            <p className="text-gray-500 mb-6">添加您想购入的酒款到愿望清单</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
            >
              添加第一款
            </button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">添加到愿望清单</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择酒款 *</label>
                <select
                  value={formData.wineId}
                  onChange={(e) => setFormData(prev => ({ ...prev, wineId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  required
                >
                  <option value="">请选择酒款</option>
                  {wines.map(wine => (
                    <option key={wine.id} value={wine.id}>
                      {wine.winery} {wine.name} ({wine.vintage})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.priority === p
                          ? 'bg-wine-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getPriorityLabel(p).label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预算 (¥)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="心理预期价位"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="购买理由、预期等..."
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
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
