import { Palette, Boxes, FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { designTokens, components, checklists, versionHistory } from '../data/mockData'

const stats = [
  { label: '设计Token', value: designTokens.length, icon: Palette, color: 'bg-blue-500' },
  { label: '组件数量', value: components.length, icon: Boxes, color: 'bg-green-500' },
  { label: '待处理走查', value: checklists.filter(c => c.status === 'in-progress').length, icon: CheckCircle2, color: 'bg-amber-500' },
  { label: '版本更新', value: versionHistory.length, icon: TrendingUp, color: 'bg-purple-500' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设计系统概览</h1>
        <p className="mt-1 text-gray-600">统一管理设计规范、组件文档和协作流程</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">最近版本更新</h2>
          </div>
          <div className="p-5 space-y-4">
            {versionHistory.slice(0, 3).map((version) => (
              <div key={version.id} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">v{version.version}</span>
                    <span className="text-xs text-gray-500">{version.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">交付进度</h2>
          </div>
          <div className="p-5 space-y-4">
            {checklists.map((item) => {
              const completed = item.items.filter(i => i.checked).length
              const total = item.items.length
              const progress = Math.round((completed / total) * 100)
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.feature}</span>
                    <span className="text-sm text-gray-500">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">设计规范管理</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">管理设计Token、命名规范和版本历史</p>
          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-500">颜色：</span><span className="font-medium">{designTokens.filter(t => t.category === 'color').length}</span></p>
            <p className="text-sm"><span className="text-gray-500">间距：</span><span className="font-medium">{designTokens.filter(t => t.category === 'spacing').length}</span></p>
            <p className="text-sm"><span className="text-gray-500">圆角：</span><span className="font-medium">{designTokens.filter(t => t.category === 'radius').length}</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">组件文档</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">完整的组件文档和使用指南</p>
          <div className="flex flex-wrap gap-2">
            {['通用', '表单', '数据展示', '反馈'].map((cat) => (
              <span key={cat} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">设计决策</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">记录重要设计决策和评审过程</p>
          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-500">决策记录：</span><span className="font-medium">3</span></p>
            <p className="text-sm"><span className="text-gray-500">评审记录：</span><span className="font-medium">3</span></p>
            <p className="text-sm"><span className="text-gray-500">设计原则：</span><span className="font-medium">5</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}