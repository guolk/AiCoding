import { designPrinciples } from '../../data/mockData'
import { CheckCircle2 } from 'lucide-react'

export default function DesignPrinciples() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设计原则</h1>
        <p className="mt-1 text-gray-600">团队认可的设计理念和价值观</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">为什么设计原则很重要？</h3>
        <p className="text-sm text-amber-700">
          设计原则是团队共同遵循的设计理念，它帮助我们在面临设计决策时保持一致性，
          确保产品体验的统一。每一位团队成员都应该理解并践行这些原则。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {designPrinciples.map((principle, index) => (
          <div
            key={principle.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold text-white">{principle.title}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-4">{principle.description}</p>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">实践示例</p>
                <ul className="space-y-2">
                  {principle.examples.map((example, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}