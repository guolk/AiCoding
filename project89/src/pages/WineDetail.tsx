import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function WineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [wine, setWine] = useState<any>(null)
  const [drinkingWindow, setDrinkingWindow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBottleModal, setShowBottleModal] = useState(false)
  const [isAddingBottle, setIsAddingBottle] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bottleForm, setBottleForm] = useState({
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseChannel: '',
    storageLocation: '',
    currentMarketPrice: '',
    status: 'IN_CELLAR'
  })

  useEffect(() => {
    if (id) {
      loadWine()
    }
  }, [id])

  async function loadWine() {
    try {
      const [wineData, windowData] = await Promise.all([
        api.wines.get(id!),
        api.wines.getDrinkingWindow(id!)
      ])
      setWine(wineData)
      setDrinkingWindow(windowData)
    } catch (error) {
      console.error('Failed to load wine', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBottle(e: React.FormEvent) {
    e.preventDefault()
    if (!bottleForm.purchasePrice) {
      alert('请输入购入价格')
      return
    }
    setIsAddingBottle(true)
    try {
      await api.bottles.create({
        ...bottleForm,
        wineId: id,
        purchasePrice: parseFloat(bottleForm.purchasePrice),
        currentMarketPrice: bottleForm.currentMarketPrice ? parseFloat(bottleForm.currentMarketPrice) : null
      })
      alert('酒瓶添加成功！')
      setShowBottleModal(false)
      setBottleForm({
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseChannel: '',
        storageLocation: '',
        currentMarketPrice: '',
        status: 'IN_CELLAR'
      })
      loadWine()
    } catch (error) {
      console.error('Failed to add bottle', error)
      alert('添加失败，请重试')
    } finally {
      setIsAddingBottle(false)
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这款酒吗？这将同时删除关联的酒瓶和品饮记录。')) {
      return
    }
    setIsDeleting(true)
    try {
      await api.wines.delete(id!)
      alert('酒款删除成功！')
      navigate('/wines')
    } catch (error) {
      console.error('Failed to delete wine', error)
      alert('删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
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

  function getDrinkingWindowStatus(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
      too_young: { label: '尚年轻', color: 'bg-blue-100 text-blue-800' },
      drinkable: { label: '可饮用', color: 'bg-yellow-100 text-yellow-800' },
      peak: { label: '适饮巅峰', color: 'bg-green-100 text-green-800' },
      past_peak: { label: '已过巅峰', color: 'bg-red-100 text-red-800' }
    }
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  function getBottleStatusLabel(status: string) {
    const labels: Record<string, string> = {
      IN_CELLAR: '在窖',
      RESERVED: '预留',
      OPENED: '已开瓶',
      CONSUMED: '已饮用'
    }
    return labels[status] || status
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  if (!wine) {
    return <div className="text-center py-12">酒款未找到</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/wines" className="text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{wine.winery} {wine.name}</h2>
            <p className="text-gray-500">{wine.vintage} · {getWineTypeName(wine.type)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBottleModal(true)}
            className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
          >
            + 添加酒瓶
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '删除酒款'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="基本信息">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">酒庄</p>
                <p className="font-medium">{wine.winery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">酒款名称</p>
                <p className="font-medium">{wine.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">年份</p>
                <p className="font-medium">{wine.vintage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">类型</p>
                <p className="font-medium">{getWineTypeName(wine.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">产区</p>
                <p className="font-medium">{wine.region || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">国家</p>
                <p className="font-medium">{wine.country || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">葡萄品种</p>
                <p className="font-medium">{Array.isArray(wine.grapeVarieties) ? wine.grapeVarieties.join(', ') : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">酒精度</p>
                <p className="font-medium">{wine.alcoholContent ? wine.alcoholContent + '%' : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">陈年潜力</p>
                <p className="font-medium">{wine.agingPotential ? wine.agingPotential + ' 年' : '-'}</p>
              </div>
              {wine.vivinoRating && (
                <div>
                  <p className="text-sm text-gray-500">Vivino 评分</p>
                  <p className="font-medium">★ {wine.vivinoRating}</p>
                </div>
              )}
            </div>
            {wine.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">描述</p>
                <p className="text-gray-700">{wine.description}</p>
              </div>
            )}
          </Card>

          <Card title={`酒瓶库存 (${wine.bottles?.length || 0} 瓶)`}>
            {wine.bottles?.length > 0 ? (
              <div className="space-y-3">
                {wine.bottles.map((bottle: any) => (
                  <div key={bottle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        购入价格: ¥{bottle.purchasePrice}
                        {bottle.currentMarketPrice && bottle.currentMarketPrice !== bottle.purchasePrice && (
                          <span className={`ml-2 text-sm ${bottle.currentMarketPrice > bottle.purchasePrice ? 'text-green-600' : 'text-red-600'}`}>
                            (当前: ¥{bottle.currentMarketPrice})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        购入日期: {new Date(bottle.purchaseDate).toLocaleDateString('zh-CN')}
                        {bottle.purchaseChannel && ` · 渠道: ${bottle.purchaseChannel}`}
                        {bottle.storageLocation && ` · 位置: ${bottle.storageLocation}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bottle.status === 'IN_CELLAR' ? 'bg-green-100 text-green-800' :
                      bottle.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                      bottle.status === 'OPENED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getBottleStatusLabel(bottle.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                还没有添加酒瓶
              </div>
            )}
          </Card>

          <Card title={`品饮记录 (${wine.tastingNotes?.length || 0} 条)`}>
            {wine.tastingNotes?.length > 0 ? (
              <div className="space-y-4">
                {wine.tastingNotes.map((note: any) => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {new Date(note.tastingDate).toLocaleDateString('zh-CN')}
                      </p>
                      <span className="text-wine-600 font-semibold">{note.overallScore}/100</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">外观:</span> {note.appearanceScore}
                      </div>
                      <div>
                        <span className="text-gray-500">香气:</span> {note.aromaScore}
                      </div>
                      <div>
                        <span className="text-gray-500">口感:</span> {note.tasteScore}
                      </div>
                      <div>
                        <span className="text-gray-500">余韵:</span> {note.finishScore}
                      </div>
                    </div>
                    {note.notes && <p className="text-gray-600 text-sm">{note.notes}</p>}
                    {(note.decantingTime || note.servingTemp || note.pairedFood) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                        {note.decantingTime && `醒酒: ${note.decantingTime}分钟`}
                        {note.servingTemp && ` · 侍酒温度: ${note.servingTemp}°C`}
                        {note.pairedFood && ` · 搭配: ${note.pairedFood}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                还没有品饮记录
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="适饮期建议">
            {drinkingWindow && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDrinkingWindowStatus(drinkingWindow.status).color}`}>
                    {getDrinkingWindowStatus(drinkingWindow.status).label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">适饮期</span>
                    <span className="font-medium">{drinkingWindow.drinkWindow.from} - {drinkingWindow.drinkWindow.to}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">巅峰期</span>
                    <span className="font-medium">{drinkingWindow.peakWindow.from} - {drinkingWindow.peakWindow.to}</span>
                  </div>
                  {drinkingWindow.yearsUntilPeak > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">距巅峰期</span>
                      <span className="font-medium text-blue-600">{drinkingWindow.yearsUntilPeak} 年</span>
                    </div>
                  )}
                  {drinkingWindow.yearsPastPeak > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">已过巅峰</span>
                      <span className="font-medium text-red-600">{drinkingWindow.yearsPastPeak} 年</span>
                    </div>
                  )}
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((drinkingWindow.currentYear - wine.vintage) / wine.agingPotential) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{wine.vintage} (装瓶)</span>
                  <span>{wine.vintage + wine.agingPotential} (过期)</span>
                </div>
              </div>
            )}
          </Card>

          <Card title="搭配建议">
            {wine.pairings?.length > 0 ? (
              <div className="space-y-2">
                {wine.pairings.map((pairing: any) => (
                  <div key={pairing.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pairing.dishName}</span>
                      {pairing.rating && (
                        <span className="text-yellow-500">{'★'.repeat(pairing.rating)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{pairing.dishType}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                暂无搭配记录
              </div>
            )}
            <Link
              to="/recommendations"
              className="block mt-4 text-center text-wine-600 hover:text-wine-700 text-sm"
            >
              查看更多搭配建议 →
            </Link>
          </Card>
        </div>
      </div>

      {showBottleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">添加酒瓶</h3>
                <button onClick={() => setShowBottleModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleAddBottle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">购入价格 (¥) *</label>
                <input
                  type="number"
                  required
                  value={bottleForm.purchasePrice}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">购入日期 *</label>
                <input
                  type="date"
                  required
                  value={bottleForm.purchaseDate}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">购入渠道</label>
                <input
                  type="text"
                  value={bottleForm.purchaseChannel}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, purchaseChannel: e.target.value }))}
                  placeholder="如：酒庄直购、电商平台等"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
                <input
                  type="text"
                  value={bottleForm.storageLocation}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                  placeholder="如：酒柜A区第3层"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前市场价 (¥)</label>
                <input
                  type="number"
                  value={bottleForm.currentMarketPrice}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, currentMarketPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={bottleForm.status}
                  onChange={(e) => setBottleForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                >
                  <option value="IN_CELLAR">在窖</option>
                  <option value="RESERVED">预留</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBottleModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isAddingBottle}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 disabled:bg-wine-400 disabled:cursor-not-allowed"
                  disabled={isAddingBottle}
                >
                  {isAddingBottle ? '添加中...' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
