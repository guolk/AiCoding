import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any>(null)
  const [pairings, setPairings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personalized' | 'pairings'>('personalized')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [rec, pair] = await Promise.all([
        api.recommendations.getPersonalized(),
        api.recommendations.getPairings()
      ])
      setRecommendations(rec)
      setPairings(pair)
    } catch (error) {
      console.error('Failed to load recommendations', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">推荐与搭配</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'personalized'
                ? 'bg-wine-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            个性化推荐
          </button>
          <button
            onClick={() => setActiveTab('pairings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'pairings'
                ? 'bg-wine-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            菜肴搭配
          </button>
        </div>
      </div>

      {activeTab === 'personalized' && (
        <div className="space-y-6">
          {recommendations?.tasteProfile && (
            <Card title="您的口味画像">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">喜欢的酒款类型</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.tasteProfile.favoriteTypes?.length > 0 ? (
                      recommendations.tasteProfile.favoriteTypes.map((type: string) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-wine-100 text-wine-800 rounded-full text-sm"
                        >
                          {getWineTypeName(type)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">暂无数据，多记录品饮吧</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">喜欢的葡萄品种</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.tasteProfile.favoriteGrapes?.length > 0 ? (
                      recommendations.tasteProfile.favoriteGrapes.map((grape: string) => (
                        <span
                          key={grape}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {grape}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">暂无数据</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">喜欢的产区</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.tasteProfile.favoriteRegions?.length > 0 ? (
                      recommendations.tasteProfile.favoriteRegions.map((region: string) => (
                        <span
                          key={region}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {region}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">暂无数据</span>
                    )}
                  </div>
                </div>
              </div>
              {recommendations.tasteProfile.totalHighScoreNotes > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    基于您的 {recommendations.tasteProfile.totalHighScoreNotes} 条高分品饮记录分析得出
                  </p>
                </div>
              )}
            </Card>
          )}

          <Card title="推荐饮用（您可能喜欢）">
            {recommendations?.recommendedToDrink?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.recommendedToDrink.map((wine: any) => (
                  <Link
                    to={`/wines/${wine.id}`}
                    key={wine.id}
                    className="p-4 bg-gradient-to-br from-wine-50 to-wine-100 rounded-xl hover:from-wine-100 hover:to-wine-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{wine.winery}</h4>
                        <p className="text-sm text-gray-600">{wine.name}</p>
                      </div>
                      <span className="text-sm text-gray-500">{wine.vintage}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{getWineTypeName(wine.type)}</span>
                      <span className="text-wine-600 font-medium">
                        {wine.bottles?.length || 0} 瓶库存
                      </span>
                    </div>
                    {wine.tastingNotes?.[0] && (
                      <div className="mt-2 pt-2 border-t border-wine-200">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium">{wine.tastingNotes[0].overallScore}/100</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无推荐。尝试记录更多品饮来获取个性化推荐。</p>
                <Link to="/tasting/new" className="inline-block mt-4 text-wine-600 hover:text-wine-700">
                  记录品饮 →
                </Link>
              </div>
            )}
          </Card>

          <Card title="愿望清单推荐">
            {recommendations?.wishlistRecommendations?.length > 0 ? (
              <div className="space-y-3">
                {recommendations.wishlistRecommendations.map((wine: any) => (
                  <div
                    key={wine.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">{wine.winery} {wine.name}</h4>
                      <p className="text-sm text-gray-600">{wine.vintage} · {getWineTypeName(wine.type)}</p>
                    </div>
                    <Link
                      to={`/wines/${wine.id}`}
                      className="px-4 py-2 bg-wine-600 text-white rounded-lg text-sm hover:bg-wine-700"
                    >
                      查看详情
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>愿望清单是空的</p>
                <Link to="/wishlist" className="inline-block mt-4 text-wine-600 hover:text-wine-700">
                  添加愿望 →
                </Link>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'pairings' && (
        <div className="space-y-6">
          <Card title="经典搭配建议">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-3">🍷 红葡萄酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">🥩 烤牛排、炖牛肉</li>
                  <li className="flex items-center gap-2">🍖 烤羊排、野味</li>
                  <li className="flex items-center gap-2">🧀 硬质奶酪（切达、帕玛森）</li>
                  <li className="flex items-center gap-2">🍝 番茄意面、披萨</li>
                  <li className="flex items-center gap-2">🍄 松露、菌菇类</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-3">🥂 白葡萄酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">🐟 烤鱼、蒸海鲜</li>
                  <li className="flex items-center gap-2">🦐 虾、蟹、贝类</li>
                  <li className="flex items-center gap-2">🍗 烤鸡、火鸡</li>
                  <li className="flex items-center gap-2">🥗 清爽沙拉</li>
                  <li className="flex items-center gap-2">🧀 山羊奶酪、奶油奶酪</li>
                </ul>
              </div>
              <div className="p-4 bg-pink-50 rounded-xl">
                <h4 className="font-semibold text-pink-800 mb-3">🍾 起泡酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">🦪 生蚝、海鲜刺身</li>
                  <li className="flex items-center gap-2">🍟 油炸食物（解腻）</li>
                  <li className="flex items-center gap-2">🥐 餐前开胃菜</li>
                  <li className="flex items-center gap-2">🍰 水果甜点、奶油蛋糕</li>
                  <li className="flex items-center gap-2">🎉 庆祝场合百搭</li>
                </ul>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl">
                <h4 className="font-semibold text-rose-800 mb-3">🌹 桃红葡萄酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">🥗 希腊沙拉、地中海菜</li>
                  <li className="flex items-center gap-2">🍤 烤虾、铁板烧</li>
                  <li className="flex items-center gap-2">🍣 寿司、刺身</li>
                  <li className="flex items-center gap-2">🥘 泰式咖喱</li>
                  <li className="flex items-center gap-2">🍖 烧烤、轻食</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-3">🍯 甜酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">🍫 巧克力甜点</li>
                  <li className="flex items-center gap-2">🧀 蓝纹奶酪</li>
                  <li className="flex items-center gap-2">🍮 焦糖布丁、法式甜点</li>
                  <li className="flex items-center gap-2">🍰 水果挞、浆果派</li>
                  <li className="flex items-center gap-2">☕ 餐后搭配咖啡</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-semibold text-orange-800 mb-3">🥃 加强酒</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">💨 雪茄搭配（波特酒）</li>
                  <li className="flex items-center gap-2">🍰 核桃蛋糕、坚果甜点</li>
                  <li className="flex items-center gap-2">🍑 炖水果、蜜饯</li>
                  <li className="flex items-center gap-2">🧀 浓味奶酪</li>
                  <li className="flex items-center gap-2">☕ 单独品饮</li>
                </ul>
              </div>
            </div>
          </Card>

          {pairings.length > 0 && (
            <Card title="我的搭配记录">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pairings.map((pairing: any) => (
                  <div key={pairing.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{pairing.dishName}</h4>
                        <p className="text-sm text-gray-600">{pairing.dishType}</p>
                      </div>
                      {pairing.rating && (
                        <div className="flex text-yellow-400">
                          {'★'.repeat(pairing.rating)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-wine-600 mb-2">
                      搭配: {pairing.wine?.winery} {pairing.wine?.name}
                    </div>
                    {pairing.description && (
                      <p className="text-sm text-gray-600">{pairing.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="搭配小贴士">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">📌 搭配原则</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 重量匹配：重酒配重菜，轻酒配菜</li>
                  <li>• 酸度平衡：高酸度酒配油腻食物</li>
                  <li>• 甜度互补：甜酒配辣或咸食</li>
                  <li>• 单宁调和：高单宁红酒配脂肪</li>
                  <li>• 风味呼应：相似风味相互增强</li>
                  <li>• 地域配对：当地菜配当地酒</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">⚠️ 避坑指南</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 红酒配海鲜容易产生金属味</li>
                  <li>• 清淡白酒无法驾驭重口味红烧</li>
                  <li>• 甜酒配甜食容易过于甜腻</li>
                  <li>• 高单宁红酒配酸辣菜会更苦</li>
                  <li>• 气泡酒配热菜会快速消泡</li>
                  <li>• 陈年佳酿不宜搭配重口味菜</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
