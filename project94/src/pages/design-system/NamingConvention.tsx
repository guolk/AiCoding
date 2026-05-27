import { namingRules } from '../../data/mockData'

export default function NamingConvention() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">命名规范</h1>
        <p className="mt-1 text-gray-600">设计变量的命名规范定义</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">命名原则</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 语义化优先：使用描述用途的名称，而不是描述外观的名称</li>
          <li>• 一致性：相同类型的变量使用相同的命名模式</li>
          <li>• 简洁清晰：避免过长的名称，但要保证可读性</li>
          <li>• 层级分明：通过命名结构体现变量的层级关系</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {namingRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{rule.category}</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">命名模式</p>
                <code className="block px-3 py-2 bg-gray-900 text-green-400 rounded-lg text-sm">
                  {rule.pattern}
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">示例</p>
                <div className="flex flex-wrap gap-2">
                  {rule.example.split(', ').map((ex, i) => (
                    <code key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">说明</p>
                <p className="text-gray-700">{rule.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">命名结构说明</h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 pr-4 font-medium text-gray-500">组成部分</th>
                  <th className="text-left py-3 pr-4 font-medium text-gray-500">说明</th>
                  <th className="text-left py-3 font-medium text-gray-500">示例</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-3 pr-4 font-mono text-blue-600">用途</td>
                  <td className="py-3 pr-4 text-gray-700">描述变量的使用场景</td>
                  <td className="py-3 text-gray-600">primary, secondary, success, error</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-blue-600">属性</td>
                  <td className="py-3 pr-4 text-gray-700">描述变量的CSS属性类型</td>
                  <td className="py-3 text-gray-600">color, bg, border, text</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-blue-600">级别 (可选)</td>
                  <td className="py-3 pr-4 text-gray-700">表示强度或大小的级别</td>
                  <td className="py-3 text-gray-600">xs, sm, base, lg, xl</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-blue-600">状态 (可选)</td>
                  <td className="py-3 pr-4 text-gray-700">表示交互状态</td>
                  <td className="py-3 text-gray-600">hover, active, focus, disabled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}