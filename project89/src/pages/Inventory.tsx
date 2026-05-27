import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'
import StatCard from '../components/StatCard'

export default function Inventory() {
  const [summary, setSummary] = useState<any>(null)
  const [byWine, setByWine] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [sum, wine, alt] = await Promise.all([
        api.inventory.getSummary(),
        api.inventory.getByWine(),
        api.inventory.getAlerts()
      ])
      setSummary(sum)
      setByWine(wine)
      setAlerts(alt)
    } catch (error) {
      console.error('Failed to load inventory data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">库存概览</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="在窖瓶数"
          value={summary?.inCellar || 0}
          icon="🍷"
          subtitle={`共 ${summary?.uniqueWines || 0} 款酒`}
        />
        <StatCard
          title="预留瓶数"
          value={summary?.reserved || 0}
          icon="📌"
        />
        <StatCard
          title="已开瓶"
          value={summary?.opened || 0}
          icon="🔓"
        />
        <StatCard
          title="已饮用"
          value={summary?.consumed || 0}
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="库存总成本"
          value={`¥${summary?.inventoryValue?.toLocaleString() || 0}`}
          icon="💰"
        />
        <StatCard
          title="当前市值"
          value={`¥${summary?.inventoryMarketValue?.toLocaleString() || 0}`}
          icon="📈"
          trend={summary?.valueChangePercent?.toFixed(1) + '%'}
          trendUp={(summary?.valueChange || 0) >= 0}
        />
        <StatCard
          title="价值变化"
          value={`${summary?.valueChange >= 0 ? '+' : ''}¥${summary?.valueChange?.toLocaleString() || 0}`}
          icon={summary?.valueChange >= 0 ? '📈' : '📉'}
          trendUp={(summary?.valueChange || 0) >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="库存警报">
          {(alerts?.lowStock?.length > 0 || alerts?.peakSoon?.length > 0) ? (
            <div className="space-y-6">
              {alerts?.lowStock?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span> 低库存提醒
                  </h4>
                  <div className="space-y-2">
                    {alerts.lowStock.map((item: any) => (
                      <div key={item.wine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <Link to={`/wines/${item.wine.id}`} className="text-wine-600 hover:text-wine-700 font-medium">
                          {item.wine.winery} {item.wine.name} ({item.wine.vintage})
                        </Link>
                        <span className="text-red-600 font-semibold">仅存 {item.currentStock} 瓶</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alerts?.peakSoon?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-green-500">✨</span> 正值适饮巅峰
                  </h4>
                  <div className="space-y-2">
                    {alerts.peakSoon.slice(0, 5).map((item: any) => (
                      <div key={item.wine.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <Link to={`/wines/${item.wine.id}`} className="text-wine-600 hover:text-wine-700 font-medium">
                          {item.wine.winery} {item.wine.name} ({item.wine.vintage})
                        </Link>
                        <span className="text-green-600 text-sm">
                          还剩 {item.yearsLeftInPeak} 年适饮期
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>库存状态良好，暂无警报</p>
            </div>
          )}
        </Card>

        <Card title="按酒款统计">
          {byWine.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {byWine.map((group: any) => (
                <div key={group.wine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <Link to={`/wines/${group.wine.id}`} className="font-medium text-gray-800 hover:text-wine-600">
                      {group.wine.winery} {group.wine.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {group.wine.vintage} · 均价 ¥{Math.round(group.avgPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-wine-600">{group.count} 瓶</p>
                    <p className="text-sm text-gray-500">
                      总值 ¥{group.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无库存数据
            </div>
          )}
        </Card>
      </div>

      <Card title="库存分布">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-xl text-center">
            <div className="text-3xl mb-2">🔴</div>
            <p className="font-semibold text-gray-800">红葡萄酒</p>
            <p className="text-2xl font-bold text-red-600">
              {byWine.filter((g: any) => g.wine.type === 'RED').reduce((sum: number, g: any) => sum + g.count, 0)}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl text-center">
            <div className="text-3xl mb-2">🟡</div>
            <p className="font-semibold text-gray-800">白葡萄酒</p>
            <p className="text-2xl font-bold text-yellow-600">
              {byWine.filter((g: any) => g.wine.type === 'WHITE').reduce((sum: number, g: any) => sum + g.count, 0)}
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl text-center">
            <div className="text-3xl mb-2">🌸</div>
            <p className="font-semibold text-gray-800">桃红/起泡</p>
            <p className="text-2xl font-bold text-pink-600">
              {byWine.filter((g: any) => ['ROSE', 'SPARKLING'].includes(g.wine.type)).reduce((sum: number, g: any) => sum + g.count, 0)}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-center">
            <div className="text-3xl mb-2">🍯</div>
            <p className="font-semibold text-gray-800">甜酒/加强</p>
            <p className="text-2xl font-bold text-amber-600">
              {byWine.filter((g: any) => ['DESSERT', 'FORTIFIED'].includes(g.wine.type)).reduce((sum: number, g: any) => sum + g.count, 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
