import React from 'react'
import { useMediaStore } from '@/stores/mediaStore'
import { BookOpen, MapPin, Users, AlertTriangle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLendingStatusLabel, getLendingStatusColor, formatDate, getDaysUntilReturn } from '@/utils/helpers'

const Storage: React.FC = () => {
  const { media, returnMedia } = useMediaStore()

  const lentItems = media.filter(m => m.lending.status === 'lent')
  const overdueItems = media.filter(m => m.lending.status === 'overdue')
  const availableItems = media.filter(m => m.lending.status === 'available')

  const shelves: Record<number, typeof media> = {}
  media.forEach(item => {
    const shelf = item.location.shelf
    if (!shelves[shelf]) {
      shelves[shelf] = []
    }
    shelves[shelf].push(item)
  })

  React.useEffect(() => {
    const today = new Date()
    lentItems.forEach(item => {
      if (item.lending.expectedReturnDate && new Date(item.lending.expectedReturnDate) < today) {
        useMediaStore.getState().updateMedia(item.id, {
          lending: {
            ...item.lending,
            status: 'overdue'
          }
        })
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          存放管理
        </h1>
        <p className="text-white/60">
          管理您的藏品存放位置和借出记录
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {availableItems.length}
              </p>
              <p className="text-white/60 text-sm">
                可借阅
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {lentItems.length}
              </p>
              <p className="text-white/60 text-sm">
                借出中
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {overdueItems.length}
              </p>
              <p className="text-white/60 text-sm">
                逾期未还
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            书架概览
          </h2>
          <div className="space-y-4">
            {Object.keys(shelves).map(shelfKey => {
              const shelfNum = parseInt(shelfKey)
              const shelfItems = shelves[shelfNum]
              
              const layers: Record<number, typeof shelfItems> = {}
              shelfItems.forEach(item => {
                const layer = item.location.layer
                if (!layers[layer]) {
                  layers[layer] = []
                }
                layers[layer].push(item)
              })

              return (
                <div key={shelfKey} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          第 {shelfNum} 书架
                        </h3>
                        <p className="text-white/40 text-sm">
                          {shelfItems.length} 件藏品
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.keys(layers).map(layerKey => {
                      const layerNum = parseInt(layerKey)
                      const layerItems = layers[layerNum]
                      return (
                        <div key={layerKey} className="ml-4 pl-4 border-l-2 border-white/10">
                          <p className="text-white/60 text-sm mb-2">
                            第 {layerNum} 层
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {layerItems
                              .sort((a, b) => a.location.position - b.location.position)
                              .map(item => (
                                <Link
                                  key={item.id}
                                  to={`/collections/${item.id}`}
                                  className="relative p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                                >
                                  <div className="aspect-[3/4] bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded overflow-hidden mb-1">
                                    {item.coverImage && (
                                      <img 
                                        src={item.coverImage} 
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs text-white/70 truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-white/40">
                                    位 {item.location.position}
                                  </p>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            借出记录
          </h2>
          
          {lentItems.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/50">
                暂无借出记录
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...lentItems, ...overdueItems].map(item => {
                const daysUntil = item.lending.expectedReturnDate 
                  ? getDaysUntilReturn(item.lending.expectedReturnDate)
                  : null
                const isOverdue = item.lending.status === 'overdue'
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border ${
                      isOverdue 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                        {item.coverImage && (
                          <img 
                            src={item.coverImage} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/collections/${item.id}`}
                          className="text-white font-semibold hover:text-[#e94560] transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-white/60 text-sm">
                          借给：{item.lending.borrower}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Clock size={12} className="text-white/40" />
                            <span className="text-white/40">
                              借出：{item.lending.borrowDate ? formatDate(item.lending.borrowDate) : '未知'}
                            </span>
                          </div>
                          {item.lending.expectedReturnDate && (
                            <div className={`flex items-center gap-1 text-xs ${
                              isOverdue ? 'text-red-400' : daysUntil !== null && daysUntil <= 3 ? 'text-orange-400' : 'text-white/40'
                            }`}>
                              <Clock size={12} />
                              <span>
                                预计归还：{formatDate(item.lending.expectedReturnDate)}
                                {daysUntil !== null && (
                                  <span className="ml-1">
                                    ({isOverdue ? `逾期 ${Math.abs(daysUntil)} 天` : `还有 ${daysUntil} 天`})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => returnMedia(item.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        归还
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Storage
