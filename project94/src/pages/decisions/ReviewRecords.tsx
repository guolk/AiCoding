import { useState } from 'react'
import { Plus, Users, Calendar, Paperclip, ChevronDown, ChevronUp } from 'lucide-react'
import { reviewRecords } from '../../data/mockData'

export default function ReviewRecords() {
  const [expandedId, setExpandedId] = useState<string | null>(reviewRecords[0]?.id || null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">评审记录</h1>
          <p className="mt-1 text-gray-600">设计评审的讨论要点和最终决定</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增评审
        </button>
      </div>

      <div className="space-y-4">
        {reviewRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              className="w-full p-5 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {record.participants.length} 人参会
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {record.date}
                  </span>
                </div>
              </div>
              {expandedId === record.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedId === record.id && (
              <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
                <div className="pt-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">参与人员</h4>
                  <div className="flex flex-wrap gap-2">
                    {record.participants.map((p, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">讨论要点</h4>
                  <div className="space-y-2">
                    {record.discussionPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">最终决定</h4>
                  <p className="text-green-700">{record.finalDecision}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    附件
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {record.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-1.5 hover:bg-gray-200 cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        {att}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}