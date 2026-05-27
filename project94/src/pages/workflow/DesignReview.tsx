import { useState } from 'react'
import { Plus, User, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { designReviews } from '../../data/mockData'
import { cn } from '../../utils/cn'

const statusConfig = {
  'pending': { label: '待处理', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'resolved': { label: '已修复', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  'confirmed': { label: '已确认', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
}

export default function DesignReview() {
  const [reviews, setReviews] = useState(designReviews)

  const toggleResolve = (reviewId: string, diffIndex: number) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const newDiffs = [...review.differences]
        newDiffs[diffIndex] = { ...newDiffs[diffIndex], resolved: !newDiffs[diffIndex].resolved }
        const allResolved = newDiffs.every(d => d.resolved)
        const someResolved = newDiffs.some(d => d.resolved)
        let status: typeof review.status = 'pending'
        if (allResolved) status = review.status === 'confirmed' ? 'confirmed' : 'resolved'
        else if (someResolved) status = 'pending'
        return { ...review, differences: newDiffs, status }
      }
      return review
    }))
  }

  const confirmReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId && review.status === 'resolved') {
        return { ...review, status: 'confirmed' as const }
      }
      return review
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设计走查</h1>
          <p className="mt-1 text-gray-600">设计稿和开发实现的差异记录</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增走查
        </button>
      </div>

      <div className="flex gap-2">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = reviews.filter(r => r.status === key).length
          const Icon = config.icon
          return (
            <div key={key} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              <Icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{config.label}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const resolvedCount = review.differences.filter(d => d.resolved).length
          const totalCount = review.differences.length
          const StatusIcon = statusConfig[review.status].icon

          return (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.feature}</h3>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium',
                        statusConfig[review.status].color
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[review.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-4 h-4" />
                        设计师：{review.designer}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="w-4 h-4" />
                        开发：{review.developer}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {review.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">修复进度</p>
                      <p className="font-semibold text-gray-900">{resolvedCount}/{totalCount}</p>
                    </div>
                    {review.status === 'resolved' && (
                      <button
                        onClick={() => confirmReview(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        确认通过
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {review.differences.map((diff, i) => (
                  <div key={i} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {diff.resolved ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <h4 className="font-medium text-gray-900">{diff.location}</h4>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">设计要求</p>
                            <p className="text-sm text-gray-700 p-2 bg-blue-50 rounded-lg">{diff.design}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">当前实现</p>
                            <p className="text-sm text-gray-700 p-2 bg-amber-50 rounded-lg">{diff.implementation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">建议</p>
                            <p className="text-sm text-gray-700 p-2 bg-green-50 rounded-lg">{diff.suggestion}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleResolve(review.id, i)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded-lg transition-colors flex-shrink-0',
                          diff.resolved
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        )}
                      >
                        {diff.resolved ? '取消修复' : '标记已修复'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}