import React from 'react'
import { useMediaStore } from '@/stores/mediaStore'
import { TrendingUp, TrendingDown, DollarSign, Calendar, ShoppingBag, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice, formatDate, calculateValueChange, getMediaTypeLabel } from '@/utils/helpers'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts'

const ValueTracking: React.FC = () => {
  const { media } = useMediaStore()

  const totalPurchasePrice = media.reduce((sum, m) => sum + m.value.purchasePrice, 0)
  const totalCurrentEstimate = media.reduce((sum, m) => sum + m.value.currentEstimate, 0)
  const overallChange = calculateValueChange(totalPurchasePrice, totalCurrentEstimate)

  // Sort by value change
  const sortedByValueChange = [...media].sort((a, b) => {
    const changeA = calculateValueChange(a.value.purchasePrice, a.value.currentEstimate).percentage
    const changeB = calculateValueChange(b.value.purchasePrice, b.value.currentEstimate).percentage
    return changeB - changeA
  })

  // Top gainers and losers
  const topGainers = sortedByValueChange.filter(m => {
    const change = calculateValueChange(m.value.purchasePrice, m.value.currentEstimate)
    return change.isPositive && change.percentage > 0
  }).slice(0, 5)

  const topLosers = sortedByValueChange.filter(m => {
    const change = calculateValueChange(m.value.purchasePrice, m.value.currentEstimate)
    return !change.isPositive && change.percentage < 0
  }).slice(0, 5)

  // Chart data
  const overallChartData = [
    { name: '购入价', value: totalPurchasePrice },
    { name: '当前估价', value: totalCurrentEstimate }
  ]

  // Media type value distribution
  const typeValueData = ['dvd', 'bluray', 'vinyl', 'cd', 'game'].map(type => {
    const items = media.filter(m => m.mediaType === type)
    return {
      name: getMediaTypeLabel(type),
      购入价: items.reduce((sum, m) => sum + m.value.purchasePrice, 0),
      当前估价: items.reduce((sum, m) => sum + m.value.currentEstimate, 0),
      数量: items.length
    }
  }).filter(item => item.数量 > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          价值追踪
        </h1>
        <p className="text-white/60">
          追踪您的收藏品价值变化
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">总购入价</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatPrice(totalPurchasePrice)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">当前总价值</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatPrice(totalCurrentEstimate)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center ${
              overallChange.isPositive 
                ? 'from-green-500 to-emerald-500' 
                : 'from-red-500 to-rose-500'
            }`}>
              {overallChange.isPositive 
                ? <TrendingUp size={20} className="text-white" />
                : <TrendingDown size={20} className="text-white" />
              }
            </div>
            <p className="text-white/60 text-sm">价值变化</p>
          </div>
          <p className={`text-2xl font-bold ${
            overallChange.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {overallChange.isPositive ? '+' : ''}{formatPrice(overallChange.change)}
          </p>
          <p className={`text-sm ${
            overallChange.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {overallChange.isPositive ? '+' : ''}{overallChange.percentage.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">藏品数量</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {media.length}
          </p>
          <p className="text-white/40 text-sm">
            平均价值：{formatPrice(media.length > 0 ? totalCurrentEstimate / media.length : 0)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            总体价值对比
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatPrice(value), '金额']}
                />
                <Bar dataKey="value" fill="#e94560" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            按类型价值分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatPrice(value), '']}
                />
                <Legend />
                <Bar dataKey="购入价" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="当前估价" fill="#e94560" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">
              涨幅榜
            </h2>
          </div>
          
          {topGainers.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              暂无涨幅藏品
            </div>
          ) : (
            <div className="space-y-3">
              {topGainers.map((item, index) => {
                const change = calculateValueChange(item.value.purchasePrice, item.value.currentEstimate)
                return (
                  <Link
                    key={item.id}
                    to={`/collections/${item.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="w-12 h-16 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                      {item.coverImage && (
                        <img 
                          src={item.coverImage} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-[#e94560] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-sm">
                        {formatPrice(item.value.purchasePrice)} → {formatPrice(item.value.currentEstimate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        +{change.percentage.toFixed(1)}%
                      </p>
                      <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Losers */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown size={24} className="text-red-400" />
            <h2 className="text-xl font-semibold text-white">
              跌幅榜
            </h2>
          </div>
          
          {topLosers.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              暂无跌幅藏品
            </div>
          ) : (
            <div className="space-y-3">
              {topLosers.map((item, index) => {
                const change = calculateValueChange(item.value.purchasePrice, item.value.currentEstimate)
                return (
                  <Link
                    key={item.id}
                    to={`/collections/${item.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="w-12 h-16 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                      {item.coverImage && (
                        <img 
                          src={item.coverImage} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-[#e94560] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-sm">
                        {formatPrice(item.value.purchasePrice)} → {formatPrice(item.value.currentEstimate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-semibold">
                        {change.percentage.toFixed(1)}%
                      </p>
                      <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Items Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">
          所有藏品价值明细
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                  藏品
                </th>
                <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                  购入价
                </th>
                <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                  当前估价
                </th>
                <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                  变化
                </th>
                <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                  购买渠道
                </th>
              </tr>
            </thead>
            <tbody>
              {media.map((item) => {
                const change = calculateValueChange(item.value.purchasePrice, item.value.currentEstimate)
                return (
                  <tr 
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/collections/${item.id}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded overflow-hidden flex-shrink-0">
                          {item.coverImage && (
                            <img 
                              src={item.coverImage} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-[#e94560] transition-colors">
                            {item.title}
                          </p>
                          <p className="text-white/40 text-xs">
                            {getMediaTypeLabel(item.mediaType)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/70">
                      {formatPrice(item.value.purchasePrice)}
                    </td>
                    <td className="py-4 px-4 text-white font-medium">
                      {formatPrice(item.value.currentEstimate)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        change.isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {change.isPositive ? '+' : ''}{change.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/70">
                      {item.value.purchaseChannel || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ValueTracking
