import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, FileText, BookX, TrendingUp, ChevronRight, BarChart3, Target, Award } from 'lucide-react'
import { grammarErrors, progressData, lastWeekProgress } from '../../data/mockData'

const modules = [
  {
    id: 'grammar',
    title: '语法纠正',
    description: '提交你的文字，AI自动标注语法问题并提供改正建议',
    icon: FileText,
    path: '/errors/grammar',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'notebook',
    title: '个人错误本',
    description: '记录反复犯的错误，专项练习避免重蹈覆辙',
    icon: BookX,
    path: '/errors/notebook',
    gradient: 'from-amber-400 to-amber-600'
  },
  {
    id: 'progress',
    title: '进步报告',
    description: '对比本周与上周的表现，查看各方面的提升',
    icon: TrendingUp,
    path: '/errors/progress',
    gradient: 'from-green-400 to-green-600'
  }
]

const errorTypes = [
  { type: '时态错误', count: 7, color: 'bg-red-500' },
  { type: '主谓一致', count: 4, color: 'bg-amber-500' },
  { type: '代词格', count: 1, color: 'bg-blue-500' },
  { type: '介词搭配', count: 5, color: 'bg-purple-500' },
  { type: '冠词使用', count: 3, color: 'bg-green-500' }
]

export const ErrorsHome: React.FC = () => {
  const frequentErrors = grammarErrors.filter(e => e.count >= 2)
  const avgThisWeek = progressData[progressData.length - 1]
  const avgLastWeek = lastWeekProgress[lastWeekProgress.length - 1]

  const improvements = [
    { name: '发音', current: avgThisWeek.pronunciation, previous: avgLastWeek.pronunciation },
    { name: '语法', current: avgThisWeek.grammar, previous: avgLastWeek.grammar },
    { name: '词汇', current: avgThisWeek.vocabulary, previous: avgLastWeek.vocabulary },
    { name: '流利度', current: avgThisWeek.fluency, previous: avgLastWeek.fluency }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">错误分析</h1>
          <p className="text-gray-500 mt-1">纠正错误，记录进步，针对性提升</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">累计错误</p>
            <p className="text-2xl font-bold text-gray-800">{grammarErrors.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Target className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">高频错误</p>
            <p className="text-2xl font-bold text-gray-800">{frequentErrors.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">本周提升</p>
            <p className="text-2xl font-bold text-green-600">+8.2%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Award className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已纠正</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map(module => {
          const Icon = module.icon
          return (
            <Link
              key={module.id}
              to={module.path}
              className="card card-hover group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{module.description}</p>
              <span className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                开始使用 <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">错误类型分布</h2>
          <div className="space-y-4">
            {errorTypes.map((type, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{type.type}</span>
                  <span className="text-sm font-medium text-gray-800">{type.count} 次</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${type.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${(type.count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">本周进步对比</h2>
          <div className="space-y-4">
            {improvements.map((item, idx) => {
              const diff = item.current - item.previous
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className={`font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {diff >= 0 ? '+' : ''}{diff}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">上周 {item.previous}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full"
                          style={{ width: `${item.previous}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-primary-600 mb-1">本周 {item.current}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${item.current}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">最近的高频错误</h2>
          <Link to="/errors/notebook" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-3">
          {frequentErrors.slice(0, 3).map(error => (
            <div key={error.id} className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-danger">{error.errorType}</span>
                    <span className="badge bg-amber-100 text-amber-700">
                      错误 {error.count} 次
                    </span>
                  </div>
                  <p className="text-gray-700 line-through mb-1">{error.original}</p>
                  <p className="text-green-700 font-medium">✓ {error.corrected}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
