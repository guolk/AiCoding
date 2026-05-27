import { Plus, ExternalLink, Type } from 'lucide-react'
import { fonts } from '../../data/mockData'

const weightLabels: Record<number, string> = {
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
}

export default function FontManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">字体管理</h1>
          <p className="mt-1 text-gray-600">字体文件的授权管理</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          添加字体
        </button>
      </div>

      <div className="space-y-4">
        {fonts.map((font) => (
          <div
            key={font.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Type className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{font.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{font.family}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">字体预览</p>
                <p
                  className="text-4xl text-gray-900"
                  style={{ fontFamily: font.family }}
                >
                  设计系统 Design System
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">可用字重</p>
                  <div className="flex flex-wrap gap-2">
                    {font.weights.map((weight) => (
                      <span
                        key={weight}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        style={{ fontWeight: weight }}
                      >
                        {weightLabels[weight] || weight}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">授权信息</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{font.license}</p>
                    <a
                      href={font.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      查看许可证
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">字体使用规范</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 确保使用的字体具有合法授权，避免版权纠纷</li>
          <li>• 网页字体加载时需要考虑字体加载性能，合理使用 font-display</li>
          <li>• 中文字体优先使用系统字体，减少文件体积</li>
          <li>• 不同平台设置合理的字体回退方案</li>
        </ul>
      </div>
    </div>
  )
}