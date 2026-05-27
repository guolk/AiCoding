import { useState } from 'react'
import { Plus, User, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { checklists } from '../../data/mockData'
import { cn } from '../../utils/cn'

const statusConfig = {
  'pending': { label: '待开始', color: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  'completed': { label: '已完成', color: 'bg-green-100 text-green-700' },
}

export default function DeliveryChecklist() {
  const [items, setItems] = useState(checklists)

  const toggleItem = (checklistId: string, itemIndex: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === checklistId) {
        const newItems = [...item.items]
        newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked }
        const allChecked = newItems.every(i => i.checked)
        const someChecked = newItems.some(i => i.checked)
        let status: typeof item.status = 'pending'
        if (allChecked) status = 'completed'
        else if (someChecked) status = 'in-progress'
        return { ...item, items: newItems, status }
      }
      return item
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交付清单</h1>
          <p className="mt-1 text-gray-600">每个功能交付时需要的设计文档完整度检查</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增清单
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((checklist) => {
          const completed = checklist.items.filter(i => i.checked).length
          const total = checklist.items.length
          const progress = Math.round((completed / total) * 100)

          return (
            <div
              key={checklist.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{checklist.feature}</h3>
                  <span className={cn(
                    'px-2.5 py-1 text-xs rounded-full font-medium',
                    statusConfig[checklist.status].color
                  )}>
                    {statusConfig[checklist.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {checklist.assignee}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {checklist.deadline}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-500">完成进度</span>
                    <span className="font-medium text-gray-900">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        checklist.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <ul className="space-y-2">
                  {checklist.items.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => toggleItem(checklist.id, i)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={cn(
                          'text-sm',
                          item.checked ? 'text-gray-400 line-through' : 'text-gray-700'
                        )}>
                          {item.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}