import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function Wines() {
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    winery: '',
    vintage: new Date().getFullYear(),
    region: '',
    country: '',
    grapeVarieties: '',
    type: 'RED',
    alcoholContent: '',
    agingPotential: '',
    description: ''
  })
  const [vivinoData, setVivinoData] = useState<any>(null)

  useEffect(() => {
    loadWines()
  }, [])

  async function loadWines() {
    try {
      const data = await api.wines.getAll()
      setWines(data)
    } catch (error) {
      console.error('Failed to load wines', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearchVivino() {
    if (!formData.winery || !formData.vintage) return
    try {
      const data = await api.wines.searchVivino(formData.winery, formData.vintage)
      setVivinoData(data)
      setFormData(prev => ({
        ...prev,
        name: data.name,
        region: data.region,
        country: data.country,
        grapeVarieties: data.grapeVarieties.join(', '),
        type: data.type,
        alcoholContent: data.alcoholContent,
        agingPotential: data.agingPotential,
        description: data.description
      }))
    } catch (error) {
      console.error('Failed to search Vivino', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        grapeVarieties: formData.grapeVarieties.split(',').map(g => g.trim()).filter(Boolean),
        alcoholContent: formData.alcoholContent ? parseFloat(formData.alcoholContent) : null,
        agingPotential: formData.agingPotential ? parseInt(formData.agingPotential) : null
      }
      await api.wines.create(submitData)
      alert('酒款添加成功！')
      setShowModal(false)
      resetForm()
      loadWines()
    } catch (error) {
      console.error('Failed to create wine', error)
      alert('添加失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      winery: '',
      vintage: new Date().getFullYear(),
      region: '',
      country: '',
      grapeVarieties: '',
      type: 'RED',
      alcoholContent: '',
      agingPotential: '',
      description: ''
    })
    setVivinoData(null)
  }

  function getWineTypeColor(type: string) {
    const colors: Record<string, string> = {
      RED: 'bg-red-100 text-red-800',
      WHITE: 'bg-yellow-100 text-yellow-800',
      ROSE: 'bg-pink-100 text-pink-800',
      SPARKLING: 'bg-purple-100 text-purple-800',
      DESSERT: 'bg-amber-100 text-amber-800',
      FORTIFIED: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  function getWineTypeName(type: string) {
    const names: Record<string, string> = {
      RED: '红葡萄酒',
      WHITE: '白葡萄酒',
      ROSE: '桃红葡萄酒',
      SPARKLING: '起泡酒',
      DESSERT: '甜酒',
      FORTIFIED: '加强酒'
    }
    return names[type] || type
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">酒窖管理</h2>
          <p className="text-gray-500">共 {wines.length} 款酒</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 flex items-center gap-2"
        >
          <span>🍷</span> 添加酒款
        </button>
      </div>

      {wines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wines.map((wine) => (
            <Link to={`/wines/${wine.id}`} key={wine.id} className="group">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-wine-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🍷
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-wine-600 transition-colors">
                          {wine.winery}
                        </h3>
                        <p className="text-sm text-gray-600">{wine.name}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-500">{wine.vintage}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getWineTypeColor(wine.type)}`}>
                        {getWineTypeName(wine.type)}
                      </span>
                      {wine.vivinoRating && (
                        <span className="text-xs text-gray-500">★ {wine.vivinoRating}</span>
                      )}
                    </div>
                    {wine.region && (
                      <p className="text-xs text-gray-500 mt-2">📍 {wine.region}, {wine.country}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        库存: {wine.bottles?.filter((b: any) => b.status === 'IN_CELLAR').length || 0} 瓶
                      </span>
                      {wine.tastingNotes?.length > 0 && (
                        <span className="text-sm text-wine-600 font-medium">
                          评分: {wine.tastingNotes[0].overallScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🍷</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">酒窖还是空的</h3>
            <p className="text-gray-500 mb-6">添加您的第一款酒，开始您的酒窖管理之旅</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
            >
              添加第一款酒
            </button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">添加新酒款</h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-wine-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-2">🔍 从 Vivino 自动填充</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="酒庄名称"
                    value={formData.winery}
                    onChange={(e) => setFormData(prev => ({ ...prev, winery: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="年份"
                    value={formData.vintage}
                    onChange={(e) => setFormData(prev => ({ ...prev, vintage: parseInt(e.target.value) }))}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSearchVivino}
                    className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
                  >
                    搜索
                  </button>
                </div>
                {vivinoData && (
                  <p className="text-sm text-green-600 mt-2">✓ 已从 Vivino 获取数据</p>
                )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">酒款名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份 *</label>
                  <input
                    type="number"
                    required
                    value={formData.vintage}
                    onChange={(e) => setFormData(prev => ({ ...prev, vintage: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  >
                    <option value="RED">红葡萄酒</option>
                    <option value="WHITE">白葡萄酒</option>
                    <option value="ROSE">桃红葡萄酒</option>
                    <option value="SPARKLING">起泡酒</option>
                    <option value="DESSERT">甜酒</option>
                    <option value="FORTIFIED">加强酒</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产区</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">葡萄品种（逗号分隔）</label>
                  <input
                    type="text"
                    value={formData.grapeVarieties}
                    onChange={(e) => setFormData(prev => ({ ...prev, grapeVarieties: e.target.value }))}
                    placeholder="赤霞珠, 梅洛, 品丽珠"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">酒精度 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.alcoholContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, alcoholContent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">陈年潜力（年）</label>
                  <input
                    type="number"
                    value={formData.agingPotential}
                    onChange={(e) => setFormData(prev => ({ ...prev, agingPotential: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 disabled:bg-wine-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '添加中...' : '添加酒款'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
