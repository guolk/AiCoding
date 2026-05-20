import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, BookX, Filter, ChevronRight, RotateCcw, Play, Target, Clock } from 'lucide-react'
import { grammarErrors } from '../../data/mockData'
import { GrammarError } from '../../types'
import clsx from 'clsx'

export const ErrorsNotebook: React.FC = () => {
  const [errors, setErrors] = useState<GrammarError[]>(grammarErrors)
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'count' | 'date'>('count')
  const [practiceMode, setPracticeMode] = useState(false)
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  const frequentErrors = errors.filter(e => e.count >= 2)

  const filteredErrors = [...errors].sort((a, b) => {
    if (filterType !== 'all' && a.errorType !== filterType) return 1
    if (filterType !== 'all' && b.errorType !== filterType) return -1
    if (sortBy === 'count') return b.count - a.count
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  const errorTypes = ['all', ...new Set(errors.map(e => e.errorType))]

  const startPractice = () => {
    setPracticeMode(true)
    setCurrentPracticeIndex(0)
    setShowAnswer(false)
    setPracticeScore(0)
    setAnsweredCount(0)
  }

  const handleKnow = () => {
    setPracticeScore(prev => prev + 1)
    nextQuestion()
  }

  const handleDontKnow = () => {
    nextQuestion()
  }

  const nextQuestion = () => {
    setAnsweredCount(prev => prev + 1)
    setShowAnswer(false)
    if (currentPracticeIndex < frequentErrors.length - 1) {
      setCurrentPracticeIndex(prev => prev + 1)
    } else {
      setPracticeMode(false)
    }
  }

  const currentPracticeError = frequentErrors[currentPracticeIndex]

  const getErrorColor = (type: string) => {
    switch (type) {
      case '时态错误': return 'bg-red-100 text-red-700 border-red-200'
      case '主谓一致': return 'bg-amber-100 text-amber-700 border-amber-200'
      case '代词格': return 'bg-blue-100 text-blue-700 border-blue-200'
      case '介词搭配': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (practiceMode && currentPracticeError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPracticeMode(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">专项练习</h1>
            <p className="text-gray-500">第 {currentPracticeIndex + 1} / {frequentErrors.length} 题</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-amber-600" />
            </div>

            <p className="text-sm text-gray-500 mb-2">这是你常犯的错误，你能改正吗？</p>
            <p className="text-2xl font-medium text-gray-800 mb-6">
              "{currentPracticeError.original}"
            </p>

            {!showAnswer ? (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="btn-primary px-8 py-3"
                >
                  查看正确答案
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                  <p className="text-sm text-gray-500 mb-2">正确答案：</p>
                  <p className="text-2xl font-bold text-green-700">
                    "{currentPracticeError.corrected}"
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>说明：</strong>{currentPracticeError.explanation}
                  </p>
                </div>

                <p className="text-lg text-gray-700">你答对了吗？</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDontKnow}
                    className="btn-secondary px-8 py-3"
                  >
                    还没记住
                  </button>
                  <button
                    onClick={handleKnow}
                    className="btn-success px-8 py-3"
                  >
                    记住了！
                  </button>
                </div>
              </div>
            )}
          </div>

          {answeredCount > 0 && (
            <div className="card mt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">练习进度</span>
                <span className="font-medium text-primary-600">
                  {answeredCount} / {frequentErrors.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(answeredCount / frequentErrors.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-green-600">✓ 已掌握：{practiceScore}</span>
                <span className="text-amber-600">⏳ 需复习：{answeredCount - practiceScore}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/errors" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">个人错误本</h1>
          <p className="text-gray-500">记录反复犯的错误，专项练习避免重蹈覆辙</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <BookX className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">总错误数</p>
            <p className="text-2xl font-bold text-gray-800">{errors.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">高频错误</p>
            <p className="text-2xl font-bold text-gray-800">{frequentErrors.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">最常错误</p>
            <p className="text-2xl font-bold text-gray-800">
              {Math.max(...errors.map(e => e.count))}次
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <button
            onClick={startPractice}
            disabled={frequentErrors.length === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            开始专项练习
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">筛选：</span>
            <div className="flex flex-wrap gap-2">
              {errorTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filterType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {type === 'all' ? '全部' : type}
                </button>
              ))}
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'count' | 'date')}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="count">按错误次数</option>
              <option value="date">按时间</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredErrors.map(error => (
            <div
              key={error.id}
              className={clsx(
                'p-5 rounded-xl border-2 transition-all',
                error.count >= 3
                  ? 'border-red-300 bg-gradient-to-r from-red-50 to-white'
                  : error.count >= 2
                  ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-white'
                  : 'border-gray-200 bg-white hover:border-primary-200'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge border ${getErrorColor(error.errorType)}`}>
                      {error.errorType}
                    </span>
                    {error.count >= 2 && (
                      <span className={clsx(
                        'badge',
                        error.count >= 3 ? 'badge-danger' : 'badge-warning'
                      )}>
                        已错 {error.count} 次
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {error.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">错误句子：</p>
                      <p className="text-lg text-gray-700 line-through">{error.original}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">正确句子：</p>
                      <p className="text-lg font-semibold text-green-700">
                        ✓ {error.corrected}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    <strong>💡 {error.explanation}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
