import { useState } from 'react'
import { Plus, User, Calendar, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import { designDecisions } from '../../data/mockData'

export default function DesignDecisions() {
  const [expandedId, setExpandedId] = useState<string | null>(designDecisions[0]?.id || null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设计决策记录</h1>
          <p className="mt-1 text-gray-600">记录重要设计决策的背景和理由</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增决策
        </button>
      </div>

      <div className="space-y-4">
        {designDecisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
              className="w-full p-5 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {decision.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {decision.date}
                  </span>
                </div>
              </div>
              {expandedId === decision.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedId === decision.id && (
              <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
                <div className="pt-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">背景</h4>
                  <p className="text-gray-600">{decision.background}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">备选方案</h4>
                  <div className="grid gap-3">
                    {decision.alternatives.map((alt, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900 mb-3">{alt.name}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                              优点
                            </p>
                            <ul className="space-y-1">
                              {alt.pros.map((pro, j) => (
                                <li key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                                  <span className="text-green-500">•</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                              <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                              缺点
                            </p>
                            <ul className="space-y-1">
                              {alt.cons.map((con, j) => (
                                <li key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                                  <span className="text-red-500">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">最终决策</h4>
                  <p className="text-blue-700 font-medium mb-2">{decision.decision}</p>
                  <p className="text-sm text-blue-600">{decision.reason}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}