import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Sparkles, CheckCircle, AlertCircle, Copy, RotateCcw } from 'lucide-react'
import { grammarErrors } from '../../data/mockData'
import { GrammarError } from '../../types'
import clsx from 'clsx'

export const ErrorsGrammar: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<GrammarError | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<GrammarError[]>([])

  const commonMistakes = [
    'I go to the park yesterday.',
    'He have two sisters.',
    'She is more beautiful than me.',
    'I have seen him last week.'
  ]

  const handleAnalyze = () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)

    setTimeout(() => {
      const foundError = grammarErrors.find(e =>
        inputText.toLowerCase().includes(e.original.toLowerCase().replace('.', ''))
      )

      let result: GrammarError
      if (foundError) {
        result = foundError
      } else {
        const errorTypes = ['时态错误', '主谓一致', '介词搭配', '冠词使用', '代词格']
        const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
        result = {
          id: Date.now().toString(),
          original: inputText,
          corrected: inputText
            .replace(/\bgo\b/gi, 'went')
            .replace(/\bhave\b/gi, 'has')
            .replace(/\bme\b/gi, 'I')
            .replace(/\bhave seen\b/gi, 'saw'),
          explanation: `AI分析发现这是一个${randomType}问题。建议根据语境选择正确的动词形式和代词格。`,
          errorType: randomType,
          timestamp: new Date(),
          count: 1
        }
      }

      setAnalysisResult(result)
      setAnalysisHistory(prev => [result, ...prev].slice(0, 10))
      setIsAnalyzing(false)
    }, 1500)
  }

  const handleQuickInput = (text: string) => {
    setInputText(text)
  }

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult.corrected)
    }
  }

  const handleReset = () => {
    setInputText('')
    setAnalysisResult(null)
  }

  const getErrorColor = (type: string) => {
    switch (type) {
      case '时态错误': return 'bg-red-100 text-red-700 border-red-200'
      case '主谓一致': return 'bg-amber-100 text-amber-700 border-amber-200'
      case '代词格': return 'bg-blue-100 text-blue-700 border-blue-200'
      case '介词搭配': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/errors" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">语法纠正</h1>
          <p className="text-gray-500">AI自动标注语法问题并提供改正建议</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              输入你要检查的文字
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">快速输入常见错误：</p>
              <div className="flex flex-wrap gap-2">
                {commonMistakes.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickInput(text)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入你想要检查的英文句子..."
              className="input-field min-h-40 resize-none mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                清空
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    AI分析
                  </>
                )}
              </button>
            </div>
          </div>

          {analysisResult && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                分析结果
              </h3>

              <div className={`p-4 rounded-xl border-2 mb-4 ${getErrorColor(analysisResult.errorType)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold">错误类型：</span>
                  <span className="badge bg-white/50">{analysisResult.errorType}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">你的句子：</p>
                    <p className="text-lg line-through opacity-75">{analysisResult.original}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      修正后的句子：
                    </p>
                    <p className="text-lg font-semibold text-green-700">{analysisResult.corrected}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <p className="text-blue-800">
                  <strong>💡 解释：</strong>
                  {analysisResult.explanation}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  复制正确句子
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">检查统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-600">今日检查</span>
                <span className="text-2xl font-bold text-blue-600">{analysisHistory.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-gray-600">发现错误</span>
                <span className="text-2xl font-bold text-green-600">
                  {analysisHistory.filter(h => h.original !== h.corrected).length}
                </span>
              </div>
            </div>
          </div>

          {analysisHistory.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">最近检查</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {analysisHistory.map((item, idx) => (
                  <div
                    key={item.id + idx}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setInputText(item.original)
                      setAnalysisResult(item)
                    }}
                  >
                    <p className="text-sm text-gray-700 truncate">{item.original}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${getErrorColor(item.errorType)} border`}>
                        {item.errorType}
                      </span>
                      {item.original !== item.corrected && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">小贴士</h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-800">
                  📝 输入完整的句子可以获得更准确的分析结果
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  ✅ 每次检查后，建议大声朗读正确的句子3遍
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  🔄 反复练习同一错误类型的句子可以加深记忆
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
