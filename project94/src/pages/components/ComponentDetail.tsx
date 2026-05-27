import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Code, AlertTriangle, Copy } from 'lucide-react'
import { components } from '../../data/mockData'
import { cn } from '../../utils/cn'

const statusColors: Record<string, string> = {
  default: 'bg-gray-100 border-gray-300',
  hover: 'bg-blue-50 border-blue-300',
  active: 'bg-blue-100 border-blue-400',
  disabled: 'bg-gray-50 border-gray-200 opacity-50',
  loading: 'bg-blue-50 border-blue-300',
  focus: 'bg-blue-50 border-blue-400 ring-2 ring-blue-200',
  error: 'bg-red-50 border-red-300',
  empty: 'bg-gray-50 border-gray-200',
}

export default function ComponentDetail() {
  const { id } = useParams()
  const component = components.find((c) => c.id === id)

  if (!component) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">组件未找到</h2>
        <Link to="/components" className="text-blue-500 hover:underline mt-2 inline-block">
          返回组件列表
        </Link>
      </div>
    )
  }

  const copyCode = () => {
    navigator.clipboard.writeText(component.codeExample)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/components"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{component.name}</h1>
          <p className="text-gray-600">{component.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">用途说明</h2>
            <p className="text-gray-700">{component.usage}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">代码示例</h2>
            </div>
            <div className="relative">
              <pre className="p-6 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                <code>{component.codeExample}</code>
              </pre>
              <button
                onClick={copyCode}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">组件状态</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {component.status.map((state) => (
                <div key={state.name} className="text-center">
                  <div
                    className={cn(
                      'h-16 rounded-lg border-2 flex items-center justify-center mb-2',
                      statusColors[state.preview] || 'bg-gray-100'
                    )}
                  >
                    <span className="text-sm font-medium text-gray-700">{component.name}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{state.name}</p>
                  <p className="text-xs text-gray-500">{state.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">相关组件</h2>
            <div className="flex flex-wrap gap-3">
              {component.relatedComponents.map((rel) => (
                <Link
                  key={rel}
                  to="#"
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {rel}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              禁止用法
            </h3>
            <ul className="space-y-2">
              {component.forbidden.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              设计原稿
            </h3>
            <a
              href={component.designLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm break-all"
            >
              {component.designLink}
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              组件信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">分类</span>
                <span className="text-gray-900">{component.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态数</span>
                <span className="text-gray-900">{component.status.length}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-2">标签</span>
                <div className="flex flex-wrap gap-1.5">
                  {component.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}