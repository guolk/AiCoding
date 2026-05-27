import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatCard from '../components/StatCard'
import Card from '../components/Card'

export default function Dashboard() {
  const [inventory, setInventory] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const [recentTastings, setRecentTastings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [inv, alt, tastings] = await Promise.all([
        api.inventory.getSummary(),
        api.inventory.getAlerts(),
        api.tasting.getAll()
      ])
      setInventory(inv)
      setAlerts(alt)
      setRecentTastings(tastings.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="酒窖总瓶数"
          value={inventory?.inCellar || 0}
          icon="🍷"
          subtitle={`共 ${inventory?.uniqueWines || 0} 款酒`}
        />
        <StatCard
          title="库存价值"
          value={`¥${inventory?.inventoryValue?.toLocaleString() || 0}`}
          icon="💰"
          trend={inventory?.valueChangePercent?.toFixed(1) + '%'}
          trendUp={(inventory?.valueChange || 0) >= 0}
          subtitle={`市值 ¥${inventory?.inventoryMarketValue?.toLocaleString() || 0}`}
        />
        <StatCard
          title="已品鉴"
          value={inventory?.consumed || 0}
          icon="📝"
          subtitle={`预留 ${inventory?.reserved || 0} 瓶`}
        />
        <StatCard
          title="低库存提醒"
          value={alerts?.lowStock?.length || 0}
          icon="⚠️"
          subtitle={`${alerts?.peakSoon?.length || 0} 款正值适饮期`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="库存警报" actions={<Link to="/inventory" className="text-wine-600 hover:text-wine-700 text-sm">查看全部 →</Link>}>
          {alerts?.lowStock?.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">低库存酒款</h4>
              {alerts.lowStock.map((item: any) => (
                <div key={item.wine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.wine.winery} {item.wine.name}</p>
                    <p className="text-sm text-gray-500">{item.wine.vintage} | {item.wine.type}</p>
                  </div>
                  <span className="text-red-600 font-semibold">剩{item.currentStock}瓶</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">正值适饮期</h4>
              {alerts?.peakSoon?.slice(0, 5).map((item: any) => (
                <div key={item.wine.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.wine.winery} {item.wine.name}</p>
                    <p className="text-sm text-gray-500">{item.wine.vintage} | {item.wine.type}</p>
                  </div>
                  <span className="text-green-600 font-semibold">最佳饮用期</span>
                </div>
              ))}
              {alerts?.peakSoon?.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无适饮期提醒</p>
              )}
            </div>
          )}
        </Card>

        <Card title="最近品饮" actions={<Link to="/tasting" className="text-wine-600 hover:text-wine-700 text-sm">查看全部 →</Link>}>
          {recentTastings.length > 0 ? (
            <div className="space-y-3">
              {recentTastings.map((note) => (
                <div key={note.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-wine-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🍷</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{note.wine?.winery} {note.wine?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(note.tastingDate).toLocaleDateString('zh-CN')} · 评分 {note.overallScore}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(note.overallScore / 20) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">还没有品饮记录</p>
              <Link to="/tasting/new" className="inline-flex items-center px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700">
                记录第一次品饮
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="快捷操作" className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/wines" className="p-4 bg-gradient-to-br from-wine-50 to-wine-100 rounded-xl hover:from-wine-100 hover:to-wine-200 transition-colors text-center">
              <div className="text-3xl mb-2">🍇</div>
              <p className="font-medium text-gray-800">添加酒款</p>
            </Link>
            <Link to="/bottles" className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-colors text-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="font-medium text-gray-800">入库酒瓶</p>
            </Link>
            <Link to="/tasting/new" className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-colors text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="font-medium text-gray-800">记录品饮</p>
            </Link>
            <Link to="/purchases" className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-colors text-center">
              <div className="text-3xl mb-2">🛒</div>
              <p className="font-medium text-gray-800">采购记录</p>
            </Link>
          </div>
        </Card>

        <Card title="快速统计">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">红酒</span>
              <span className="font-semibold">{inventory?.inCellar || 0} 瓶</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">白酒</span>
              <span className="font-semibold">0 瓶</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">起泡酒</span>
              <span className="font-semibold">0 瓶</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-pink-400 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
